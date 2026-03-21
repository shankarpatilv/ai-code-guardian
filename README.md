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

## Current Development Status

**🚧 Phase 0: Foundation (Complete)**
- ✅ Project structure created
- ✅ Claude Code plugin manifest configured
- ✅ Open source setup (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT)
- ✅ GitHub repository with branch protection
- ✅ Development agents configured

**📍 Current Phase: Phase 1 - Hook System**
- [ ] npm initialization
- [ ] TypeScript setup
- [ ] Basic hook implementation
- [ ] Skill definitions

### Project Structure

```
ai-code-guardian/
├── .claude-plugin/          # Plugin manifest
│   └── plugin.json
├── .claude/                 # Development configuration
│   ├── agents/             # Specialized development agents
│   │   ├── orchestrator.md
│   │   ├── backend-developer.md
│   │   ├── frontend-developer.md
│   │   ├── test-engineer.md
│   │   └── documentation-writer.md
│   ├── memories/           # Session history
│   ├── tasks/              # Development plan
│   └── settings.json
├── .github/                # GitHub configuration
│   ├── workflows/          # CI/CD
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── .git/hooks/            # Git hooks
│   └── pre-commit         # Auto code review
├── docs/                  # Documentation
│   └── architecture.md
├── hooks/                 # Plugin event hooks
│   └── hooks.json
├── skills/                # Plugin commands (empty)
│   ├── guardian-watch/
│   ├── guardian-config/
│   └── guardian-report/
├── src/                   # Source code (empty)
│   ├── analyzer/
│   ├── rules/
│   ├── visualizer/
│   └── dashboard/
├── CLAUDE.md             # Claude Code guidance
├── CONTRIBUTING.md       # Contribution guide
├── CODE_OF_CONDUCT.md    # Community standards
├── SECURITY.md           # Security policy
├── LICENSE               # MIT license
└── README.md            # This file
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Claude Code CLI

### Getting Started

```bash
# Clone repository
git clone https://github.com/vivekspatil/ai-code-guardian
cd ai-code-guardian

# Install dependencies (when package.json is created)
npm install

# Test plugin locally
claude --plugin-dir .

# Development mode
npm run dev
```

### Using Development Agents

The project includes specialized Claude agents for development:

```bash
# For complex tasks
"Use the orchestrator agent to implement [feature]"

# For specific tasks
"Use the backend-developer agent to create [component]"
"Use the test-engineer agent to write tests"
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. All contributions require:
- Pull request with review
- Tests for new features
- Documentation updates
- Conventional commits

## Documentation

- [Architecture Overview](docs/architecture.md) - Technical details
- [Development Guide](docs/development.md) - Setup and contribution
- [Rule Configuration](docs/rules.md) - Custom rules
- [API Reference](docs/api.md) - Plugin API

## License

MIT © Vivek Patil