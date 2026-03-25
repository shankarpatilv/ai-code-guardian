import { AnalyzerConfig, Severity } from '../../types';

/**
 * Configuration validation utilities
 */
export class ConfigValidator {

  /**
   * Validate analyzer configuration
   */
  static validateConfig(config: Partial<AnalyzerConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate basic properties
    if (config.maxIssues !== undefined && (config.maxIssues < 0 || !Number.isInteger(config.maxIssues))) {
      errors.push('maxIssues must be a non-negative integer');
    }

    // Validate severity threshold
    if (config.severityThreshold !== undefined && !this.isValidSeverity(config.severityThreshold)) {
      errors.push('severityThreshold must be one of: error, warning, info');
    }

    // Validate performance settings
    if (config.performance) {
      if (config.performance.timeout !== undefined && config.performance.timeout <= 0) {
        errors.push('performance.timeout must be greater than 0');
      }

      if (config.performance.maxFileSize !== undefined && config.performance.maxFileSize <= 0) {
        errors.push('performance.maxFileSize must be greater than 0');
      }
    }

    // Validate rules array
    if (config.rules !== undefined && !Array.isArray(config.rules)) {
      errors.push('rules must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if severity is valid
   */
  private static isValidSeverity(severity: any): severity is Severity {
    return ['error', 'warning', 'info'].includes(severity);
  }

  /**
   * Sanitize configuration values
   */
  static sanitizeConfig(config: Partial<AnalyzerConfig>): Partial<AnalyzerConfig> {
    const sanitized: Partial<AnalyzerConfig> = { ...config };

    // Ensure non-negative integers
    if (sanitized.maxIssues !== undefined) {
      sanitized.maxIssues = Math.max(0, Math.floor(sanitized.maxIssues));
    }

    // Ensure performance settings are positive
    if (sanitized.performance?.timeout !== undefined) {
      sanitized.performance.timeout = Math.max(100, sanitized.performance.timeout);
    }

    if (sanitized.performance?.maxFileSize !== undefined) {
      sanitized.performance.maxFileSize = Math.max(1024, sanitized.performance.maxFileSize);
    }

    return sanitized;
  }
}