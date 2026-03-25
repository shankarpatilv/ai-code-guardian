// Simple test to verify basic functionality
const { createAnalyzer } = require('../dist/analyzer');

describe('Basic Analyzer Test', () => {
  test('createAnalyzer creates an analyzer instance', () => {
    const analyzer = createAnalyzer();
    expect(analyzer).toBeDefined();
    expect(analyzer.analyze).toBeDefined();
    expect(analyzer.analyzeFile).toBeDefined();
    expect(analyzer.analyzeContent).toBeDefined();
  });

  test('analyzer detects eval usage', async () => {
    const analyzer = createAnalyzer();
    const code = 'eval("dangerous code")';
    const result = await analyzer.analyzeContent(code, 'javascript', 'test.js');
    
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].severity).toBe('error');
    expect(result.issues[0].message).toContain('eval');
  });

  test('analyzer detects hardcoded secrets', async () => {
    const analyzer = createAnalyzer();
    const code = 'const apiKey = "sk-secret-key-123";';
    const result = await analyzer.analyzeContent(code, 'javascript', 'test.js');
    
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].severity).toBe('error');
    expect(result.issues[0].message).toContain('API key');
  });

  test('analyzer performance is under 500ms', async () => {
    const analyzer = createAnalyzer();
    const code = `
      function test() {
        const x = 1;
        console.log(x);
        // TODO: fix this
        eval("test");
      }
    `;
    
    const start = Date.now();
    const result = await analyzer.analyzeContent(code, 'javascript', 'test.js');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(500);
    expect(result.analysisTime).toBeLessThan(500);
  });
});