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
  
  // Security: Prevent path traversal attacks
  if (filePath.includes('../') || filePath.includes('..\\')) {
    return false;
  }
  
  // Prevent null bytes and dangerous characters
  if (filePath.includes('\0') || filePath.includes('\x00')) {
    return false;
  }
  
  // Prevent absolute paths to sensitive directories (basic protection)
  const dangerousPrefixes = ['/etc/', '/proc/', '/sys/', '/dev/', 'C:\\Windows\\', 'C:\\System32\\'];
  for (const prefix of dangerousPrefixes) {
    if (filePath.startsWith(prefix)) {
      return false;
    }
  }
  
  // Check for dangerous shell characters
  if (/[;|&`$()<>{}]/.test(filePath)) {
    return false;
  }
  
  return true;
}

/**
 * Validates language specification
 */
export function validateLanguage(language: string): boolean {
  if (!language || language.trim().length === 0) {
    return false;
  }
  
  // Only allow known safe language identifiers (matching SupportedLanguage type)
  const allowedLanguages = [
    'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'objc',
    'bash', 'sql', 'html', 'css', 'json', 'xml', 'yaml', 'markdown', 'unknown'
  ];
  
  return allowedLanguages.includes(language.toLowerCase());
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