# Codebase Structure

**Analysis Date:** 2026-02-20

## Directory Layout

```
Uariumin/
├── .agents/                          # Project-specific agent skills
│   └── skills/
│       └── chrome-extension-development/
│           ├── SKILL.md              # Skill index and guidelines
│           └── rules/                # Domain-specific conventions
├── .claude/                          # Claude/GSD framework installation
│   ├── agents/                       # 11 specialized agent definitions
│   │   ├── gsd-codebase-mapper.md
│   │   ├── gsd-debugger.md
│   │   ├── gsd-executor.md
│   │   ├── gsd-integration-checker.md
│   │   ├── gsd-phase-researcher.md
│   │   ├── gsd-plan-checker.md
│   │   ├── gsd-planner.md
│   │   ├── gsd-project-researcher.md
│   │   ├── gsd-research-synthesizer.md
│   │   ├── gsd-roadmapper.md
│   │   └── gsd-verifier.md
│   ├── commands/                     # CLI command definitions
│   │   └── gsd/                      # 33+ gsd commands
│   ├── get-shit-done/                # Core GSD framework
│   │   ├── bin/
│   │   │   ├── gsd-tools.cjs         # Primary tool: init, queries, phase mgmt
│   │   │   └── gsd-tools.test.cjs
│   │   ├── references/               # 13 technical guides
│   │   │   ├── checkpoints.md
│   │   │   ├── continuation-format.md
│   │   │   ├── git-integration.md
│   │   │   ├── model-profiles.md
│   │   │   ├── phase-argument-parsing.md
│   │   │   ├── planning-config.md
│   │   │   ├── tdd.md
│   │   │   ├── verification-patterns.md
│   │   │   └── [8 others]
│   │   ├── templates/                # Document scaffolds
│   │   │   ├── codebase/             # Codebase analysis templates
│   │   │   │   ├── architecture.md
│   │   │   │   ├── concerns.md
│   │   │   │   ├── conventions.md
│   │   │   │   ├── integrations.md
│   │   │   │   ├── stack.md
│   │   │   │   ├── structure.md
│   │   │   │   └── testing.md
│   │   │   ├── research-project/     # Research output format
│   │   │   ├── phase-prompt.md
│   │   │   ├── project.md
│   │   │   ├── milestone.md
│   │   │   └── [20+ others]
│   │   ├── workflows/                # 32 named orchestration workflows
│   │   │   ├── new-project.md        # Initialize project
│   │   │   ├── plan-phase.md         # Plan one phase
│   │   │   ├── execute-phase.md      # Execute phases
│   │   │   ├── verify-phase.md       # Verify goal achievement
│   │   │   ├── research-phase.md
│   │   │   ├── discuss-phase.md
│   │   │   └── [26 others]
│   │   └── VERSION                   # Framework version
│   ├── hooks/                        # CLI hooks
│   │   ├── gsd-check-update.js       # Version checking
│   │   └── gsd-statusline.js         # Status display
│   ├── skills/                       # Framework-level skills
│   ├── gsd-file-manifest.json        # File inventory & checksums
│   ├── settings.json                 # Hook configuration
│   └── package.json                  # Node.js dependencies
├── .cursor/                          # Cursor IDE configuration
│   └── skills/
├── .planning/                        # Project planning & state
│   ├── codebase/                     # Codebase analysis docs
│   │   ├── ARCHITECTURE.md           # (created by mapper)
│   │   ├── STRUCTURE.md              # (created by mapper)
│   │   ├── CONVENTIONS.md            # (created by mapper)
│   │   ├── TESTING.md                # (created by mapper)
│   │   ├── STACK.md                  # (created by mapper)
│   │   ├── INTEGRATIONS.md           # (created by mapper)
│   │   └── CONCERNS.md               # (created by mapper)
│   ├── phases/                       # Per-phase execution artifacts
│   │   ├── 01-discovery/             # Phase structure: {padded}-{slug}
│   │   ├── 02-setup/
│   │   └── [more phases]/
│   ├── PROJECT.md                    # Project vision & scope
│   ├── ROADMAP.md                    # Phase definitions & goals
│   ├── REQUIREMENTS.md               # Feature specifications
│   ├── STATE.md                      # Current execution position
│   └── MILESTONES.md                 # Shipped version history
├── .git/                             # Git repository
├── CLAUDE.md                         # Project-specific instructions
└── README.md                          # (if project-provided)
```

## Directory Purposes

**`.agents/skills/`:**
- Purpose: Store project-specific agent skills and conventions
- Contains: Subdirectories per domain (e.g., `chrome-extension-development/`)
- Key files: `SKILL.md` (index), `rules/*.md` (detailed patterns)
- Access: Loaded by planner/executor agents during phase planning

**`.claude/agents/`:**
- Purpose: Define 11 specialized Claude agents for GSD workflows
- Contains: Markdown files with agent role, tools, and execution logic
- Key files:
  - `gsd-planner.md` (17KB+) - Creates executable plans
  - `gsd-executor.md` (17KB+) - Implements plans atomically
  - `gsd-verifier.md` (17KB+) - Goal-backward verification
  - `gsd-debugger.md` (36KB) - Failure diagnosis
  - Others for research, checking, phase management

**`.claude/commands/gsd/`:**
- Purpose: Register user-facing CLI commands
- Contains: 33+ command definition files
- Key files: `new-project.md`, `plan-phase.md`, `execute-phase.md`, `verify-phase.md`
- Pattern: Each file maps `/gsd:{command}` to orchestration workflow

**`.claude/get-shit-done/bin/`:**
- Purpose: System-level operations and state management
- Key file: `gsd-tools.cjs` (primary tool)
- Functions:
  - `init` - Initialize context for workflows
  - `roadmap` - Query phase information
  - `phase-plan-index` - Group plans by wave
  - `state` - Update execution position
  - State queries for UI status line

**`.claude/get-shit-done/references/`:**
- Purpose: Technical reference documentation
- Contains: 13 guides on GSD patterns and integrations
- Examples: `checkpoints.md`, `verification-patterns.md`, `tdd.md`, `git-integration.md`
- Usage: Agents read for pattern guidance

**`.claude/get-shit-done/templates/`:**
- Purpose: Document scaffolds for all project artifacts
- Contains: 26 templates including:
  - `codebase/` - Codebase analysis templates (ARCHITECTURE, CONVENTIONS, etc.)
  - `project.md` - Project vision structure
  - `milestone.md` - Version release format
  - `phase-prompt.md` - Phase execution prompt
  - `research.md` - Research output format
  - `requirements.md` - Feature specification format
- Usage: Orchestrators use to create new phase directories

**`.claude/get-shit-done/workflows/`:**
- Purpose: Define orchestration workflows for user commands
- Contains: 32 named workflows (named after user commands)
- Lifecycle workflows: `new-project` → `plan-phase` → `execute-phase` → `verify-phase`
- Utility workflows: `research-phase`, `discuss-phase`, `complete-milestone`, `debug`
- Each file: `<purpose>`, `<process>` sections with bash commands

**`.planning/`:**
- Purpose: Central project planning and state
- Contains: All project artifacts generated during workflow execution
- Key files:
  - `PROJECT.md` - Project vision and scope
  - `ROADMAP.md` - Phase definitions with goals
  - `REQUIREMENTS.md` - Feature/constraint specifications
  - `STATE.md` - Current execution position (updated by orchestrators)
  - `MILESTONES.md` - Shipped version history
  - `codebase/` - Static codebase analysis (ARCHITECTURE, CONVENTIONS, etc.)
  - `phases/` - Per-phase artifacts

**`.planning/phases/{padded}-{slug}/`:**
- Purpose: Store all artifacts for one phase
- Naming: `{padded_number}-{slug}` (e.g., `01-discovery`, `02-setup`)
- Lifecycle artifacts:
  - `RESEARCH.md` - Research findings (from gsd-phase-researcher)
  - `CONTEXT.md` - User design decisions (from gsd-discussion)
  - `{timestamp}-PLAN.md` - Executable task breakdown (from gsd-planner)
  - `{timestamp}-SUMMARY.md` - Execution results (from gsd-executor)
  - `{timestamp}-VERIFICATION.md` - Goal validation (from gsd-verifier)
- Multiple files allowed: Versions tracked by timestamp

## Key File Locations

**Entry Points:**

- `CLAUDE.md`: Project-specific instructions and skills index
- `.planning/PROJECT.md`: Project vision; starting point for understanding scope
- `.planning/ROADMAP.md`: Phase list; entry point for phase operations

**Configuration:**

- `.claude/settings.json`: Hook configuration (version checks, status line)
- `.claude/package.json`: Node.js dependencies for gsd-tools.cjs
- `.claude/gsd-file-manifest.json`: File inventory with checksums for integrity checks

**Core Logic:**

- `.claude/get-shit-done/bin/gsd-tools.cjs`: Primary initialization and state tool (2000+ lines)
- `.claude/agents/gsd-planner.md`: Plan creation logic (38KB)
- `.claude/agents/gsd-executor.md`: Task execution logic (17KB)
- `.claude/agents/gsd-verifier.md`: Goal verification logic (17KB)

**Workflows:**

- `.claude/get-shit-done/workflows/plan-phase.md`: Phase planning orchestration
- `.claude/get-shit-done/workflows/execute-phase.md`: Phase execution orchestration
- `.claude/get-shit-done/workflows/verify-phase.md`: Verification orchestration

**Testing:**

- `.claude/get-shit-done/bin/gsd-tools.test.cjs`: Unit tests for gsd-tools

## Naming Conventions

**Files:**

- Agent definitions: `gsd-{name}.md` (e.g., `gsd-executor.md`)
- Workflow definitions: `{workflow-name}.md` (e.g., `plan-phase.md`)
- Command definitions: `{command-name}.md` (e.g., `execute-phase.md`)
- Project state files: `{NAME}.md` in UPPERCASE (PROJECT.md, ROADMAP.md, STATE.md)
- Phase artifacts: `{timestamp}-{NAME}.md` (e.g., `2025-02-20T10:15:00Z-PLAN.md`)

**Directories:**

- Agent skills: `.agents/skills/{domain}/` (e.g., `.agents/skills/chrome-extension-development/`)
- Phase directories: `.planning/phases/{padded}-{slug}/` (e.g., `.planning/phases/01-discovery/`)
- Framework directories: `.claude/` (root), `.claude/get-shit-done/` (framework core)

## Where to Add New Code

**New Workflow:**
- Create: `.claude/get-shit-done/workflows/{workflow-name}.md`
- Add command mapping: `.claude/commands/gsd/{command-name}.md`
- Structure: `<purpose>`, `<process>` sections with bash commands
- Pattern: Use `gsd-tools.cjs` for initialization

**New Agent:**
- Create: `.claude/agents/gsd-{name}.md`
- Structure: YAML frontmatter (name, description, tools, color) + `<role>`, sections
- Register: Invoke from workflows, typically via orchestrator spawn
- Guidance: Follow existing agents' pattern of reading context, executing logic, producing artifacts

**New Project Skill:**
- Create: `.agents/skills/{domain-name}/`
- Add: `SKILL.md` (index) and `rules/*.md` (detailed patterns)
- Reference: Load SKILL.md in planner/executor via project context discovery
- Usage: Agents read rules during phase planning/execution

**New Reference:**
- Create: `.claude/get-shit-done/references/{topic}.md`
- Structure: Clear sections, code examples where applicable
- Usage: Agents read references for pattern guidance

**New Template:**
- Create: `.claude/get-shit-done/templates/{category}/{name}.md`
- For codebase analysis: `.claude/get-shit-done/templates/codebase/{name}.md`
- Structure: Placeholder sections with `[Placeholder]` tokens
- Usage: Orchestrators scaffold documents for agents

## Special Directories

**`.claude/` (Framework Installation):**
- Purpose: GSD framework core and project-level customization
- Generated: No, committed to git
- Contains: Agents, commands, workflows, tools, templates, references, skills
- Integrity: Checksummed in `gsd-file-manifest.json`
- Never delete; update via `/gsd:update` command

**`.planning/` (Project State & Artifacts):**
- Purpose: All project planning decisions and execution history
- Generated: Yes, created during `/gsd:new-project` and phase operations
- Key files committed: PROJECT.md, ROADMAP.md, REQUIREMENTS.md
- Ephemeral files (not essential to commit): Intermediate research, plans, summaries
- Integrity: Tracked by orchestrators, integrity checks in workflows

**`.planning/phases/` (Phase Execution History):**
- Purpose: Preserve all decisions and implementations per phase
- Created: New directory per phase via phase planning
- Committed: Yes, entire directory with all artifacts
- Versioning: Multiple {timestamp}-PLAN.md files allowed if plan revised
- Cleanup: Archive old phase directories to `.planning/archive/` if needed

**`.agents/skills/` (Project Skills):**
- Purpose: Domain-specific agent skills and conventions
- Generated: No, created by user or expert once per domain
- Committed: Yes, should be version controlled
- Referenced: Loaded by planner/executor during phase operations
- Scope: One per technical domain (e.g., one for mobile, one for web)

**`.git/` (Version Control):**
- Purpose: Track all changes to `.claude/`, `.planning/`, and project code
- Not a GSD artifact: Managed by git, not by orchestrator
- Commits: Created by executor per task with `feat({phase}-{plan}): {objective}` format
- Hooks: Integration points in `.claude/hooks/` for version checks and status

## File Location Examples

**Create a new backend API phase:**
```
.planning/phases/04-backend-api/
├── 2025-02-20T14:30:00Z-PLAN.md       # Tasks: set up Express, auth, schemas
├── 2025-02-20T15:45:00Z-SUMMARY.md    # Execution results, commit hashes
└── 2025-02-20T16:20:00Z-VERIFICATION.md # Goal: "Working API with auth" ✓
```

**Add Chrome extension skill:**
```
.agents/skills/chrome-extension-development/
├── SKILL.md                            # "Build secure, performant Chrome extensions"
└── rules/
    ├── manifest-v3.md                  # Manifest V3 structure and validation
    ├── security-best-practices.md      # Security patterns
    └── performance-optimization.md     # Memory, CPU, message-passing patterns
```

**Execute a plan for phase 2:**
```
.planning/phases/02-authentication/
├── CONTEXT.md                          # "Use JWT + secure storage"
├── 2025-02-20T10:00:00Z-PLAN.md       # 4 tasks across 2 waves
└── [After execution]
    ├── 2025-02-20T12:15:00Z-SUMMARY.md
    └── 2025-02-20T13:00:00Z-VERIFICATION.md
```

---

*Structure analysis: 2026-02-20*
