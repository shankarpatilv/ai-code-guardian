import { AnalysisIssue } from '../types';

/**
 * Interface for pattern detection modules
 */
export interface IPatternDetector {
  /**
   * Detect patterns in code content
   */
  detectPatterns(content: string, filePath: string): Promise<AnalysisIssue[]>;
  
  /**
   * Detect patterns using pre-split lines for better performance
   */
  detectPatternsWithLines(lines: string[], filePath: string): Promise<AnalysisIssue[]>;
  
  /**
   * Get supported pattern types
   */
  getSupportedPatterns(): string[];
  
  /**
   * Check if a pattern is enabled
   */
  isPatternEnabled(patternId: string): boolean;
}