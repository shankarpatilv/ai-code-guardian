import { CodeAnalysis } from '../../types';

/**
 * Handles output formatting for different display modes
 */
export class OutputFormatter {

  /**
   * Format analysis as JSON string
   */
  formatAsJson(analysis: CodeAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }

  /**
   * Format analysis as plain text
   */
  formatAsText(analysis: CodeAnalysis): string {
    const lines = [
      `File: ${analysis.file}`,
      `Language: ${analysis.language}`,
      `Analysis Time: ${analysis.analysisTime}ms`,
      `Issues Found: ${analysis.issues.length}`,
      `Lines of Code: ${analysis.metrics.linesOfCode}`,
      ''
    ];

    if (analysis.issues.length > 0) {
      lines.push('Issues:');
      analysis.issues.forEach((issue, index) => {
        lines.push(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        if (issue.range) {
          lines.push(`     Location: Line ${issue.range.start.line}, Column ${issue.range.start.column}`);
        }
        if (issue.suggestion) {
          lines.push(`     Suggestion: ${issue.suggestion}`);
        }
        lines.push('');
      });
    }

    return lines.join('\n');
  }

  /**
   * Format analysis as table data (for CLI table display)
   */
  formatAsTable(analysis: CodeAnalysis): Record<string, string | number>[] {
    if (analysis.issues.length === 0) {
      return [{
        File: analysis.file,
        Language: analysis.language,
        Issues: 0,
        'Analysis Time (ms)': analysis.analysisTime
      }];
    }

    return analysis.issues.map(issue => ({
      Severity: issue.severity.toUpperCase(),
      Category: issue.category,
      Message: issue.message,
      Line: issue.range?.start.line || 'N/A',
      Rule: issue.rule
    }));
  }

  /**
   * Format metrics summary
   */
  formatMetricsSummary(analysis: CodeAnalysis): string {
    const metrics = analysis.metrics;
    return [
      'Code Metrics:',
      `  Lines of Code: ${metrics.linesOfCode}`,
      `  Cyclomatic Complexity: ${metrics.cyclomaticComplexity}`,
      `  Cognitive Complexity: ${metrics.cognitiveComplexity}`,
      `  Function Count: ${metrics.functionCount}`,
      `  Class Count: ${metrics.classCount}`,
      `  Max Nesting Depth: ${metrics.maxNestingDepth}`
    ].join('\n');
  }
}