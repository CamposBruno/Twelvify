# Architecture

**Analysis Date:** 2026-02-20

## Pattern Overview

**Overall:** Orchestrated multi-agent workflow system with task decomposition, verification loops, and atomic git-based execution.

**Key Characteristics:**
- Stateless agent spawning orchestrated by workflows
- Goal-backward verification for outcome validation
- Wave-based parallel execution with dependency tracking
- Checkpoint-based resumption for long-running tasks
- Phase-driven project structure with planning → execution → verification cycles

## Layers

**Orchestration Layer:**
- Purpose: Coordinate workflows, spawn agents, manage state, handle branching strategies
- Location: `.claude/get-shit-done/workflows/`, `.claude/commands/gsd/`
- Contains: Workflow definitions (`.md` files) and command registrations
- Depends on: gsd-tools.cjs for initialization and state queries
- Used by: User-facing CLI commands and workflow transitions

**Agent Layer:**
- Purpose: Execute specialized tasks (research, planning, execution, verification, debugging)
- Location: `.claude/agents/` (11 agent definitions)
- Contains: Agent prompts with role, tools, and execution logic
- Key agents:
  - `gsd-project-researcher.md` - Discovers project scope and unknowns
  - `gsd-planner.md` - Decomposes phases into executable plans with task breakdown
  - `gsd-executor.md` - Implements plan tasks with atomic git commits
  - `gsd-verifier.md` - Goal-backward outcome validation
  - `gsd-debugger.md` - Diagnoses failures and creates fix plans
- Depends on: Orchestrator state (STATE.md, ROADMAP.md, etc.)
- Used by: Orchestration layer workflows

**Planning & State Layer:**
- Purpose: Persist project decisions, requirements, phases, and execution progress
- Location: `.planning/` (project root)
- Contains:
  - `ROADMAP.md` - Phase definitions with goals
  - `REQUIREMENTS.md` - Feature and constraint specifications
  - `CONTEXT.md` (per-phase) - Design decisions and constraints
  - `STATE.md` - Current execution position and project state
  - `phases/` - Per-phase artifacts (research, plans, summaries, verifications)
- Used by: Orchestrators for initialization, agents for context, tools for status queries

**Tools & Utilities Layer:**
- Purpose: Provide system-level operations (initialization, state queries, git integration)
- Location: `.claude/get-shit-done/bin/gsd-tools.cjs`
- Contains: Node.js CLI tool for file system operations, JSON-based state machine
- Interfaces with: All workflows and orchestrators via JSON commands
- Used by: All orchestration layer workflows

**Template & Reference Layer:**
- Purpose: Define document structures and best practices
- Location: `.claude/get-shit-done/templates/`, `.claude/get-shit-done/references/`
- Contains: Markdown templates for project documents, technical references
- Used by: Orchestrators to scaffold new phases, agents for guidance

**Skills Layer:**
- Purpose: Provide project-specific patterns and conventions
- Location: `.agents/skills/` (per-project)
- Contains: Skill SKILL.md index files and rule definitions in `rules/` subdirectories
- Used by: Planner and executor agents for domain-specific guidance

## Data Flow

**Project Initialization Flow:**

1. User runs `/gsd:new-project`
2. Orchestrator creates `.planning/PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md`
3. State stored in `.planning/STATE.md` for subsequent operations

**Phase Planning Flow:**

1. User runs `/gsd:plan-phase {phase_number}`
2. Orchestrator initializes via `gsd-tools.cjs init plan-phase`
3. Optional: Spawn `gsd-phase-researcher` if research needed
4. Spawn `gsd-planner` with phase context, research, requirements
5. Planner reads ROADMAP.md for phase goal, REQUIREMENTS.md for scope, CONTEXT.md for decisions
6. Planner creates phase directory `.planning/phases/{padded}-{slug}/` with PLAN.md files
7. Optional: Spawn `gsd-plan-checker` for verification
8. Update STATE.md with planning position
9. Return plan summaries to user

**Phase Execution Flow:**

1. User runs `/gsd:execute-phase {phase_number}`
2. Orchestrator initializes via `gsd-tools.cjs init execute-phase`
3. Orchestrator analyzes PLAN.md wave dependencies
4. For each wave (sequentially):
   - For each plan in wave (parallel or sequential based on config):
     - Spawn `gsd-executor` with PLAN.md context
     - Executor reads PLAN.md objective, context references (@file paths)
     - Executor implements tasks, commits per task with `Co-Authored-By` footer
     - If checkpoint encountered: STOP, return structured message
     - Executor creates SUMMARY.md with completions and deviations
5. Orchestrator collects all SUMMARY.md files
6. Update STATE.md with execution position
7. Spawn `gsd-verifier` if enabled
8. Verifier reads phase GOAL from ROADMAP.md, PLAN.md must_haves, SUMMARY.md claims
9. Verifier goal-backwards validates artifacts exist and function
10. Verifier creates VERIFICATION.md with pass/fail status and gap identification

**Phase Verification & Gap Closure Flow:**

1. Verifier completes, marks phase verified or with gaps
2. If gaps found: Update STATE.md with gap list
3. User runs `/gsd:plan-milestone-gaps` or manually continues
4. If gap closure: Spawn verifier again in re-verification mode
5. Re-verifier loads previous VERIFICATION.md, optimizes checking failed items only
6. Update STATE.md when gaps resolved

**State Management:**

- **STATE.md**: Central state file tracking project status, current phase, completion percentages
  - Updated by: Orchestrators after each major workflow (init, planning, execution, verification)
  - Read by: All agents and orchestrators for position and context

- **Per-Phase Artifacts**: Stored in `.planning/phases/{padded_number}-{slug}/`
  - RESEARCH.md: Topic investigation output
  - CONTEXT.md: User design decisions
  - {timestamp}-PLAN.md: Executable task breakdown
  - {timestamp}-SUMMARY.md: Execution results and git hashes
  - {timestamp}-VERIFICATION.md: Goal achievement validation

## Key Abstractions

**Workflow:**
- Purpose: Named orchestration process with specific entry point and exit
- Examples: `new-project`, `plan-phase`, `execute-phase`, `verify-phase`
- Pattern: Markdown file in `.claude/get-shit-done/workflows/` with `<purpose>`, `<process>` sections
- Flow: Parse arguments → Initialize via tool → Spawn agents → Collect results → Update state

**Phase:**
- Purpose: Logical unit of work with one goal
- Defined in: ROADMAP.md as `| number | name | goal |`
- Contains: Research, context decisions, plans, execution summaries, verification report
- Artifacts: `.planning/phases/{padded}-{slug}/` directory structure
- Lifecycle: Unplanned → Researched → Planned → Executing → Executed → Verifying → Verified

**Plan:**
- Purpose: Decomposed task breakdown for one phase with wave-based parallelization
- Frontmatter: `phase`, `plan`, `type`, `autonomous`, `wave`, `depends_on`, `must_haves`
- Contains: Objective, context (@file references), task list with verification criteria
- Multiple per phase: Plans are grouped in waves for parallel execution
- Created by: gsd-planner, executed by: gsd-executor

**Task:**
- Purpose: Atomic unit of implementation work
- Types: `auto` (autonomous, no stops), `checkpoint:user` (pause for feedback), `checkpoint:test` (pause for testing)
- Verification: Success criteria and expected outcomes per task
- Tracking: Git commit hash recorded in SUMMARY.md

**Wave:**
- Purpose: Group of plans that can execute in parallel
- Dependencies: Plans may depend on other plans, waves execute sequentially
- Configuration: Set via `depends_on` field in plan frontmatter
- Execution: Orchestrator groups by wave number and spawns agents

**Verification:**
- Purpose: Goal-backward validation that phase objective was achieved
- Pattern: Must-haves (truths, artifacts, links) → exists checks → substantive checks → wired checks
- Re-verification: Optimized mode for checking failed gaps only
- Output: VERIFICATION.md with pass/fail per must-have and gap list

**Checkpoint:**
- Purpose: Controlled pause point for manual intervention
- Types: `checkpoint:user` (design feedback), `checkpoint:test` (UAT validation)
- Triggering: `type="checkpoint:*"` in task definition
- Handling: Executor pauses, returns structured message, fresh agent resumes from task

## Entry Points

**User CLI Commands:**
- Location: `.claude/commands/gsd/` (command registrations)
- Execution: Via Claude's command system (e.g., `/gsd:new-project`)
- Dispatch: Maps to workflow in `.claude/get-shit-done/workflows/`

**Workflow Orchestrator:**
- Location: `.claude/get-shit-done/workflows/{workflow-name}.md`
- Triggers: User invokes `/gsd:{workflow-name}` command
- Responsibilities:
  - Parse arguments (phase number, flags)
  - Initialize project state via gsd-tools.cjs
  - Load context files (STATE.md, ROADMAP.md, requirements)
  - Spawn appropriate agents with structured context
  - Coordinate multi-agent flows (research → plan → verify)
  - Update STATE.md with completion

**Agent Entry:**
- Location: `.claude/agents/{agent-name}.md`
- Trigger: Spawned by orchestrator with context in `<files_to_read>` block
- Responsibilities: Execute specialized logic, produce output artifacts, return completion status
- Context: Receives project state, phase info, user decisions, codebase analysis

## Error Handling

**Strategy:** Explicit error detection with fail-fast messages and guided recovery.

**Patterns:**

- **Missing Prerequisites:** Orchestrator validates required files before agent spawn
  - Example: Check STATE.md exists before executing phases
  - Recovery: Offer to reconstruct or run prerequisite workflow

- **Verification Failures:** Goal-backward checks identify gaps vs. false successes
  - Pattern: Verify truths → artifacts → wiring; fail on any level
  - Recovery: Spawn debugger to diagnose, create gap-closure plan

- **Agent Errors:** Agents return failures with actionable messages
  - Pattern: Task fails → record deviation → continue other tasks if possible
  - Recovery: Executor notes deviations in SUMMARY.md, returns status

- **Checkpoint Pauses:** Controlled stops with state preservation
  - Pattern: Task type="checkpoint:*" → STOP, return structured message with task position
  - Recovery: User reviews, confirms continuation, orchestrator spawns fresh agent at checkpoint

- **Execution Deviations:** Expected when research assumptions diverge from reality
  - Pattern: Task deviation rules (skip optional tasks, substitute libraries, adapt patterns)
  - Recovery: Document deviation in SUMMARY.md, continue with adapted approach

## Cross-Cutting Concerns

**Logging:**
- Approach: Orchestrators log workflow status (initialization, agent spawn, completion)
- Agents log task-level progress and deviations
- No persistent log file; status visible via STATE.md and phase artifacts

**Validation:**
- Orchestrators: File existence checks, phase number validation, argument parsing
- Agents: Goal-backward verification (truths → artifacts → wiring)
- Executors: Success criteria checks per task

**Authentication:**
- Not implemented in GSD framework
- Authentication gates handled as executor deviations
- Secrets stored in project's `.env` (never logged)

**Git Integration:**
- Executor creates atomic commits per task with format: `feat({phase}-{plan}): {objective}`
- Footer: `Co-Authored-By: Claude {model} <noreply@anthropic.com>`
- STATE.md tracks commit ranges for milestones
- Branch strategy: None, phase-based, or milestone-based per config

**Context Management:**
- Orchestrators minimize context by using `<files_to_read>` blocks
- Agents load full context for their specialized task
- State preserved in `.planning/STATE.md` across agent spawns
- Agent spawns are stateless; orchestrator manages coordination

---

*Architecture analysis: 2026-02-20*
