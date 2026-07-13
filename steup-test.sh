#!/usr/bin/env bash
#
# DarijaCode — testing infrastructure setup
#
# Run once from the project root:
#
#   bash scripts/setup-tests.sh
#
# What this does, in order:
#   1. Creates tests/{lexer,parser,checker,compiler,runtime,errors,
#      snapshots,fixtures,outputs}/
#   2. Writes real .drj fixture files into each category — each one
#      demonstrates exactly one behavior.
#   3. Writes scripts/test.ts, the test runner.
#   4. Merges the required test:* scripts into package.json, without
#      touching anything else in it.
#   5. Actually runs the compiler once (via `npm run test:update`) to
#      record real expected output for every fixture — nothing here is a
#      hand-typed guess of what a token dump or an error message should
#      look like. If ts-node isn't installed yet, this step is skipped
#      with instructions instead of failing.
#
# Re-running this script re-writes the fixtures listed below to their
# original content. Any test files you add yourself, under different
# names, are left untouched.

set -euo pipefail

c_green()  { printf '\033[32m%s\033[0m' "$1"; }
c_red()    { printf '\033[31m%s\033[0m' "$1"; }
c_yellow() { printf '\033[33m%s\033[0m' "$1"; }
c_cyan()   { printf '\033[36m%s\033[0m' "$1"; }

say()  { echo "$(c_cyan "==>") $1"; }
warn() { echo "$(c_yellow "warning:") $1"; }
ok()   { echo "$(c_green "ok:") $1"; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

find_root() {
  local dir="$1"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/package.json" ]; then
      echo "$dir"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  return 1
}

if ! ROOT="$(find_root "$ROOT")"; then
  echo "Could not find a package.json above $(dirname "${BASH_SOURCE[0]}")." >&2
  echo "Run this script from inside the DarijaCode project (or place it at scripts/setup-tests.sh there)." >&2
  exit 1
fi

cd "$ROOT"

say "Setting up the DarijaCode testing infrastructure in: $ROOT"

mkdir -p scripts
mkdir -p tests/lexer
mkdir -p tests/parser
mkdir -p tests/checker
mkdir -p tests/compiler
mkdir -p tests/runtime
mkdir -p tests/errors
mkdir -p tests/snapshots/lexer
mkdir -p tests/snapshots/parser
mkdir -p tests/fixtures
mkdir -p tests/outputs

ok "folder structure created"

cat > tests/outputs/.gitignore <<'EOF'
*
!.gitignore
EOF

# ---------------------------------------------------------------------------
# 2. Fixture files
#
# Naming convention: files prefixed "valid-" are expected to succeed at
# whatever stage their folder tests; files prefixed "invalid-" are
# expected to fail there. The runner does NOT branch on this prefix — it
# only tells a human what a fixture is for. What "correct" means for each
# file is recorded for real in step 5 below (snapshot seeding), never
# hand-typed.
# ---------------------------------------------------------------------------

say "writing fixture files"

# --- lexer/ -----------------------------------------------------------------

cat > tests/lexer/valid-string.drj <<'EOF'
dir msg = "Salam!";
EOF

cat > tests/lexer/valid-number.drj <<'EOF'
dir age = 25;
EOF

cat > tests/lexer/invalid-string.drj <<'EOF'
dir msg = "Salam;
EOF

cat > tests/lexer/invalid-operator.drj <<'EOF'
dir x = 5 @ 3;
EOF

# --- parser/ ------------------------------------------------------------

cat > tests/parser/valid-variable-declaration.drj <<'EOF'
dir age: ra9m = 20;
EOF

cat > tests/parser/valid-function.drj <<'EOF'
dalla add(a: ra9m, b: ra9m): ra9m {
    raj3 a + b;
}
EOF

cat > tests/parser/valid-if.drj <<'EOF'
dir age = 20;
ila (age >= 18) {
    kteb("Adult");
} wla {
    kteb("Minor");
}
EOF

cat > tests/parser/valid-while.drj <<'EOF'
dir i = 0;
mahd (i < 5) {
    kteb(i);
    i = i + 1;
}
EOF

cat > tests/parser/valid-for.drj <<'EOF'
dwr (i = 0; i < 5; i++) {
    kteb(i);
}
EOF

cat > tests/parser/valid-print.drj <<'EOF'
kteb("Salam, DarijaCode!");
EOF

cat > tests/parser/invalid-parentheses.drj <<'EOF'
dir age = 20;
ila (age >= 18 {
    kteb("Adult");
}
EOF

cat > tests/parser/invalid-braces.drj <<'EOF'
dalla greet() {
    kteb("Salam");
EOF

# --- checker/ -------------------------------------------------------------

cat > tests/checker/valid-variable-declaration.drj <<'EOF'
dir age: ra9m = 20;
age = 21;
EOF

cat > tests/checker/valid-function.drj <<'EOF'
dalla square(x: ra9m): ra9m {
    raj3 x * x;
}

dir result = square(5);
EOF

cat > tests/checker/invalid-variable-declaration.drj <<'EOF'
dir age: ra9m = "twenty";
EOF

cat > tests/checker/invalid-undefined-variable.drj <<'EOF'
kteb(nonExistent);
EOF

# --- compiler/ (full pipeline, real binary, real stdout) -------------------

cat > tests/compiler/valid-print.drj <<'EOF'
kteb("Salam, DarijaCode!");
EOF

cat > tests/compiler/valid-arithmetic.drj <<'EOF'
dir a = 4;
dir b = 7;
kteb(a + b);
EOF

# --- runtime/ ---------------------------------------------------------------
# DarijaCode doesn't have a separate interpreted runtime yet (see
# DEVELOPER.md's known-gaps table) — the only thing that actually
# executes a program today is the compiled C binary. These tests reuse
# that same execution path rather than pretending an interpreter exists.

cat > tests/runtime/valid-loop-sum.drj <<'EOF'
dir total = 0;
dwr (i = 1; i <= 5; i++) {
    total = total + i;
}
kteb(total);
EOF

# --- errors/ (intentionally trigger a real pipeline error) -----------------

cat > tests/errors/missing-semicolon.drj <<'EOF'
dir age = 20
kteb(age);
EOF

cat > tests/errors/break-outside-loop.drj <<'EOF'
qta3;
EOF

cat > tests/errors/undefined-function-call.drj <<'EOF'
kteb(mystery());
EOF

# --- fixtures/ ---------------------------------------------------------
# Shared example snippets for hand-writing new tests. DarijaCode has no
# working module system yet (see DEVELOPER.md), so these are reference
# material only — not `jib`-imported by anything.

cat > tests/fixtures/hello.drj <<'EOF'
kteb("Salam mn DarijaCode!");
EOF

cat > tests/fixtures/README.md <<'EOF'
# Fixtures

Reference snippets for hand-writing new tests elsewhere in `tests/`.

These are **not** wired into an import system — DarijaCode doesn't have
one yet (`jib`/`sadr` aren't implemented). Copy from here, don't try to
import from here.
EOF

ok "fixtures written"

# ---------------------------------------------------------------------------
# 3. Test runner
# ---------------------------------------------------------------------------

say "writing scripts/test.ts"

cat > scripts/test.ts <<'EOF'
/**
 * DarijaCode test runner.
 *
 * Usage:
 *   ts-node scripts/test.ts <all|lexer|parser|checker|compiler|runtime|errors> [--update]
 *
 * Discovers every .drj file under tests/<category>/ automatically — no
 * test name is ever hardcoded here. For each file it runs the pipeline
 * stage(s) that category exercises, turns the result (success or a
 * thrown error) into a single comparable string, and checks it against
 * a recorded expected file. With --update, a missing or differing
 * expected file is (re)written from the actual output instead of
 * failing — that's the whole of "snapshot support."
 *
 */

import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

import { Lexer } from "../src/compiler/lexer";
import { Parser } from "../src/compiler/parser";
import { Checker } from "../src/compiler/checker";
import { compile } from "../src/compiler/compiler";
import { DarijaError } from "../src/compiler/errors";


const ROOT = path.resolve(__dirname, "..");
const TESTS_DIR = path.join(ROOT, "tests");
const SNAPSHOTS_DIR = path.join(TESTS_DIR, "snapshots");
const OUTPUTS_DIR = path.join(TESTS_DIR, "outputs");

const CATEGORIES = ["lexer", "parser", "checker", "compiler", "runtime", "errors"] as const;
type Category = (typeof CATEGORIES)[number];

const color = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};


const args = process.argv.slice(2);
const update = args.includes("--update");
const requested = args.filter((a) => a !== "--update");

const categories: Category[] =
  requested.length === 0 || requested.includes("all")
    ? [...CATEGORIES]
    : requested.filter((a): a is Category => (CATEGORIES as readonly string[]).includes(a));

if (categories.length === 0) {
  console.error(`Unknown test category. Choose from: all, ${CATEGORIES.join(", ")}`);
  process.exit(1);
}


function findDrjFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...findDrjFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".drj")) files.push(full);
  }
  return files.sort();
}

// ---------------------------------------------------------------------------
// Stable serialization (tokens / AST) — strip source positions so
// snapshots don't churn every time a line shifts by one character.
// ---------------------------------------------------------------------------

function stripPositions(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripPositions);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key === "pos" || key === "line" || key === "column") continue;
      out[key] = stripPositions(val);
    }
    return out;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Running one test: source -> a single comparable string
// ---------------------------------------------------------------------------

function produceActual(file: string, category: Category): string {
  const source = fs.readFileSync(file, "utf-8");

  try {
    switch (category) {
      case "lexer": {
        const tokens = new Lexer(source).tokenize();
        return JSON.stringify(stripPositions(tokens), null, 2) + "\n";
      }

      case "parser": {
        const tokens = new Lexer(source).tokenize();
        const ast = new Parser(tokens).parse();
        return JSON.stringify(stripPositions(ast), null, 2) + "\n";
      }

      case "checker": {
        const tokens = new Lexer(source).tokenize();
        const ast = new Parser(tokens).parse();
        new Checker().check(ast);
        return "OK\n";
      }

      case "compiler":
      case "runtime": {
        const outDir = path.join(OUTPUTS_DIR, category);
        fs.mkdirSync(outDir, { recursive: true });
        const outputPath = path.join(outDir, path.basename(file, ".drj"));
        const result = compile(file, { outputPath });
        return execFileSync(result.binaryPath, [], { encoding: "utf-8" });
      }

      case "errors": {
        const outDir = path.join(OUTPUTS_DIR, "errors");
        fs.mkdirSync(outDir, { recursive: true });
        const outputPath = path.join(outDir, path.basename(file, ".drj"));
        const result = compile(file, { outputPath });
        // A file under tests/errors/ that compiles cleanly failed to do
        // its one job — report that as clearly as any other mismatch.
        return `UNEXPECTED SUCCESS: compiled to ${result.binaryPath}\n`;
      }
    }
  } catch (err) {
    const message =
      err instanceof DarijaError
        ? `[${err.stage}:${err.code}] ${err.message}`
        : err instanceof Error
          ? err.message
          : String(err);
    return `ERROR: ${message}\n`;
  }
}

// ---------------------------------------------------------------------------
// Expected-file location per category
// ---------------------------------------------------------------------------

function expectedPathFor(file: string, category: Category): string {
  const name = path.basename(file, ".drj");
  switch (category) {
    case "lexer":
      return path.join(SNAPSHOTS_DIR, "lexer", `${name}.json`);
    case "parser":
      return path.join(SNAPSHOTS_DIR, "parser", `${name}.json`);
    case "checker":
      return path.join(path.dirname(file), `${name}.expected`);
    case "compiler":
    case "runtime":
      return path.join(path.dirname(file), `${name}.stdout`);
    case "errors":
      return path.join(path.dirname(file), `${name}.stderr`);
  }
}

// ---------------------------------------------------------------------------
// Compare / update
// ---------------------------------------------------------------------------

function compareOrUpdate(expectedFile: string, actual: string): { passed: boolean; expected: string } {
  const expected = fs.existsSync(expectedFile) ? fs.readFileSync(expectedFile, "utf-8") : null;

  if (expected === null) {
    if (update) {
      fs.mkdirSync(path.dirname(expectedFile), { recursive: true });
      fs.writeFileSync(expectedFile, actual, "utf-8");
      return { passed: true, expected: actual };
    }
    return { passed: false, expected: "(no snapshot yet — run `npm run test:update`)" };
  }

  if (update && expected !== actual) {
    fs.writeFileSync(expectedFile, actual, "utf-8");
    return { passed: true, expected: actual };
  }

  return { passed: expected === actual, expected };
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

interface TestResult {
  name: string;
  passed: boolean;
  timeMs: number;
  expected: string;
  received: string;
}

function truncate(line: string, max = 100): string {
  return line.length > max ? line.slice(0, max) + "…" : line;
}

function firstDifferingLine(
  expected: string,
  actual: string,
): { lineNumber: number; expectedLine: string; actualLine: string } | null {
  const expectedLines = expected.split("\n");
  const actualLines = actual.split("\n");
  const max = Math.max(expectedLines.length, actualLines.length);
  for (let i = 0; i < max; i++) {
    if (expectedLines[i] !== actualLines[i]) {
      return {
        lineNumber: i + 1,
        expectedLine: expectedLines[i] ?? "(missing)",
        actualLine: actualLines[i] ?? "(missing)",
      };
    }
  }
  return null;
}

function printResult(result: TestResult) {
  const label = result.passed ? color.green("PASS") : color.red("FAIL");
  console.log(`${label} ${result.name} ${color.dim(`(${result.timeMs}ms)`)}`);

  if (!result.passed && !update) {
    const diff = firstDifferingLine(result.expected, result.received);
    if (diff) {
      console.log(`  ${color.dim(`line ${diff.lineNumber}`)}`);
      console.log(`  ${color.dim("expected:")} ${truncate(diff.expectedLine)}`);
      console.log(`  ${color.dim("received:")} ${truncate(diff.actualLine)}`);
    }
  }
}

function printSummary(results: TestResult[], totalTime: string) {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  console.log(color.cyan("─".repeat(40)));
  console.log(
    `${color.green(`Passed: ${passed}`)}   ${failed > 0 ? color.red(`Failed: ${failed}`) : color.dim("Failed: 0")}`,
  );
  console.log(color.dim(`Time: ${totalTime}s`));
  if (update) console.log(color.yellow("Snapshots written/updated where needed."));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

  const results: TestResult[] = [];
  const suiteStart = Date.now();

  for (const category of categories) {
    const dir = path.join(TESTS_DIR, category);
    const files = findDrjFiles(dir);
    if (files.length === 0) continue;

    console.log(color.cyan(color.bold(`\n${category}`)));

    for (const file of files) {
      const name = `${category}/${path.relative(dir, file).replace(/\\/g, "/")}`;
      const testStart = Date.now();

      const actual = produceActual(file, category);
      const expectedFile = expectedPathFor(file, category);
      const { passed, expected } = compareOrUpdate(expectedFile, actual);

      const result: TestResult = {
        name,
        passed,
        timeMs: Date.now() - testStart,
        expected,
        received: actual,
      };

      results.push(result);
      printResult(result);
    }
  }

  const totalTime = ((Date.now() - suiteStart) / 1000).toFixed(2);
  printSummary(results, totalTime);

  const failed = results.filter((r) => !r.passed);
  if (failed.length > 0 && !update) process.exit(1);
}

main();
EOF

ok "scripts/test.ts written"

# ---------------------------------------------------------------------------
# 4. package.json scripts
# ---------------------------------------------------------------------------

say "merging test scripts into package.json"

node <<'NODE_EOF'
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

pkg.scripts = pkg.scripts || {};

const newScripts = {
  test: 'ts-node scripts/test.ts all',
  'test:update': 'ts-node scripts/test.ts all --update',
  'test:lexer': 'ts-node scripts/test.ts lexer',
  'test:parser': 'ts-node scripts/test.ts parser',
  'test:checker': 'ts-node scripts/test.ts checker',
  'test:compiler': 'ts-node scripts/test.ts compiler',
  'test:runtime': 'ts-node scripts/test.ts runtime',
  'test:errors': 'ts-node scripts/test.ts errors',
};

for (const [key, value] of Object.entries(newScripts)) {
  if (pkg.scripts[key] && pkg.scripts[key] !== value) {
    console.log(`  overwriting existing script "${key}": "${pkg.scripts[key]}" -> "${value}"`);
  }
  pkg.scripts[key] = value;
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
NODE_EOF

ok "package.json updated"

# ---------------------------------------------------------------------------
# 5. Seed real snapshots by actually running the compiler
# ---------------------------------------------------------------------------

say "seeding snapshots from real compiler output"

if ! command -v clang >/dev/null 2>&1 && ! command -v gcc >/dev/null 2>&1; then
  warn "neither clang nor gcc found on PATH — tests/compiler and tests/runtime fixtures will record a compile failure until a C compiler is installed."
fi

TS_NODE=""
if [ -x "node_modules/.bin/ts-node" ]; then
  TS_NODE="node_modules/.bin/ts-node"
elif command -v npx >/dev/null 2>&1; then
  TS_NODE="npx --no-install ts-node"
fi

if [ -n "$TS_NODE" ] && $TS_NODE --version >/dev/null 2>&1; then
  if $TS_NODE scripts/test.ts all --update; then
    ok "snapshots seeded"
    say "running the suite once more to confirm a clean baseline"
    $TS_NODE scripts/test.ts all || true
  else
    warn "snapshot seeding failed — run 'npm run test:update' manually once dependencies are installed."
  fi
else
  warn "ts-node not found — run 'npm install' then 'npm run test:update' to generate the initial snapshots."
fi

echo
ok "testing infrastructure ready."
echo "  npm test            run everything"
echo "  npm run test:update seed/refresh snapshots and expected files"
echo "  npm run test:lexer  (also: test:parser, test:checker, test:compiler, test:runtime, test:errors)"
#!/usr/bin/env bash
