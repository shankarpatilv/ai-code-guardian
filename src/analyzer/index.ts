import { CodeAnalysis, AnalysisIssue, AnalyzerConfig, HookResult, SupportedLanguage } from '../types';
import { IAnalyzer } from '../interfaces';
import { Logger } from '../utils/logger';
import { PerformanceTimer } from '../utils/performance';
import { readFile } from 'fs/promises';

// Import our modularized components
import { PatternRegistry } from './patterns';
import { MetricsCalculator, AnalysisPerformanceMonitor } from './metrics';
import { IssueFormatter } from './formatters';
import { validateContentSize, validateFilePath } from './utils/validators';
import { detectLanguage, createEmptyAnalysis } from './utils/helpers';

/**
 * Main CodeGuardianAnalyzer class - orchestrates all analysis modules
 */
export class CodeGuardianAnalyzer implements IAnalyzer {
  private logger: Logger;
  private config: AnalyzerConfig;
  private patternRegistry: PatternRegistry;
  private metricsCalculator: MetricsCalculator;
  private issueFormatter: IssueFormatter;
  private performanceMonitor: AnalysisPerformanceMonitor;

  constructor(config?: Partial<AnalyzerConfig>) {
    this.logger = new Logger('CodeGuardianAnalyzer');
    this.config = {
      enabled: true,
      maxIssues: 100,
      severityThreshold: 'info',
      rules: [],
      performance: {
        timeout: 500,
        maxFileSize: 1024 * 1024, // 1MB
      },
      ...config,
    };

    // Initialize components
    this.patternRegistry = new PatternRegistry();
    this.metricsCalculator = new MetricsCalculator();
    this.issueFormatter = new IssueFormatter();
    this.performanceMonitor = AnalysisPerformanceMonitor.getInstance();
  }

  async analyze(filePath: string, content: string, language?: string): Promise<CodeAnalysis> {
    const timer = new PerformanceTimer();
    
    if (!this.config.enabled) {
      this.logger.debug('Analyzer is disabled');
      return createEmptyAnalysis(filePath, content, language || detectLanguage(filePath));
    }

    try {
      timer.mark('start');
      
      // Validate inputs
      if (!validateFilePath(filePath)) {
        throw new Error('Invalid file path');
      }

      if (!validateContentSize(content, this.config)) {
        this.logger.warn(`File too large: ${content.length} bytes`);
        return createEmptyAnalysis(filePath, content, language || detectLanguage(filePath));
      }

      const detectedLanguage = language || detectLanguage(filePath);
      if (process.env.SUPPRESS_ANALYZER_LOGS !== 'true') {
        this.logger.info(`Analyzing ${filePath} (${detectedLanguage})`);
      }

      // Perform analysis using our modularized components
      const issues = await this.performAnalysis(content, filePath);
      const metrics = this.metricsCalculator.calculateBasicMetrics(content);

      timer.mark('analysis-complete');
      const analysisTime = timer.measure('analysis', 'start');
      
      // Check performance
      this.performanceMonitor.checkAnalysisPerformance(analysisTime, `Analysis of ${filePath}`);

      const analysis: CodeAnalysis = {
        file: filePath,
        language: detectedLanguage,
        content,
        issues: issues.slice(0, this.config.maxIssues),
        metrics,
        analysisTime,
        timestamp: Date.now(),
      };

      // Log summary
      this.issueFormatter.logAnalysisSummary(analysis);

      return analysis;
    } catch (error) {
      this.logger.error('Analysis failed', error as Error);
      return createEmptyAnalysis(filePath, content, language || 'unknown');
    }
  }

  async analyzeFile(filePath: string, language?: SupportedLanguage): Promise<CodeAnalysis> {
    try {
      const content = await readFile(filePath, 'utf-8');
      return this.analyze(filePath, content, language);
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error as Error);
      throw new Error(`Cannot read file: ${filePath}`);
    }
  }

  async analyzeContent(content: string, language: SupportedLanguage, filePath: string): Promise<CodeAnalysis> {
    return this.analyze(filePath, content, language);
  }

  async analyzeFromHook(args: string[] | string): Promise<HookResult> {
    const timer = new PerformanceTimer();
    timer.mark('start');
    
    try {
      let hookData: { tool: string; filePath: string; content: string | string[]; language?: string } | null = null;
      
      // Handle both command-line args and JSON string input
      if (Array.isArray(args)) {
        // Parse command-line arguments (from CLI)
        hookData = this.parseHookArgs(args);
      } else {
        // Parse JSON string (from HookHandler)
        hookData = this.parseHookJson(args);
      }
      
      if (!hookData) {
        return {
          success: false,
          error: 'Invalid hook arguments'
        };
      }

      // Analyze the content from hook
      const analysis = await this.analyzeContent(
        Array.isArray(hookData.content) ? hookData.content.join('\n') : hookData.content,
        hookData.language as SupportedLanguage || detectLanguage(hookData.filePath),
        hookData.filePath
      );

      const duration = timer.measure('hook-analysis', 'start');
      
      return {
        success: true,
        analysis,
        duration
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during hook analysis'
      };
    }
  }

  private async performAnalysis(content: string, filePath: string): Promise<AnalysisIssue[]> {
    // Use the pattern registry to detect all patterns
    return await this.patternRegistry.detectAllPatterns(content, filePath);
  }

  private parseHookArgs(args: string[]): { tool: string; filePath: string; content: string | string[]; language?: string } | null {
    let tool = '';
    let filePath = '';
    let content: string | string[] = '';
    let language = '';

    for (let i = 0; i < args.length; i += 2) {
      const flag = args[i];
      const value = args[i + 1];

      if (!value) continue; // Skip if value is undefined

      switch (flag) {
        case '--tool':
          tool = value;
          break;
        case '--file':
          filePath = value;
          break;
        case '--content':
          content = value;
          break;
        case '--language':
          language = value;
          break;
      }
    }

    if (!tool || !filePath || !content) {
      return null;
    }

    return { tool, filePath, content, language: language || undefined };
  }

  private parseHookJson(jsonString: string): { tool: string; filePath: string; content: string | string[]; language?: string } | null {
    try {
      // Security: Limit JSON size to prevent DoS attacks
      if (jsonString.length > 10485760) { // 10MB limit
        throw new Error(`JSON input too large: ${jsonString.length} bytes (max 10MB)`);
      }
      
      const data = JSON.parse(jsonString);
      
      // Extract operation from tool name
      const tool = data.tool || data.operation;
      
      // Extract file path
      let filePath = data.file_path || data.filePath || '';
      
      // Extract content based on operation
      let content: string | string[] = '';
      
      if (tool === 'Write') {
        content = data.content || '';
        filePath = data.file_path || '';
      } else if (tool === 'Edit') {
        content = data.new_string || '';
        filePath = data.file_path || '';
      } else if (tool === 'MultiEdit') {
        content = (data.edits || []).map((edit: any) => edit.new_string);
        filePath = data.file_path || '';
      } else if (tool === 'NotebookEdit') {
        content = data.new_source || '';
        filePath = data.notebook_path || '';
      }

      if (!filePath || !content) {
        return null;
      }

      return {
        tool,
        filePath,
        content,
        language: detectLanguage(filePath)
      };
    } catch (error) {
      this.logger.error('Failed to parse hook JSON', error as Error);
      return null;
    }
  }

  getConfig(): AnalyzerConfig {
    return { ...this.config };
  }

  getPerformanceStats(): any {
    return this.performanceMonitor.getStats();
  }

  clearPerformanceStats(): void {
    this.performanceMonitor.clearStats();
  }
}

// Factory function for creating analyzer instances
export function createAnalyzer(config?: Partial<AnalyzerConfig>): CodeGuardianAnalyzer {
  return new CodeGuardianAnalyzer(config);
}

// Export types and interfaces
export type { IAnalyzer } from '../interfaces';
export * from '../types';