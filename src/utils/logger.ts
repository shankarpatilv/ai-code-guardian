import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private level: LogLevel;
  private context: string;

  constructor(context: string, level: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.level = level;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.context}] ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(this.formatMessage('DEBUG', message)), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(this.formatMessage('INFO', message)), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(chalk.yellow(this.formatMessage('WARN', message)), ...args);
    }
  }

  error(message: string, error?: Error): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(chalk.red(this.formatMessage('ERROR', message)));
      if (error) {
        console.error(chalk.red(error.stack || error.message));
      }
    }
  }

  success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  }

  static formatIssue(severity: string, message: string, location?: string): string {
    const icon = severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';
    const color = severity === 'error' ? chalk.red : severity === 'warning' ? chalk.yellow : chalk.blue;
    
    let output = `${icon} ${color.bold(severity.toUpperCase())}: ${message}`;
    if (location) {
      output += chalk.gray(` [${location}]`);
    }
    return output;
  }
}

// Aliases for backward compatibility with tests
export const StructuredLogger = Logger;
export function createLogger(context: string, level: LogLevel = LogLevel.INFO): Logger {
  return new Logger(context, level);
}