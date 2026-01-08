import { CodeGuardianAnalyzer, createAnalyzer } from '../../src/analyzer';

describe('CodeGuardianAnalyzer', () => {
  let analyzer: CodeGuardianAnalyzer;

  beforeEach(() => {
    analyzer = createAnalyzer();
  });

  describe('Pattern Detection', () => {
    test('detects eval usage', async () => {
      const content = 'eval(userInput);';
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      
      expect(analysis.issues).toHaveLength(1);
      expect(analysis.issues[0]?.rule).toBe('eval-usage');
      expect(analysis.issues[0]?.severity).toBe('error');
      expect(analysis.issues[0]?.message).toContain('eval()');
    });

    test('detects hardcoded secrets', async () => {
      const content = 'const apiKey = "sk-1234567890abcdef";';
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      
      expect(analysis.issues.length).toBeGreaterThan(0);
      const secretIssue = analysis.issues.find(issue => issue.rule === 'hardcoded-secret');
      expect(secretIssue).toBeDefined();
      expect(secretIssue?.severity).toBe('error');
    });

    test('detects console statements', async () => {
      const content = 'console.log("debug");';
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      
      expect(analysis.issues.length).toBeGreaterThan(0);
      const consoleIssue = analysis.issues.find(issue => issue.rule === 'console-log');
      expect(consoleIssue).toBeDefined();
      expect(consoleIssue?.severity).toBe('warning');
    });

    test('detects TODO comments', async () => {
      const content = '// TODO: Fix this later';
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      
      expect(analysis.issues.length).toBeGreaterThan(0);
      const todoIssue = analysis.issues.find(issue => issue.rule === 'todo-comment');
      expect(todoIssue).toBeDefined();
      expect(todoIssue?.severity).toBe('info');
    });

    test('handles clean code without issues', async () => {
      const content = `
function add(a, b) {
  return a + b;
}
`;
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      
      expect(analysis.issues).toHaveLength(0);
    });
  });

  describe('Language Detection', () => {
    test('detects JavaScript files', async () => {
      const analysis = await analyzer.analyzeContent('const x = 1;', 'javascript', 'test.js');
      expect(analysis.language).toBe('javascript');
    });

    test('detects TypeScript files', async () => {
      const analysis = await analyzer.analyzeContent('const x: number = 1;', 'typescript', 'test.ts');
      expect(analysis.language).toBe('typescript');
    });

    test('detects Python files', async () => {
      const analysis = await analyzer.analyzeContent('x = 1', 'python', 'test.py');
      expect(analysis.language).toBe('python');
    });

    test('handles unknown language', async () => {
      const analysis = await analyzer.analyzeContent('some code', 'unknown', 'test.txt');
      expect(analysis.language).toBe('unknown');
    });
  });

  describe('Metrics Calculation', () => {
    test('calculates lines of code correctly', async () => {
      const content = `
line 1
line 2
line 3
`;
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      expect(analysis.metrics.linesOfCode).toBe(3); // Only count non-empty lines
    });

    test('calculates complexity metrics', async () => {
      const content = `
function test() {
  if (true) {
    if (true) {
      return 1;
    }
  }
}
`;
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      expect(analysis.metrics.cyclomaticComplexity).toBeGreaterThan(0);
      expect(analysis.metrics.maxNestingDepth).toBeGreaterThan(0);
    });

    test('handles empty content', async () => {
      const analysis = await analyzer.analyzeContent('', 'javascript', 'test.js');
      expect(analysis.metrics.linesOfCode).toBe(0);
      expect(analysis.metrics.cyclomaticComplexity).toBe(1); // Base complexity
      expect(analysis.metrics.maxNestingDepth).toBe(0);
    });
  });

  describe('Performance Timing', () => {
    test('measures analysis time', async () => {
      const content = 'const x = 1;';
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      
      expect(analysis.analysisTime).toBeGreaterThan(0);
      expect(analysis.analysisTime).toBeLessThan(500); // Under 500ms requirement
    });

    test('handles large files efficiently', async () => {
      // Create a large content string
      const content = Array(1000).fill('function test() { return 1; }').join('\n');
      
      const startTime = performance.now();
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Under 500ms requirement
      expect(analysis.metrics.linesOfCode).toBe(1000);
    });
  });

  describe('Configuration', () => {
    test('respects disabled analyzer', async () => {
      const disabledAnalyzer = new CodeGuardianAnalyzer({ enabled: false });
      const content = 'eval(userInput);';
      
      const analysis = await disabledAnalyzer.analyzeContent(content, 'javascript', 'test.js');
      expect(analysis.issues).toHaveLength(0);
    });

    test('respects max issues limit', async () => {
      const limitedAnalyzer = new CodeGuardianAnalyzer({ maxIssues: 2 });
      const content = `
eval(a);
eval(b);
eval(c);
eval(d);
`;
      
      const analysis = await limitedAnalyzer.analyzeContent(content, 'javascript', 'test.js');
      expect(analysis.issues.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Error Handling', () => {
    test('handles very large content gracefully', async () => {
      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
      
      const analysis = await analyzer.analyzeContent(largeContent, 'javascript', 'test.js');
      // Should either process or skip due to size limit, not crash
      expect(analysis).toBeDefined();
      expect(analysis.file).toBeDefined();
    });

    test('handles special characters in content', async () => {
      const content = 'const x = "🔥🚀💯";';
      
      const analysis = await analyzer.analyzeContent(content, 'javascript', 'test.js');
      expect(analysis).toBeDefined();
      expect(analysis.issues).toBeDefined();
    });
  });
});

describe('createAnalyzer', () => {
  test('creates analyzer with default config', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeInstanceOf(CodeGuardianAnalyzer);
  });

  test('creates analyzer with custom config', () => {
    const config = { enabled: false, maxIssues: 50 };
    const analyzer = createAnalyzer(config);
    expect(analyzer).toBeInstanceOf(CodeGuardianAnalyzer);
  });
});