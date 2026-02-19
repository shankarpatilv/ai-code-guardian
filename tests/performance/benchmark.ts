/**
 * Performance benchmarks for AST parser and rule engine
 */

import { CodeGuardianAnalyzer, createAnalyzer } from '../../src/analyzer';
import { ASTParser, createASTParser } from '../../src/parser';
import { RuleEngine, createRuleEngine } from '../../src/rules';

interface BenchmarkResult {
  operation: string;
  samples: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
  memoryUsage?: number;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  async runBenchmark(
    name: string,
    operation: () => Promise<any>,
    samples: number = 10
  ): Promise<BenchmarkResult> {
    console.log(`Running benchmark: ${name} (${samples} samples)`);
    
    const times: number[] = [];
    const startMemory = process.memoryUsage().heapUsed;
    
    // Warm up
    await operation();
    
    // Run benchmark samples
    for (let i = 0; i < samples; i++) {
      const start = performance.now();
      await operation();
      const end = performance.now();
      times.push(end - start);
    }
    
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;
    
    const result: BenchmarkResult = {
      operation: name,
      samples,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      totalTime: times.reduce((a, b) => a + b, 0),
      memoryUsage: memoryDelta
    };
    
    this.results.push(result);
    return result;
  }

  printResults(): void {
    console.log('\n=== Performance Benchmark Results ===');
    console.log('');
    
    this.results.forEach(result => {
      console.log(`${result.operation}:`);
      console.log(`  Average: ${result.averageTime.toFixed(2)}ms`);
      console.log(`  Min:     ${result.minTime.toFixed(2)}ms`);
      console.log(`  Max:     ${result.maxTime.toFixed(2)}ms`);
      console.log(`  Total:   ${result.totalTime.toFixed(2)}ms (${result.samples} samples)`);
      if (result.memoryUsage) {
        console.log(`  Memory:  ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB delta`);
      }
      console.log('');
    });
    
    // Performance validation
    console.log('=== Performance Validation ===');
    const failedTests: string[] = [];
    
    this.results.forEach(result => {
      const target = this.getPerformanceTarget(result.operation);
      if (result.averageTime > target) {
        failedTests.push(`${result.operation}: ${result.averageTime.toFixed(2)}ms > ${target}ms`);
      } else {
        console.log(`✓ ${result.operation}: ${result.averageTime.toFixed(2)}ms <= ${target}ms`);
      }
    });
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed performance targets:');
      failedTests.forEach(test => console.log(`  ${test}`));
    } else {
      console.log('\n✅ All performance targets met!');
    }
  }

  private getPerformanceTarget(operation: string): number {
    // Performance targets in milliseconds
    const targets: Record<string, number> = {
      'AST Parser Initialization': 2000,
      'Small File Parse (JavaScript)': 50,
      'Medium File Parse (TypeScript)': 200,
      'Large File Parse (Python)': 500,
      'Rule Engine Initialization': 1000,
      'Simple Rule Execution': 10,
      'Complex Rule Execution': 100,
      'Full Analysis (Small File)': 100,
      'Full Analysis (Medium File)': 300,
      'Full Analysis (Large File)': 500,
      'Cache Hit Performance': 5,
      'Memory Usage Test': 1000
    };
    
    return targets[operation] || 500; // Default 500ms
  }
}

// Sample code generators
function generateJavaScriptCode(size: 'small' | 'medium' | 'large'): string {
  const baseCode = `
const apiKey = "sk-1234567890abcdef"; // Should trigger hardcoded secret rule
console.log("Debug message"); // Should trigger console log rule

function complexFunction(data) {
  if (data.type === 'A') {
    if (data.valid) {
      if (data.processed) {
        console.log('Complex nested conditions');
        const query = "SELECT * FROM users WHERE id = " + data.id; // SQL injection
        element.innerHTML = data.content; // XSS vulnerability
        return data;
      }
    }
  }
  return null;
}

for (let i = 0; i < 100; i++) {
  for (let j = 0; j < 100; j++) {
    // Nested loops performance issue
    console.log(i, j);
  }
}

// Command injection vulnerability
const command = "ls " + userInput;
exec(command);
  `;

  switch (size) {
    case 'small':
      return baseCode;
    case 'medium':
      return baseCode.repeat(10);
    case 'large':
      return baseCode.repeat(50);
    default:
      return baseCode;
  }
}

function generateTypeScriptCode(size: 'medium'): string {
  const baseCode = `
interface User {
  id: number;
  name: string;
  email: string;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

class UserService {
  private apiKey = "hardcoded-api-key"; // Security issue
  
  async getUser(id: number): Promise<ApiResponse<User>> {
    console.log('Fetching user:', id); // Quality issue
    
    // SQL injection vulnerability
    const query = \`SELECT * FROM users WHERE id = \${id}\`;
    
    // Complex nested conditions
    if (id > 0) {
      if (typeof id === 'number') {
        if (id < 1000000) {
          const result = await this.fetchFromDatabase(query);
          return {
            data: result,
            status: 200
          };
        }
      }
    }
    
    throw new Error('Invalid user ID');
  }
  
  private async fetchFromDatabase(query: string): Promise<User> {
    // Simulated database fetch
    return { id: 1, name: 'Test', email: 'test@test.com' };
  }
}

// Performance issue - nested loops
const matrix: number[][] = [];
for (let i = 0; i < 50; i++) {
  matrix[i] = [];
  for (let j = 0; j < 50; j++) {
    matrix[i][j] = i * j;
  }
}
  `;

  return baseCode.repeat(size === 'medium' ? 5 : 1);
}

function generatePythonCode(size: 'large'): string {
  const baseCode = `
import os
import subprocess

# Hardcoded secret
API_KEY = "sk-abcdef123456789"

def process_data(data):
    print("Processing data:", data)  # Should be logging
    
    if data['type'] == 'user':
        if data['valid']:
            if data['authenticated']:
                # Complex nested conditions
                user_id = data['id']
                
                # SQL injection vulnerability
                query = f"SELECT * FROM users WHERE id = {user_id}"
                
                # Command injection
                filename = data['filename']
                command = f"cat {filename}"
                subprocess.run(command, shell=True)
                
                return process_user(data)
    
    return None

def process_user(user_data):
    # Performance issue - nested loops
    results = []
    for i in range(100):
        row = []
        for j in range(100):
            row.append(i * j)
        results.append(row)
    
    return results

# More complex patterns
class DataProcessor:
    def __init__(self):
        self.api_key = "another-hardcoded-secret"
    
    def unsafe_file_read(self, filename):
        # Path traversal vulnerability
        filepath = "/data/" + filename
        with open(filepath, 'r') as f:
            return f.read()
  `;

  return baseCode.repeat(size === 'large' ? 20 : 1);
}

// Main benchmark execution
async function runPerformanceBenchmarks(): Promise<void> {
  const benchmark = new PerformanceBenchmark();
  
  console.log('🚀 Starting Performance Benchmarks for Phase 2 AST Parser & Rule Engine');
  console.log('Target: <500ms for analysis of files up to 5000 lines');
  console.log('');

  // 1. AST Parser Benchmarks
  console.log('📊 AST Parser Performance Tests');
  
  let parser: ASTParser;
  
  await benchmark.runBenchmark('AST Parser Initialization', async () => {
    parser = createASTParser(50, 100);
    await parser.initialize();
  }, 3);

  // Small file parsing
  await benchmark.runBenchmark('Small File Parse (JavaScript)', async () => {
    const code = generateJavaScriptCode('small');
    await parser.parse('test.js', code);
  });

  // Medium file parsing  
  await benchmark.runBenchmark('Medium File Parse (TypeScript)', async () => {
    const code = generateTypeScriptCode('medium');
    await parser.parse('test.ts', code);
  });

  // Large file parsing
  await benchmark.runBenchmark('Large File Parse (Python)', async () => {
    const code = generatePythonCode('large');
    await parser.parse('test.py', code);
  });

  // Cache performance
  const cachedCode = generateJavaScriptCode('small');
  await parser.parse('cached.js', cachedCode); // Prime cache
  
  await benchmark.runBenchmark('Cache Hit Performance', async () => {
    await parser.parse('cached.js', cachedCode);
  });

  // 2. Rule Engine Benchmarks
  console.log('📊 Rule Engine Performance Tests');
  
  let ruleEngine: RuleEngine;
  
  await benchmark.runBenchmark('Rule Engine Initialization', async () => {
    ruleEngine = createRuleEngine(parser);
    // Rules are loaded by the AST adapter automatically
  }, 3);

  // Simple rule execution
  await benchmark.runBenchmark('Simple Rule Execution', async () => {
    const code = 'console.log("test");';
    await ruleEngine.executeRules('test.js', code, 'javascript');
  });

  // Complex rule execution
  await benchmark.runBenchmark('Complex Rule Execution', async () => {
    const code = generateJavaScriptCode('medium');
    await ruleEngine.executeRules('complex.js', code, 'javascript');
  });

  // 3. Full Analysis Benchmarks
  console.log('📊 Full Analysis Performance Tests');
  
  const analyzer = createAnalyzer({
    enabled: true,
    maxIssues: 100,
    severityThreshold: 'info',
    rules: [],
    performance: {
      timeout: 5000,
      maxFileSize: 1024 * 1024
    }
  });

  await benchmark.runBenchmark('Full Analysis (Small File)', async () => {
    const code = generateJavaScriptCode('small');
    await analyzer.analyze('small.js', code, 'javascript');
  });

  await benchmark.runBenchmark('Full Analysis (Medium File)', async () => {
    const code = generateJavaScriptCode('medium');
    await analyzer.analyze('medium.js', code, 'javascript');
  });

  await benchmark.runBenchmark('Full Analysis (Large File)', async () => {
    const code = generateJavaScriptCode('large');
    await analyzer.analyze('large.js', code, 'javascript');
  });

  // Memory usage test
  await benchmark.runBenchmark('Memory Usage Test', async () => {
    // Process multiple files to test memory management
    const codes = [
      generateJavaScriptCode('small'),
      generateTypeScriptCode('medium'),
      generatePythonCode('large')
    ];
    
    for (let i = 0; i < codes.length; i++) {
      await analyzer.analyze(`test${i}.js`, codes[i]!, 'javascript');
    }
  });

  // Print all results
  benchmark.printResults();
}

// Export for use in tests or standalone execution
export { runPerformanceBenchmarks, PerformanceBenchmark };

// Run if called directly
if (require.main === module) {
  runPerformanceBenchmarks()
    .then(() => {
      console.log('✅ Performance benchmarks completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    });
}