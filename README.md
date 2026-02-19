# AI Code Guardian 🛡️

Real-time security and quality analysis for AI-generated code. Catches vulnerabilities before they enter your codebase.

[![Tests](https://img.shields.io/badge/tests-124%20passing-brightgreen)](https://github.com/vivekspatil/ai-code-guardian)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Plugin-purple)](https://claude.ai/code)

## 🎯 What It Does

AI Code Guardian automatically analyzes code as Claude writes it, detecting:

- 🔴 **Security Issues**: SQL injection, XSS, eval usage, hardcoded secrets
- 🟡 **Code Quality**: Console statements, TODO comments, complexity issues  
- 🔵 **Best Practices**: Empty catch blocks, code duplication
- ⚡ **Performance**: <5ms analysis time, no workflow interruption

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/vivekspatil/ai-code-guardian
cd ai-code-guardian

# Install dependencies and build
npm install
npm run build

# Test the plugin locally
claude --plugin-dir .
```

### For End Users (Once Published)

```bash
# Install from Claude Code plugin marketplace
claude plugin install ai-code-guardian

# Or install from GitHub
claude plugin install https://github.com/vivekspatil/ai-code-guardian
```

## 🔧 How to Use

### Automatic Protection

Once installed, AI Code Guardian works automatically:

1. **Write code with Claude** - Just use Claude Code normally
2. **Real-time analysis** - Every Write/Edit operation is analyzed
3. **Instant warnings** - Security and quality issues appear immediately
4. **Fix suggestions** - Get actionable recommendations

### Manual Commands

```bash
# Analyze a specific file
npx ai-code-guardian analyze src/app.js

# Check from stdin
echo "eval('dangerous')" | npx ai-code-guardian analyze --stdin

# Get JSON output for CI/CD
npx ai-code-guardian analyze src/app.js --format json
```

### Plugin Commands (When Installed)

These commands will be available after Phase 3/4 completion:

- `/guardian-watch` - Start monitoring (future)
- `/guardian-report` - Generate report (future)
- `/guardian-config` - Configure rules (future)

## 📊 What Gets Detected

### Security Vulnerabilities (High Priority)

| Pattern | Example | Detection |
|---------|---------|-----------|
| SQL Injection | `query = "SELECT * FROM users WHERE id = " + userId` | ✅ |
| XSS | `element.innerHTML = userInput` | ✅ |
| Eval Usage | `eval(userCode)` | ✅ |
| Hardcoded Secrets | `apiKey = "sk-1234567890"` | ✅ |
| Command Injection | `exec("rm -rf " + path)` | ✅ |

### Code Quality Issues

| Pattern | Example | Detection |
|---------|---------|-----------|
| Console Statements | `console.log("debug")` | ✅ |
| TODO Comments | `// TODO: fix this` | ✅ |
| Empty Catch | `try {...} catch(e) {}` | ✅ |
| Debugger | `debugger;` | ✅ |

## ⚙️ Configuration

### Environment Variables

```bash
# Enable debug output
AI_CODE_GUARDIAN_DEBUG=true

# Set analysis timeout (ms)
GUARDIAN_TIMEOUT=500

# Disable specific checks
GUARDIAN_DISABLE_CONSOLE_CHECK=true
```

### Custom Rules (Advanced)

Add custom patterns to `src/rules/index.ts`:

```typescript
{
  id: 'custom-pattern',
  name: 'Custom Security Check',
  pattern: /dangerous_pattern/g,
  severity: 'error',
  category: 'security',
  message: 'Custom security issue detected'
}
```

## 🏗️ Architecture

```
ai-code-guardian/
├── hooks/              # Claude Code hook scripts
│   ├── analyze.sh     # Main analysis hook
│   └── hooks.json     # Hook configuration
├── src/
│   ├── analyzer.ts    # Core analyzer engine
│   ├── parser/        # AST parser (simplified)
│   ├── rules/         # Security & quality rules
│   └── cli/           # CLI interface
└── dist/              # Built files
```

## 🧪 Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Run tests (100% passing!)
npm test

# Build the plugin
npm run build

# Test with Claude Code
claude --plugin-dir .
```

### Testing the Hook

```bash
# Test analyze.sh directly
./hooks/analyze.sh --tool Write --file test.js --content "eval('dangerous')"

# Test with actual Claude Code
claude --plugin-dir .
# Then ask Claude to write vulnerable code
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test tests/unit/rules

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Analysis Speed**: 3-5ms for typical files
- **Memory Usage**: <50MB
- **File Size Limit**: 1MB
- **Timeout**: 500ms (configurable)
- **Test Coverage**: 100% (124/124 tests passing)

## 🛠️ Troubleshooting

### Plugin Not Loading

```bash
# Check plugin structure
ls -la .claude-plugin/plugin.json
ls -la hooks/hooks.json

# Verify build
npm run build
ls -la dist/

# Test hook directly
./hooks/analyze.sh --tool Write --file test.js --content "console.log('test')"
```

### No Analysis Output

1. Check if hooks are executable:

```bash
chmod +x hooks/analyze.sh
```

2. Enable debug mode:

```bash
export AI_CODE_GUARDIAN_DEBUG=true
claude --plugin-dir .
```

3. Check Claude Code version:

```bash
claude --version  # Should be latest
```

### Performance Issues

```bash
# Check analysis time
time npx ai-code-guardian analyze large-file.js

# Reduce timeout if needed
export GUARDIAN_TIMEOUT=250
```

## 🚦 Development Status

### ✅ Completed Phases

- **Phase 0**: Project Foundation
- **Phase 1**: Hook System (intercepts AI code)
- **Phase 1.1**: Security & Quality (9.2/10 score)
- **Phase 2 Week 1**: Simplified AST Parser

### 🔄 Current Focus

- **Phase 2 Week 2**: Expanding security rules (OWASP Top 10)

### 📅 Upcoming

- **Phase 3**: Visual Feedback System
- **Phase 4**: Web Dashboard

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass (100% required)
5. Submit a pull request

### Areas Needing Help

- 🔍 More security patterns
- 🌍 Language support (Java, Go, Rust)
- 📊 Performance optimizations
- 📝 Documentation improvements

## 📄 License

MIT - See [LICENSE](LICENSE)

## 🙏 Acknowledgments

- Claude Code team for the plugin platform
- Tree-sitter for AST parsing
- Security community for vulnerability patterns

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/vivekspatil/ai-code-guardian/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vivekspatil/ai-code-guardian/discussions)
- **Security**: Report vulnerabilities privately via GitHub Security

---

**Remember**: AI Code Guardian is your safety net, not a replacement for security best practices. Always review AI-generated code before production use.

🛡️ **Stay Safe, Code Smart!**
