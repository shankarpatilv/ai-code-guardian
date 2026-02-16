import { AnalysisIssue } from '../../types';
import { IPatternDetector } from '../../interfaces';
import { createIssue } from '../utils/helpers';

/**
 * Code quality pattern detection module
 */
export class QualityPatternDetector implements IPatternDetector {
  private enabledPatterns: Set<string> = new Set([
    'console-log',
    'todo-comment'
  ]);

  async detectPatterns(content: string, filePath: string): Promise<AnalysisIssue[]> {
    const lines = content.split('\n');
    return this.detectPatternsWithLines(lines, filePath);
  }

  async detectPatternsWithLines(lines: string[], filePath: string): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];

    lines.forEach((line, index) => {
      // Check for console statements
      if (this.isPatternEnabled('console-log') && this.detectConsoleStatements(line)) {
        issues.push(createIssue(
          'console-log',
          'warning',
          'quality',
          'Console statement found',
          filePath,
          index + 1,
          'Remove console statements before production'
        ));
      }

      // Check for TODO comments
      if (this.isPatternEnabled('todo-comment') && this.detectTodoComments(line)) {
        issues.push(createIssue(
          'todo-comment',
          'info',
          'quality',
          'TODO comment found',
          filePath,
          index + 1
        ));
      }
    });

    return issues;
  }

  getSupportedPatterns(): string[] {
    return Array.from(this.enabledPatterns);
  }

  isPatternEnabled(patternId: string): boolean {
    return this.enabledPatterns.has(patternId);
  }

  private detectConsoleStatements(line: string): boolean {
    return /console\.(log|debug|info)/.test(line);
  }

  private detectTodoComments(line: string): boolean {
    return /\/\/\s*TODO|\/\*\s*TODO/.test(line);
  }
}