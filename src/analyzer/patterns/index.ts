import { SecurityPatternDetector } from './security';
import { QualityPatternDetector } from './quality';
import { AnalysisIssue } from '../../types';

/**
 * Pattern registry - orchestrates all pattern detection modules
 */
export class PatternRegistry {
  public securityDetector: SecurityPatternDetector;
  public qualityDetector: QualityPatternDetector;

  constructor() {
    this.securityDetector = new SecurityPatternDetector();
    this.qualityDetector = new QualityPatternDetector();
  }

  async detectAllPatterns(content: string, filePath: string): Promise<AnalysisIssue[]> {
    const allIssues: AnalysisIssue[] = [];

    // Split lines only once for better performance
    const lines = content.split('\n');

    // Run all detectors in parallel for better performance, sharing the pre-split lines
    const [securityIssues, qualityIssues] = await Promise.all([
      this.securityDetector.detectPatternsWithLines(lines, filePath),
      this.qualityDetector.detectPatternsWithLines(lines, filePath),
    ]);

    allIssues.push(...securityIssues);
    allIssues.push(...qualityIssues);

    return allIssues;
  }

  getSupportedPatterns(): string[] {
    return [
      ...this.securityDetector.getSupportedPatterns(),
      ...this.qualityDetector.getSupportedPatterns(),
    ];
  }
}

// Export detector classes for direct use
export { SecurityPatternDetector } from './security';
export { QualityPatternDetector } from './quality';