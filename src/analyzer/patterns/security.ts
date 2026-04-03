import { AnalysisIssue } from '../../types';
import { IPatternDetector } from '../../interfaces';
import { createIssue } from '../utils/helpers';

/**
 * Security pattern detection module
 */
export class SecurityPatternDetector implements IPatternDetector {
  private enabledPatterns: Set<string> = new Set([
    'hardcoded-secret',
    'eval-usage'
  ]);

  async detectPatterns(content: string, filePath: string): Promise<AnalysisIssue[]> {
    const lines = content.split('\n');
    return this.detectPatternsWithLines(lines, filePath);
  }

  async detectPatternsWithLines(lines: string[], filePath: string): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];

    lines.forEach((line, index) => {
      // Check for hardcoded secrets
      if (this.isPatternEnabled('hardcoded-secret') && this.detectHardcodedSecrets(line)) {
        issues.push(createIssue(
          'hardcoded-secret',
          'error',
          'security',
          'Hardcoded API key detected',
          filePath,
          index + 1,
          'Avoid hardcoding secrets. Use environment variables instead.'
        ));
      }

      // Check for eval usage
      if (this.isPatternEnabled('eval-usage') && this.detectEvalUsage(line)) {
        issues.push(createIssue(
          'eval-usage',
          'error',
          'security',
          'Use of eval() is dangerous and can lead to code injection',
          filePath,
          index + 1,
          'Consider using safer alternatives like JSON.parse() or Function constructor'
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

  private detectHardcodedSecrets(line: string): boolean {
    return /api[_-]?key\s*=\s*["'][^"']+["']/i.test(line);
  }

  private detectEvalUsage(line: string): boolean {
    return /\beval\s*\(/.test(line);
  }
}