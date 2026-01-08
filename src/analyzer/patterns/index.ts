import { SecurityPatternDetector } from './security';
import { QualityPatternDetector } from './quality';
import { AnalysisIssue } from '../../types';

/**
 * Pattern registry - orchestrates all pattern detection modules
 */
export class PatternRegistry {
  private securityDetector: SecurityPatternDetector;
  private qualityDetector: QualityPatternDetector;

  constructor() {
    this.securityDetector = new SecurityPatternDetector();
    this.qualityDetector = new QualityPatternDetector();
  }

  async detectAllPatterns(content: string, filePath: string): Promise<AnalysisIssue[]> {
    const allIssues: AnalysisIssue[] = [];

    // Run all detectors in parallel for better performance
    const [securityIssues, qualityIssues] = await Promise.all([
      this.securityDetector.detectPatterns(content, filePath),
      this.qualityDetector.detectPatterns(content, filePath),
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