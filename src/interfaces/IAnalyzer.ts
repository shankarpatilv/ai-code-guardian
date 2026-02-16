import { CodeAnalysis, AnalyzerConfig, HookResult, SupportedLanguage, PerformanceStats } from '../types';

/**
 * Interface for the main code analyzer
 */
export interface IAnalyzer {
  /**
   * Analyze code content
   */
  analyze(filePath: string, content: string, language?: string): Promise<CodeAnalysis>;
  
  /**
   * Analyze a file from disk
   */
  analyzeFile(filePath: string, language?: SupportedLanguage): Promise<CodeAnalysis>;
  
  /**
   * Analyze content with explicit language and file path
   */
  analyzeContent(content: string, language: SupportedLanguage, filePath: string): Promise<CodeAnalysis>;
  
  /**
   * Analyze from hook data (CLI integration)
   */
  analyzeFromHook(args: string[] | string): Promise<HookResult>;
  
  /**
   * Get current analyzer configuration
   */
  getConfig(): AnalyzerConfig;
  
  /**
   * Get performance statistics
   */
  getPerformanceStats(): PerformanceStats;
  
  /**
   * Clear performance statistics
   */
  clearPerformanceStats(): void;
}