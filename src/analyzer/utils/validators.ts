import { AnalyzerConfig } from '../../types';

/**
 * Input validation utilities for the analyzer
 */

/**
 * Validates file content size against configuration limits
 */
export function validateContentSize(content: string, config: AnalyzerConfig): boolean {
  return content.length <= config.performance.maxFileSize;
}

/**
 * Validates file path format
 */
export function validateFilePath(filePath: string): boolean {
  if (!filePath || filePath.trim().length === 0) {
    return false;
  }
  
  // Check for basic path format
  return true; // In Phase 1, we're permissive
}

/**
 * Validates language specification
 */
export function validateLanguage(language: string): boolean {
  if (!language || language.trim().length === 0) {
    return false;
  }
  
  return true; // In Phase 1, we accept any language
}

/**
 * Validates analyzer configuration
 */
export function validateAnalyzerConfig(config: Partial<AnalyzerConfig>): boolean {
  if (config.performance?.timeout && config.performance.timeout < 0) {
    return false;
  }
  
  if (config.performance?.maxFileSize && config.performance.maxFileSize < 0) {
    return false;
  }
  
  if (config.maxIssues && config.maxIssues < 0) {
    return false;
  }
  
  return true;
}