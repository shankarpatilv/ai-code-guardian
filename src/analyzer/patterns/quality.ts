import { AnalysisIssue, SupportedLanguage } from '../../types';
import { IPatternDetector } from '../../interfaces';
import { createIssue, detectLanguage } from '../utils/helpers';
import { getASTParser, ParsedAST, ASTNode } from '../../parser/ast-parser';
import { getRuleEngine } from '../../rules/rule-engine';
import { readFileSync } from 'fs';
import { Logger } from '../../utils/logger';

/**
 * Code quality pattern detection module
 */
export class QualityPatternDetector implements IPatternDetector {
  supportedPatterns: Set<string> = new Set([
    'long-function',
    'complex-logic',
    'duplicate-code',
    'console-log',
    'todo-comment'
  ]);
  
  private logger: Logger;
  private ruleEngine = getRuleEngine();
  private astParser = getASTParser();
  private useASTAnalysis = true;

  constructor() {
    this.logger = new Logger('QualityPatternDetector');
    this.loadQualityRules();
  }

  async detectPatterns(content: string, filePath: string): Promise<AnalysisIssue[]> {
    const lines = content.split('\n');
    
    // Combine regex-based and AST-based detection
    const regexIssues = await this.detectPatternsWithLines(lines, filePath);
    
    // Use AST analysis for supported languages
    const language = detectLanguage(filePath) as SupportedLanguage;
    const astIssues = await this.detectWithAST(content, filePath, language);
    
    return [...regexIssues, ...astIssues];
  }

  async detectPatternsWithLines(lines: string[], filePath: string): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];

    // Check for long functions
    const functionBoundaries = this.findFunctionBoundaries(lines);
    for (const func of functionBoundaries) {
      if (func.length > 50) {
        issues.push(createIssue({
          severity: 'warning',
          category: 'quality',
          message: `Function is too long (${func.length} lines)`,
          file: filePath,
          line: func.start,
          rule: 'long-function',
          suggestion: 'Consider breaking this function into smaller functions'
        }));
      }
    }

    // Check for console.log statements
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const lineNumber = i + 1;

      if (this.detectConsoleLog(line)) {
        issues.push(createIssue({
          severity: 'warning',
          category: 'quality',
          message: 'Console.log statement should be removed',
          file: filePath,
          line: lineNumber,
          rule: 'console-log',
          suggestion: 'Use proper logging framework or remove debug statements'
        }));
      }

      if (this.detectTodoComments(line)) {
        issues.push(createIssue({
          severity: 'info',
          category: 'quality',
          message: 'TODO comment found',
          file: filePath,
          line: lineNumber,
          rule: 'todo-comment',
          suggestion: 'Complete the TODO task or remove the comment'
        }));
      }
    }

    return issues;
  }

  private findFunctionBoundaries(lines: string[]): Array<{ start: number; length: number }> {
    const boundaries: Array<{ start: number; length: number }> = [];
    let inFunction = false;
    let functionStart = 0;
    let braceDepth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line && /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(/.test(line)) {
        if (!inFunction) {
          inFunction = true;
          functionStart = i + 1;
          braceDepth = 0;
        }
      }

      if (inFunction && line) {
        braceDepth += (line.match(/{/g) || []).length;
        braceDepth -= (line.match(/}/g) || []).length;

        if (braceDepth === 0 && line.includes('}')) {
          boundaries.push({
            start: functionStart,
            length: i - functionStart + 1
          });
          inFunction = false;
        }
      }
    }

    return boundaries;
  }

  private detectConsoleLog(line: string): boolean {
    return /console\.\w+\(/.test(line);
  }

  private detectTodoComments(line: string): boolean {
    return /\/\/\s*TODO|\/\*\s*TODO/.test(line);
  }

  /**
   * Perform AST-based quality analysis
   */
  private async detectWithAST(content: string, filePath: string, language: SupportedLanguage): Promise<AnalysisIssue[]> {
    if (!this.useASTAnalysis || !this.astParser.isLanguageSupported(language)) {
      return [];
    }

    try {
      const ast = await this.astParser.parse(content, language);
      if (!ast.success) {
        return [];
      }

      const issues: AnalysisIssue[] = [];
      
      // Apply rule engine analysis
      const ruleIssues = await this.ruleEngine.analyzeAST(ast, filePath);
      issues.push(...ruleIssues.filter(issue => issue.category === 'quality'));
      
      // Add custom quality metrics
      const customIssues = await this.analyzeCodeQuality(ast, filePath);
      issues.push(...customIssues);
      
      return issues;
    } catch (error) {
      this.logger.error(`Quality AST analysis failed for ${filePath}`, error as Error);
      return [];
    }
  }

  /**
   * Analyze code quality metrics using AST
   */
  private async analyzeCodeQuality(ast: ParsedAST, filePath: string): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];
    
    // Check function complexity and length
    const functionNodes = this.astParser.findNodesByType(ast, 'function_declaration');
    const arrowFunctionNodes = this.astParser.findNodesByType(ast, 'arrow_function');
    const allFunctions = [...functionNodes, ...arrowFunctionNodes];
    
    for (const func of allFunctions) {
      // Check function length
      const lineCount = func.endPosition.row - func.startPosition.row + 1;
      if (lineCount > 50) {
        issues.push({
          id: `long-function-${func.startPosition.row}`,
          severity: 'warning',
          category: 'quality',
          message: `Function is too long (${lineCount} lines)`,
          file: filePath,
          range: {
            start: { line: func.startPosition.row + 1, column: func.startPosition.column },
            end: { line: func.endPosition.row + 1, column: func.endPosition.column }
          },
          rule: 'function-length',
          suggestion: 'Consider breaking this function into smaller functions'
        });
      }
      
      // Check parameter count
      const parameterNodes = this.astParser.findNodes(ast, node => 
        node.type === 'formal_parameters' && this.isChildOf(node, func)
      );
      
      if (parameterNodes.length > 0) {
        const firstParam = parameterNodes[0];
        if (firstParam && firstParam.children) {
          const paramCount = firstParam.children.length;
          if (paramCount > 5) {
            issues.push({
              id: `too-many-params-${func.startPosition.row}`,
              severity: 'info',
              category: 'quality',
              message: `Function has too many parameters (${paramCount})`,
              file: filePath,
              range: {
                start: { line: func.startPosition.row + 1, column: func.startPosition.column },
                end: { line: func.endPosition.row + 1, column: func.endPosition.column }
              },
              rule: 'parameter-count',
              suggestion: 'Consider using an options object or reducing parameters'
            });
          }
        }
      }
      
      // Check nesting depth
      const nestingDepth = this.calculateNestingDepth(func);
      if (nestingDepth > 4) {
        issues.push({
          id: `deep-nesting-${func.startPosition.row}`,
          severity: 'warning',
          category: 'quality',
          message: `Function has deep nesting (${nestingDepth} levels)`,
          file: filePath,
          range: {
            start: { line: func.startPosition.row + 1, column: func.startPosition.column },
            end: { line: func.endPosition.row + 1, column: func.endPosition.column }
          },
          rule: 'nesting-depth',
          suggestion: 'Reduce nesting using early returns or extracting functions'
        });
      }
    }
    
    return issues;
  }

  /**
   * Calculate nesting depth of a function
   */
  private calculateNestingDepth(node: ASTNode, currentDepth: number = 0): number {
    let maxDepth = currentDepth;
    
    if (['if_statement', 'for_statement', 'while_statement', 'try_statement'].includes(node.type)) {
      currentDepth++;
    }
    
    if (node.children) {
      for (const child of node.children) {
        const childDepth = this.calculateNestingDepth(child, currentDepth);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }
    
    return maxDepth;
  }

  /**
   * Check if a node is a child of another node
   */
  private isChildOf(child: ASTNode, parent: ASTNode): boolean {
    return child.startPosition.row >= parent.startPosition.row &&
           child.endPosition.row <= parent.endPosition.row;
  }

  /**
   * Load quality rules from JSON file
   */
  private loadQualityRules(): void {
    try {
      const qualityRulesPath = require.resolve('../../rules/quality-rules.json');
      const qualityRules = JSON.parse(readFileSync(qualityRulesPath, 'utf-8'));
      this.ruleEngine.loadRulesFromJSON(qualityRules);
      this.logger.debug('Loaded quality rules');
    } catch (error) {
      this.logger.warn('Could not load quality rules file, using built-in rules only');
    }
  }

  /**
   * Toggle AST analysis
   */
  setUseASTAnalysis(enabled: boolean): void {
    this.useASTAnalysis = enabled;
  }

  /**
   * Get AST analysis status
   */
  isASTAnalysisEnabled(): boolean {
    return this.useASTAnalysis;
  }

  /**
   * Get supported patterns
   */
  getSupportedPatterns(): string[] {
    return Array.from(this.supportedPatterns);
  }

  /**
   * Check if a pattern is enabled
   */
  isPatternEnabled(patternId: string): boolean {
    return this.supportedPatterns.has(patternId);
  }
}