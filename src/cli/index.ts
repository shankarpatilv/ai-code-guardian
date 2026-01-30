#!/usr/bin/env node

/**
 * AI Code Guardian - Command Line Interface
 * Entry point for CLI operations and hook execution
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { VERSION } from '../types';

// Import command handlers
import { AnalyzeCommand } from './commands/analyze';
import { HookCommand } from './commands/hook';
import { PerformanceCommand } from './commands/performance';
import { ConfigCommand } from './commands/config';

/**
 * Main CLI setup and routing
 */
export function setupCLI(): Command {
  // Configure the CLI program
  const program = new Command();

  program
    .name('ai-code-guardian')
    .description('Real-time preventative feedback system for AI-generated code')
    .version(VERSION);

  // Global options
  program
    .option('-v, --verbose', 'Enable verbose output')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('--no-color', 'Disable colored output');

  // Initialize command handlers
  const analyzeCommand = new AnalyzeCommand();
  const hookCommand = new HookCommand();
  const performanceCommand = new PerformanceCommand();
  const configCommand = new ConfigCommand();

  // Setup analyze command
  program
    .command('analyze')
    .description(analyzeCommand.getDescription())
    .argument('[file]', 'File to analyze')
    .option('-l, --language <language>', 'Programming language override')
    .option('-f, --format <format>', 'Output format (json|text|table)', 'text')
    .option('-c, --config <path>', 'Configuration file path')
    .option('--stdin', 'Read code from stdin')
    .option('--min-severity <level>', 'Minimum severity to report (error|warning|info)', 'info')
    .action(async (file, options) => {
      await analyzeCommand.execute(file, options);
    });

  // Setup hook command
  program
    .command('hook')
    .description(hookCommand.getDescription())
    .option('--tool <tool>', 'Tool name (Write|Edit|MultiEdit)')
    .option('--file <file>', 'File path')
    .option('--content <content>', 'Tool output content')
    .action(async (options) => {
      await hookCommand.execute(null, options);
    });

  // Setup watch command (Phase 1 - placeholder)
  program
    .command('watch')
    .description('Watch for file changes and analyze (development mode)')
    .argument('[directory]', 'Directory to watch', '.')
    .option('--interval <ms>', 'Check interval in milliseconds', '1000')
    .action(async (directory: string, _options: { interval?: string }) => {
      console.log(chalk.blue('Watch mode is not implemented in Phase 1'));
      console.log(chalk.gray('This feature will be available in a future release'));
      console.log(chalk.gray(`Target directory: ${directory}`));
      process.exit(0);
    });

  // Setup config command
  program
    .command('config')
    .description(configCommand.getDescription())
    .option('--show', 'Show current configuration')
    .option('--set <key=value>', 'Set configuration value')
    .action(async (options) => {
      await configCommand.execute(null, options);
    });

  // Setup performance command
  program
    .command('perf')
    .description(performanceCommand.getDescription())
    .option('--clear', 'Clear statistics after showing')
    .action(async (options) => {
      await performanceCommand.execute(null, options);
    });

  return program;
}

/**
 * Handle unhandled rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

/**
 * Main execution
 */
// Check if this file is being run directly
if (process.argv[1] && (process.argv[1].endsWith('cli.ts') || process.argv[1].endsWith('cli.js'))) {
  const program = setupCLI();
  program.parse();
}