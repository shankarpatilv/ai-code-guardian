/**
 * Integration tests for Hook System
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

const HOOK_SCRIPT = join(__dirname, '../../hooks/analyze.sh');
const FIXTURES_PATH = join(__dirname, '../fixtures');

// Helper function to run hook script
function runHookScript(args: string[], env?: Record<string, string>): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const child = spawn('bash', [HOOK_SCRIPT, ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
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
  });
}

describe('Hook System Integration Tests', () => {
  beforeAll(async () => {
    // Ensure hook script exists and is executable
    try {
      await fs.access(HOOK_SCRIPT);
      await fs.chmod(HOOK_SCRIPT, '755');
    } catch {
      console.warn('Hook script not found, skipping integration tests');
      return;
    }
  });

  describe('analyze.sh script', () => {
    it('should process Write tool operation', async () => {
      const testFile = join(FIXTURES_PATH, 'clean-code.js');
      const result = await runHookScript([
        '--tool', 'Write',
        '--file', testFile,
        '--content', ''
      ], {
        GUARDIAN_ROOT: join(__dirname, '../..'),
        GUARDIAN_DEBUG: 'true'
      });

      expect(result.code).toBe(0);
      expect(result.stderr).toContain('Processing hook');
    });

    it('should process Edit tool operation', async () => {
      const editContent = JSON.stringify({ new_string: 'const edited = true;' });
      const result = await runHookScript([
        '--tool', 'Edit',
        '--file', '/test/file.js',
        '--content', editContent
      ], {
        GUARDIAN_ROOT: join(__dirname, '../..'),
        GUARDIAN_DEBUG: 'true'
      });

      expect(result.code).toBe(0);
      expect(result.stderr).toContain('Processing hook');
    });

    it('should handle missing required arguments', async () => {
      const result = await runHookScript(['--tool', 'Write']);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain('File path is required');
    });

    it('should handle unknown tool types', async () => {
      const result = await runHookScript([
        '--tool', 'UnknownTool',
        '--file', '/test/file.js'
      ]);

      expect(result.code).toBe(0); // Should not fail, just warn
      expect(result.stderr).toContain('Unknown tool type');
    });

    it('should detect different languages', async () => {
      const testCases = [
        { file: join(FIXTURES_PATH, 'clean-code.js'), expectedLang: 'javascript' },
        { file: join(FIXTURES_PATH, 'python-samples.py'), expectedLang: 'python' },
      ];

      for (const testCase of testCases) {
        const result = await runHookScript([
          '--tool', 'Write',
          '--file', testCase.file,
          '--content', ''
        ], {
          GUARDIAN_DEBUG: 'true'
        });

        expect(result.code).toBe(0);
        expect(result.stderr).toContain(`Detected language: ${testCase.expectedLang}`);
      }
    });

    it('should perform basic security analysis', async () => {
      const vulnerableCode = `
        function dangerous(userInput) {
          eval(userInput);
          document.write(userInput);
        }
      `;

      // Create temporary file for testing
      const tempFile = join(__dirname, '../temp-vulnerable.js');
      await fs.writeFile(tempFile, vulnerableCode);

      try {
        const result = await runHookScript([
          '--tool', 'Write',
          '--file', tempFile,
          '--content', ''
        ], {
          GUARDIAN_DEBUG: 'true'
        });

        expect(result.code).toBe(0);
        expect(result.stderr).toContain('SECURITY');
      } finally {
        // Clean up
        await fs.unlink(tempFile).catch(() => {});
      }
    });

    it('should handle TypeScript analyzer when available', async () => {
      const result = await runHookScript([
        '--tool', 'Write',
        '--file', join(FIXTURES_PATH, 'clean-code.js'),
        '--content', ''
      ], {
        GUARDIAN_ROOT: join(__dirname, '../..'),
        GUARDIAN_DEBUG: 'true'
      });

      expect(result.code).toBe(0);
      // Should either call TypeScript analyzer or fall back to shell analysis
      expect(result.stderr).toMatch(/(TypeScript analyzer|fallback shell analysis)/);
    });

    it('should respect debug mode', async () => {
      const result = await runHookScript([
        '--tool', 'Write',
        '--file', join(FIXTURES_PATH, 'clean-code.js'),
        '--content', ''
      ], {
        GUARDIAN_DEBUG: 'true'
      });

      expect(result.stderr).toContain('[GUARDIAN-INFO]');
    });

    it('should work without debug mode', async () => {
      const result = await runHookScript([
        '--tool', 'Write',
        '--file', join(FIXTURES_PATH, 'clean-code.js'),
        '--content', ''
      ], {
        GUARDIAN_DEBUG: 'false'
      });

      expect(result.code).toBe(0);
      // Should not contain debug logs
      expect(result.stderr).not.toContain('[GUARDIAN-INFO]');
    });
  });

  describe('hook configuration', () => {
    it('should read hooks.json correctly', async () => {
      const hooksPath = join(__dirname, '../../hooks/hooks.json');
      const hooksContent = await fs.readFile(hooksPath, 'utf-8');
      const hooks = JSON.parse(hooksContent);

      expect(hooks).toHaveProperty('hooks');
      expect(hooks.hooks).toHaveProperty('PostToolUse');
      expect(hooks.hooks).toHaveProperty('PreToolUse');

      const postToolUseHooks = hooks.hooks.PostToolUse;
      expect(postToolUseHooks).toHaveLength(1);
      expect(postToolUseHooks[0].matcher).toBe('Write|Edit|MultiEdit');
    });
  });

  describe('end-to-end hook processing', () => {
    it('should process a complete Write -> Analyze flow', async () => {
      const testCode = `
        const apiKey = "sk_test_1234567890"; // Hardcoded secret
        
        function getUserData(userId) {
          const query = "SELECT * FROM users WHERE id = " + userId; // SQL injection
          return database.query(query);
        }
      `;

      const tempFile = join(__dirname, '../temp-e2e.js');
      await fs.writeFile(tempFile, testCode);

      try {
        const result = await runHookScript([
          '--tool', 'Write',
          '--file', tempFile,
          '--content', ''
        ], {
          GUARDIAN_ROOT: join(__dirname, '../..'),
          GUARDIAN_DEBUG: 'true'
        });

        expect(result.code).toBe(0);
        expect(result.stderr).toContain('Processing hook');
        
        // Should detect security issues with the basic analyzer
        expect(result.stderr).toMatch(/(SECURITY|potential)/i);
        
      } finally {
        await fs.unlink(tempFile).catch(() => {});
      }
    });
  });
});