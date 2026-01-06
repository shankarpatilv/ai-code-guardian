# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## WHY - Purpose & Goals
Building AI Code Guardian - a Claude Code plugin that provides real-time preventative feedback for AI-generated code. It catches security vulnerabilities, code quality issues, and over-engineering patterns BEFORE they enter the codebase.

## WHAT - Tech Stack & Structure
- **Language**: TypeScript/JavaScript
- **Frontend**: React 18, D3.js, TailwindCSS
- **Backend**: Node.js, web-tree-sitter for AST parsing
- **Communication**: WebSocket for real-time updates
- **Plugin Type**: Claude Code plugin with hooks, skills, and dashboard

## HOW - Development Workflow

### Commands
```bash
npm install && npm run dev    # Start development
claude --plugin-dir .         # Test plugin locally
/reload-plugins              # Reload after changes
```

### Plugin Commands (when installed)
- `/guardian-watch` - Start monitoring
- `/guardian-config` - Configure rules  
- `/guardian-report` - Get analysis report

### Where to Find Things
- **Project Overview**: `README.md` - Full project documentation
- **Architecture**: `docs/architecture.md` - Technical details
- **Task Plan**: `.claude/tasks/master-plan.md` - Development phases
- **Session History**: `.claude/memories/` - Previous sessions
- **Plugin Config**: `.claude-plugin/plugin.json`
- **Hooks**: `hooks/hooks.json`
- **Core Logic**: `src/` folder

### Memory Triggers

**"check memories"**
1. Read `.claude/memories/` folder
2. Read `.claude/tasks/master-plan.md`
3. Summarize project status

**"save memories"**
1. Save session to `.claude/memories/session_YYYY-MM-DD_HH-MM.md`
2. Update task checklist in master-plan.md
3. Note new tasks discovered

### Current Focus
Phase 1: Foundation & Hook System - Intercept and log AI-generated code
See `.claude/tasks/master-plan.md` for detailed task breakdown.

### Key Constraints
- Plugin must work across ALL user projects once installed
- Analysis must complete in <500ms to not slow code generation
- Visual feedback must be non-intrusive but immediately visible