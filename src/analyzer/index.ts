import { CodeAnalysis, AnalysisIssue, AnalyzerConfig, HookResult, SupportedLanguage, PerformanceStats, EditOperation } from '../types';
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

      // Split lines once for better performance
      const lines = content.split('\n');

      // Perform analysis using our modularized components with timeout
      const analysisPromise = this.performAnalysisWithLines(content, filePath, lines);
      const metricsPromise = Promise.resolve(this.metricsCalculator.calculateBasicMetricsWithLines(content, lines));
      
      const [issues, metrics] = await this.withTimeout(
        Promise.all([analysisPromise, metricsPromise]), 
        this.config.performance.timeout,
        'Analysis timeout exceeded'
      );

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
      // Add timeout to file reading as well
      const content = await this.withTimeout(
        readFile(filePath, 'utf-8'),
        this.config.performance.timeout / 2, // Use half the timeout for file reading
        `File reading timeout for ${filePath}`
      );
      return this.analyze(filePath, content, language);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to read file: ${filePath}`, error as Error);
      
      // Provide more specific error messages
      if (errorMessage.includes('ENOENT')) {
        throw new Error(`File not found: ${filePath}`);
      } else if (errorMessage.includes('EACCES')) {
        throw new Error(`Permission denied: ${filePath}`);
      } else if (errorMessage.includes('timeout')) {
        throw new Error(`File reading timeout: ${filePath}`);
      } else {
        throw new Error(`Cannot read file: ${filePath} - ${errorMessage}`);
      }
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

      // Analyze the content from hook with timeout protection
      const contentString = Array.isArray(hookData.content) ? hookData.content.join('\n') : hookData.content;
      const analysisLanguage = hookData.language as SupportedLanguage || detectLanguage(hookData.filePath);
      
      // Add input validation
      if (!contentString || contentString.length === 0) {
        return {
          success: false,
          error: 'Empty or invalid content provided'
        };
      }

      if (contentString.length > this.config.performance.maxFileSize) {
        return {
          success: false,
          error: `Content too large: ${contentString.length} bytes (max: ${this.config.performance.maxFileSize})`
        };
      }

      const analysis = await this.withTimeout(
        this.analyzeContent(contentString, analysisLanguage, hookData.filePath),
        this.config.performance.timeout,
        'Hook analysis timeout'
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

  /**
   * Perform analysis using pre-split lines for optimal performance
   * This method eliminates redundant line splitting across multiple detectors
   * @param _content Original content string (unused but kept for signature compatibility)
   * @param filePath Path to the file being analyzed
   * @param lines Pre-split content lines
   * @returns Array of detected issues
   */
  private async performAnalysisWithLines(_content: string, filePath: string, lines: string[]): Promise<AnalysisIssue[]> {
    // Use the pattern registry to detect all patterns with pre-split lines
    const allIssues: AnalysisIssue[] = [];

    // Run all detectors in parallel for better performance, sharing the pre-split lines
    const [securityIssues, qualityIssues] = await Promise.all([
      this.patternRegistry.securityDetector.detectPatternsWithLines(lines, filePath),
      this.patternRegistry.qualityDetector.detectPatternsWithLines(lines, filePath),
    ]);

    allIssues.push(...securityIssues);
    allIssues.push(...qualityIssues);

    return allIssues;
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
        content = (data.edits || []).map((edit: EditOperation) => edit.new_string);
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

  getPerformanceStats(): PerformanceStats {
    return this.performanceMonitor.getStats();
  }

  clearPerformanceStats(): void {
    this.performanceMonitor.clearStats();
  }

  /**
   * Wraps a promise with a timeout to prevent hanging operations
   */
  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    errorMessage: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
      }, timeoutMs);
      
      // Clear timeout if the original promise resolves first
      promise.finally(() => clearTimeout(timeoutId));
    });

    return Promise.race([promise, timeoutPromise]);
  }
}

// Factory function for creating analyzer instances
export function createAnalyzer(config?: Partial<AnalyzerConfig>): CodeGuardianAnalyzer {
  return new CodeGuardianAnalyzer(config);
}

// Export types and interfaces
export type { IAnalyzer } from '../interfaces';
export * from '../types';