import { AnalyzerConfig } from '../../types';

/**
 * Configuration loading utilities
 */
export class ConfigLoader {

  /**
   * Load configuration from file (Phase 1 - placeholder)
   */
  static async loadFromFile(filePath: string): Promise<Partial<AnalyzerConfig> | null> {
    // In Phase 1, return null to use default config
    // Later phases will implement actual file loading
    console.log(`Configuration loading from ${filePath} is not implemented in Phase 1`);
    return null;
  }

  /**
   * Get default configuration
   */
  static getDefaultConfig(): AnalyzerConfig {
    return {
      enabled: true,
      maxIssues: 100,
      severityThreshold: 'info',
      rules: [],
      performance: {
        timeout: 500,
        maxFileSize: 1024 * 1024, // 1MB
      },
    };
  }

  /**
   * Merge configurations
   */
  static mergeConfigs(defaultConfig: AnalyzerConfig, overrides: Partial<AnalyzerConfig>): AnalyzerConfig {
    return {
      ...defaultConfig,
      ...overrides,
      performance: {
        ...defaultConfig.performance,
        ...overrides.performance,
      },
      rules: overrides.rules || defaultConfig.rules,
    };
  }
}