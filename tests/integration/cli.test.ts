/**
 * Integration tests for CLI
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../../dist/cli.js');
const FIXTURES_PATH = join(__dirname, '../fixtures');

// Helper function to run CLI command
function runCLI(args: string[], input?: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code || 0 });
    });

    if (input) {
      child.stdin?.write(input);
      child.stdin?.end();
    }
  });
}

describe('CLI Integration Tests', () => {
  // Skip if CLI is not built
  beforeAll(async () => {
    try {
      await fs.access(CLI_PATH);
    } catch {
      console.warn('CLI not built, skipping integration tests');
      return;
    }
  });

  describe('analyze command', () => {
    it('should analyze a clean JavaScript file', async () => {
      const filePath = join(FIXTURES_PATH, 'clean-code.js');
      const result = await runCLI(['analyze', filePath]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('AI Code Guardian Analysis');
      expect(result.stdout).toContain('clean-code.js');
      expect(result.stdout).toContain('javascript');
    });

    it('should analyze content from stdin', async () => {
      const code = 'console.log("Hello, World!");';
      const result = await runCLI(['analyze', '--stdin', '--language', 'javascript'], code);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('<stdin>');
      expect(result.stdout).toContain('javascript');
    });

    it('should output JSON format', async () => {
      const filePath = join(FIXTURES_PATH, 'clean-code.js');
      const result = await runCLI(['analyze', filePath, '--format', 'json']);

      expect(result.code).toBe(0);
      
      const output = JSON.parse(result.stdout);
      expect(output).toHaveProperty('file');
      expect(output).toHaveProperty('language');
      expect(output).toHaveProperty('metrics');
      expect(output).toHaveProperty('issues');
    });

    it('should handle missing file gracefully', async () => {
      const result = await runCLI(['analyze', '/nonexistent/file.js']);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Analysis failed');
    });

    it('should analyze Python files', async () => {
      const filePath = join(FIXTURES_PATH, 'python-samples.py');
      const result = await runCLI(['analyze', filePath]);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('python');
    });

    it('should respect language override', async () => {
      const filePath = join(FIXTURES_PATH, 'clean-code.js');
      const result = await runCLI(['analyze', filePath, '--language', 'typescript']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('typescript');
    });
  });

  describe('hook command', () => {
    it('should process Write hook', async () => {
      const result = await runCLI([
        'hook',
        '--tool', 'Write',
        '--file', '/test/example.js',
        '--content', 'const x = 1;'
      ]);

      expect(result.code).toBe(0);
    });

    it('should process Edit hook', async () => {
      const editContent = JSON.stringify({ new_string: 'const y = 2;' });
      const result = await runCLI([
        'hook',
        '--tool', 'Edit',
        '--file', '/test/example.js',
        '--content', editContent
      ]);

      expect(result.code).toBe(0);
    });

    it('should handle invalid hook arguments', async () => {
      const result = await runCLI(['hook', '--tool', 'InvalidTool']);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Hook processing failed');
    });
  });

  describe('config command', () => {
    it('should show current configuration', async () => {
      const result = await runCLI(['config', '--show']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('timeout');
      expect(result.stdout).toContain('maxFileSize');
    });
  });

  describe('perf command', () => {
    it('should show performance statistics', async () => {
      const result = await runCLI(['perf']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('Performance Statistics');
    });
  });

  describe('help and version', () => {
    it('should show help', async () => {
      const result = await runCLI(['--help']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('ai-code-guardian');
      expect(result.stdout).toContain('analyze');
    });

    it('should show version', async () => {
      const result = await runCLI(['--version']);

      expect(result.code).toBe(0);
      expect(result.stdout).toContain('1.0.0');
    });
  });
});