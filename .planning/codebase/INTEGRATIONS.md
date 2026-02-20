# External Integrations

**Analysis Date:** 2026-02-20

## APIs & External Services

**Web Search:**
- Brave Search API - Web search functionality for research phases
  - SDK/Client: Native fetch (built into `gsd-tools.cjs`)
  - Auth: API key via `BRAVE_API_KEY` environment variable
  - Endpoint: `https://api.search.brave.com/res/v1/web/search`
  - Usage: `gsd-tools.cjs websearch <query> [--limit N] [--freshness day|week|month]`
  - Key location: `~/.gsd/brave_api_key` or environment variable

**Claude AI Services:**
- Claude API - LLM backbone for all GSD agents
  - Available in Claude Code environment
  - Models configurable via profile system (`.claude/get-shit-done/references/model-profiles.md`)
  - Used by: gsd-codebase-mapper, gsd-executor, gsd-planner, gsd-verifier agents

**Context & Documentation APIs:**
- Context7 (MCP) - Library documentation and technical queries
  - Available to research agents via `mcp__context7__*` tools
  - `mcp__context7__resolve-library-id` - Find library by name
  - `mcp__context7__query-docs` - Query library documentation
  - Priority: Used before general web search for verified technical info

## Data Storage

**Databases:**
- None configured in core GSD framework
- Local filesystem-based state management via Markdown files

**File Storage:**
- Local filesystem only
- `.planning/` - Project planning documents
- `.planning/research/` - Research outputs
- `.planning/phases/[N]/` - Phase-specific plans and summaries
- `.planning/milestones/` - Archived milestone data

**Caching:**
- `.claude/cache/gsd-update-check.json` - GSD version check cache
- Session-based: todo cache in `~/.claude/todos/`

## Authentication & Identity

**Auth Provider:**
- Custom/No centralized auth
- API keys stored in:
  - Environment variables (`BRAVE_API_KEY`)
  - Local config files (`~/.gsd/brave_api_key`)
  - Project config (`.planning/config.json`)

**Git Integration:**
- SSH/HTTPS - Via system git configuration
- Commits authored with configurable name/email via git config
- No specific auth mechanism - uses system Git credentials

## Monitoring & Observability

**Error Tracking:**
- None configured
- Errors logged to stdout/stderr

**Logs:**
- Console output (stdout/stderr) via Node.js
- No persistent logging configured
- Session hooks provide feedback via statusline

## CI/CD & Deployment

**Hosting:**
- Claude Code (cloud-based AI development environment)
- No traditional server deployment

**CI Pipeline:**
- No automated CI/CD configured
- Manual invocation via `/gsd:*` commands in Claude Code

## Environment Configuration

**Required env vars:**
- `BRAVE_API_KEY` - Optional, enables web search in research phases
- Git configuration (`user.name`, `user.email`) - For commit authorship

**Optional env vars for GSD tools:**
- `NODE_OPTIONS` - Node.js runtime options if needed

**Secrets location:**
- `.gsd/brave_api_key` - Alternative to env variable
- `~/.gsd/` - User-level GSD configuration directory
- Project `.planning/config.json` - May contain local API keys (not tracked in git)

**Configuration files:**
- `.planning/config.json` - GSD framework settings
  - Fields: workflow, planning, parallelization, gates, safety settings
- `.planning/STATE.md` - Project execution state
- `.planning/ROADMAP.md` - Phase structure and timeline

## Webhooks & Callbacks

**Incoming:**
- None - GSD is CLI/IDE-based, not server-based

**Outgoing:**
- Git commits - Automatic commits to local repository
- Optional: Web search API requests to Brave Search
- No other external webhooks configured

## Special Integrations

**Claude Code Integration:**
- GSD commands loaded as custom commands via `.claude/commands/gsd/`
- Agent definitions in `.claude/agents/` - Spawned by orchestrators
- Hooks in `.claude/hooks/` - Execute on SessionStart and statusline rendering
- Tools available: Read, Bash, Grep, Glob, Write, WebSearch, WebFetch

**Chrome Extension Development Skill:**
- Located at `.claude/skills/chrome-extension-development/`
- Provides expert guidelines for Manifest V3 extension development
- Covers Chrome APIs, security, testing, publishing workflows
- Targets Chrome Web Store distribution

**File Manifest System:**
- `.claude/gsd-file-manifest.json` - Integrity tracking for all GSD files
- Includes: SHA-256 hashes, timestamps, file version metadata
- Used by update mechanism to verify consistency

---

*Integration audit: 2026-02-20*
