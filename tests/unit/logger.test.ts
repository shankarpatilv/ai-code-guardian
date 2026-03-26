/**
 * Unit tests for Logger utilities
 */

import { StructuredLogger, createLogger, LogLevel } from '../../src/utils/logger';

describe('StructuredLogger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create logger with default level', () => {
      const logger = new StructuredLogger('TestContext');
      // Default level is INFO, so debug messages shouldn't show
      logger.debug('test');
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      logger.info('test');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should create logger with custom level', () => {
      const logger = new StructuredLogger('TestContext', LogLevel.DEBUG);
      logger.debug('test debug');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG')
      );
    });
  });

  describe('logging methods', () => {
    it('should log error messages', () => {
      const logger = new StructuredLogger('TestContext', LogLevel.ERROR);
      logger.error('Test error message');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test error message')
      );
    });

    it('should log info messages', () => {
      const logger = new StructuredLogger('TestContext', LogLevel.INFO);
      logger.info('Test info message');
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test info message')
      );
    });

    it('should log warn messages', () => {
      const logger = new StructuredLogger('TestContext', LogLevel.INFO);
      logger.warn('Test warning');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test warning')
      );
    });

    it('should respect log level filtering', () => {
      const logger = new StructuredLogger('TestContext', LogLevel.WARN);
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      );
    });

    it('should format issues correctly', () => {
      const formatted = StructuredLogger.formatIssue('error', 'Test issue', 'line 10');
      expect(formatted).toContain('❌');
      expect(formatted).toContain('ERROR');
      expect(formatted).toContain('Test issue');
      expect(formatted).toContain('line 10');
    });
  });

  describe('createLogger', () => {
    it('should create logger instance with context', () => {
      const logger = createLogger('TestContext');
      expect(logger).toBeInstanceOf(StructuredLogger);
    });

    it('should create logger instance with context and level', () => {
      const logger = createLogger('TestContext', LogLevel.DEBUG);
      expect(logger).toBeInstanceOf(StructuredLogger);
      
      // Verify it works at debug level
      logger.debug('test');
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});