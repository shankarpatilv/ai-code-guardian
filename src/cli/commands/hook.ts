import chalk from 'chalk';
import { ICommand } from '../../interfaces';
import { createAnalyzer } from '../../analyzer';
import { OutputHandler } from '../io';

/**
 * Hook command handler - processes Claude Code hooks
 */
export class HookCommand implements ICommand {
  
  getName(): string {
    return 'hook';
  }

  getDescription(): string {
    return 'Process Claude Code hook (internal use)';
  }

  async execute(
    _args: unknown, 
    options: { tool?: string; file?: string; content?: string }
  ): Promise<void> {
    try {
      const analyzer = createAnalyzer();
      
      // Build arguments array
      const hookArgs: string[] = [];
      if (options.tool) {
        hookArgs.push('--tool', options.tool);
      }
      if (options.file) {
        hookArgs.push('--file', options.file);
      }
      if (options.content) {
        hookArgs.push('--content', options.content);
      }

      const result = await analyzer.analyzeFromHook(hookArgs);

      if (result.success && result.analysis) {
        // Output warnings/errors to stderr for Claude to display
        OutputHandler.outputHookResults(result.analysis);
      } else {
        console.error(chalk.red('Hook processing failed:'), result.error);
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('Hook execution failed:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}