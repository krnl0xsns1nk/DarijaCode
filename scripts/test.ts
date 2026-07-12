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
 * Note on chalk: it's already a project dependency, but chalk 5.x is
 * ESM-only, which breaks a plain `require()` under this project's
 * CommonJS ts-node setup. Hand-rolled ANSI codes below avoid that
 * mismatch entirely rather than fighting module resolution for
 * something this small.
 */

import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";

import { Lexer } from "../src/compiler/lexer";
import { Parser } from "../src/compiler/parser";
import { Checker } from "../src/compiler/checker";
import { compile } from "../src/compiler/compiler";
import { DarijaError } from "../src/compiler/errors";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

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
