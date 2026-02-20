# Technology Stack

**Analysis Date:** 2026-02-20

## Languages

**Primary:**
- JavaScript (Node.js) - GSD framework and hooks
- Node.js script runners for CLI tools and automation
- Markdown - All documentation and configuration files

**Secondary:**
- TypeScript - Recommended for client projects using the Chrome Extension Skill
- Bash - Shell scripting for git operations and file management

## Runtime

**Environment:**
- Node.js - Version specified in `.claude/package.json` (minimal setup)
- Operating Systems: macOS, Linux (zsh/bash shell primary)

**Package Manager:**
- npm - Used for CLI tool versioning and distribution
- Lockfile: Not present (minimal dependencies approach)

## Frameworks

**Core:**
- GSD Framework 1.20.5 - Core planning and project orchestration framework
  - CLI tool suite in `gsd-tools.cjs`
  - Agent-based architecture using Claude APIs
  - Markdown-based configuration and state management

**CLI/Automation:**
- CommonJS modules (`.cjs`) - Used for Node.js CLI utilities
- Native Node.js APIs - `fs`, `path`, `child_process`, `os`

**Chrome Extension Support:**
- Manifest V3 - Chrome extension architecture standard
- JavaScript/TypeScript - Extension implementation
- Webpack/Vite - Recommended build tools (per Chrome Extension Skill)

## Key Dependencies

**Critical:**
- Node.js built-in modules only - `fs`, `path`, `os`, `child_process`, `execSync`
- No external npm dependencies in core framework (deliberate minimalism)

**API Integration:**
- Brave Search API - Optional web search functionality
  - Environment variable: `BRAVE_API_KEY`
  - Integration point: `gsd-tools.cjs` websearch command
  - API endpoint: `https://api.search.brave.com/res/v1/web/search`

**Claude Integration:**
- Claude API (via Claude Code environment)
- MCP (Model Context Protocol) tools - Used by researcher agents
- Context7 - Library documentation queries

## Configuration

**Environment:**
- `BRAVE_API_KEY` - Optional, enables websearch functionality in gsd-tools
- `.gsd/brave_api_key` - Alternative file-based key storage
- `.gsd/defaults.json` - User configuration defaults
- `~/.claude/` - User GSD configuration directory

**Build:**
- `tsconfig.json` - TypeScript configuration (for client projects)
- `.eslintrc` / `.prettierrc` - Code linting and formatting (per conventions)
- `gsd-tools.cjs` - Core CLI utility without build step required

**GSD Configuration Files:**
- `.planning/config.json` - Project-specific GSD settings
- `.planning/STATE.md` - Project state and progress tracking
- `.planning/ROADMAP.md` - Phase and milestone definitions

## Platform Requirements

**Development:**
- Node.js (latest LTS recommended)
- Git repository (initialized automatically by GSD)
- Text editor/IDE with Markdown support
- Unix-like shell (bash/zsh) on macOS/Linux
- Chrome browser for extension development (via Chrome Extension Skill)

**Production:**
- Claude Code environment or equivalent AI development interface
- GSD framework files at `.claude/get-shit-done/`
- Git repository for version control and commit management
- Optional: Brave Search API key for websearch features

---

*Stack analysis: 2026-02-20*
