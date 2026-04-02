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

### Phase 1.1: Priority Fixes (Quality & Security) IN PROGRESS
**Goal**: Modularize code first, then fix critical security vulnerabilities and quality issues
**Quality Score**: Current 6/10 → Achieved 8.5/10 → Target 9/10
**Timeline**: 6 days
**Status**: Day 2 Complete - Security Hardening Done

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

5. **Type Safety Fixes (Day 3) - NEXT**
   - [ ] Replace all 'any' types with proper interfaces (partially done in Day 2)
   - [ ] Fix AnalysisIssue[] array types
   - [ ] Add PerformanceStats interface
   - [ ] Remove type assertions
   - [ ] Add strict null checks

6. **Performance Optimizations (Day 4)**
   - [ ] Fix memory leaks in performance monitoring
   - [ ] Optimize O(n²) brace counting to O(n)
   - [ ] Add async processing for large files
   - [ ] Implement chunked line processing
   - [ ] Add caching for repeated analyses

7. **Error Handling Improvements (Day 5)**
   - [ ] Add timeout handling for stdin/async operations
   - [ ] Add comprehensive error recovery
   - [ ] Implement error boundary pattern
   - [ ] Add stream size limits
   - [ ] Add graceful degradation

8. **Final Polish (Day 6)**
   - [ ] Security testing (command injection, path traversal)
   - [ ] Performance testing with large files
   - [ ] Memory leak testing
   - [ ] Documentation updates
   - [ ] Final quality checks

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

### Phase 2: Analysis Engine
**Goal**: Analyze code for security issues, quality problems, and patterns

#### Tasks:
1. **AST Parser Setup**
   - [ ] Install and configure web-tree-sitter
   - [ ] Download language grammars:
     - JavaScript (.js)
     - TypeScript (.ts, .tsx)
     - Python (.py)
   - [ ] Create `src/parser.ts` with language detection:
     ```typescript
     class CodeParser {
       async parse(code: string, language: string): Promise<Tree>
       getLanguageFromExtension(filename: string): Language
     }
     ```
   - [ ] Build AST traversal utilities:
     - Node visitor pattern
     - Path tracking
     - Parent/child navigation
   - [ ] Implement query builder for pattern matching
   - [ ] Add result caching with TTL

2. **Rule Engine Architecture**
   - [ ] Design rule JSON schema:
     ```json
     {
       "id": "sql-injection",
       "severity": "error",
       "pattern": "query($STR + $VAR)",
       "message": "Potential SQL injection"
     }
     ```
   - [ ] Create `src/rules/rule-engine.ts`:
     - Load rules from JSON files
     - Validate rule syntax
     - Compile patterns to AST queries
   - [ ] Implement pattern matching:
     - Literal matches
     - Variable binding ($VAR)
     - Wildcard patterns (*)
   - [ ] Build priority/severity system
   - [ ] Support for custom rule directories

3. **Security Pattern Detection**
   - [ ] SQL Injection patterns:
     - String concatenation in queries
     - Dynamic query building
     - Unparameterized queries
   - [ ] XSS vulnerability patterns:
     - innerHTML with user input
     - document.write usage
     - Unescaped template literals
   - [ ] Hardcoded secrets:
     - API key patterns (regex)
     - Password literals
     - Private key detection
   - [ ] Dangerous functions:
     - eval() usage
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

**Deliverable**: High-performance analysis engine detecting security and quality issues in <500ms

---

### Phase 3: Visual Feedback System
**Goal**: Display real-time warnings and suggestions visually

#### Tasks:
1. **Overlay Architecture**
   - [ ] Design overlay component system
   - [ ] Create rendering engine
   - [ ] Implement positioning logic
   - [ ] Build animation system
   - [ ] Add theming support

2. **Warning Components**
   - [ ] Create severity indicators (🔴 🟡 🟠 🔵)
   - [ ] Build inline annotation components
   - [ ] Create tooltip system
   - [ ] Add code highlighting
   - [ ] Implement suggestion cards

3. **Live Scoring Dashboard**
   - [ ] Create score calculation engine
   - [ ] Build progress bar components
   - [ ] Add real-time score updates
   - [ ] Create score history tracker
   - [ ] Implement score breakdowns

4. **Integration Layer**
   - [ ] Connect to analysis engine
   - [ ] Create WebSocket server
   - [ ] Build message protocol
   - [ ] Add event system
   - [ ] Implement error handling

5. **User Interaction**
   - [ ] Add dismiss functionality
   - [ ] Create "ignore this" options
   - [ ] Build configuration shortcuts
   - [ ] Add keyboard shortcuts

**Deliverable**: Visual overlay showing warnings in real-time

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

## Progress Summary (2026-04-02)
- **Phase 0**: ✅ Complete - Project foundation established
- **Phase 1**: ✅ Complete - Hook system working, 1-7ms performance
- **Phase 1.1 Day 1**: ✅ Complete - Code modularized, 100% tests passing
- **Phase 1.1 Day 2**: ✅ Complete - All critical security vulnerabilities fixed

## Current Statistics
- **Test Coverage**: 85/85 tests passing (100%)
- **Build Status**: ✅ Successful
- **Bundle Size**: 32.6KB
- **Performance**: 1-7ms analysis time (<500ms requirement met)
- **Code Quality**: 8.5/10 (up from 8/10 after security fixes)
- **CI/CD**: ✅ GitHub Actions configured
- **Security**: ✅ All OWASP vulnerabilities addressed

## Security Improvements (Day 2)
- ✅ Path traversal vulnerability fixed with multi-layer validation
- ✅ Command injection fixed with secure case statements
- ✅ ReDoS vulnerabilities eliminated with safer patterns
- ✅ Phase 1 permissive bypasses removed
- ✅ JSON parsing secured with 10MB size limit
- ✅ Type safety improved - critical `any` types replaced

## Next Actions
1. ✅ Phase 1 Complete - Foundation working with hooks
2. ✅ Phase 1.1 Day 1 Complete - Code modularized, tests fixed
3. ✅ Phase 1.1 Day 2 Complete - Security hardening implemented
4. 🔵 **NEXT**: Day 3 - Type Safety Fixes
   - Complete remaining `any` type replacements
   - Add strict null checks
   - Improve interface definitions
5. Continue with remaining priority fixes (Days 4-6)
6. Begin Phase 2 after all quality issues resolved