/**
 * Jest test setup configuration
 */

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods for cleaner test output
const originalConsole = global.console;

beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

afterEach(() => {
  global.console = originalConsole;
});