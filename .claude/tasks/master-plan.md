# AI Code Guardian - Development Plan

## Project Vision
Build a real-time preventative feedback system that monitors AI-generated code as it's being created, providing instant visual warnings about security issues, code quality problems, and over-engineering patterns.

## Development Phases

### Phase 1: Foundation & Hook System
**Goal**: Intercept and log all AI-generated code in real-time

#### Tasks:
1. **Project Setup**
   - [ ] Initialize npm package with TypeScript
   - [ ] Set up build tooling (Vite, TypeScript)
   - [ ] Configure ESLint and Prettier
   - [ ] Create .gitignore and README.md
   - [ ] Set up Jest for testing

2. **Hook System Implementation**
   - [ ] Create analyze.sh script for PostToolUse hook
   - [ ] Create pre-check.sh script for PreToolUse hook
   - [ ] Implement logging system to capture intercepted code
   - [ ] Test hook triggers with different Claude operations
   - [ ] Create hook configuration manager

3. **Skill Definitions**
   - [ ] Create /guardian-watch skill definition
   - [ ] Create /guardian-config skill definition
   - [ ] Create /guardian-report skill definition
   - [ ] Implement skill parameter parsing
   - [ ] Add skill help documentation

4. **Basic CLI Interface**
   - [ ] Create command-line entry point
   - [ ] Implement basic argument parsing
   - [ ] Add version and help commands
   - [ ] Create configuration file loader

5. **Testing Infrastructure**
   - [ ] Set up test fixtures for code samples
   - [ ] Create mock Claude environment
   - [ ] Write initial hook tests

**Deliverable**: Plugin that logs all AI-generated code to console/file

---

### Phase 2: Analysis Engine
**Goal**: Analyze code for security issues, quality problems, and patterns

#### Tasks:
1. **AST Parser Setup**
   - [ ] Integrate web-tree-sitter
   - [ ] Download language grammars (JS, TS, Python)
   - [ ] Create parser wrapper for multiple languages
   - [ ] Build AST traversal utilities
   - [ ] Cache parsed results

2. **Rule Engine Architecture**
   - [ ] Design rule JSON schema
   - [ ] Create rule loader and validator
   - [ ] Implement rule matching engine
   - [ ] Build rule priority system
   - [ ] Add custom rule support

3. **Security Pattern Detection**
   - [ ] Create SQL injection detector
   - [ ] Create XSS vulnerability detector
   - [ ] Create hardcoded secrets detector
   - [ ] Create insecure random detector
   - [ ] Create path traversal detector

4. **Code Quality Analysis**
   - [ ] Implement complexity scoring
   - [ ] Create code duplication detector
   - [ ] Add function length analyzer
   - [ ] Build nesting depth checker
   - [ ] Create variable naming analyzer

5. **Performance Optimization**
   - [ ] Implement incremental analysis
   - [ ] Add caching layer
   - [ ] Create analysis queue system
   - [ ] Optimize AST operations

**Deliverable**: CLI tool that analyzes code and outputs issues

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

## Next Actions
1. Start with Phase 1, Task 1: Project Setup
2. Test each phase before moving to next
3. Document as you build
4. Get feedback from actual usage