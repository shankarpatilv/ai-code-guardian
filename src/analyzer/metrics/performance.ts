import { PerformanceMonitor } from '../../utils/performance';
import { PerformanceStats } from '../../types';

/**
 * Performance monitoring utilities for analyzer metrics
 */
export class AnalysisPerformanceMonitor {
  private static instance: AnalysisPerformanceMonitor | null = null;
  
  static getInstance(): AnalysisPerformanceMonitor {
    if (!this.instance) {
      this.instance = new AnalysisPerformanceMonitor();
    }
    return this.instance;
  }

  /**
   * Monitor analysis performance and log warnings if thresholds are exceeded
   */
  checkAnalysisPerformance(duration: number, context: string): void {
    PerformanceMonitor.checkPerformance(duration, context);
  }

  /**
   * Get current performance statistics
   */
  getStats(): PerformanceStats {
    return PerformanceMonitor.getStats();
  }

  /**
   * Clear performance statistics
   */
  clearStats(): void {
    PerformanceMonitor.clearStats();
  }

  /**
   * Record metric calculation time
   */
  recordMetricCalculation(metricName: string, duration: number): void {
    // In Phase 1, just use the global performance monitor
    // Later phases will implement detailed metric-specific tracking
    this.checkAnalysisPerformance(duration, `Metric calculation: ${metricName}`);
  }
}