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

    // Security: Prevent path traversal attacks
    if (filePath.includes('../') || filePath.includes('..\\')) {
      return false;
    }

    // Prevent null bytes and dangerous characters
    if (filePath.includes('\0') || filePath.includes('\x00')) {
      return false;
    }

    // Prevent absolute paths to sensitive directories (basic protection)
    const dangerousPrefixes = ['/etc/', '/proc/', '/sys/', '/dev/', 'C:\\Windows\\', 'C:\\System32\\'];
    for (const prefix of dangerousPrefixes) {
      if (filePath.startsWith(prefix)) {
        return false;
      }
    }

    // Check for dangerous shell characters
    if (/[;|&`$()<>{}]/.test(filePath)) {
      return false;
    }

    return true;
  }

  /**
   * Prepare content for analysis
   */
  static prepareContent(content: string): string {
    // Normalize line endings and trim
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
}