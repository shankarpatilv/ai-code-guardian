import { CodeMetrics, SupportedLanguage } from '../../types';
import { IMetricsCalculator } from '../../interfaces';
import { getASTParser, ParsedAST, ASTNode } from '../../parser/ast-parser';
import { detectLanguage } from '../utils/helpers';
import { Logger } from '../../utils/logger';

/**
 * Basic code metrics calculator
 */
export class MetricsCalculator implements IMetricsCalculator {
  private logger: Logger;
  private astParser = getASTParser();
  private useASTMetrics = true;

  constructor() {
    this.logger = new Logger('MetricsCalculator');
  }

  calculateBasicMetrics(content: string): CodeMetrics {
    const lines = content.split('\n');
    return this.calculateBasicMetricsWithLines(content, lines);
  }

  async calculateAdvancedMetrics(content: string, filePath: string): Promise<CodeMetrics> {
    const lines = content.split('\n');
    const language = detectLanguage(filePath) as SupportedLanguage;
    
    if (this.useASTMetrics && this.astParser.isLanguageSupported(language)) {
      return this.calculateMetricsWithAST(content, lines, language);
    }
    
    return this.calculateBasicMetricsWithLines(content, lines);
  }

  calculateBasicMetricsWithLines(content: string, lines: string[]): CodeMetrics {
    return {
      linesOfCode: this.calculateLinesOfCodeWithLines(lines),
      cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
      cognitiveComplexity: this.calculateCognitiveComplexity(content),
      functionCount: this.calculateFunctionCount(content),
      classCount: this.calculateClassCount(content),
      maxNestingDepth: this.calculateMaxNestingDepth(content)
    };
  }

  calculateLinesOfCode(content: string): number {
    const lines = content.split('\n');
    return this.calculateLinesOfCodeWithLines(lines);
  }

  calculateLinesOfCodeWithLines(lines: string[]): number {
    const nonEmptyLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') && 
             !trimmed.startsWith('*');
    });
    return nonEmptyLines.length;
  }

  calculateCyclomaticComplexity(content: string): number {
    // Enhanced regex-based calculation as fallback
    const decisionPoints = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g, 
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\&\&/g,
      /\|\|/g,
      /\?.*:/g // ternary operator
    ];
    
    let complexity = 1; // Base complexity
    
    for (const pattern of decisionPoints) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }
    
    return Math.min(complexity, 50); // Cap at reasonable maximum
  }

  calculateCognitiveComplexity(content: string): number {
    // Enhanced cognitive complexity calculation
    const lines = content.split('\n');
    let complexity = 0;
    let nestingDepth = 0;
    
    for (const line of lines) {
      // Track nesting depth
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      nestingDepth += openBraces - closeBraces;
      
      // Add complexity for control structures with nesting multiplier
      if (/\b(if|else\s+if|while|for|switch|catch)\b/.test(line)) {
        complexity += 1 + nestingDepth;
      }
      
      // Add complexity for logical operators
      const logicalOps = (line.match(/&&|\|\|/g) || []).length;
      complexity += logicalOps;
      
      // Add complexity for ternary operators
      const ternaryOps = (line.match(/\?.*:/g) || []).length;
      complexity += ternaryOps * (1 + nestingDepth);
    }
    
    return Math.min(complexity, 100); // Cap at reasonable maximum
  }

  calculateFunctionCount(content: string): number {
    const patterns = [
      /function\s+\w+\s*\(/g,
      /\w+\s*:\s*function\s*\(/g,
      /\w+\s*=\s*function\s*\(/g,
      /\w+\s*=\s*\(.*?\)\s*=>/g,
      /const\s+\w+\s*=\s*\(.*?\)\s*=>/g,
      /let\s+\w+\s*=\s*\(.*?\)\s*=>/g,
      /async\s+function\s+\w+\s*\(/g,
      /\w+\s*:\s*async\s*\(.*?\)\s*=>/g
    ];

    let count = 0;
    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }

    return count;
  }

  calculateClassCount(content: string): number {
    const classPattern = /\bclass\s+\w+/g;
    const matches = content.match(classPattern);
    return matches ? matches.length : 0;
  }

  calculateMaxNestingDepth(content: string): number {
    const lines = content.split('\n');
    let currentDepth = 0;
    let maxDepth = 0;

    for (const line of lines) {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;

      currentDepth += openBraces;
      maxDepth = Math.max(maxDepth, currentDepth);
      currentDepth -= closeBraces;
      currentDepth = Math.max(0, currentDepth);
    }

    return maxDepth;
  }

  /**
   * Calculate metrics using AST analysis for better accuracy
   */
  private async calculateMetricsWithAST(content: string, lines: string[], language: SupportedLanguage): Promise<CodeMetrics> {
    try {
      const ast = await this.astParser.parse(content, language);
      if (!ast.success) {
        this.logger.debug('AST parsing failed, falling back to regex-based metrics');
        return this.calculateBasicMetricsWithLines(content, lines);
      }

      return {
        linesOfCode: this.calculateLinesOfCodeWithLines(lines),
        cyclomaticComplexity: this.calculateCyclomaticComplexityAST(ast),
        cognitiveComplexity: this.calculateCognitiveComplexityAST(ast),
        functionCount: this.calculateFunctionCountAST(ast),
        classCount: this.calculateClassCountAST(ast),
        maxNestingDepth: this.calculateMaxNestingDepthAST(ast)
      };
    } catch (error) {
      this.logger.error('AST metrics calculation failed', error as Error);
      return this.calculateBasicMetricsWithLines(content, lines);
    }
  }

  /**
   * Calculate cyclomatic complexity using AST
   */
  private calculateCyclomaticComplexityAST(ast: ParsedAST): number {
    let complexity = 1; // Base complexity
    
    const decisionNodes = [
      'if_statement',
      'while_statement', 
      'for_statement',
      'switch_statement',
      'case_clause',
      'catch_clause',
      'conditional_expression', // ternary
      'logical_expression' // && ||
    ];
    
    const traverseNode = (node: ASTNode) => {
      if (decisionNodes.includes(node.type)) {
        complexity++;
        
        // Add extra complexity for logical operators
        if (node.type === 'logical_expression' && (node.text.includes('&&') || node.text.includes('||'))) {
          const operatorCount = (node.text.match(/&&|\|\|/g) || []).length;
          complexity += operatorCount - 1; // -1 because we already added 1
        }
      }
      
      if (node.children) {
        for (const child of node.children) {
          traverseNode(child);
        }
      }
    };
    
    traverseNode(ast.rootNode);
    return Math.min(complexity, 50);
  }

  /**
   * Calculate cognitive complexity using AST with nesting awareness
   */
  private calculateCognitiveComplexityAST(ast: ParsedAST): number {
    let complexity = 0;
    
    const calculateComplexity = (node: ASTNode, nestingDepth: number = 0): void => {
      let currentNesting = nestingDepth;
      
      // Control flow structures add complexity based on nesting
      if (['if_statement', 'while_statement', 'for_statement', 'switch_statement', 'catch_clause'].includes(node.type)) {
        complexity += 1 + currentNesting;
        currentNesting++;
      } else if (node.type === 'conditional_expression') {
        complexity += 1 + currentNesting;
      } else if (node.type === 'logical_expression') {
        const operatorCount = (node.text.match(/&&|\|\|/g) || []).length;
        complexity += operatorCount;
      }
      
      // Recursively process children with updated nesting
      if (node.children) {
        for (const child of node.children) {
          calculateComplexity(child, currentNesting);
        }
      }
    };
    
    calculateComplexity(ast.rootNode);
    return Math.min(complexity, 100);
  }

  /**
   * Calculate function count using AST
   */
  private calculateFunctionCountAST(ast: ParsedAST): number {
    const functionTypes = ['function_declaration', 'method_definition', 'arrow_function', 'function_expression'];
    let count = 0;
    
    for (const funcType of functionTypes) {
      const functions = this.astParser.findNodesByType(ast, funcType);
      count += functions.length;
    }
    
    return count;
  }

  /**
   * Calculate class count using AST
   */
  private calculateClassCountAST(ast: ParsedAST): number {
    const classes = this.astParser.findNodesByType(ast, 'class_declaration');
    return classes.length;
  }

  /**
   * Calculate maximum nesting depth using AST
   */
  private calculateMaxNestingDepthAST(ast: ParsedAST): number {
    let maxDepth = 0;
    
    const calculateDepth = (node: ASTNode, currentDepth: number = 0): void => {
      let nodeDepth = currentDepth;
      
      // Increment depth for nesting structures
      if (['block_statement', 'if_statement', 'while_statement', 'for_statement', 'switch_statement', 'try_statement'].includes(node.type)) {
        nodeDepth++;
        maxDepth = Math.max(maxDepth, nodeDepth);
      }
      
      if (node.children) {
        for (const child of node.children) {
          calculateDepth(child, nodeDepth);
        }
      }
    };
    
    calculateDepth(ast.rootNode);
    return maxDepth;
  }

  /**
   * Toggle AST-based metrics
   */
  setUseASTMetrics(enabled: boolean): void {
    this.useASTMetrics = enabled;
    this.logger.debug(`AST metrics ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get AST metrics status
   */
  isASTMetricsEnabled(): boolean {
    return this.useASTMetrics;
  }
}