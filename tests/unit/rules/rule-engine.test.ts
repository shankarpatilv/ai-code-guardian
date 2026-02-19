/**
 * Unit tests for Rule Engine
 */

import { ruleEngine, RuleDefinition } from '../../../src/rules';

describe('SimpleRuleEngine', () => {
  
  describe('basic functionality', () => {
    test('should detect eval usage', () => {
      const code = `
        function process(input) {
          eval(input);
          return true;
        }
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const evalIssue = issues.find(i => i.message.includes('eval'));
      
      expect(evalIssue).toBeDefined();
      expect(evalIssue?.severity).toBe('error');
    });

    test('should detect SQL injection patterns', () => {
      const code = `
        function getUser(id) {
          const query = 'SELECT * FROM users WHERE id = ' + id;
          return db.execute(query);
        }
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const sqlIssue = issues.find(i => i.message.toLowerCase().includes('sql'));
      
      expect(sqlIssue).toBeDefined();
      expect(sqlIssue?.severity).toBe('error');
    });

    test('should detect hardcoded secrets', () => {
      const code = `
        const apiKey = 'sk-1234567890abcdef';
        const password = 'hardcodedPassword123';
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const secretIssues = issues.filter(i => i.message.toLowerCase().includes('secret') || i.message.toLowerCase().includes('hardcoded'));
      
      expect(secretIssues.length).toBeGreaterThanOrEqual(2);
    });

    test('should detect XSS vulnerabilities', () => {
      const code = `
        function display(userInput) {
          document.getElementById('output').innerHTML = userInput;
        }
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const xssIssue = issues.find(i => i.message.toLowerCase().includes('xss') || i.message.toLowerCase().includes('innerhtml'));
      
      expect(xssIssue).toBeDefined();
    });

    test('should detect console.log statements', () => {
      const code = `
        function debug() {
          console.log('debugging');
          console.error('error');
        }
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const consoleIssues = issues.filter(i => i.message.toLowerCase().includes('console'));
      
      expect(consoleIssues.length).toBeGreaterThanOrEqual(2);
    });

    test('should handle empty code', () => {
      const code = '';
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      
      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
    });

    test('should handle Python code', () => {
      const code = `
import os
password = "hardcoded123"
exec("dangerous code")
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.py');
      
      expect(issues.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle TypeScript code', () => {
      const code = `
        const apiKey: string = 'sk-secret123';
        eval('untrusted');
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.ts');
      
      expect(issues.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('rule customization', () => {
    test('should add custom rule', () => {
      const customRule: RuleDefinition = {
        id: 'custom-test',
        name: 'Debugger Statement',
        pattern: /debugger/g,
        message: 'Debugger statement found',
        severity: 'warning',
        category: 'quality'
      };
      
      ruleEngine.addRule(customRule);
      
      const code = 'debugger;';
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const customIssue = issues.find(i => i.message.includes('Debugger'));
      
      expect(customIssue).toBeDefined();
    });

    test('should filter by severity', () => {
      const code = `
        console.log('test'); // usually warning
        eval('code'); // error
      `;
      
      const issues = ruleEngine.analyzeContent(code, 'test.js');
      const errors = issues.filter(i => i.severity === 'error');
      const warnings = issues.filter(i => i.severity === 'warning');
      
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(warnings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('performance', () => {
    test('should analyze large file quickly', () => {
      const largeCode = 'const x = 1;\n'.repeat(5000);
      
      const startTime = Date.now();
      const issues = ruleEngine.analyzeContent(largeCode, 'large.js');
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500); // Should be under 500ms
      expect(issues).toBeDefined();
    });
  });
});