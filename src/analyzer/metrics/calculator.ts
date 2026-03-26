import { CodeMetrics } from '../../types';
import { IMetricsCalculator } from '../../interfaces';

/**
 * Basic code metrics calculator
 */
export class MetricsCalculator implements IMetricsCalculator {
  
  calculateBasicMetrics(content: string): CodeMetrics {
    return {
      linesOfCode: this.calculateLinesOfCode(content),
      cyclomaticComplexity: this.calculateCyclomaticComplexity(content),
      cognitiveComplexity: this.calculateCognitiveComplexity(content),
      functionCount: this.calculateFunctionCount(content),
      classCount: this.calculateClassCount(content),
      maxNestingDepth: this.calculateMaxNestingDepth(content),
    };
  }

  calculateLinesOfCode(content: string): number {
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    return nonEmptyLines.length;
  }

  calculateCyclomaticComplexity(_content: string): number {
    // Basic placeholder for Phase 1
    return 1;
  }

  calculateCognitiveComplexity(_content: string): number {
    // Basic placeholder for Phase 1
    return 1;
  }

  calculateFunctionCount(content: string): number {
    // Basic pattern matching for function declarations
    const matches = content.match(/function\s+\w+|=>\s*{|\w+\s*\([^)]*\)\s*{/g) || [];
    return matches.length;
  }

  calculateClassCount(content: string): number {
    const matches = content.match(/class\s+\w+/g) || [];
    return matches.length;
  }

  calculateMaxNestingDepth(content: string): number {
    const lines = content.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;

    lines.forEach(line => {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      currentDepth += openBraces - closeBraces;
      maxDepth = Math.max(maxDepth, currentDepth);
    });

    return maxDepth;
  }
}