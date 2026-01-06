# Security Policy

## Reporting Security Vulnerabilities

**Please do not report security vulnerabilities through public GitHub issues.**

If you believe you have found a security vulnerability in AI Code Guardian, please report it to us through coordinated disclosure.

### How to Report

Please report security vulnerabilities by:

1. **GitHub Security Advisories** (Preferred): 
   - Go to the Security tab in this repository
   - Click "Report a vulnerability"
   - Provide detailed information

2. **Private Discussion**:
   - Create a private security discussion in the repository
   - Tag @vivekspatil

### What to Include

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit)
- Step-by-step instructions to reproduce
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

## Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix Timeline**: Depends on severity
  - Critical: Within 72 hours
  - High: Within 1 week
  - Medium: Within 2 weeks
  - Low: Next release cycle

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices for Users

When using AI Code Guardian:

1. **Keep the plugin updated** to the latest version
2. **Never commit sensitive files** (.env, API keys, passwords)
3. **Review all AI-generated code** before using in production
4. **Use the security scanner agent** regularly
5. **Configure rules** appropriate to your security requirements

## Security Features

AI Code Guardian includes built-in security features:

- Detection of hardcoded secrets
- SQL injection pattern recognition
- XSS vulnerability scanning
- Path traversal detection
- Insecure random number usage alerts

## Acknowledgments

We appreciate security researchers who help keep AI Code Guardian and our users safe. Responsible disclosure contributors will be acknowledged here (with permission).

## Contact

For any security concerns not covered here, please contact the maintainer directly through GitHub.