import { AnalysisIssue, Severity, SupportedLanguage } from '../../types';

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Group issues by severity
 */
export function groupIssuesBySeverity(issues: AnalysisIssue[]): Map<Severity, AnalysisIssue[]> {
  const grouped = new Map<Severity, AnalysisIssue[]>();
  
  for (const issue of issues) {
    if (!grouped.has(issue.severity)) {
      grouped.set(issue.severity, []);
    }
    grouped.get(issue.severity)!.push(issue);
  }
  
  return grouped;
}

/**
 * Sort issues by severity
 */
export function sortBySeverity(issues: AnalysisIssue[]): AnalysisIssue[] {
  const severityOrder: Record<Severity, number> = {
    'error': 0,
    'warning': 1,
    'info': 2
  };
  
  return issues.sort((a, b) => {
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Truncate string with ellipsis
 */
export function truncateString(str: string | undefined, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get file extension
 */
export function getFileExtension(filePath: string): string {
  const parts = filePath.split('.');
  const lastPart = parts[parts.length - 1];
  return parts.length > 1 && lastPart ? lastPart.toLowerCase() : '';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Merge configurations
 */
export function mergeConfigs<T extends Record<string, any>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base };
  
  for (const key in override) {
    if (override.hasOwnProperty(key)) {
      const value = override[key];
      if (value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
          const baseValue = base[key];
          result[key] = mergeConfigs(
            baseValue && typeof baseValue === 'object' ? baseValue : {}, 
            value
          ) as T[Extract<keyof T, string>];
        } else {
          result[key] = value as T[Extract<keyof T, string>];
        }
      }
    }
  }
  
  return result;
}

/**
 * Detect language from file extension
 */
export function detectLanguage(filePath: string): SupportedLanguage {
  const ext = getFileExtension(filePath);
  
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'c':
      return 'c';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'rb':
      return 'ruby';
    case 'php':
      return 'php';
    case 'swift':
      return 'swift';
    case 'kt':
    case 'kts':
      return 'kotlin';
    default:
      return 'unknown' as SupportedLanguage;
  }
}

/**
 * Create an issue helper
 */
export function createIssue(params: {
  severity: Severity;
  category: 'security' | 'quality' | 'performance';
  message: string;
  file: string;
  line: number;
  rule: string;
  suggestion?: string;
}): AnalysisIssue {
  return {
    id: `${params.rule}-${params.line}`,
    severity: params.severity,
    category: params.category,
    message: params.message,
    file: params.file,
    range: {
      start: { line: params.line, column: 0 },
      end: { line: params.line, column: 0 }
    },
    rule: params.rule,
    suggestion: params.suggestion
  };
}