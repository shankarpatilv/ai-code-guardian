import chalk from 'chalk';
import { ICommand } from '../../interfaces';
import { createAnalyzer } from '../../analyzer';

/**
 * Performance command handler - shows performance statistics
 */
export class PerformanceCommand implements ICommand {
  
  getName(): string {
    return 'perf';
  }

  getDescription(): string {
    return 'Show performance statistics';
  }

  async execute(_args: any, options: { clear?: boolean }): Promise<void> {
    const analyzer = createAnalyzer();
    const stats = analyzer.getPerformanceStats();
    
    console.log(chalk.bold('Performance Statistics:'));
    console.log(JSON.stringify(stats, null, 2));
    
    if (options.clear) {
      analyzer.clearPerformanceStats();
      console.log(chalk.green('Statistics cleared'));
    }
  }
}