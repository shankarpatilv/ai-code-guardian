import { AnalysisIssue, CodeAnalysis } from '../../types';
import { Logger } from '../../utils/logger';
import { PerformanceTimer } from '../../utils/performance';

/**
 * Handles formatting and logging of analysis issues
 */
export class IssueFormatter {
  private logger: Logger;

  constructor(componentName: string = 'IssueFormatter') {
    this.logger = new Logger(componentName);
  }

  /**
   * Log a summary of the analysis results
   */
  logAnalysisSummary(analysis: CodeAnalysis): void {
    // Skip logging if in JSON mode (environment variable set)
    if (process.env.SUPPRESS_ANALYZER_LOGS === 'true') {
      return;
    }

    const { issues, analysisTime } = analysis;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;

    if (errorCount > 0 || warningCount > 0) {
      this.logger.warn(
        `Found ${errorCount} errors, ${warningCount} warnings, ${infoCount} info in ${PerformanceTimer.formatDuration(analysisTime)}`
      );
    } else if (infoCount > 0) {
      this.logger.info(
        `Found ${infoCount} info messages in ${PerformanceTimer.formatDuration(analysisTime)}`
      );
    } else {
      this.logger.success(
        `No issues found in ${PerformanceTimer.formatDuration(analysisTime)}`
      );
    }
  }

  /**
   * Format issues for display
   */
  formatIssues(issues: AnalysisIssue[]): string {
    if (issues.length === 0) {
      return 'No issues detected.';
    }

    return issues.map((issue, index) => {
      const location = issue.range ? 
        ` at line ${issue.range.start.line}:${issue.range.start.column}` : '';
      
      return `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}${location}` +
             (issue.suggestion ? `\n   Suggestion: ${issue.suggestion}` : '');
    }).join('\n');
  }

  /**
   * Format issues by severity
   */
  formatIssuesBySeverity(issues: AnalysisIssue[]): { errors: string[]; warnings: string[]; info: string[] } {
    const result = { errors: [] as string[], warnings: [] as string[], info: [] as string[] };

    issues.forEach(issue => {
      const formatted = this.formatSingleIssue(issue);
      
      switch (issue.severity) {
        case 'error':
          result.errors.push(formatted);
          break;
        case 'warning':
          result.warnings.push(formatted);
          break;
        case 'info':
          result.info.push(formatted);
          break;
      }
    });

    return result;
  }

  private formatSingleIssue(issue: AnalysisIssue): string {
    const location = issue.range ? 
      ` (Line ${issue.range.start.line})` : '';
    
    return `${issue.message}${location}`;
  }
}