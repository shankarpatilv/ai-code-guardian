import { CodeGuardianAnalyzer, createAnalyzer } from './analyzer';
import { Logger } from './utils/logger';
import { AnalysisIssue, CodeAnalysis } from './types';
import * as fs from 'fs';
import * as path from 'path';

interface HookData {
  tool: string;
  file_path: string;
  content: string;
}

export class HookHandler {
  private analyzer: CodeGuardianAnalyzer;
  private logger: Logger;

  constructor() {
    this.analyzer = createAnalyzer();
    this.logger = new Logger('HookHandler');
  }

  async handleHookData(input: string): Promise<void> {
    try {
      this.logger.info('Processing hook data');

      // Use the centralized analyzeFromHook method
      const result = await this.analyzer.analyzeFromHook(input);

      if (!result.success) {
        this.logger.warn('Hook analysis failed:', result.error);
        return;
      }

      if (!result.analysis) {
        this.logger.debug('No content to analyze');
        return;
      }

      // Output issues to stderr (visible in Claude)
      this.outputIssues(result.analysis.issues);

      // Optionally save analysis to file for debugging
      if (process.env.AI_CODE_GUARDIAN_DEBUG === 'true') {
        this.saveAnalysis(result.analysis);
      }

    } catch (error) {
      this.logger.error('Hook handler failed', error as Error);
    }
  }


  private outputIssues(issues: AnalysisIssue[]): void {
    if (issues.length === 0) {
      return;
    }

    console.error('\n' + '='.repeat(60));
    console.error('🛡️ AI Code Guardian - Analysis Results');
    console.error('='.repeat(60) + '\n');

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    // Summary
    if (errorCount > 0 || warningCount > 0) {
      console.error(`Found: ${errorCount} errors, ${warningCount} warnings, ${infoCount} info messages\n`);
    }

    // Group issues by severity
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    const infos = issues.filter(i => i.severity === 'info');

    // Output errors first
    if (errors.length > 0) {
      console.error('ERRORS:');
      errors.forEach(issue => {
        console.error(Logger.formatIssue(
          issue.severity,
          issue.message,
          `line ${issue.range.start.line}`
        ));
        if (issue.suggestion) {
          console.error(`  💡 ${issue.suggestion}\n`);
        }
      });
    }

    // Then warnings
    if (warnings.length > 0) {
      console.error('\nWARNINGS:');
      warnings.forEach(issue => {
        console.error(Logger.formatIssue(
          issue.severity,
          issue.message,
          `line ${issue.range.start.line}`
        ));
        if (issue.suggestion) {
          console.error(`  💡 ${issue.suggestion}\n`);
        }
      });
    }

    // Finally info
    if (infos.length > 0 && process.env.AI_CODE_GUARDIAN_VERBOSE === 'true') {
      console.error('\nINFO:');
      infos.forEach(issue => {
        console.error(Logger.formatIssue(
          issue.severity,
          issue.message,
          `line ${issue.range.start.line}`
        ));
      });
    }

    console.error('\n' + '='.repeat(60) + '\n');
  }

  private saveAnalysis(analysis: CodeAnalysis): void {
    const debugDir = path.join(process.cwd(), '.ai-code-guardian', 'debug');
    
    // Create debug directory if it doesn't exist
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `analysis-${timestamp}.json`;
    const filePath = path.join(debugDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(analysis, null, 2));
    this.logger.debug(`Analysis saved to ${filePath}`);
  }
}

// Helper functions for backward compatibility with tests
export function createHookDataFromArgs(args: string[]): HookData {
  if (args.length < 3) {
    throw new Error('Insufficient arguments for hook data');
  }
  
  return {
    tool: args[0] || '',
    file_path: args[1] || '',
    content: args[2] || ''
  };
}

export function validateHookData(data: unknown): data is HookData {
  return !!(data && 
           typeof data === 'object' && 
           'tool' in data && 
           'file_path' in data && 
           'content' in data &&
           typeof (data as HookData).tool === 'string' &&
           typeof (data as HookData).file_path === 'string' &&
           typeof (data as HookData).content === 'string');
}