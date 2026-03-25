import chalk from 'chalk';
import { CodeAnalysis, AnalysisIssue, IssueSeverity, VERSION } from '../../types';
import { formatDuration } from '../../utils/performance';

/**
 * Handles output formatting for different CLI display modes
 */
export class OutputHandler {

  /**
   * Output analysis results in the specified format
   */
  static outputAnalysis(analysis: CodeAnalysis, format: string, verbose: boolean): void {
    switch (format) {
      case 'json':
        console.log(JSON.stringify(analysis, null, 2));
        break;
      
      case 'table':
        this.outputTableFormat(analysis, verbose);
        break;
      
      case 'text':
      default:
        this.outputTextFormat(analysis, verbose);
        break;
    }
  }

  /**
   * Output in text format
   */
  private static outputTextFormat(analysis: CodeAnalysis, verbose: boolean): void {
    // Header
    console.log(chalk.bold(`\n🛡️  AI Code Guardian Analysis`));
    console.log(chalk.gray('─'.repeat(50)));
    
    // File info
    console.log(`${chalk.blue('File:')} ${analysis.file}`);
    console.log(`${chalk.blue('Language:')} ${analysis.language}`);
    console.log(`${chalk.blue('Duration:')} ${formatDuration(analysis.analysisTime)}`);
    
    // Metrics summary
    const metrics = analysis.metrics;
    console.log(`${chalk.blue('Lines:')} ${metrics.linesOfCode}`);
    console.log(`${chalk.blue('Complexity:')} Cyclomatic=${metrics.cyclomaticComplexity}, Max Depth=${metrics.maxNestingDepth}`);
    
    // Issues
    if (analysis.issues.length === 0) {
      console.log(chalk.green('\n✅ No issues detected'));
    } else {
      console.log(chalk.yellow(`\n⚠️  Found ${analysis.issues.length} issue(s):`));
      
      analysis.issues.forEach((issue, index) => {
        const severityIcon = this.getSeverityIcon(issue.severity);
        const severityColor = this.getSeverityColor(issue.severity);
        
        console.log(`\n${index + 1}. ${severityColor(severityIcon + ' ' + issue.message)}`);
        console.log(`   ${chalk.gray(issue.category)} - ${issue.rule}`);
        
        if (issue.range) {
          console.log(`   ${chalk.gray(`Line ${issue.range.start.line}:${issue.range.start.column}`)}`);
        }
        
        if (verbose && issue.suggestion) {
          console.log(`   ${chalk.cyan('Suggestion:')} ${issue.suggestion}`);
        }
        
        if (verbose && issue.rule) {
          console.log(`   ${chalk.gray(`Rule: ${issue.rule}`)}`);
        }
      });
    }
    
    // Footer
    if (verbose) {
      console.log(chalk.gray('\n─'.repeat(50)));
      console.log(chalk.gray(`Analysis completed at ${new Date(analysis.timestamp).toISOString()}`));
      console.log(chalk.gray(`AI Code Guardian v${VERSION}`));
    }
    
    console.log(''); // Empty line
  }

  /**
   * Output in table format
   */
  private static outputTableFormat(analysis: CodeAnalysis, verbose: boolean): void {
    // For Phase 1, just output text format
    // Table formatting will be enhanced in later phases
    this.outputTextFormat(analysis, verbose);
  }

  /**
   * Output hook results to stderr for Claude to display
   */
  static outputHookResults(analysis: CodeAnalysis): void {
    if (analysis.issues.length === 0) {
      // Silent success for clean code
      return;
    }
    
    // Output warnings to stderr
    analysis.issues.forEach(issue => {
      const severityIcon = this.getSeverityIcon(issue.severity);
      const message = `${severityIcon} ${issue.message}`;
      
      if (issue.severity === 'error') {
        console.error(chalk.red(message));
      } else if (issue.severity === 'warning') {
        console.error(chalk.yellow(message));
      } else {
        console.error(chalk.blue(message));
      }
    });
  }

  /**
   * Filter issues by minimum severity level
   */
  static filterBySeverity(issues: AnalysisIssue[], minSeverity: IssueSeverity): AnalysisIssue[] {
    const severityOrder: Record<IssueSeverity, number> = {
      error: 3,
      warning: 2,
      info: 1,
    };
    
    const minLevel = severityOrder[minSeverity];
    return issues.filter(issue => severityOrder[issue.severity] >= minLevel);
  }

  private static getSeverityIcon(severity: IssueSeverity): string {
    switch (severity) {
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'info':
        return 'ℹ️';
      default:
        return '⚪';
    }
  }

  private static getSeverityColor(severity: IssueSeverity): typeof chalk.red {
    switch (severity) {
      case 'error':
        return chalk.red;
      case 'warning':
        return chalk.yellow;
      case 'info':
        return chalk.blue;
      default:
        return chalk.white;
    }
  }
}