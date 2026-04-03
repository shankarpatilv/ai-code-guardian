/**
 * Unit tests for AST Parser
 */

import { ASTParser, createASTParser } from '../../../src/parser';

describe('ASTParser', () => {
  let parser: ASTParser;

  beforeEach(() => {
    parser = createASTParser(10, 50); // Small cache for testing
  });

  afterEach(() => {
    parser.reset();
  });

  describe('initialization', () => {
    test('should initialize successfully', async () => {
      await expect(parser.initialize()).resolves.not.toThrow();
    });

    test('should detect supported languages', () => {
      const supportedLanguages = parser.getSupportedLanguages();
      expect(supportedLanguages).toContain('javascript');
      expect(supportedLanguages).toContain('typescript');
      expect(supportedLanguages).toContain('python');
    });

    test('should detect language from file path', () => {
      expect(parser.detectLanguage('test.js')).toBe('javascript');
      expect(parser.detectLanguage('test.ts')).toBe('typescript');
      expect(parser.detectLanguage('test.py')).toBe('python');
      expect(parser.detectLanguage('test.unknown')).toBeUndefined();
    });
  });

  describe('parsing', () => {
    beforeEach(async () => {
      await parser.initialize();
    });

    test('should parse JavaScript code successfully', async () => {
      const code = 'const x = 42; console.log(x);';
      const result = await parser.parse('test.js', code);

      expect(result.success).toBe(true);
      expect(result.tree).toBeDefined();
      expect(result.language).toBe('javascript');
      expect(result.parseTime).toBeGreaterThan(0);
      expect(result.fromCache).toBe(false);
    });

    test('should parse TypeScript code successfully', async () => {
      const code = 'interface Test { value: number; }';
      const result = await parser.parse('test.ts', code, { language: 'typescript' });

      expect(result.success).toBe(true);
      expect(result.tree).toBeDefined();
      expect(result.language).toBe('typescript');
    });

    test('should parse Python code successfully', async () => {
      const code = 'def hello():\n    print("Hello World")';
      const result = await parser.parse('test.py', code);

      expect(result.success).toBe(true);
      expect(result.tree).toBeDefined();
      expect(result.language).toBe('python');
    });

    test('should handle unsupported language', async () => {
      const code = 'some code';
      const result = await parser.parse('test.unknown', code);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported file type');
    });

    test('should handle malformed code gracefully', async () => {
      const code = 'const x = { unclosed object';
      const result = await parser.parse('test.js', code);

      // Should still succeed but may have errors in the tree
      expect(result.success).toBe(true);
      expect(result.tree).toBeDefined();
    });

    test('should use cache for repeated parses', async () => {
      const code = 'const x = 42;';
      
      // First parse
      const result1 = await parser.parse('test.js', code);
      expect(result1.fromCache).toBe(false);

      // Second parse should use cache
      const result2 = await parser.parse('test.js', code);
      expect(result2.fromCache).toBe(true);
      expect(result2.success).toBe(true);
    });

    test('should handle parse timeout', async () => {
      const code = 'const x = 42;';
      const result = await parser.parse('test.js', code, { timeout: 1 }); // Very short timeout

      // Should still succeed for simple code
      expect(result.success).toBe(true);
    });
  });

  describe('caching', () => {
    beforeEach(async () => {
      await parser.initialize();
    });

    test('should cache parse results', async () => {
      const code = 'const x = 42;';
      
      await parser.parse('test.js', code);
      const stats = parser.getStats();
      
      expect(stats.totalParses).toBe(1);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(1);

      // Parse again
      await parser.parse('test.js', code);
      const stats2 = parser.getStats();
      
      expect(stats2.totalParses).toBe(1); // No new parse
      expect(stats2.cacheHits).toBe(1);
    });

    test('should invalidate cache when content changes', async () => {
      const code1 = 'const x = 42;';
      const code2 = 'const y = 24;';
      
      await parser.parse('test.js', code1);
      await parser.parse('test.js', code2); // Different content
      
      const stats = parser.getStats();
      expect(stats.totalParses).toBe(2); // Two separate parses
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      await parser.initialize();
    });

    test('should track parsing statistics', async () => {
      await parser.parse('test.js', 'const x = 42;');
      await parser.parse('test.ts', 'const y: number = 24;');
      
      const stats = parser.getStats();
      
      expect(stats.totalParses).toBe(2);
      expect(stats.languageDistribution.javascript).toBe(1);
      expect(stats.languageDistribution.typescript).toBe(1);
      expect(stats.averageParseTime).toBeGreaterThan(0);
    });

    test('should get cache health metrics', async () => {
      const health = parser.getCacheHealth();
      
      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('issues');
      expect(health).toHaveProperty('recommendations');
    });
  });

  describe('query execution', () => {
    beforeEach(async () => {
      await parser.initialize();
    });

    test('should execute queries on parsed code', async () => {
      const code = 'const x = 42; const y = 24;';
      const query = '(variable_declaration) @var_decl';
      
      const matches = await parser.executeQuery('test.js', code, query);
      
      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBe(true);
      // Should find variable declarations
    });

    test('should return empty matches for invalid queries', async () => {
      const code = 'const x = 42;';
      const invalidQuery = '(invalid_syntax';
      
      const matches = await parser.executeQuery('test.js', code, invalidQuery);
      
      expect(matches).toEqual([]);
    });
  });
});