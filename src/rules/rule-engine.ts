import { AnalysisIssue, Severity, SupportedLanguage } from '../types';
import { ASTNode, ParsedAST } from '../parser/ast-parser';
import { Logger } from '../utils/logger';

// Rule configuration types
export interface ASTRuleConfig {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  category: 'security' | 'quality' | 'performance';
  enabled: boolean;
  languages: SupportedLanguage[];
  nodeTypes?: string[];
  patterns?: {
    nodeType: string;
    conditions?: RuleCondition[];
    children?: PatternSpec[];
  }[];
  customLogic?: string; // For complex rules
  suggestion?: string;
  examples?: {
    bad: string[];
    good: string[];
  };
}

export interface RuleCondition {
  type: 'attribute' | 'text' | 'parent' | 'child' | 'custom';
  attribute?: string;
  operator: 'equals' | 'contains' | 'matches' | 'exists' | 'not_exists';
  value?: string | number | boolean;
  regex?: string;
}

export interface PatternSpec {
  nodeType: string;
  conditions?: RuleCondition[];
  optional?: boolean;
  multiple?: boolean;
}

export interface RuleMatch {
  rule: ASTRuleConfig;
  node: ASTNode;
  message: string;
  suggestion?: string;
}

/**
 * AST-based rule engine for detecting patterns in parsed code
 */
export class ASTRuleEngine {
  private logger: Logger;
  private rules: Map<string, ASTRuleConfig> = new Map();
  private rulesByLanguage: Map<SupportedLanguage, ASTRuleConfig[]> = new Map();

  constructor() {
    this.logger = new Logger('ASTRuleEngine');
    this.loadDefaultRules();
  }

  /**
   * Add a rule to the engine
   */
  addRule(rule: ASTRuleConfig): void {
    this.rules.set(rule.id, rule);
    
    // Index by language for faster lookup
    for (const language of rule.languages) {
      if (!this.rulesByLanguage.has(language)) {
        this.rulesByLanguage.set(language, []);
      }
      this.rulesByLanguage.get(language)!.push(rule);
    }
    
    this.logger.debug(`Added rule: ${rule.id}`);
  }

  /**
   * Load rules from JSON configuration with robust error handling
   */
  loadRulesFromJSON(rulesData: any): void {
    try {
      // Validate input is an array
      if (!Array.isArray(rulesData)) {
        this.logger.error('Invalid rules data: expected array, got ' + typeof rulesData);
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      
      for (const [index, ruleData] of rulesData.entries()) {
        try {
          const rule = this.validateRuleConfig(ruleData);
          if (rule) {
            this.addRule(rule);
            successCount++;
          } else {
            failCount++;
            this.logger.warn(`Skipping invalid rule at index ${index}`);
          }
        } catch (ruleError) {
          failCount++;
          this.logger.error(`Failed to process rule at index ${index}`, ruleError as Error);
        }
      }
      
      this.logger.info(`Loaded ${successCount} rules, ${failCount} failed from JSON configuration`);
    } catch (error) {
      this.logger.error('Failed to load rules from JSON', error as Error);
    }
  }

  /**
   * Apply rules to an AST and return detected issues
   */
  async analyzeAST(ast: ParsedAST, filePath: string): Promise<AnalysisIssue[]> {
    if (!ast.success) {
      return [];
    }

    const languageRules = this.rulesByLanguage.get(ast.language) || [];
    const issues: AnalysisIssue[] = [];

    for (const rule of languageRules) {
      if (!rule.enabled) continue;

      try {
        const matches = await this.applyRule(rule, ast, filePath);
        issues.push(...matches);
      } catch (error) {
        this.logger.error(`Error applying rule ${rule.id}`, error as Error);
      }
    }

    return issues;
  }

  /**
   * Apply a single rule to the AST
   */
  private async applyRule(rule: ASTRuleConfig, ast: ParsedAST, filePath: string): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];
    const matches: RuleMatch[] = [];

    // Handle pattern-based rules
    if (rule.patterns) {
      for (const pattern of rule.patterns) {
        const nodeMatches = this.findPatternMatches(ast.rootNode, pattern);
        for (const node of nodeMatches) {
          matches.push({
            rule,
            node,
            message: rule.description,
            suggestion: rule.suggestion
          });
        }
      }
    }

    // Handle node type based rules
    if (rule.nodeTypes) {
      for (const nodeType of rule.nodeTypes) {
        const nodes = this.findNodesByType(ast.rootNode, nodeType);
        for (const node of nodes) {
          matches.push({
            rule,
            node,
            message: rule.description,
            suggestion: rule.suggestion
          });
        }
      }
    }

    // Convert matches to issues
    for (const match of matches) {
      issues.push({
        id: `${rule.id}-${match.node.startPosition.row}-${match.node.startPosition.column}`,
        severity: rule.severity,
        category: rule.category,
        message: match.message,
        file: filePath,
        range: {
          start: { 
            line: match.node.startPosition.row + 1, 
            column: match.node.startPosition.column 
          },
          end: { 
            line: match.node.endPosition.row + 1, 
            column: match.node.endPosition.column 
          }
        },
        rule: rule.id,
        suggestion: match.suggestion
      });
    }

    return issues;
  }

  /**
   * Find nodes matching a pattern specification
   */
  private findPatternMatches(node: ASTNode, pattern: { nodeType: string; conditions?: RuleCondition[] }): ASTNode[] {
    const matches: ASTNode[] = [];

    const traverse = (currentNode: ASTNode) => {
      if (currentNode.type === pattern.nodeType) {
        if (!pattern.conditions || this.matchesConditions(currentNode, pattern.conditions)) {
          matches.push(currentNode);
        }
      }

      if (currentNode.children) {
        for (const child of currentNode.children) {
          traverse(child);
        }
      }
    };

    traverse(node);
    return matches;
  }

  /**
   * Find all nodes of a specific type
   */
  private findNodesByType(node: ASTNode, nodeType: string): ASTNode[] {
    const nodes: ASTNode[] = [];

    const traverse = (currentNode: ASTNode) => {
      if (currentNode.type === nodeType) {
        nodes.push(currentNode);
      }

      if (currentNode.children) {
        for (const child of currentNode.children) {
          traverse(child);
        }
      }
    };

    traverse(node);
    return nodes;
  }

  /**
   * Check if a node matches all specified conditions
   */
  private matchesConditions(node: ASTNode, conditions: RuleCondition[]): boolean {
    return conditions.every(condition => this.matchesCondition(node, condition));
  }

  /**
   * Check if a node matches a single condition
   */
  private matchesCondition(node: ASTNode, condition: RuleCondition): boolean {
    switch (condition.type) {
      case 'text':
        return this.evaluateTextCondition(node.text, condition);
      case 'attribute':
        // For future extension with node attributes
        return true;
      case 'parent':
        // Check parent node conditions
        return true;
      case 'child':
        // Check child node conditions
        return node.children ? node.children.some(child => 
          condition.value ? child.type === condition.value : true
        ) : false;
      default:
        return true;
    }
  }

  /**
   * Evaluate text-based conditions
   */
  private evaluateTextCondition(text: string, condition: RuleCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return text === condition.value;
      case 'contains':
        return text.includes(String(condition.value));
      case 'matches':
        if (condition.regex) {
          return new RegExp(condition.regex).test(text);
        }
        return false;
      case 'exists':
        return text.length > 0;
      case 'not_exists':
        return text.length === 0;
      default:
        return false;
    }
  }

  /**
   * Validate rule configuration
   */
  private validateRuleConfig(ruleData: any): ASTRuleConfig | null {
    try {
      if (!ruleData.id || !ruleData.name || !ruleData.languages) {
        this.logger.warn('Invalid rule configuration: missing required fields');
        return null;
      }

      return {
        id: ruleData.id,
        name: ruleData.name,
        description: ruleData.description || '',
        severity: ruleData.severity || 'warning',
        category: ruleData.category || 'quality',
        enabled: ruleData.enabled !== false,
        languages: ruleData.languages,
        nodeTypes: ruleData.nodeTypes,
        patterns: ruleData.patterns,
        customLogic: ruleData.customLogic,
        suggestion: ruleData.suggestion,
        examples: ruleData.examples
      };
    } catch (error) {
      this.logger.error('Failed to validate rule configuration', error as Error);
      return null;
    }
  }

  /**
   * Get all enabled rules for a language
   */
  getRulesForLanguage(language: SupportedLanguage): ASTRuleConfig[] {
    return this.rulesByLanguage.get(language)?.filter(rule => rule.enabled) || [];
  }

  /**
   * Get rule by ID
   */
  getRule(id: string): ASTRuleConfig | undefined {
    return this.rules.get(id);
  }

  /**
   * Enable/disable a rule
   */
  toggleRule(id: string, enabled: boolean): void {
    const rule = this.rules.get(id);
    if (rule) {
      rule.enabled = enabled;
      this.logger.debug(`Rule ${id} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Load default rules for common security and quality patterns
   */
  private loadDefaultRules(): void {
    // Add some basic default rules - we'll expand this in the next steps
    this.addRule({
      id: 'eval-usage',
      name: 'Dangerous eval() Usage',
      description: 'Use of eval() function can lead to code injection vulnerabilities',
      severity: 'error',
      category: 'security',
      enabled: true,
      languages: ['javascript', 'typescript'],
      nodeTypes: ['call_expression'],
      patterns: [{
        nodeType: 'call_expression',
        conditions: [{
          type: 'text',
          operator: 'matches',
          regex: '\\beval\\s*\\('
        }]
      }],
      suggestion: 'Use safer alternatives like JSON.parse() or avoid dynamic code execution'
    });

    this.addRule({
      id: 'console-log',
      name: 'Console Log Statement',
      description: 'Console.log statements should not be left in production code',
      severity: 'warning',
      category: 'quality',
      enabled: true,
      languages: ['javascript', 'typescript'],
      patterns: [{
        nodeType: 'call_expression',
        conditions: [{
          type: 'text',
          operator: 'matches',
          regex: 'console\\.(log|warn|error|info|debug)'
        }]
      }],
      suggestion: 'Use proper logging framework or remove debug statements'
    });
  }

  /**
   * Get all rules
   */
  getAllRules(): ASTRuleConfig[] {
    return Array.from(this.rules.values());
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
    this.rulesByLanguage.clear();
  }
}

// Export singleton instance
let ruleEngineInstance: ASTRuleEngine | null = null;

export function getRuleEngine(): ASTRuleEngine {
  if (!ruleEngineInstance) {
    ruleEngineInstance = new ASTRuleEngine();
  }
  return ruleEngineInstance;
}

export function resetRuleEngine(): void {
  ruleEngineInstance = null;
}