# AI Code Guardian 🛡️

Real-time security and quality analysis for AI-generated code. A Claude plugin that catches vulnerabilities before they enter your codebase.

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-purple)](https://claude.ai/code)

## What It Does

AI Code Guardian automatically analyzes code as Claude writes it, detecting:

- 🔴 **Security Issues**: SQL injection, XSS, eval usage, hardcoded secrets
- 🟡 **Code Quality**: High complexity, long functions, code duplication  
- 🔵 **Best Practices**: OWASP Top 10 patterns, naming conventions
- ⚡ **Performance**: 1.46ms analysis time with full AST parsing

## Quick Start

```bash
# Clone and install
git clone https://github.com/vivekspatil/ai-code-guardian
cd ai-code-guardian
npm install && npm run build

# Use as Claude plugin
claude --plugin-dir .
```

## Features

### Real-time Protection
- Automatic analysis on every code generation
- Inline feedback in Claude interface
- AST-based parsing for JS/TS/Python
- JSON-configurable rule engine

### Security Detection (OWASP Top 10)
- SQL/NoSQL injection
- Cross-site scripting (XSS)
- Hardcoded credentials
- Insecure cryptography
- Authentication weaknesses

### Code Quality Metrics
- Cyclomatic complexity
- Function length
- Nesting depth
- Parameter count
- Code duplication

## Usage

### As Claude Plugin (Coming in Phase 3)
```
/guardian-analyze    # Analyze current code
/guardian-watch      # Toggle monitoring
/guardian-report     # Session report
```

### As CLI Tool
```bash
# Analyze file
npx ai-code-guardian analyze src/app.js

# Analyze with JSON output
npx ai-code-guardian analyze src/app.js --format json
```

## Project Status

- ✅ **Phase 0**: Project foundation
- ✅ **Phase 1**: Hook system (1-7ms)
- ✅ **Phase 2**: AST parser & rules (1.46ms)
- 🔵 **Phase 3**: Plugin integration (in progress)
- ⏳ **Phase 4**: Web dashboard (future)

## Performance

- Analysis time: **1.46ms** (target <50ms)
- Languages: JavaScript, TypeScript, Python
- Bundle size: ~160KB with tree-sitter

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT - See [LICENSE](LICENSE) file for details.

## Links

- [Architecture](docs/architecture.md)
- [Plugin Flow](docs/learning/plugin-flow.md)
- [Development Plan](.claude/tasks/master-plan.md)