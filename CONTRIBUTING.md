# Contributing to AI Code Guardian

First off, thank you for considering contributing to AI Code Guardian! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**To report a bug:**
1. Use the GitHub Issues page
2. Use the bug report template
3. Include as many details as possible
4. Never report security vulnerabilities in issues (see [SECURITY.md](SECURITY.md))

### Suggesting Features

Feature suggestions are welcome! Please:
1. Check if the feature was already suggested
2. Create an issue with the feature request template
3. Explain the use case and benefits

### Pull Requests

1. **Fork & Clone**: Fork the repo and clone it locally
2. **Branch**: Create a branch from `main` for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Code**: Make your changes following our standards
4. **Test**: Ensure all tests pass and add new ones if needed
5. **Commit**: Use conventional commits format
   ```
   feat: add new security pattern detection
   fix: resolve AST parsing issue
   docs: update API documentation
   ```
6. **Push**: Push to your fork
7. **PR**: Submit a pull request to the `main` branch

### Development Process

1. **Setup Development Environment**
   ```bash
   npm install
   npm run dev
   ```

2. **Code Standards**
   - Use TypeScript for type safety
   - Follow ESLint rules
   - Keep analysis under 500ms performance target
   - Add JSDoc comments for public APIs

3. **Testing Requirements**
   - Write tests for new features
   - Maintain test coverage above 80%
   - Run `npm test` before submitting PR

4. **Documentation**
   - Update README.md if needed
   - Add inline comments for complex logic
   - Update docs/ folder for architectural changes

## Pull Request Guidelines

### PR Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow conventional format
- [ ] Branch is up-to-date with main

### Review Process
1. All PRs require at least 1 review from maintainers
2. CI checks must pass
3. Address all review feedback
4. Maintainers will merge once approved

## Project Structure

```
ai-code-guardian/
├── .claude-plugin/     # Plugin manifest
├── skills/            # Claude commands
├── hooks/             # Event interceptors  
├── src/              # Core source code
│   ├── analyzer/     # Analysis engine
│   ├── rules/        # Detection rules
│   └── visualizer/   # UI components
└── docs/             # Documentation
```

## Getting Help

- Create a GitHub Discussion for questions
- Tag @vivekspatil for urgent issues
- Check existing docs in `/docs` folder

Thank you for contributing! 🚀