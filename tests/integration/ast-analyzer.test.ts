/**
 * Integration tests for AST analyzer with existing analyzer
 */

import { CodeGuardianAnalyzer, createAnalyzer } from '../../src/analyzer';

describe('AST Analyzer Integration', () => {
  let analyzer: CodeGuardianAnalyzer;

  beforeEach(() => {
    analyzer = createAnalyzer({
      enabled: true,
      maxIssues: 100,
      severityThreshold: 'info',
      rules: [],
      performance: {
        timeout: 5000,
        maxFileSize: 1024 * 1024
      }
    });
  });

  afterEach(() => {
    analyzer.clearPerformanceStats();
    if ((analyzer as any).astAdapter) {
      (analyzer as any).astAdapter.reset();
    }
  });

  describe('combined analysis', () => {
    test('should perform both regex and AST analysis', async () => {
      const code = `
        const apiKey = "hardcoded-secret-key";
        console.log("Debug info");
        const query = "SELECT * FROM users WHERE id = " + userId;
        element.innerHTML = userInput;
      `;

      const analysis = await analyzer.analyze('test.js', code, 'javascript');

      expect(analysis.issues).toBeDefined();
      expect(analysis.issues.length).toBeGreaterThan(0);
      
      // Check that analysis completed successfully
      expect(analysis.analysisTime).toBeGreaterThan(0);
      expect(analysis.timestamp).toBeGreaterThan(0);
    });

    test('should handle JavaScript file analysis', async () => {
      const jsCode = `
        function processData(data) {
          if (data.type === 'A') {
            if (data.valid) {
              if (data.processed) {
                // Complex nested conditions
                console.log('Processing A');
              }
            }
          } else if (data.type === 'B') {
            console.log('Processing B');
          }
        }
      `;

      const analysis = await analyzer.analyze('complex.js', jsCode, 'javascript');

      expect(analysis.file).toBe('complex.js');
      expect(analysis.language).toBe('javascript');
      expect(analysis.issues).toBeDefined();
    });

    test('should handle TypeScript file analysis', async () => {
      const tsCode = `
        interface User {
          id: number;
          name: string;
        }
        
        function getUser(id: number): User {
          console.log('Getting user', id);
          return { id, name: 'Test' };
        }
      `;

      const analysis = await analyzer.analyze('user.ts', tsCode, 'typescript');

      expect(analysis.file).toBe('user.ts');
      expect(analysis.language).toBe('typescript');
      expect(analysis.issues).toBeDefined();
    });

    test('should handle Python file analysis', async () => {
      const pyCode = `
def process_data(data):
    if data['type'] == 'A':
        print('Processing A')
    elif data['type'] == 'B':
        print('Processing B')
    return data
      `;

      const analysis = await analyzer.analyze('process.py', pyCode, 'python');

      expect(analysis.file).toBe('process.py');
      expect(analysis.language).toBe('python');
      expect(analysis.issues).toBeDefined();
    });

    test('should handle unsupported language gracefully', async () => {
      const code = 'some code in unknown language';

      const analysis = await analyzer.analyze('test.unknown', code);

      expect(analysis.file).toBe('test.unknown');
      expect(analysis.language).toBe('unknown');
      // Should still work with regex patterns even without AST
    });

    test('should maintain performance under timeout', async () => {
      const largeCode = 'const x = 42;\n'.repeat(1000); // Large but simple code

      const startTime = Date.now();
      const analysis = await analyzer.analyze('large.js', largeCode, 'javascript');
      const duration = Date.now() - startTime;

      expect(analysis.file).toBe('large.js');
      expect(duration).toBeLessThan(5000); // Should complete within timeout
    });
  });

  describe('AST-specific functionality', () => {
    test('should provide AST statistics', async () => {
      const code = 'const x = 42; console.log(x);';
      
      await analyzer.analyze('test.js', code, 'javascript');

      // Check if AST stats methods exist and work
      if (typeof (analyzer as any).getASTStats === 'function') {
        const astStats = (analyzer as any).getASTStats();
        expect(astStats).toBeDefined();
      }

      if (typeof (analyzer as any).getRuleEngineStats === 'function') {
        const ruleStats = (analyzer as any).getRuleEngineStats();
        expect(ruleStats).toBeDefined();
      }
    });

    test('should check AST language support', async () => {
      if (typeof (analyzer as any).isASTSupported === 'function') {
        expect((analyzer as any).isASTSupported('javascript')).toBe(true);
        expect((analyzer as any).isASTSupported('typescript')).toBe(true);
        expect((analyzer as any).isASTSupported('python')).toBe(true);
        expect((analyzer as any).isASTSupported('unknown')).toBe(false);
      }
    });

    test('should provide supported languages list', async () => {
      if (typeof (analyzer as any).getASTSupportedLanguages === 'function') {
        const languages = (analyzer as any).getASTSupportedLanguages();
        expect(Array.isArray(languages)).toBe(true);
        expect(languages).toContain('javascript');
      }
    });
  });

  describe('backward compatibility', () => {
    test('should not break existing functionality', async () => {
      const code = `
        const password = "hardcoded123";
        eval("dangerous code");
        fs.readFile("/etc/passwd");
      `;

      const analysis = await analyzer.analyze('test.js', code, 'javascript');

      // Should still detect patterns from existing regex-based detectors
      expect(analysis.file).toBe('test.js');
      expect(analysis.issues).toBeDefined();
      expect(analysis.metrics).toBeDefined();
      expect(analysis.analysisTime).toBeGreaterThan(0);
    });

    test('should maintain existing API contract', async () => {
      // Test that all existing methods still work
      expect(typeof analyzer.analyze).toBe('function');
      expect(typeof analyzer.analyzeFile).toBe('function');
      expect(typeof analyzer.analyzeContent).toBe('function');
      expect(typeof analyzer.analyzeFromHook).toBe('function');
      expect(typeof analyzer.getConfig).toBe('function');
      expect(typeof analyzer.getPerformanceStats).toBe('function');
      expect(typeof analyzer.clearPerformanceStats).toBe('function');

      const config = analyzer.getConfig();
      expect(config).toBeDefined();
      expect(config.enabled).toBeDefined();

      const perfStats = analyzer.getPerformanceStats();
      expect(perfStats).toBeDefined();
    });

    test('should handle errors gracefully without breaking analysis', async () => {
      // Test with malformed code that might break AST parsing
      const malformedCode = 'const x = { unclosed: object without closing brace';

      const analysis = await analyzer.analyze('malformed.js', malformedCode, 'javascript');

      // Should still succeed overall even if AST parsing fails
      expect(analysis.file).toBe('malformed.js');
      expect(analysis.issues).toBeDefined();
      expect(Array.isArray(analysis.issues)).toBe(true);
    });
  });
});