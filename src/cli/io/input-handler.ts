/**
 * Handles various input sources for the CLI
 */
export class InputHandler {

  /**
   * Read content from stdin
   */
  static async readStdin(): Promise<string> {
    return new Promise((resolve, reject) => {
      let input = '';
      
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => {
        input += chunk;
      });
      
      process.stdin.on('end', () => {
        resolve(input);
      });
      
      process.stdin.on('error', reject);
    });
  }

  /**
   * Validate input file path
   */
  static validateFilePath(filePath: string): boolean {
    if (!filePath || filePath.trim().length === 0) {
      return false;
    }

    // Basic validation - check if it's not empty and doesn't contain null characters
    return !filePath.includes('\0');
  }

  /**
   * Prepare content for analysis
   */
  static prepareContent(content: string): string {
    // Normalize line endings and trim
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
}