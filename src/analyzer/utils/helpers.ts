import * as path from 'path';
import { AnalysisIssue, Severity, CodeAnalysis } from '../../types';

/**
 * Helper utilities for the analyzer
 */

/**
 * Detect programming language from file extension
 */
export function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const languageMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.r': 'r',
    '.m': 'objc',
    '.sh': 'bash',
    '.sql': 'sql',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
  };
  
  return languageMap[ext] || 'unknown';
}

/**
 * Create an empty analysis result
 */
export function createEmptyAnalysis(filePath: string, content: string, language: string): CodeAnalysis {
  return {
    file: filePath,
    language,
    content,
    issues: [],
    metrics: {
      linesOfCode: 0,
      cyclomaticComplexity: 0,
      cognitiveComplexity: 0,
      functionCount: 0,
      classCount: 0,
      maxNestingDepth: 0,
    },
    analysisTime: 0,
    timestamp: Date.now(),
  };
}

/**
 * Create a standard analysis issue
 */
export function createIssue(
  id: string,
  severity: Severity,
  category: 'security' | 'quality' | 'performance',
  message: string,
  file: string,
  line: number,
  suggestion?: string
): AnalysisIssue {
  return {
    id,
    severity,
    category,
    message,
    file,
    range: {
      start: { line, column: 1 },
      end: { line, column: 1 },
    },
    rule: id,
    suggestion,
  };
}