/**
 * Unit tests for Hook Handler
 */

import { HookHandler, createHookDataFromArgs, validateHookData } from '../../src/hook-handler';

describe('HookHandler', () => {
  let hookHandler: HookHandler;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    hookHandler = new HookHandler();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('handleHookData', () => {
    it('should process Write operation with clean code', async () => {
      const hookData = JSON.stringify({
        tool: 'Write',
        file_path: '/test/file.js',
        content: 'const x = 1;\nconst y = 2;'
      });

      await hookHandler.handleHookData(hookData);

      // Should not output any errors for clean code
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('ERRORS:')
      );
    });

    it('should detect issues in Write operation', async () => {
      const hookData = JSON.stringify({
        tool: 'Write',
        file_path: '/test/file.js',
        content: 'eval("dangerous code");\nconst apiKey = "sk-1234567890";'
      });

      await hookHandler.handleHookData(hookData);

      // Should output errors for dangerous code
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI Code Guardian')
      );
    });

    it('should process Edit operation', async () => {
      const hookData = JSON.stringify({
        tool: 'Edit',
        file_path: '/test/file.js',
        new_string: 'console.log("hello");'
      });

      await hookHandler.handleHookData(hookData);

      // Should detect console.log
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle invalid hook data gracefully', async () => {
      const invalidData = 'not valid json';

      await hookHandler.handleHookData(invalidData);

      // Should handle error gracefully
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('ERROR:')
      );
    });

    it('should handle MultiEdit operation', async () => {
      const hookData = JSON.stringify({
        tool: 'MultiEdit',
        file_path: '/test/file.js',
        edits: [
          { new_string: 'const x = 1;' },
          { new_string: 'eval("test")' }
        ]
      });

      await hookHandler.handleHookData(hookData);

      // Should detect eval in one of the edits
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('helper functions', () => {
    describe('createHookDataFromArgs', () => {
      it('should create hook data from arguments', () => {
        const args = ['Write', '/test/file.js', 'content'];
        const result = createHookDataFromArgs(args);

        expect(result).toEqual({
          tool: 'Write',
          file_path: '/test/file.js',
          content: 'content'
        });
      });

      it('should throw error for insufficient arguments', () => {
        expect(() => createHookDataFromArgs(['Write'])).toThrow('Insufficient arguments');
      });
    });

    describe('validateHookData', () => {
      it('should validate complete hook data', () => {
        const data = {
          tool: 'Write',
          file_path: '/test/file.js',
          content: 'test'
        };

        expect(validateHookData(data)).toBe(true);
      });

      it('should reject incomplete hook data', () => {
        expect(validateHookData({})).toBe(false);
        expect(validateHookData({ tool: 'Write' })).toBe(false);
        expect(validateHookData({ tool: 'Write', file_path: '/test' })).toBe(false);
      });
    });
  });

  describe('integration with analyzer', () => {
    it('should use analyzer to detect security issues', async () => {
      const hookData = JSON.stringify({
        tool: 'Write',
        file_path: '/test/vulnerable.js',
        content: `
          const password = "hardcoded123";
          eval(userInput);
          const apiKey = "sk-secret-key";
        `
      });

      await hookHandler.handleHookData(hookData);

      // Should detect multiple security issues
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI Code Guardian')
      );
    });

    it('should handle different file types', async () => {
      const pythonData = JSON.stringify({
        tool: 'Write',
        file_path: '/test/script.py',
        content: 'exec("dangerous")\napi_key = "secret"'
      });

      await hookHandler.handleHookData(pythonData);

      // Should detect issues in Python code
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});