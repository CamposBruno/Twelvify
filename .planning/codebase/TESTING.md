# Testing Patterns

**Analysis Date:** 2026-02-20

## Test Framework

**Runner:**
- Node.js built-in `node:test` module
- Config: No separate config file; tests run via `node gsd-tools.test.cjs`

**Assertion Library:**
- Node.js built-in `node:assert` module with `assert.ok()`, `assert.deepStrictEqual()`, `assert.strictEqual()`

**Run Commands:**
```bash
node /Users/brunocampos/Uariumin/.claude/get-shit-done/bin/gsd-tools.test.cjs              # Run all tests
# No watch mode available (built-in test module limitation)
# No separate coverage tool configured
```

## Test File Organization

**Location:**
- Co-located in same directory: `gsd-tools.test.cjs` alongside `gsd-tools.cjs`
- Separate test file rather than inline

**Naming:**
- Single test file: `gsd-tools.test.cjs` (mirrors source + `.test`)

**Structure:**
```
/Users/brunocampos/Uariumin/.claude/get-shit-done/bin/
├── gsd-tools.cjs           # Implementation
├── gsd-tools.test.cjs      # Tests
```

## Test Structure

**Suite Organization:**
```javascript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

describe('history-digest command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('empty phases directory returns valid schema', () => {
    const result = runGsdTools('history-digest', tmpDir);
    assert.ok(result.success, `Command failed: ${result.error}`);

    const digest = JSON.parse(result.output);
    assert.deepStrictEqual(digest.phases, {}, 'phases should be empty object');
  });

  test('nested frontmatter fields extracted correctly', () => {
    // ... test implementation
  });
});
```

**Patterns:**
- Setup: `beforeEach()` creates temporary project directory structure
- Teardown: `afterEach()` cleans up temp directory recursively
- Assertion pattern: `assert.ok()` for boolean checks, `assert.deepStrictEqual()` for object comparison
- Error messages included in assertions: `assert.ok(result.success, `Command failed: ${result.error}`)`

## Mocking

**Framework:** None - uses real filesystem and subprocess execution

**Patterns:**
- Subprocess invocation via `execSync()` running actual gsd-tools commands
- Temporary filesystem setup with `fs.mkdirSync()` and `fs.mkdtempSync()`
- Fixtures created dynamically in beforeEach

**Test Data Creation:**
```javascript
function createTempProject() {
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'gsd-test-'));
  fs.mkdirSync(path.join(tmpDir, '.planning', 'phases'), { recursive: true });
  return tmpDir;
}

// In test:
const phaseDir = path.join(tmpDir, '.planning', 'phases', '01-foundation');
fs.mkdirSync(phaseDir, { recursive: true });
fs.writeFileSync(path.join(phaseDir, '01-01-SUMMARY.md'), `---
phase: "01"
name: "Foundation Setup"
provides:
  - "Database schema"
---
`);
```

**What to Mock:**
- Nothing - integration tests run actual commands
- Filesystem operations use temp directories instead of mocking fs module

**What NOT to Mock:**
- Command execution (subprocess calls)
- Filesystem operations
- JSON parsing/serialization

## Fixtures and Factories

**Test Data:**
```javascript
function runGsdTools(args, cwd = process.cwd()) {
  try {
    const result = execSync(`node "${TOOLS_PATH}" ${args}`, {
      cwd,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return {
      success: false,
      output: err.stdout?.toString().trim() || '',
      error: err.stderr?.toString().trim() || err.message,
    };
  }
}
```

**Location:**
- Helper functions defined at top of test file: `runGsdTools()`, `createTempProject()`, `cleanup()`
- Inline fixture creation in `beforeEach()` blocks
- No separate fixtures directory

**Patterns:**
- Each test creates its own temp project structure
- SUMMARY.md files created with specific frontmatter for test scenarios
- Malformed files created intentionally to test error handling

## Coverage

**Requirements:** No coverage target enforced

**View Coverage:**
- No coverage tooling configured (would require C8 or NYC)
- Test file is 1000+ lines covering multiple command suites

## Test Types

**Unit Tests:**
- Not applicable - tests are integration tests
- Each test invokes actual CLI command via subprocess

**Integration Tests:**
- All tests are integration-style
- Test command output by parsing JSON results
- Scope: Individual command functionality (state load, history digest, phases list, etc.)
- Approach: Create temp directories, invoke command, assert output

**E2E Tests:**
- Not used - integration tests serve this purpose

## Common Patterns

**Async Testing:**
- No async/await used; synchronous I/O via `fs` module
- subprocess execution synchronous via `execSync()`
- Tests are synchronous functions

**Error Testing:**
```javascript
test('malformed SUMMARY.md skipped gracefully', () => {
  // Create valid summary
  fs.writeFileSync(
    path.join(phaseDir, '01-01-SUMMARY.md'),
    `---
phase: "01"
provides:
  - "Valid feature"
---
`
  );

  // Create malformed summary (no frontmatter)
  fs.writeFileSync(
    path.join(phaseDir, '01-02-SUMMARY.md'),
    `# Just a heading
No frontmatter here
`
  );

  // Another malformed summary (broken YAML)
  fs.writeFileSync(
    path.join(phaseDir, '01-03-SUMMARY.md'),
    `---
broken: [unclosed
---
`
  );

  const result = runGsdTools('history-digest', tmpDir);
  assert.ok(result.success, `Command should succeed despite malformed files: ${result.error}`);

  const digest = JSON.parse(result.output);
  assert.ok(digest.phases['01'], 'Phase 01 should exist');
  assert.ok(
    digest.phases['01'].provides.includes('Valid feature'),
    'Valid feature should be extracted'
  );
});
```

**Backward Compatibility Testing:**
```javascript
test('flat provides field still works (backward compatibility)', () => {
  const phaseDir = path.join(tmpDir, '.planning', 'phases', '01-test');
  fs.mkdirSync(phaseDir, { recursive: true });

  fs.writeFileSync(
    path.join(phaseDir, '01-01-SUMMARY.md'),
    `---
phase: "01"
provides:
  - "Direct provides"
---
`
  );

  const result = runGsdTools('history-digest', tmpDir);
  assert.ok(result.success, `Command failed: ${result.error}`);

  const digest = JSON.parse(result.output);
  assert.deepStrictEqual(
    digest.phases['01'].provides,
    ['Direct provides'],
    'Direct provides should work'
  );
});
```

**Output Format Testing:**
```javascript
test('inline array syntax supported', () => {
  const phaseDir = path.join(tmpDir, '.planning', 'phases', '01-test');
  fs.mkdirSync(phaseDir, { recursive: true });

  fs.writeFileSync(
    path.join(phaseDir, '01-01-SUMMARY.md'),
    `---
phase: "01"
provides: [Feature A, Feature B]
patterns-established: ["Pattern X", "Pattern Y"]
---
`
  );

  const result = runGsdTools('history-digest', tmpDir);
  assert.ok(result.success, `Command failed: ${result.error}`);

  const digest = JSON.parse(result.output);
  assert.deepStrictEqual(
    digest.phases['01'].provides.sort(),
    ['Feature A', 'Feature B'],
    'Inline array should work'
  );
});
```

## Test Suites Covered

**Implemented Test Suites:**
- `history-digest command` - Frontmatter parsing, phase extraction, nested field handling
- `phases list command` - Directory listing, numeric sorting, decimal phase ordering
- `roadmap-get-phase command` - ROADMAP.md parsing, phase section extraction
- `phase-next-decimal command` - Decimal phase number generation
- `phase-plan-index command` - Plan grouping by wave, checkpoint detection
- Multiple error scenarios - Malformed files, missing files, backward compatibility

**Test Coverage Pattern:**
- Happy path: Empty state, valid single item, valid multiple items
- Edge cases: Decimal phases, gaps in numbering, sorting order
- Error handling: Malformed files, missing required fields, graceful degradation
- Backward compatibility: Old formats still work

---

*Testing analysis: 2026-02-20*
