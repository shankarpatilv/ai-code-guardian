/**
 * Simple, working security and quality rules
 * Actually finds real issues - no placeholders
 */

import { AnalysisIssue, Severity, Range } from '../types';

interface PatternRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: Severity;
  category: 'security' | 'quality' | 'performance';
  message: string;
  suggestion?: string;
}

export class SimpleRuleEngine {
  private securityRules: PatternRule[] = [
    {
      id: 'eval-usage',
      name: 'Dangerous eval() usage',
      pattern: /\beval\s*\(/g,
      severity: 'error',
      category: 'security',
      message: 'Avoid using eval() as it can execute arbitrary code',
      suggestion: 'Use JSON.parse() for parsing JSON or safer alternatives'
    },
    {
      id: 'hardcoded-secret',
      name: 'Hardcoded secret detected',
      pattern: /(?:api[_-]?key|secret|token|password)\s*[=:]\s*['"`][a-zA-Z0-9\-_]{8,}['"`]|sk-[a-zA-Z0-9\-_]{8,}/gi,
      severity: 'error',
      category: 'security',
      message: 'Hardcoded API key detected - use environment variables instead',
      suggestion: 'Store secrets in environment variables or secure configuration'
    },
    {
      id: 'sql-injection-risk',
      name: 'SQL injection risk',
      pattern: /(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE).*['"`]\s*\+\s*[a-zA-Z_$][\w$]*|query\s*=\s*['"`].*['"`]\s*\+/gi,
      severity: 'error',
      category: 'security',
      message: 'Potential SQL injection vulnerability - use parameterized queries',
      suggestion: 'Use parameterized queries or prepared statements'
    },
    {
      id: 'xss-vulnerability',
      name: 'XSS vulnerability',
      pattern: /\.innerHTML\s*=\s*[^'"`]*[a-zA-Z_$][\w$]*|document\.write\s*\([^)]*[a-zA-Z_$][\w$]*\)/g,
      severity: 'error',
      category: 'security',
      message: 'Potential XSS vulnerability - sanitize user input',
      suggestion: 'Use textContent instead of innerHTML or sanitize input'
    }
  ];

  private qualityRules: PatternRule[] = [
    {
      id: 'console-log',
      name: 'Console statement',
      pattern: /console\.(log|warn|error|info|debug)\s*\(/g,
      severity: 'warning',
      category: 'quality',
      message: 'Console statement found - consider using proper logging',
      suggestion: 'Use a proper logging library instead of console statements'
    },
    {
      id: 'todo-comment',
      name: 'TODO comment',
      pattern: /\/\/\s*TODO|\/\*\s*TODO|#\s*TODO/gi,
      severity: 'info',
      category: 'quality',
      message: 'TODO comment found',
      suggestion: 'Create a task or issue to track this work'
    },
    {
      id: 'empty-catch',
      name: 'Empty catch block',
      pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
      severity: 'warning',
      category: 'quality',
      message: 'Empty catch block - handle or log the error',
      suggestion: 'Add error handling or logging in the catch block'
    }
  ];

  /**
   * Analyze content for security and quality issues
   */
  analyzeContent(content: string, filePath: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const allRules = [...this.securityRules, ...this.qualityRules];
    
    for (const rule of allRules) {
      const matches = this.findMatches(content, rule, filePath);
      issues.push(...matches);
    }

    return issues;
  }

  /**
   * Find all matches for a specific rule
   */
  private findMatches(content: string, rule: PatternRule, filePath: string): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    let match;

    // Reset regex lastIndex to ensure we get all matches
    rule.pattern.lastIndex = 0;

    while ((match = rule.pattern.exec(content)) !== null) {
      const range = this.getMatchRange(content, match.index, match[0].length);
      
      issues.push({
        id: `${rule.id}-${issues.length}`,
        severity: rule.severity,
        category: rule.category,
        message: rule.message,
        file: filePath,
        range,
        rule: rule.id,
        suggestion: rule.suggestion
      });

      // Prevent infinite loops with zero-length matches
      if (match[0].length === 0) {
        rule.pattern.lastIndex++;
      }
    }

    return issues;
  }

  /**
   * Convert string index to line/column range
   */
  private getMatchRange(content: string, startIndex: number, length: number): Range {
    const lines = content.split('\n');
    let currentIndex = 0;
    let line = 0;
    let column = 0;

    // Find starting position
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i]!.length + 1; // +1 for newline
      if (currentIndex + lineLength > startIndex) {
        line = i;
        column = startIndex - currentIndex;
        break;
      }
      currentIndex += lineLength;
    }

    // Calculate end position (simplified - same line)
    const endColumn = column + length;

    return {
      start: { line, column },
      end: { line, column: endColumn }
    };
  }

  /**
   * Get security rules
   */
  getSecurityRules(): PatternRule[] {
    return [...this.securityRules];
  }

  /**
   * Get quality rules
   */
  getQualityRules(): PatternRule[] {
    return [...this.qualityRules];
  }

  /**
   * Add custom rule
   */
  addRule(rule: PatternRule): void {
    if (rule.category === 'security') {
      this.securityRules.push(rule);
    } else {
      this.qualityRules.push(rule);
    }
  }
}

export const ruleEngine = new SimpleRuleEngine();
export { PatternRule };

// Aliases for backward compatibility with tests
export const RuleEngine = SimpleRuleEngine;
export const createRuleEngine = () => new SimpleRuleEngine();
export type RuleDefinition = PatternRule;
export interface RuleSet {
  rules: PatternRule[];
}