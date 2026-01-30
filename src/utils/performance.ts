export class PerformanceTimer {
  private startTime: number;
  private marks: Map<string, number>;

  constructor() {
    this.startTime = performance.now();
    this.marks = new Map();
  }

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(_name: string, startMark?: string): number {
    const endTime = performance.now();
    const startTime = startMark ? this.marks.get(startMark) : this.startTime;
    
    if (!startTime) {
      throw new Error(`Mark "${startMark}" not found`);
    }
    
    return endTime - startTime;
  }

  getElapsedTime(): number {
    return performance.now() - this.startTime;
  }

  reset(): void {
    this.startTime = performance.now();
    this.marks.clear();
  }

  static formatDuration(ms: number): string {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(0)}μs`;
    } else if (ms < 1000) {
      return `${ms.toFixed(2)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  }
}

export class PerformanceMonitor {
  private static readonly WARNING_THRESHOLD = 300; // 300ms
  private static readonly ERROR_THRESHOLD = 500; // 500ms
  private static stats: { [key: string]: number[] } = {};

  static checkPerformance(duration: number, operation: string): void {
    // Record stats
    if (!this.stats[operation]) {
      this.stats[operation] = [];
    }
    this.stats[operation].push(duration);

    // Check thresholds
    if (duration > this.ERROR_THRESHOLD) {
      console.error(`⚠️ Performance: ${operation} took ${PerformanceTimer.formatDuration(duration)} (exceeds ${this.ERROR_THRESHOLD}ms threshold)`);
    } else if (duration > this.WARNING_THRESHOLD) {
      console.warn(`⚠️ Performance: ${operation} took ${PerformanceTimer.formatDuration(duration)}`);
    }
  }

  static getStats(): { [key: string]: { count: number; average: number; min: number; max: number } } {
    const result: { [key: string]: { count: number; average: number; min: number; max: number } } = {};
    
    for (const [operation, durations] of Object.entries(this.stats)) {
      const count = durations.length;
      const average = durations.reduce((a, b) => a + b, 0) / count;
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      result[operation] = { count, average, min, max };
    }
    
    return result;
  }

  static clearStats(): void {
    this.stats = {};
  }
}

// Export formatDuration as a standalone function
export function formatDuration(ms: number): string {
  return PerformanceTimer.formatDuration(ms);
}

// Aliases for backward compatibility with tests
export const Timer = PerformanceTimer;
export const Profiler = PerformanceMonitor;

// Helper function for synchronous timing
export function timeSync<T>(fn: () => T, label?: string): T {
  const timer = new PerformanceTimer();
  const result = fn();
  const duration = timer.getElapsedTime();
  
  if (label) {
    PerformanceMonitor.checkPerformance(duration, label);
  }
  
  return result;
}