# Codebase Concerns

**Analysis Date:** 2026-02-20

## Tech Debt

**Monolithic CLI Router:**
- Issue: All 100+ GSD commands are dispatched from a single 5300+ line file (`gsd-tools.cjs`) with deeply nested switch statements
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 4911-5300+)
- Impact: Adding new commands or modifying existing ones requires editing the massive file; testing specific commands is difficult
- Fix approach: Refactor into modular command files (e.g., `commands/state.js`, `commands/phase.js`) with a plugin-based router

**YAML Frontmatter Parser is Hand-Rolled:**
- Issue: Custom regex-based YAML parser (`extractFrontmatter()` at lines 251-324) handles only subset of YAML spec
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 251-324, 326-388)
- Impact: Edge cases with special characters, quotes, nested objects, and arrays may parse incorrectly; fragile to frontmatter format variations
- Fix approach: Replace with mature YAML library (js-yaml or similar) or use frontmatter npm package

**Excessive try-catch with Silent Failures:**
- Issue: 153 try-catch blocks throughout codebase, many with empty or generic catch clauses that hide errors
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (scattered throughout, e.g., lines 1056-1058, 1486-1488, 4392)
- Impact: Silent failures make debugging difficult; errors go unlogged; difficult to know when operations actually failed
- Fix approach: Log errors before swallowing; use specific error messages; return error status codes; add verbose/debug flag

**String Manipulation Over Validation:**
- Issue: Heavy use of string operations (126 instances of replace/split/slice/substring) for parsing file names, phase numbers, and paths
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 4222, 4468, 4476, 4499, 4590, 4826, etc.)
- Impact: Inconsistent parsing logic; off-by-one errors; phase number normalization not standardized across functions
- Fix approach: Create ParsedPhase class with validated properties; use consistent regex patterns; add comprehensive unit tests

**File I/O Operations Without Atomic Safety:**
- Issue: 89 `fs.readFileSync/writeFileSync` calls without atomic guarantees or backup/rollback
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (scattered, e.g., lines 1160, 1181, 1225, 1232, 1419)
- Impact: Partial writes if process crashes; concurrent operations can corrupt files; phase renumbering operations may leave inconsistent state
- Fix approach: Implement atomic write pattern (write to temp file, then rename); add rollback for multi-step operations (phase removal, renumbering)

## Fragile Areas

**Phase Renumbering Logic:**
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 2803-2920+, 2960-3050+)
- Why fragile: Complex decimal phase renumbering logic with multiple string parsing steps; interdependencies between directory and file renaming
- Safe modification: Add comprehensive test suite for all phase number combinations (01-99, decimal chains); test concurrent operations; add dry-run mode
- Test coverage: cmdPhaseRemove and related renumbering tested minimally in gsd-tools.test.cjs

**ROADMAP.md Synchronization:**
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 3509-3600+, 2620-2750+)
- Why fragile: ROADMAP content is edited by regex patterns; phase section extraction assumes specific markdown structure; no validation of format
- Safe modification: Parse ROADMAP into structured object; validate all mutations; test with malformed ROADMAP files
- Test coverage: Regex patterns for phase extraction not covered in tests

**Config Loading and Validation:**
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 156-207, 3715-3750)
- Why fragile: Nested config object access with optional chaining but missing defaults; JSON parsing unprotected (lines 174, 609, 663, 701)
- Safe modification: Use schema validation (e.g., zod or joi); provide detailed error messages for invalid configs
- Test coverage: Config mutation scenarios not tested

**Git Command Escaping:**
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 221-240, 211)
- Why fragile: Manual shell escaping of git arguments; regex-based allowlist for safe characters may miss edge cases
- Safe modification: Use child_process with array arguments (not shell=true); use git library instead of execSync
- Test coverage: No tests for special characters in branch names, commit messages, or file paths

## Missing Error Handling

**Phase Validation Gaps:**
- Problem: No validation that phase directories exist before operations
- Files: `cmdFindPhase()` line 1458 wraps in try-catch but returns notFound silently
- Blocker: Can't guarantee operations on non-existent phases fail loudly

**JSON Parsing Without Recovery:**
- Problem: `JSON.parse()` at lines 174, 609, 663, 701, 3722 will crash if config.json or other files are corrupted
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs`
- Blocker: Corrupt .planning/config.json breaks all operations; no fallback to defaults or error message

**Regex Pattern Edge Cases:**
- Problem: Phase number regex `^(\d+(?:\.\d+)?)` assumes well-formed input; no bounds checking (e.g., phase 999.999)
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 242-248, 1019, 1467, 1527, 3526, 3538, 3581)
- Blocker: Malformed phase numbers can cause parsing to fail in unpredictable ways

## Performance Bottlenecks

**Repeated File System Scans:**
- Problem: `fs.readdirSync()` called multiple times per operation; no caching
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 1012, 1458, 1572, 1823, 2824, 2854, 3535, 3572, etc.)
- Cause: Each phase lookup, validation, or traversal scans the entire phases directory from disk
- Improvement path: Cache directory listings in memory during command execution; use watch-based file monitoring for long-running operations

**Shell Command for File Discovery:**
- Problem: `execSync('find . -maxdepth 3...')` at line 4386 spawns external process to find source files
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (line 4386)
- Cause: Not using Node.js built-in fs APIs
- Improvement path: Replace with recursive fs.readdirSync() or use glob library

**Markdown Parsing with Regex:**
- Problem: All markdown section extraction uses regex matching (lines 1909-2035); re-parsing same file multiple times
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs`
- Cause: No markdown parser; regex re-applied for each field extraction
- Improvement path: Parse markdown once into AST; extract all fields from AST

## Scaling Limits

**Phase Directory Enumeration:**
- Current capacity: Linear scan works for <1000 phases; O(n) for each operation
- Limit: With 10,000+ phases, repeated scans become seconds per operation
- Scaling path: Implement phase index file (JSON) listing all phases and their metadata; update on phase add/remove/rename

**Monolithic Tool File:**
- Current capacity: Single 5324-line file manageable; diffs get massive
- Limit: Each new command adds 50-200 lines; at 10,000 lines, code becomes unmaintainable
- Scaling path: Separate into modules; implement command plugin system

## Dependencies at Risk

**No External Dependencies for Core Operations:**
- Risk: Hand-rolled YAML, markdown, git, and file I/O means bugs are entirely our responsibility
- Impact: Security: custom string escaping in shell commands; correctness: custom parsing breaks on edge cases
- Migration plan: Gradually add trusted libraries (js-yaml, markdown-it, isomorphic-git, proper git wrapper)

## Security Considerations

**Shell Injection Risk in Git Commands:**
- Risk: `execSync('git ' + escaped.join(' '))` at line 227; custom regex-based escaping at line 224
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 221-240)
- Current mitigation: Allowlist-based regex `/^[a-zA-Z0-9._\-/=:@]+$/` at line 224; single quotes for unsafe args
- Recommendations: Use child_process.execFile() with array args instead of shell escaping; avoid shell=true entirely

**Path Traversal Risk:**
- Risk: `path.join(cwd, ...)` operations assume cwd is valid; no canonicalization check
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (scattered throughout)
- Current mitigation: Implicit (path.join is safe); but no explicit validation that operations stay in .planning/
- Recommendations: Validate that all file operations are within project directory; add tests for symlink traversal

**Process Environment Exposure:**
- Risk: Config loading reads from `process.env` without filtering (line 4380); BRAVE_API_KEY exposed if process.env dumped
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs` (lines 4380, 4389)
- Current mitigation: None (env var access is implicit)
- Recommendations: Document which env vars are expected; validate presence before use; don't dump full process.env in logs/output

## Test Coverage Gaps

**Phase Operations Not Fully Tested:**
- Untested: Phase removal with decimals (cmdPhaseRemove lines 2847-2920); plan renumbering in removed phases
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs`
- Risk: Silent corruption of phase numbering; inconsistent state between ROADMAP and disk
- Priority: High

**Markdown Section Mutations Not Tested:**
- Untested: STATE.md field updates (stateReplaceField lines ~1250-1280); ROADMAP.md phase section edits
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs`
- Risk: Regex mutations may leave partial or corrupted markdown
- Priority: High

**File System Edge Cases Not Tested:**
- Untested: Behavior with missing .planning/, corrupted config.json, non-existent phase directories
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs`
- Risk: Unclear error messages; silent failures
- Priority: Medium

**Git Command Error Handling Not Tested:**
- Untested: Behavior when git operations fail (lines 221-240); commit with no changes; push to non-existent branch
- Files: `/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.cjs`
- Risk: Operations may appear to succeed when they fail
- Priority: Medium

---

*Concerns audit: 2026-02-20*
