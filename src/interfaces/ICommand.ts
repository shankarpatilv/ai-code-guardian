/**
 * Interface for CLI command handlers
 */
export interface ICommand {
  /**
   * Execute the command
   */
  execute(args: any, options: any): Promise<void>;
  
  /**
   * Get command name
   */
  getName(): string;
  
  /**
   * Get command description
   */
  getDescription(): string;
}