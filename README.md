# AI Code Guardian

Real-time preventative feedback system for AI-generated code that acts as your coding guardian, catching issues before they enter your codebase.

## Overview

AI Code Guardian is a Claude Code plugin that monitors code generation in real-time, providing instant visual warnings about:
- 🔴 Security vulnerabilities (SQL injection, XSS, hardcoded secrets)
- 🟡 Code quality issues (duplication, complexity, naming)
- 🟠 Over-engineering patterns (unnecessary abstractions)
- 🔵 Contextual inconsistencies with existing codebase

## Installation

```bash
# Install from marketplace (when published)
claude plugin install ai-code-guardian

# Or test locally during development
git clone https://github.com/vivekspatil/ai-code-guardian
cd ai-code-guardian
npm install
claude --plugin-dir .
```

## Usage

Once installed, the plugin works automatically across all your projects:

```bash
# Start real-time monitoring
/guardian-watch

# Configure rules and thresholds
/guardian-config

# Generate analysis report
/guardian-report
```

## Documentation

- [Architecture Overview](docs/architecture.md) - Technical details
- [Development Guide](docs/development.md) - Setup and contribution
- [Rule Configuration](docs/rules.md) - Custom rules
- [API Reference](docs/api.md) - Plugin API

## License

MIT © Vivek Patil