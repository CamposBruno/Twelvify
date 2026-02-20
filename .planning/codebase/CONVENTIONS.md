# Coding Conventions

**Analysis Date:** 2026-02-20

## Naming Patterns

**Files:**
- Kebab-case with explicit purpose: `gsd-tools.cjs`, `gsd-check-update.js`, `gsd-statusline.js`
- Test files use `.test.cjs` suffix: `gsd-tools.test.cjs`
- Entry scripts use `.cjs` (CommonJS) or `.js` extensions for Node.js CLI tools
- Uppercase for documentation and config: `VERSION`, `ROADMAP.md`, `STATE.md`

**Functions:**
- Camel case: `safeReadFile()`, `loadConfig()`, `execGit()`, `isGitIgnored()`
- Command functions prefixed with `cmd`: `cmdGenerateSlug()`, `cmdStateLoad()`, `cmdVerifyPathExists()`
- Handler/helper functions named descriptively: `extractFrontmatter()`, `reconstructFrontmatter()`, `normalizePhaseName()`

**Variables:**
- Camel case for general variables: `tmpDir`, `configPath`, `tmpPath`, `cacheFile`, `cacheDir`
- Uppercase with underscores for constants: `MODEL_PROFILES`, `TOOLS_PATH`, `BRAVE_API_KEY`
- Descriptive names reflecting content: `parentSection`, `planNums`, `diskPhases`, `frontmatter`

**Types:**
- Objects use descriptive names: `MODEL_PROFILES` (lookup table), `result`, `digest`, `config`
- Array variables often end in 's': `files`, `todos`, `warnings`, `items`, `phases`
- Boolean flags prefixed with `is` or `has`: `isDirectory()`, `hasVerify`, `hasDone`, `hasFiles`

## Code Style

**Formatting:**
- No explicit formatter (prettier/eslint) detected
- Consistent indentation: 2 spaces
- Long lines preserved without wrapping where meaningful
- Comments use proper spacing: `// Comment` not `//Comment`

**Linting:**
- No ESLint or Biome configuration detected
- Code follows implicit Node.js conventions
- Error handling explicit with try/catch

## Import Organization

**Order:**
1. Node.js built-in modules: `const fs = require('fs');`
2. External packages: `const { test, describe } = require('node:test');`
3. Local utilities: Imported path-based modules

**Path Aliases:**
- Relative paths used: `path.join(__dirname, 'gsd-tools.cjs')`
- Absolute paths for system directories: `path.join(cwd, '.planning', 'config.json')`
- No alias shortcuts (@utils, @helpers) used in this codebase

**Example Import Pattern:**
```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
```

## Error Handling

**Patterns:**
- Explicit try/catch for I/O operations (file reads/writes)
- Silent catch blocks for non-critical operations: `} catch {}`
- Error function used for user-facing messages: `error('message')`
- Process exits on fatal errors: `process.exit(1)` in error handler
- Graceful degradation: Returns empty arrays/null on missing files
- Command functions validate required parameters early: `if (!text) { error(...) }`

**Example Error Handling:**
```javascript
try {
  return fs.readFileSync(filePath, 'utf-8');
} catch {
  return null;
}
```

```javascript
try {
  const stats = fs.statSync(fullPath);
  // ...
} catch {
  output({ exists: false, type: null }, raw, 'false');
}
```

## Logging

**Framework:** None - uses direct `process.stdout` and `process.stderr`

**Patterns:**
- Output function wraps all result communication: `output(result, raw, rawValue)`
- Error output to stderr: `process.stderr.write('Error: ' + message + '\n')`
- Large JSON outputs (>50KB) written to temp files with `@file:` prefix
- Test output captured via execSync with stdio pipes
- No debug logging; focus on command result output

**Output Example:**
```javascript
function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue));
  } else {
    const json = JSON.stringify(result, null, 2);
    if (json.length > 50000) {
      const tmpPath = path.join(require('os').tmpdir(), `gsd-${Date.now()}.json`);
      fs.writeFileSync(tmpPath, json, 'utf-8');
      process.stdout.write('@file:' + tmpPath);
    } else {
      process.stdout.write(json);
    }
  }
  process.exit(0);
}
```

## Comments

**When to Comment:**
- File-level JSDoc describing purpose and parameters
- Complex algorithms with inline explanation
- Section headers using unicode line decorators: `// ─── Section Name ──────`
- Disable rule explanations: `// @noqa`, error handling intent
- Implementation notes for non-obvious logic

**JSDoc/TSDoc:**
- File headers include purpose and CLI usage
- Command documentation inline above function
- No type annotations used (CommonJS/Node.js style)

**Example Comment Pattern:**
```javascript
/**
 * GSD Tools — CLI utility for GSD workflow operations
 *
 * Replaces repetitive inline bash patterns across ~50 GSD command/workflow/agent files.
 * Centralizes: config parsing, model resolution, phase lookup, git commits...
 */

// ─── Model Profile Table ─────────────────────────────────────────────────────
const MODEL_PROFILES = {
  // ...
};

// Helper to run gsd-tools command
function runGsdTools(args, cwd = process.cwd()) {
  // ...
}
```

## Function Design

**Size:** Functions range from 5-100+ lines; larger functions handle complex state mutations or multi-step operations

**Parameters:**
- Most functions take `cwd` (current working directory) as first parameter for path resolution
- `raw` boolean parameter used in commands to control output format (JSON vs raw string)
- Options passed as objects: `{ force: true, repair: true }`
- Command names matched against argv in main dispatch loop

**Return Values:**
- No explicit return statements; results passed to `output()` function
- Early returns for parameter validation
- Process exits via `output()` or `error()` functions

**Example Pattern:**
```javascript
function cmdGenerateSlug(text, raw) {
  if (!text) {
    error('text required for slug generation');
  }

  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const result = { slug };
  output(result, raw, slug);
}
```

## Module Design

**Exports:**
- Monolithic tool file exports single command dispatcher at bottom (line 5000+)
- Test file requires the tool via execSync (subprocess invocation)
- No module.exports used for individual functions; CLI dispatch via main switch statement

**Barrel Files:**
- No barrel files (index.js re-exports) used in this codebase
- Single file per tool: gsd-tools.cjs is ~5300 lines with all commands

**Dispatch Pattern:**
```javascript
// At end of gsd-tools.cjs
if (process.argv[2] === 'state' && process.argv[3] === 'load') {
  cmdStateLoad(cwd, raw);
} else if (process.argv[2] === 'generate-slug') {
  cmdGenerateSlug(process.argv[3], raw);
} // ... hundreds of conditions
```

## Special Patterns

**Configuration Loading:**
- Reads from `.planning/config.json`
- Merges with hardcoded defaults
- Supports nested object access: `{ section: 'git', field: 'branching_strategy' }`
- Handles both boolean and complex object values for parallelization

**Frontmatter Extraction:**
- Parses YAML frontmatter between `---` markers
- Stack-based recursive parsing for nested objects
- Handles both inline arrays `[a, b, c]` and block arrays with `-`
- Graceful fallback to empty object on parse failure

**Phase Numbering:**
- Supports decimal phases: `01`, `02.1`, `02.2`, `03`
- Normalization function left-pads phase numbers: `normalizePhaseName()`
- Sorting handles numeric comparison with decimal awareness

---

*Convention analysis: 2026-02-20*
