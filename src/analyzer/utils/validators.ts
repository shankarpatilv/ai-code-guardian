import { AnalyzerConfig } from '../../types';

/**
 * Validate file path for security
 */
export function validateFilePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }

  // Prevent path traversal attacks
  if (filePath.includes('..') || filePath.includes('~')) {
    return false;
  }

  // Check for absolute path attempts in a way that could escape
  if (/^\/etc|^\/usr|^\/bin|^\/sbin|^\/var|^\/tmp/.test(filePath)) {
    return false;
  }

  return true;
}

/**
 * Validate content size
 */
export function validateContentSize(content: string, config: AnalyzerConfig): boolean {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const maxSize = config.performance?.maxFileSize || 1024 * 1024; // 1MB default
  return content.length <= maxSize;
}

/**
 * Validate language is supported
 */
export function validateLanguage(language: string): boolean {
  const supportedLanguages = [
    'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
    'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r',
    'objc', 'bash', 'sql', 'html', 'css', 'json', 'xml', 'yaml', 'markdown'
  ];
  
  return supportedLanguages.includes(language);
}

/**
 * Validate configuration object
 */
export function validateConfig(config: any): config is AnalyzerConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Check required fields
  if (typeof config.enabled !== 'boolean') {
    return false;
  }

  // Check performance settings if present
  if (config.performance) {
    if (typeof config.performance.timeout !== 'number' ||
        typeof config.performance.maxFileSize !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Escape shell metacharacters
  sanitized = sanitized.replace(/[;&|`$<>\\]/g, '\\$&');
  
  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized;
}