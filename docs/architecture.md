# Architecture Overview

## System Architecture

AI Code Guardian uses a multi-layered architecture to provide real-time feedback on AI-generated code.

## Core Components

### 1. Hook System (`/hooks/hooks.json`)
Intercepts Claude's code generation events

### 2. Analysis Engine (`/src/analyzer/`)
AST parsing and pattern matching

### 3. Rule Engine (`/src/rules/`)
Configurable security and quality patterns

### 4. Visual Feedback (`/src/visualizer/`)
Real-time overlay and warnings

### 5. Dashboard (`/src/dashboard/`)
Web-based monitoring interface

### 6. Skills (`/skills/`)
Claude Code command definitions

## Data Flow

```
Claude generates code → Hook intercepts → Analyzer parses → Rules match → Visual feedback → Dashboard updates
```

## Performance Targets

- Analysis: <500ms per file
- Visual feedback: <1 second
- Dashboard update: Real-time via WebSocket

## Technology Stack

- **Frontend**: React 18, D3.js, TailwindCSS
- **Backend**: Node.js, TypeScript, web-tree-sitter
- **Communication**: WebSocket
- **Development**: Vite, Jest, ESLint