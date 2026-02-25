import Parser from 'web-tree-sitter';
import { SupportedLanguage } from '../types';
import { Logger } from '../utils/logger';

export interface ASTNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  endPosition: { row: number; column: number };
  children?: ASTNode[];
}

export interface ParsedAST {
  language: SupportedLanguage;
  rootNode: ASTNode;
  source: string;
  success: boolean;
  error?: string;
}

/**
 * AST Parser using tree-sitter for accurate syntax analysis
 */
export class ASTParser {
  private parser: Parser | null = null;
  private logger: Logger;
  private languageCache = new Map<SupportedLanguage, any>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private readonly MAX_CACHE_SIZE = 10; // Limit cache size to prevent unbounded growth

  constructor() {
    this.logger = new Logger('ASTParser');
  }

  /**
   * Initialize the parser with tree-sitter (prevents concurrent initialization)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Prevent concurrent initialization
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }
  
  private async performInitialization(): Promise<void> {
    try {
      await Parser.init();
      this.parser = new Parser();
      this.initialized = true;
      this.logger.debug('AST Parser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AST Parser', error as Error);
      this.initPromise = null; // Reset on failure to allow retry
      throw new Error(`Failed to initialize tree-sitter: ${error}`);
    }
  }

  /**
   * Parse source code and return AST
   */
  async parse(source: string, language: SupportedLanguage): Promise<ParsedAST> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.parser) {
      return {
        language,
        rootNode: this.createEmptyNode(),
        source,
        success: false,
        error: 'Parser not initialized'
      };
    }

    try {
      const languageModule = await this.getLanguageModule(language);
      if (!languageModule) {
        return {
          language,
          rootNode: this.createEmptyNode(),
          source,
          success: false,
          error: `Language ${language} not supported`
        };
      }

      this.parser.setLanguage(languageModule);
      const tree = this.parser.parse(source);
      
      return {
        language,
        rootNode: this.convertToASTNode(tree.rootNode),
        source,
        success: true
      };
    } catch (error) {
      this.logger.error(`Failed to parse ${language} code`, error as Error);
      return {
        language,
        rootNode: this.createEmptyNode(),
        source,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown parse error'
      };
    }
  }

  /**
   * Get tree-sitter language module for supported languages
   */
  private async getLanguageModule(language: SupportedLanguage): Promise<any> {
    if (this.languageCache.has(language)) {
      return this.languageCache.get(language);
    }

    try {
      let languageModule;
      
      switch (language) {
        case 'javascript':
          languageModule = await import('tree-sitter-javascript');
          break;
        case 'typescript':
          languageModule = await import('tree-sitter-typescript');
          // Use TypeScript parser for .ts files
          languageModule = languageModule.typescript;
          break;
        case 'python':
          languageModule = await import('tree-sitter-python');
          break;
        default:
          return null;
      }

      // Implement LRU cache eviction to prevent unbounded growth
      if (this.languageCache.size >= this.MAX_CACHE_SIZE) {
        const firstKey = this.languageCache.keys().next().value;
        if (firstKey !== undefined) {
          this.languageCache.delete(firstKey);
          this.logger.debug(`Evicted language module from cache: ${firstKey}`);
        }
      }
      
      this.languageCache.set(language, languageModule);
      return languageModule;
    } catch (error) {
      this.logger.error(`Failed to load language module for ${language}`, error as Error);
      return null;
    }
  }

  /**
   * Convert tree-sitter node to our AST node format
   */
  private convertToASTNode(node: any): ASTNode {
    const astNode: ASTNode = {
      type: node.type,
      text: node.text,
      startPosition: {
        row: node.startPosition.row,
        column: node.startPosition.column
      },
      endPosition: {
        row: node.endPosition.row,
        column: node.endPosition.column
      }
    };

    if (node.childCount > 0) {
      astNode.children = [];
      for (let i = 0; i < node.childCount; i++) {
        astNode.children.push(this.convertToASTNode(node.child(i)));
      }
    }

    return astNode;
  }

  /**
   * Create an empty AST node for error cases
   */
  private createEmptyNode(): ASTNode {
    return {
      type: 'program',
      text: '',
      startPosition: { row: 0, column: 0 },
      endPosition: { row: 0, column: 0 },
      children: []
    };
  }

  /**
   * Find nodes by type in the AST
   */
  findNodesByType(ast: ParsedAST, nodeType: string): ASTNode[] {
    if (!ast.success) return [];
    
    const results: ASTNode[] = [];
    this.traverseNodes(ast.rootNode, (node) => {
      if (node.type === nodeType) {
        results.push(node);
      }
    });
    return results;
  }

  /**
   * Find nodes matching a predicate function
   */
  findNodes(ast: ParsedAST, predicate: (node: ASTNode) => boolean): ASTNode[] {
    if (!ast.success) return [];
    
    const results: ASTNode[] = [];
    this.traverseNodes(ast.rootNode, (node) => {
      if (predicate(node)) {
        results.push(node);
      }
    });
    return results;
  }

  /**
   * Traverse all nodes in the AST
   */
  private traverseNodes(node: ASTNode, callback: (node: ASTNode) => void): void {
    callback(node);
    if (node.children) {
      for (const child of node.children) {
        this.traverseNodes(child, callback);
      }
    }
  }

  /**
   * Get the line number for a node
   */
  getNodeLine(node: ASTNode): number {
    return node.startPosition.row + 1; // Convert to 1-based line numbers
  }

  /**
   * Check if AST parsing is available for a language
   */
  isLanguageSupported(language: SupportedLanguage): boolean {
    return ['javascript', 'typescript', 'python'].includes(language);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.parser) {
      this.parser.delete();
      this.parser = null;
    }
    this.languageCache.clear();
    this.initialized = false;
  }
}

// Export singleton instance
let astParserInstance: ASTParser | null = null;

export function getASTParser(): ASTParser {
  if (!astParserInstance) {
    astParserInstance = new ASTParser();
  }
  return astParserInstance;
}

export function resetASTParser(): void {
  if (astParserInstance) {
    astParserInstance.dispose();
    astParserInstance = null;
  }
}