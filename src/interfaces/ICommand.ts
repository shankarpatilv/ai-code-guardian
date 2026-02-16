/**
 * Interface for CLI command handlers
 */
export interface ICommand {
  /**
   * Execute the command
   */
  execute(...args: unknown[]): Promise<void>;
  
  /**
   * Get command name
   */
  getName(): string;
  
  /**
   * Get command description
   */
  getDescription(): string;
}