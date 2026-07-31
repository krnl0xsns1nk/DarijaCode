#!/usr/bin/env node

/**
 * DarijaCode Test Runner
 *
 * Executes generated test files against the DarijaCode compiler and validates
 * results against metadata specifications.
 *
 * Categories:
 *   - lexer:    Token output (snapshot-based)
 *   - parser:   AST output (snapshot-based)
 *   - checker:  Type checking results (expect: pass/fail + error codes)
 *   - compiler: Compilation and binary execution (expect: stdout)
 *   - runtime:  Program output (expect: stdout)
 *   - errors:   Expected compilation failures (expect: fail + error code)
 *
 * Usage:
 *   npm test                     # run everything
 *   npm run test:lexer           # run only lexer tests
 *   npm run test -- --update     # regenerate snapshots
 */

import * as fs from "fs";
import * as path from "path";
import { execFileSync, execSync } from "child_process";

import { Lexer } from "../src/compiler/lexer";
import { Parser } from "../src/compiler/parser";
import { Checker } from "../src/compiler/checker";
import { compile } from "../src/compiler/compiler";
import { DarijaError } from "../src/compiler/errors";

const ROOT = path.resolve(__dirname, "..");
const GENERATED_DIR = path.join(ROOT, "tests", "generated");
const SNAPSHOTS_DIR = path.join(ROOT, "tests", "snapshots");
const OUTPUTS_DIR = path.join(ROOT, "tests", "outputs");

type Category = "lexer" | "parser" | "checker" | "compiler" | "runtime" | "errors";

interface TestMetadata {
  name: string;
  category: Category;
  spec?: string;
  line?: number;
  source?: string | null;
  expect?: "pass" | "fail";
  error?: string;
  stdout?: string;
  stderr?: string;
  snapshot?: boolean;
}

interface TestResult {
  name: string;
  category: Category;
  passed: boolean;
  timeMs: number;
  expected: string;
  received: string;
  error?: string;
}

const colors = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/**
 * Strip position information (line, column, pos) from parsed structures
 * so snapshots don't churn on formatting changes
 */
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

/**
 * Discover all generated test files
 */
function discoverTests(category?: Category): Map<Category, Map<string, TestMetadata>> {
  const tests = new Map<Category, Map<string, TestMetadata>>();

  if (!fs.existsSync(GENERATED_DIR)) {
    return tests;
  }

  const categories: Category[] = category
    ? [category]
    : (fs.readdirSync(GENERATED_DIR) as Category[]);

  for (const cat of categories) {
    const catDir = path.join(GENERATED_DIR, cat);
    if (!fs.existsSync(catDir)) continue;

    const catTests = new Map<string, TestMetadata>();
    const files = fs.readdirSync(catDir);

    for (const file of files) {
      if (!file.endsWith(".meta.json")) continue;

      const metaPath = path.join(catDir, file);
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as TestMetadata;
      catTests.set(meta.name, meta);
    }

    if (catTests.size > 0) {
      tests.set(cat, catTests);
    }
  }

  return tests;
}

/**
 * Execute a test for a given category and return the actual output
 */
function runTest(metadata: TestMetadata): string {
  const testFile = path.join(GENERATED_DIR, metadata.category, `${metadata.name}.drj`);
  const source = fs.readFileSync(testFile, "utf-8");

  try {
    switch (metadata.category) {
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
        return "CHECKER_PASS\n";
      }

      case "compiler":
      case "runtime": {
        const outDir = path.join(OUTPUTS_DIR, metadata.category);
        fs.mkdirSync(outDir, { recursive: true });
        const outputPath = path.join(outDir, metadata.name);

        const result = compile(testFile, { outputPath });
        const output = execFileSync(result.binaryPath, [], { encoding: "utf-8" });
        return output;
      }

      case "errors": {
        // For error tests, we expect compilation to fail
        // If we reach here, compilation succeeded when it shouldn't
        return "COMPILATION_SUCCEEDED_UNEXPECTEDLY\n";
      }
    }
  } catch (err) {
    if (err instanceof DarijaError) {
      return `${err.stage.toUpperCase()}_ERROR:${err.code}\n`;
    }
    if (err instanceof Error) {
      return `ERROR:${err.message}\n`;
    }
    return `ERROR:${String(err)}\n`;
  }
}

/**
 * Get or create snapshot file path for a test
 */
function getSnapshotPath(metadata: TestMetadata): string {
  const catDir = path.join(SNAPSHOTS_DIR, metadata.category);
  fs.mkdirSync(catDir, { recursive: true });
  return path.join(catDir, `${metadata.name}.json`);
}

/**
 * Compare actual output against expected metadata or snapshot
 */
function validateTest(metadata: TestMetadata, actual: string, updateMode: boolean): {
  passed: boolean;
  expected: string;
} {
  // Snapshot-based categories (lexer, parser)
  if (metadata.category === "lexer" || metadata.category === "parser") {
    const snapshotPath = getSnapshotPath(metadata);
    const expected = fs.existsSync(snapshotPath)
      ? fs.readFileSync(snapshotPath, "utf-8")
      : null;

    if (!expected) {
      if (updateMode) {
        fs.writeFileSync(snapshotPath, actual, "utf-8");
        return { passed: true, expected: actual };
      }
      return {
        passed: false,
        expected: "(no snapshot — run with --update to generate)",
      };
    }

    if (updateMode && actual !== expected) {
      fs.writeFileSync(snapshotPath, actual, "utf-8");
      return { passed: true, expected: actual };
    }

    return { passed: actual === expected, expected };
  }

  // Metadata-based validation (checker, compiler, runtime, errors)

  // Checker: expect pass or fail with error code
  if (metadata.category === "checker") {
    if (metadata.expect === "pass") {
      const passed = actual === "CHECKER_PASS\n";
      return {
        passed,
        expected: passed ? "pass" : `fail (got: ${actual.trim()})`,
      };
    }

    if (metadata.expect === "fail" && metadata.error) {
      const expected = `${metadata.category.toUpperCase()}_ERROR:${metadata.error}\n`;
      const passed = actual === expected;
      return {
        passed,
        expected: passed ? `fail with ${metadata.error}` : `fail with ${metadata.error} (got: ${actual.trim()})`,
      };
    }

    return { passed: false, expected: "unknown checker expectation" };
  }

  // Runtime/Compiler: expect stdout
  if (metadata.category === "runtime" || metadata.category === "compiler") {
    if (metadata.stdout !== undefined) {
      const passed = actual === metadata.stdout;
      return {
        passed,
        expected: metadata.stdout,
      };
    }
    return { passed: false, expected: "no stdout specified in metadata" };
  }

  // Errors: expect compilation to fail with specific error code
  if (metadata.category === "errors") {
    if (metadata.error) {
      const expected = `${metadata.category.toUpperCase()}_ERROR:${metadata.error}\n`;
      const passed = actual === expected;
      return {
        passed,
        expected: passed ? `fail with ${metadata.error}` : `fail with ${metadata.error} (got: ${actual.trim()})`,
      };
    }
    return { passed: false, expected: "no error code specified in metadata" };
  }

  return { passed: false, expected: "unknown category" };
}

/**
 * Format test output for console
 */
function formatTestResult(result: TestResult): string {
  const label = result.passed ? colors.green("✓") : colors.red("✗");
  const name = `${result.category}/${result.name}`;
  const time = colors.dim(`${result.timeMs}ms`);

  return `${label} ${name} ${time}`;
}

/**
 * Show diff for failed tests
 */
function showDiff(expected: string, received: string): void {
  const expectedLines = expected.split("\n");
  const receivedLines = received.split("\n");

  for (let i = 0; i < Math.max(expectedLines.length, receivedLines.length); i++) {
    const e = expectedLines[i] ?? "(missing)";
    const r = receivedLines[i] ?? "(missing)";

    if (e !== r) {
      console.log(`  ${colors.dim("line " + (i + 1))}`);
      console.log(`  ${colors.dim("exp:")} ${truncate(e)}`);
      console.log(`  ${colors.dim("got:")} ${truncate(r)}`);
      return;
    }
  }
}

/**
 * Truncate long lines for display
 */
function truncate(line: string, max = 100): string {
  return line.length > max ? line.slice(0, max) + "…" : line;
}

/**
 * Main test runner
 */
function main(): void {
  const args = process.argv.slice(2);
  const updateMode = args.includes("--update");
  const categoryFilter = args.find((a) => !a.startsWith("--")) as Category | undefined;

  fs.mkdirSync(OUTPUTS_DIR, { recursive: true });

  const allTests = discoverTests(categoryFilter);
  const results: TestResult[] = [];
  const startTime = Date.now();

  if (allTests.size === 0) {
    console.error("No generated tests found. Run: npm run generate");
    process.exit(1);
  }

  for (const [category, tests] of allTests) {
    console.log(colors.cyan(colors.bold(`\n${category}`)));

    for (const [name, metadata] of tests) {
      const testStart = Date.now();

      const actual = runTest(metadata);
      const { passed, expected } = validateTest(metadata, actual, updateMode);
      const timeMs = Date.now() - testStart;

      const result: TestResult = {
        name,
        category,
        passed,
        timeMs,
        expected,
        received: actual,
      };

      results.push(result);
      console.log(formatTestResult(result));

      if (!passed && !updateMode) {
        showDiff(expected, actual);
      }
    }
  }

  // Summary
  console.log(colors.cyan("\n" + "─".repeat(50)));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(colors.green(`Passed: ${passed}`) + "  " + (failed > 0 ? colors.red(`Failed: ${failed}`) : colors.dim("Failed: 0")));
  console.log(colors.dim(`Time: ${totalTime}s`));

  if (updateMode) {
    console.log(colors.yellow("Snapshots updated where needed."));
  }

  if (failed > 0 && !updateMode) {
    process.exit(1);
  }
}

main();

