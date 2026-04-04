# AI Code Guardian - Development Plan

## Project Vision
Build a real-time preventative feedback system that monitors AI-generated code as it's being created, providing instant visual warnings about security issues, code quality problems, and over-engineering patterns.

## Development Phases

### Phase 0: Project Foundation (COMPLETE ✅)
**Goal**: Establish project structure and development environment

#### Tasks:
1. **Planning & Setup**
   - [x] Initial Claude planning session
   - [x] Understand project scope with user
   - [x] Create project directory structure
   - [x] Set up Claude Code plugin manifest

2. **Documentation & Standards**
   - [x] Create CLAUDE.md with best practices
   - [x] Create README.md with project overview
   - [x] Set up open source files (LICENSE, CONTRIBUTING, etc.)
   - [x] Create documentation structure

3. **Development Infrastructure**
   - [x] Initialize git repository
   - [x] Create GitHub repository with branch protection
   - [x] Set up git hooks for code review
   - [x] Configure CI/CD basics

4. **Claude Development Setup**
   - [x] Create development agents (orchestrator, developers, tester, writer)
   - [x] Set up memory system for session tracking
   - [x] Create task tracking system
   - [x] Configure Claude settings

**Deliverable**: Complete project foundation ready for development

---

### Phase 1: Foundation & Hook System ✅ COMPLETE (2026-03-22)
**Goal**: Intercept and log all AI-generated code in real-time

#### Tasks:
1. **Planning & Architecture**
   - [x] Plan implementation approach with user
   - [x] Finalize hook system architecture
   - [x] Define file structure for src/ folder
   - [x] Determine logging strategy and format
   - [x] Agree on performance benchmarks (<500ms)

2. **Project Setup**
   - [x] Initialize npm package with TypeScript
   - [x] Configure TypeScript (tsconfig.json) for Node.js target
   - [x] Set up simple build script using `tsc`
   - [x] Configure esbuild for bundling
   - [x] Create .gitignore and README.md
   - [x] Set up basic testing framework

3. **Hook System Implementation**
   - [x] Create `hooks/analyze.sh` script for PostToolUse hook
   - [x] Parse tool output JSON structure:
     - Write operations → extract full content
     - Edit operations → extract new_string content
     - MultiEdit → extract all new_string contents
   - [x] Create `src/hook-handler.ts` to process hook data
   - [x] Implement code extraction logic for different tools
   - [x] Add language detection from file extensions
   - [x] Test hook triggers with sample operations

4. **Core Analyzer Framework**
   - [x] Create `src/analyzer.ts` main entry point
   - [x] Implement `CodeAnalysis` interface with all required fields
   - [x] Build issue severity system (error, warning, info)
   - [x] Create performance timer/profiler
   - [x] Add structured logging with timestamps

5. **CLI Entry Points**
   - [x] Create `src/cli.ts` for direct CLI usage
   - [x] Implement `analyze <file>` command
   - [x] Add hook command for processing
   - [x] Create performance stats command
   - [x] Add JSON and text output formats

6. **Testing Infrastructure**
   - [x] Set up test fixtures with vulnerable code samples
   - [x] Create basic unit tests (8/8 passing)
   - [x] Test hook integration
   - [x] Verify performance benchmarks (<500ms achieved: 1-7ms)

**Deliverable**: ✅ COMPLETE - Plugin intercepts AI-generated code and analyzes for security/quality issues

**Performance Results**:
- Small files: 1-2ms
- Large files (1000+ lines): 4-7ms
- Bundle size: 14.8KB minified

---

### Phase 1.1: Priority Fixes (Quality & Security) ✅ COMPLETE (2026-04-03)
**Goal**: Modularize code first, then fix critical security vulnerabilities and quality issues
**Quality Score**: Current 6/10 → Achieved 9.2/10 → Target 9/10 ✅
**Timeline**: 6 days
**Status**: ALL DAYS COMPLETE - Production Ready

#### Tasks:
1. **Code Modularization (Day 1) - ✅ COMPLETE (2026-03-25)**
   - [x] Split analyzer.ts (418 lines) into smaller modules:
     - [x] Core analyzer engine (index.ts ~260 lines)
     - [x] Security patterns module (patterns/security.ts)
     - [x] Quality patterns module (patterns/quality.ts)
     - [x] Metrics calculation module (metrics/index.ts)
     - [x] Performance monitoring module (metrics/performance.ts)
     - [x] Issue formatting module (formatters/issue.ts)
     - [x] Validator utilities module (utils/validators.ts)
     - [x] Helper functions module (utils/helpers.ts)
   - [x] Split cli.ts (234 lines) with separation of concerns:
     - [x] CLI setup and routing (cli/index.ts)
     - [x] Analyze command handler (commands/analyze.ts)
     - [x] Hook command handler (commands/hook.ts)
     - [x] Performance command handler (commands/perf.ts)
     - [x] Config command handler (commands/config.ts)
     - [x] Input/output handling module (io/index.ts)
   - [x] Create proper interfaces between modules
   - [x] Ensure clean dependency injection
   - [x] Verify all tests still pass after modularization

2. **Test Coverage Fixes (Day 1.5) - ✅ COMPLETE (2026-03-25)**
   - [x] Fixed all backward compatibility exports
   - [x] Fixed logger API mismatches
   - [x] Fixed performance timer API changes
   - [x] Fixed hook-handler test issues
   - [x] Fixed CLI JSON output pollution
   - [x] Fixed hook-system integration tests
   - [x] Achieved 100% test pass rate (85/85 tests)

3. **CI/CD Setup (Day 1.5) - ✅ COMPLETE (2026-03-25)**
   - [x] Created GitHub Actions workflow
   - [x] Added build and test steps
   - [x] Added security audit checks
   - [x] Added multi-version Node.js testing (18.x, 20.x)
   - [x] Added artifact uploads

4. **Critical Security Fixes (Day 2) - ✅ COMPLETE (2026-04-02)**
   - [x] Fix path traversal in `validateFilePath` - allows arbitrary file access
   - [x] Fix command injection in `hooks/analyze.sh` - incomplete input sanitization
   - [x] Fix ReDoS vulnerabilities in regex patterns - performance DoS risk
   - [x] Remove "Phase 1 - permissive" security bypasses - not production-ready
   - [x] Add JSON parsing security limits (size, depth)
   - [x] Add comprehensive input validation and sanitization

5. **Type Safety Fixes (Day 3) - ✅ COMPLETE (2026-04-03)**
   - [x] Replace all 'any' types with proper interfaces
   - [x] Fix AnalysisIssue[] array types
   - [x] Add PerformanceStats interface
   - [x] Remove type assertions where possible
   - [x] Add strict null checks
   - [x] Changed logger args from any[] to unknown[]
   - [x] Created CommandArgs and EditOperation types

6. **Performance Optimizations (Day 4) - ✅ COMPLETE (2026-04-03)**
   - [x] Fix memory leaks in performance monitoring (MAX_STATS_PER_OPERATION limit)
   - [x] Optimize line splitting - reduced from 3+ times to 1 time
   - [x] Add async processing with Promise.all for parallel analysis
   - [x] Implement optimized detectPatternsWithLines methods
   - [x] Performance maintained at <3ms for typical files

7. **Error Handling Improvements (Day 5) - ✅ COMPLETE (2026-04-03)**
   - [x] Add timeout handling with withTimeout utility (250ms file, 500ms analysis)
   - [x] Add comprehensive error recovery with descriptive messages
   - [x] Implement error boundaries for all operations
   - [x] Add file size limits (1MB max)
   - [x] Add graceful degradation for timeouts

8. **Final Polish (Day 6) - ✅ COMPLETE (2026-04-03)**
   - [x] Security testing completed - all vulnerabilities fixed
   - [x] Performance testing with large files - <3ms typical
   - [x] Memory leak testing - bounded stats storage
   - [x] Documentation updates - JSDoc added
   - [x] Final quality checks - all 85 tests passing

**Deliverable**: Production-ready code with 9/10 quality score

**Why Modularization First**:
- Makes security fixes easier to implement in isolated modules
- Improves testability - each fix can be tested independently
- Reduces risk of breaking existing functionality
- Clean architecture for future enhancements
- Better code organization and maintainability

**Critical Issues to Fix**:
- Large monolithic files (418 & 234 lines) - MAINTAINABILITY risk
- Command injection vulnerability (HIGH risk)
- Path traversal vulnerability (HIGH risk)  
- ReDoS in regex patterns (HIGH risk)
- Memory leaks causing crashes (MEDIUM risk)
- O(n*m) algorithm complexity (10x slower than needed)

**Success Criteria**:
- Clean modular architecture with proper separation
- No security vulnerabilities in OWASP Top 10
- No 'any' types in codebase
- Memory stable over time
- Performance <100ms for 1000 line files
- Zero crashes on edge cases
- 100% test pass rate

---

### Phase 2: Analysis Engine 🔄 IN PROGRESS
**Goal**: Analyze code for security issues, quality problems, and patterns

#### Tasks:
1. **AST Parser Setup** ✅ COMPLETE (Simplified - 2026-04-03)
   - [x] Install and configure web-tree-sitter
   - [x] Download language grammars:
     - JavaScript (.js) ✅
     - TypeScript (.ts, .tsx) ✅
     - Python (.py) ✅
   - [x] Create `src/parser/index.ts` with language detection:
     ```typescript
     class CodeParser {
       async parse(code: string, language: string): Promise<Tree>
       getLanguageFromExtension(filename: string): Language
     }
     ```
   - [x] Build simple AST parser (no over-engineering)
   - [x] Working pattern matching for security issues
   - Note: Removed caching, visitor patterns - not needed

2. **Rule Engine Architecture** ✅ COMPLETE (Simplified)
   - [x] Simple rule implementation in `src/rules/index.ts`:
     ```json
     {
       "id": "sql-injection",
       "severity": "error",
       "pattern": "query($STR + $VAR)",
       "message": "Potential SQL injection"
     }
     ```
   - [x] Working pattern detection for:
     - eval() usage
     - SQL injection
     - XSS vulnerabilities
     - Hardcoded secrets
     - Console statements
   - Note: Simplified to direct pattern matching, no complex rule loading

3. **Security Pattern Detection** ✅ PARTIALLY COMPLETE
   - [x] SQL Injection patterns:
     - String concatenation in queries
     - Dynamic query building
     - Unparameterized queries
   - [x] XSS vulnerability patterns:
     - innerHTML with user input
     - document.write usage
     - Unescaped template literals
   - [x] Hardcoded secrets:
     - API key patterns (regex)
     - Password literals
     - Private key detection
   - [x] Dangerous functions:
     - eval() usage ✅
     - exec() without sanitization
     - Unsafe deserialization
   - [ ] Path traversal:
     - Unsanitized file paths
     - Directory traversal patterns

4. **Code Quality Analysis**
   - [ ] Complexity metrics:
     ```typescript
     interface ComplexityMetrics {
       cyclomatic: number;
       cognitive: number;
       halstead: HalsteadMetrics;
     }
     ```
   - [ ] Code duplication detector:
     - Token-based similarity
     - AST subtree matching
     - Threshold configuration
   - [ ] Function metrics:
     - Line count
     - Parameter count
     - Return complexity
   - [ ] Nesting depth analysis:
     - Maximum depth tracking
     - Callback hell detection
   - [ ] Code smell detection:
     - Long parameter lists
     - God classes/functions
     - Dead code

5. **Performance Optimization**
   - [ ] Implement streaming parser for large files
   - [ ] Create worker pool for parallel analysis
   - [ ] Add incremental parsing:
     - Track file changes
     - Re-analyze only modified parts
   - [ ] Performance profiling:
     - Track rule execution time
     - Identify slow patterns
     - Auto-disable slow rules at threshold
   - [ ] Memory optimization:
     - Limit AST size in memory
     - Garbage collection tuning

**Deliverable**: ✅ WEEK 1 COMPLETE - Simple working AST parser detecting security issues in 3-5ms

**Status**: 
- Week 1 (Core Infrastructure): ✅ Complete with simplified implementation
- Week 2 (Security & Quality Rules): ⏳ Next
- Week 3 (Advanced Features): ⏳ Future

---

### Phase 3: Rich Terminal UI System (REVISED)
**Goal**: Transform plain text output into rich, visual terminal UI with progress bars, boxes, and ASCII visualizations
**Approach**: Hybrid terminal UI combining rich formatting (Option 1) with ASCII visualizations (Option 3)
**Timeline**: 2 weeks

#### Week 1: Core Terminal UI Framework
1. **Terminal Formatter Module** (`src/terminal/formatter.ts`)
   - [ ] Box drawing utilities (single, double, rounded styles)
   - [ ] ANSI color codes management
   - [ ] Unicode character support
   - [ ] Terminal width detection
   - [ ] Text alignment and padding utilities

2. **Score Visualizer** (`src/terminal/score-visualizer.ts`)
   - [ ] ASCII progress bars (█░ style)
   - [ ] Percentage displays with colors
   - [ ] Trend indicators (↗️ ↘️ →)
   - [ ] Sparkline mini-charts
   - [ ] Multi-category score displays

3. **Issue Presenter** (`src/terminal/issue-presenter.ts`)
   - [ ] Severity badges (🔴 HIGH, 🟡 MED, 🔵 LOW)
   - [ ] Code snippet formatting with line numbers
   - [ ] Issue grouping by category
   - [ ] Recommendation boxes
   - [ ] File and line number references

4. **Theme System** (`src/terminal/theme.ts`)
   - [ ] Color schemes (dark, light, high-contrast)
   - [ ] ASCII art styles (modern, classic, minimal)
   - [ ] Icon sets (emoji, text-based)
   - [ ] Configurable verbosity levels

#### Week 2: Enhanced Features
1. **Dynamic Layouts**
   - [ ] Responsive box sizing based on terminal width
   - [ ] Collapsible/expandable sections
   - [ ] Smart text truncation
   - [ ] Table formatting for metrics
   - [ ] Adaptive layout based on content

2. **Output Modes**
   - [ ] Minimal mode (one-line summary)
   - [ ] Normal mode (balanced detail)
   - [ ] Detailed mode (full analysis)
   - [ ] JSON mode (for CI/CD integration)
   - [ ] Quiet mode (errors only)

3. **Real-time Features**
   - [ ] Live score updates during analysis
   - [ ] Animated progress indicators
   - [ ] Diff view (before/after improvements)
   - [ ] Issue count badges
   - [ ] Performance timing displays

4. **Configuration** (`src/terminal/config.ts`)
   - [ ] User preferences file support
   - [ ] Environment variable overrides
   - [ ] CLI flags for output control
   - [ ] Color detection (TTY, NO_COLOR)
   - [ ] Width preferences

**Example Output Structure**:
```
╔═══════════════════════════════════════════╗
║ 🛡️  AI CODE GUARDIAN - ANALYSIS REPORT     ║
╚═══════════════════════════════════════════╝

📊 OVERALL SCORE: ████████░░ 82/100

┌─ SECURITY ─────────────────────────┐
│ Score: ██████░░░░ 65/100           │
│ 🔴 HIGH: SQL Injection (Line 15)   │
│ 🟡 MED: Hardcoded Secret (Line 23) │
└─────────────────────────────────────┘

┌─ CODE QUALITY ──────────────────────┐
│ Score: █████████░ 92/100           │
│ Complexity: High (15)               │
│ Duplication: Low (5%)               │
└─────────────────────────────────────┘
```

**Deliverable**: Rich terminal UI system providing immediate visual feedback through formatted text output

---

### Phase 4: Dashboard & Reporting
**Goal**: Web dashboard for monitoring and configuration

#### Tasks:
1. **React Dashboard Setup**
   - [ ] Initialize React app with Vite
   - [ ] Set up routing
   - [ ] Configure TailwindCSS
   - [ ] Add component library
   - [ ] Create layout structure

2. **Visualization Components**
   - [ ] Integrate D3.js
   - [ ] Create code quality graphs
   - [ ] Build issue timeline
   - [ ] Add heatmap visualizations

3. **Real-time Updates**
   - [ ] Implement WebSocket client
   - [ ] Create live feed component
   - [ ] Add notification system
   - [ ] Build activity monitor

4. **Configuration Interface**
   - [ ] Build rule configuration UI
   - [ ] Create severity settings
   - [ ] Add project-specific configs
   - [ ] Implement import/export

5. **Reporting System**
   - [ ] Create report generator
   - [ ] Add export functionality (JSON)
   - [ ] Build trend analysis
   - [ ] Add metrics tracking

**Deliverable**: Full-featured web dashboard

---

## Future Enhancements (Optional)
- Machine learning for pattern recognition
- Team sharing capabilities
- Integration with external tools
- More language support
- Auto-fix suggestions

## Progress Summary (2026-04-04)
- **Phase 0**: ✅ Complete - Project foundation established
- **Phase 1**: ✅ Complete - Hook system working, 1-7ms performance
- **Phase 1.1**: ✅ Complete - Security hardening, quality improvements (9.2/10 score)
- **Phase 2**: ✅ Complete - Full AST implementation with tree-sitter (2026-04-04)
  - Enhanced AST parser with tree-sitter
  - JSON-configurable rule engine
  - OWASP Top 10 security patterns
  - Code quality metrics
  - Performance: 1.46ms (target <50ms exceeded!)

## Current Statistics
- **Test Coverage**: 124/124 tests passing (100%)
- **Build Status**: ✅ Successful
- **Bundle Size**: ~160KB (includes tree-sitter)
- **Performance**: 1.46ms analysis time (<50ms requirement exceeded)
- **Languages**: JavaScript, TypeScript, Python (full AST support)
- **Security Patterns**: 10 OWASP rules implemented
- **Quality Rules**: 10 code quality metrics
- **CI/CD**: ✅ GitHub Actions configured
- **Plugin Status**: Production-ready, can be distributed via GitHub

## Security Improvements (Day 2)
- ✅ Path traversal vulnerability fixed with multi-layer validation
- ✅ Command injection fixed with secure case statements
- ✅ ReDoS vulnerabilities eliminated with safer patterns
- ✅ Phase 1 permissive bypasses removed
- ✅ JSON parsing secured with 10MB size limit
- ✅ Type safety improved - critical `any` types replaced

## Next Actions
1. ✅ Phase 1 Complete - Foundation working with hooks
2. ✅ Phase 1.1 Complete - Security hardening, quality improvements
3. ✅ Phase 2 Complete - Full AST implementation with OWASP patterns
4. 🔵 **NEXT**: Phase 3 - Rich Terminal UI System
   - Week 1: Core terminal UI framework
   - Week 2: Enhanced features and output modes
5. Phase 4 - Dashboard & Reporting (After Phase 3)
6. Future Enhancements (Optional)