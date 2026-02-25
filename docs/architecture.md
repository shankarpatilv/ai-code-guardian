# Architecture Overview

## System Architecture

AI Code Guardian is a Claude plugin that provides real-time code analysis and security feedback for AI-generated code. It uses a multi-layered architecture with AST parsing, pattern matching, and configurable rule engines.

## Current Code Structure (Phase 2 Complete)

```
ai-code-guardian/
├── .claude/                      # Claude-specific files
│   ├── tasks/
│   │   └── master-plan.md       # Development roadmap
│   └── memories/                # Session documentation
│
├── hooks/                        # Claude hook system
│   ├── hooks.json               # Hook configuration
│   └── analyze.sh               # PostToolUse hook script
│
├── src/                         # Source code
│   ├── analyzer.ts              # Main analyzer entry point
│   ├── hook-handler.ts          # Hook processing logic
│   ├── cli.ts                   # CLI entry point
│   ├── types/                   # TypeScript definitions
│   │   └── index.ts             # Shared interfaces & types
│   │
│   ├── analyzer/                # Analysis modules (modularized)
│   │   ├── metrics/
│   │   │   └── calculator.ts   # Enhanced metrics with AST
│   │   ├── patterns/
│   │   │   ├── security.ts     # Security pattern detection
│   │   │   └── quality.ts      # Quality pattern detection
│   │   └── utils/
│   │       ├── helpers.ts      # Utility functions
│   │       └── validators.ts   # Input validation
│   │
│   ├── parser/                  # AST parsing (Phase 2)
│   │   ├── ast-parser.ts       # Tree-sitter AST parser
│   │   └── index.ts            # Parser exports
│   │
│   ├── rules/                   # Rule engine (Phase 2)
│   │   ├── rule-engine.ts      # JSON-configurable engine
│   │   ├── owasp-rules.json   # OWASP Top 10 patterns
│   │   └── quality-rules.json # Code quality rules
│   │
│   ├── cli/                    # CLI components (modularized)
│   │   ├── index.ts           # CLI router
│   │   ├── commands/
│   │   │   ├── analyze.ts    # Analyze command
│   │   │   ├── hook.ts       # Hook command
│   │   │   ├── config.ts     # Config command
│   │   │   └── performance.ts # Performance command
│   │   ├── io/
│   │   │   ├── input-handler.ts  # Input processing
│   │   │   └── output-handler.ts # Output formatting
│   │   └── config/
│   │       ├── loader.ts     # Config loader
│   │       └── validator.ts  # Config validation
│   │
│   ├── interfaces/            # Interface definitions
│   │   ├── IAnalyzer.ts      # Analyzer interface
│   │   ├── IPatternDetector.ts # Pattern detector
│   │   └── IMetricsCalculator.ts # Metrics interface
│   │
│   ├── utils/                 # Shared utilities
│   │   ├── logger.ts         # Structured logging
│   │   └── performance.ts    # Performance monitoring
│   │
│   └── plugin/               # Plugin integration (Phase 3)
│       ├── index.ts         # Plugin entry point
│       ├── commands.ts      # Command handlers
│       └── feedback.ts      # Feedback formatter
│
├── tests/                    # Test suites
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── fixtures/           # Test fixtures
│
├── dist/                    # Built files
│   ├── analyzer.js         # Bundled analyzer
│   └── cli.js             # CLI executable
│
├── docs/                    # Documentation
│   ├── architecture.md     # This file
│   ├── api.md             # API documentation
│   └── learning/          # Flow documentation
│       ├── plugin-flow.md     # Plugin approach
│       └── terminal-ui-flow.md # Terminal approach
│
├── .claude-plugin/         # Plugin configuration (Phase 3)
│   └── plugin.json        # Plugin manifest
│
├── package.json           # NPM configuration
├── tsconfig.json         # TypeScript config
└── README.md            # Project documentation
```

## Core Components

### 1. Hook System (`/hooks/`)
- **hooks.json**: Defines PostToolUse hook for intercepting code generation
- **analyze.sh**: Shell script that calls the analyzer on Write/Edit operations
- **Performance**: <5ms trigger time
- **Integration**: Seamlessly intercepts Claude's tool operations

### 2. Analysis Engine (`/src/analyzer/`)
- **Modular Architecture**: Separated into metrics, patterns, and utils
- **Pattern Detection**: Security (OWASP) and quality patterns
- **Metrics Calculation**: LOC, complexity, nesting depth
- **Performance**: 1.46ms average analysis time

### 3. AST Parser (`/src/parser/`)
- **Tree-sitter Integration**: Full AST parsing for JS/TS/Python
- **Singleton Pattern**: Efficient parser instance management
- **LRU Cache**: Limits language module cache to 10 entries
- **Concurrent Protection**: Prevents initialization race conditions

### 4. Rule Engine (`/src/rules/`)
- **JSON Configuration**: External rule definitions
- **OWASP Coverage**: Top 10 security vulnerabilities
- **Quality Rules**: Complexity, length, naming, etc.
- **Extensible**: Easy to add new rules via JSON

### 5. CLI System (`/src/cli/`)
- **Modular Commands**: Separate handlers for each command
- **I/O Abstraction**: Clean input/output handling
- **Multiple Formats**: Text, JSON, verbose modes
- **Performance Stats**: Built-in profiling

### 6. Plugin System (`/src/plugin/`) - Phase 3
- **Command Registration**: /guardian-* commands
- **Real-time Feedback**: Inline issue display
- **Session Management**: Tracks issues across conversation
- **Configuration**: Per-project settings

## Data Flow Architecture

### Real-time Analysis Flow (Plugin Mode)
```
User Input → Claude Generates Code → PostToolUse Hook Triggered
     ↓                                          ↓
Plugin Intercepts ← Hook Calls Analyzer ← Extract Code Content
     ↓
AST Parser Processes → Tree-sitter Parses → Returns AST
     ↓
Rule Engine Evaluates → Pattern Matching → Issue Detection
     ↓
Feedback Formatter → Inline Display → User Sees Issues
```

### Manual Analysis Flow (CLI Mode)
```
File System → CLI Command → File Reader → Content Extraction
     ↓
Analyzer Core → AST Parser → Rule Engine → Pattern Detection
     ↓
Output Handler → Terminal Formatter → Pretty Display
```

## Technology Stack

### Current Implementation:
- **Language**: TypeScript 5.3
- **Runtime**: Node.js 18+
- **AST Parsing**: web-tree-sitter 0.20.8
- **Build Tool**: TypeScript + esbuild
- **Testing**: Jest 29
- **Linting**: ESLint 8

### Dependencies:
- **tree-sitter-javascript**: JavaScript parsing
- **tree-sitter-typescript**: TypeScript parsing
- **tree-sitter-python**: Python parsing
- **commander**: CLI framework
- **chalk**: Terminal colors

### Future Additions (Phase 3-4):
- **Plugin System**: Claude plugin integration
- **Rich Terminal**: Box drawing, progress bars
- **Web Dashboard**: React + WebSocket
- **Visualization**: D3.js charts

## Performance Characteristics

### Current Performance (Phase 2):
- **Hook Trigger**: <5ms
- **AST Parsing**: 5-10ms
- **Pattern Matching**: 1-5ms
- **Rule Engine**: 1-3ms
- **Total Analysis**: 1.46ms average (target <50ms)
- **Bundle Size**: 160KB (with tree-sitter)
- **Memory Usage**: <50MB

### Optimization Strategies:
1. **Singleton Parsers**: Reuse parser instances
2. **LRU Caching**: Limit language module cache
3. **Concurrent Protection**: Prevent duplicate initialization
4. **Optimized Patterns**: Efficient regex with boundaries
5. **Early Returns**: Skip unnecessary processing

## Security Architecture

### Input Validation:
- Path traversal prevention
- Command injection protection
- Size limits (1MB files, 10MB JSON)
- Sanitized inputs

### Pattern Detection:
- OWASP Top 10 coverage
- SQL/NoSQL injection
- XSS vulnerabilities
- Hardcoded secrets
- Authentication weaknesses

### Safe Defaults:
- Strict validation by default
- No eval() or exec() usage
- Parameterized operations
- Timeout protection

## Testing Architecture

### Test Coverage:
- **Unit Tests**: 85+ tests for individual components
- **Integration Tests**: 39+ tests for workflows
- **End-to-End Tests**: Hook system validation
- **Total**: 124 tests (100% passing)

### Test Structure:
```
tests/
├── unit/
│   ├── analyzer.test.ts
│   ├── parser/ast-parser.test.ts
│   ├── rules/rule-engine.test.ts
│   └── performance.test.ts
├── integration/
│   ├── cli.test.ts
│   ├── hook-system.test.ts
│   └── ast-analyzer.test.ts
└── fixtures/
    ├── vulnerable-code.js
    └── clean-code.js
```

## Configuration Architecture

### Configuration Levels:
1. **Default Config**: Built-in safe defaults
2. **Project Config**: `.guardian.config.json`
3. **User Preferences**: CLI flags and env vars
4. **Runtime Config**: Command arguments

### Configuration Schema:
```typescript
interface AnalyzerConfig {
  enabled: boolean;
  maxIssues?: number;
  severityThreshold?: 'error' | 'warning' | 'info';
  patterns?: {
    security: boolean;
    quality: boolean;
  };
  performance?: {
    timeout: number;
    maxFileSize: number;
  };
  rules?: {
    [ruleId: string]: {
      enabled: boolean;
      severity?: Severity;
    };
  };
}
```

## Future Architecture (Phase 3-4)

### Plugin Integration:
- Command registration system
- Hook event handling
- Session state management
- Real-time feedback loop

### Terminal UI:
- Box drawing components
- Progress visualization
- Theme system
- Responsive layouts

### Web Dashboard:
- React component tree
- WebSocket communication
- D3.js visualizations
- Real-time updates

## Deployment Architecture

### Distribution Methods:
1. **NPM Package**: `npm install -g ai-code-guardian`
2. **Claude Plugin**: Clone and install locally
3. **GitHub Release**: Binary downloads
4. **Docker Image**: Containerized version (future)

### CI/CD Pipeline:
- GitHub Actions for testing
- Automated builds on push
- Security scanning
- Multi-version Node.js testing

## Scalability Considerations

### Current Limitations:
- Single-threaded analysis
- In-memory caching only
- No distributed processing

### Future Improvements:
- Worker thread pool
- Redis caching layer
- Incremental analysis
- Cloud-based rules

## Maintenance & Extensibility

### Adding New Languages:
1. Install tree-sitter grammar
2. Add to language detection
3. Configure in ast-parser.ts
4. Add language-specific rules

### Adding New Rules:
1. Define in JSON format
2. Add to appropriate rules file
3. Test with fixtures
4. Document patterns

### Plugin Commands:
1. Define in plugin.json
2. Implement handler
3. Add to command router
4. Test integration

## Conclusion

The architecture is designed to be modular, performant, and secure. It provides real-time protection for AI-generated code while maintaining extensibility for future enhancements. The plugin approach (Phase 3) will complete the integration with Claude, making it a seamless part of the AI coding workflow.