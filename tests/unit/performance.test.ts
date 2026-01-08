/**
 * Unit tests for Performance utilities
 */

import { Timer, Profiler, formatDuration, timeSync } from '../../src/utils/performance';

describe('Timer', () => {
  let timer: InstanceType<typeof Timer>;

  beforeEach(() => {
    timer = new Timer();
  });

  describe('basic timing', () => {
    it('should track elapsed time', async () => {
      const initialTime = timer.getElapsedTime();
      expect(initialTime).toBeGreaterThanOrEqual(0);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const elapsed = timer.getElapsedTime();
      expect(elapsed).toBeGreaterThan(initialTime);
    });

    it('should mark and measure intervals', () => {
      timer.mark('start');
      timer.mark('end');
      
      const duration = timer.measure('interval', 'start');
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw error for non-existent mark', () => {
      expect(() => timer.measure('test', 'nonexistent')).toThrow('Mark "nonexistent" not found');
    });

    it('should reset timer', () => {
      timer.mark('test');
      const elapsed1 = timer.getElapsedTime();
      
      timer.reset();
      const elapsed2 = timer.getElapsedTime();
      
      expect(elapsed2).toBeLessThan(elapsed1);
    });
  });

  describe('formatDuration', () => {
    it('should format microseconds', () => {
      expect(Timer.formatDuration(0.5)).toBe('500μs');
    });

    it('should format milliseconds', () => {
      expect(Timer.formatDuration(10.5)).toBe('10.50ms');
    });

    it('should format seconds', () => {
      expect(Timer.formatDuration(1500)).toBe('1.50s');
    });
  });
});

describe('Profiler', () => {
  beforeEach(() => {
    Profiler.clearStats();
  });

  describe('performance monitoring', () => {
    it('should check performance and log warnings', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Test warning threshold (300ms)
      Profiler.checkPerformance(350, 'slow-operation');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance')
      );
      
      consoleSpy.mockRestore();
    });

    it('should check performance and log errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Test error threshold (500ms)
      Profiler.checkPerformance(600, 'very-slow-operation');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('exceeds 500ms')
      );
      
      consoleSpy.mockRestore();
    });

    it('should collect and return statistics', () => {
      // Record some performance data
      Profiler.checkPerformance(100, 'fast-op');
      Profiler.checkPerformance(200, 'fast-op');
      Profiler.checkPerformance(150, 'fast-op');
      
      const stats = Profiler.getStats();
      expect(stats['fast-op']).toBeDefined();
      expect(stats['fast-op']?.count).toBe(3);
      expect(stats['fast-op']?.average).toBe(150);
      expect(stats['fast-op']?.min).toBe(100);
      expect(stats['fast-op']?.max).toBe(200);
    });

    it('should clear statistics', () => {
      Profiler.checkPerformance(100, 'test-op');
      const statsBefore = Profiler.getStats();
      expect(Object.keys(statsBefore).length).toBeGreaterThan(0);
      
      Profiler.clearStats();
      const statsAfter = Profiler.getStats();
      expect(Object.keys(statsAfter).length).toBe(0);
    });
  });
});

describe('utility functions', () => {
  describe('formatDuration', () => {
    it('should format microseconds', () => {
      expect(formatDuration(0.5)).toBe('500μs');
    });

    it('should format milliseconds', () => {
      expect(formatDuration(123.45)).toBe('123.45ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(2500)).toBe('2.50s');
    });

  });

  describe('timeSync', () => {
    it('should time synchronous operations', () => {
      const result = timeSync(() => {
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });

      expect(result).toBe(499500);
    });

    it('should time operations with label', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleSpy2 = jest.spyOn(console, 'error').mockImplementation();
      
      const result = timeSync(() => 42, 'test-operation');
      expect(result).toBe(42);
      
      consoleSpy.mockRestore();
      consoleSpy2.mockRestore();
    });

    it('should handle errors in timed operations', () => {
      expect(() => {
        timeSync(() => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });
  });
});