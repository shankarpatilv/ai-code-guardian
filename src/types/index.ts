export type Severity = 'error' | 'warning' | 'info';

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface AnalysisIssue {
  id: string;
  severity: Severity;
  category: 'security' | 'quality' | 'performance';
  message: string;
  file: string;
  range: Range;
  rule: string;
  suggestion?: string;
}

export interface CodeMetrics {
  linesOfCode: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  functionCount: number;
  classCount: number;
  maxNestingDepth: number;
}

export interface CodeAnalysis {
  file: string;
  language: string;
  content: string;
  issues: AnalysisIssue[];
  metrics: CodeMetrics;
  analysisTime: number;
  timestamp: number;
}

export interface EditOperation {
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export interface HookData {
  tool: string;
  operation: 'Write' | 'Edit' | 'MultiEdit' | 'NotebookEdit';
  filePath: string;
  content: string | string[];
  language?: string;
  // MultiEdit specific fields
  edits?: EditOperation[];
  file_path?: string;
  // Edit specific fields
  new_string?: string;
  // NotebookEdit specific fields
  new_source?: string;
  notebook_path?: string;
}

export interface AnalyzerConfig {
  enabled: boolean;
  maxIssues: number;
  severityThreshold: Severity;
  rules: RuleConfig[];
  performance: {
    timeout: number;
    maxFileSize: number;
  };
}

export interface RuleConfig {
  id: string;
  enabled: boolean;
  severity: Severity;
  options?: Record<string, unknown>;
}

export interface PerformanceStats {
  [operation: string]: {
    count: number;
    average: number;
    min: number;
    max: number;
  };
}

export interface CommandArgs {
  [key: string]: string | boolean | undefined;
}

export interface CommandOptions {
  [key: string]: string | boolean | undefined;
}

// Additional types needed for CLI and analyzer interface
export const VERSION = '1.0.0';

export type IssueSeverity = Severity;

export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'java' 
  | 'c' 
  | 'cpp' 
  | 'csharp' 
  | 'go' 
  | 'rust' 
  | 'ruby' 
  | 'php' 
  | 'swift' 
  | 'kotlin' 
  | 'scala' 
  | 'r' 
  | 'objc' 
  | 'bash' 
  | 'sql' 
  | 'html' 
  | 'css' 
  | 'json' 
  | 'xml' 
  | 'yaml' 
  | 'markdown' 
  | 'unknown';

export interface CliOptions {
  verbose?: boolean;
  quiet?: boolean;
  color?: boolean;
  language?: SupportedLanguage;
  format?: 'json' | 'text' | 'table';
  config?: string;
  stdin?: boolean;
  minSeverity?: IssueSeverity;
}

export interface HookResult {
  success: boolean;
  analysis?: CodeAnalysis;
  error?: string;
  duration?: number;
}

// Additional types for backward compatibility with tests
export interface AnalysisContext {
  filePath: string;
  language: SupportedLanguage;
  content: string;
  options?: CliOptions;
}

export const DEFAULT_CONFIG: AnalyzerConfig = {
  enabled: true,
  maxIssues: 100,
  severityThreshold: 'info',
  rules: [],
  performance: {
    timeout: 500,
    maxFileSize: 1024 * 1024, // 1MB
  },
};