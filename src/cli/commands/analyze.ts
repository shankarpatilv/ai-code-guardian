import chalk from 'chalk';
import { CliOptions, SupportedLanguage, IssueSeverity, CodeAnalysis } from '../../types';
import { ICommand } from '../../interfaces';
import { createAnalyzer } from '../../analyzer';
import { InputHandler, OutputHandler } from '../io';

/**
 * Analyze command handler
 */
export class AnalyzeCommand implements ICommand {
  
  getName(): string {
    return 'analyze';
  }

  getDescription(): string {
    return 'Analyze a file or code from stdin';
  }

  async execute(file: string | undefined, options: Partial<CliOptions>): Promise<void> {
    try {
      // Suppress logging for JSON format
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      if (options.format === 'json') {
        console.log = () => {}; // Suppress all console.log output
        console.warn = () => {};
        console.error = () => {};
        process.env.SUPPRESS_ANALYZER_LOGS = 'true';
      }
      
      const analyzer = createAnalyzer();
      let analysis: CodeAnalysis;

      if (options.stdin) {
        // Read from stdin
        const content = await InputHandler.readStdin();
        const processedContent = InputHandler.prepareContent(content);
        const language = options.language as SupportedLanguage ?? 'unknown';
        analysis = await analyzer.analyzeContent(processedContent, language, '<stdin>');
      } else if (file) {
        // Validate file path
        if (!InputHandler.validateFilePath(file)) {
          console.error(chalk.red('Error: Invalid file path'));
          process.exit(1);
        }

        // Analyze file
        const language = options.language as SupportedLanguage;
        analysis = await analyzer.analyzeFile(file, language);
      } else {
        console.error(chalk.red('Error: Either provide a file path or use --stdin'));
        process.exit(1);
      }

      // Filter by severity if specified
      if (options.minSeverity) {
        analysis.issues = OutputHandler.filterBySeverity(
          analysis.issues, 
          options.minSeverity as IssueSeverity
        );
      }

      // Restore console methods before outputting results
      if (options.format === 'json') {
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        delete process.env.SUPPRESS_ANALYZER_LOGS;
      }

      // Output results
      OutputHandler.outputAnalysis(analysis, options.format ?? 'text', options.verbose ?? false);
      
      // Exit immediately for JSON format to prevent any trailing output
      if (options.format === 'json') {
        process.exit(0);
      }

    } catch (error) {
      console.error(chalk.red('Analysis failed:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}