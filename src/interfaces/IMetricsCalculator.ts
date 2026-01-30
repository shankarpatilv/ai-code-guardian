import { CodeMetrics } from '../types';

/**
 * Interface for metrics calculation
 */
export interface IMetricsCalculator {
  /**
   * Calculate basic code metrics
   */
  calculateBasicMetrics(content: string): CodeMetrics;
  
  /**
   * Calculate lines of code
   */
  calculateLinesOfCode(content: string): number;
  
  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(content: string): number;
  
  /**
   * Calculate cognitive complexity
   */
  calculateCognitiveComplexity(content: string): number;
  
  /**
   * Calculate function count
   */
  calculateFunctionCount(content: string): number;
  
  /**
   * Calculate class count
   */
  calculateClassCount(content: string): number;
  
  /**
   * Calculate maximum nesting depth
   */
  calculateMaxNestingDepth(content: string): number;
}