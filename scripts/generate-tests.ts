#!/usr/bin/env node

/**
 * DarijaCode Test Generator
 *
 * Parses specification files from tests/specs/ and generates individual test files
 * with metadata into tests/generated/.
 *
 * Each spec file contains one or more tests marked with @test metadata blocks.
 * The generator extracts these and creates:
 *   - Generated .drj files in tests/generated/<category>/
 *   - Metadata .meta.json files describing expected outcomes
 */

import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const SPECS_DIR = path.join(ROOT, "tests", "specs");
const GENERATED_DIR = path.join(ROOT, "tests", "generated");

/**
 * Test metadata extracted from @test block
 */
interface TestMetadata {
  name: string;
  category: "lexer" | "parser" | "checker" | "compiler" | "runtime" | "errors";
  expect?: "pass" | "fail";
  error?: string;
  stdout?: string;
  stderr?: string;
  snapshot?: boolean;
  description?: string;
}

/**
 * A single test case extracted from a spec file
 */
interface TestCase {
  metadata: TestMetadata;
  source: string;
  specFile: string;
  lineNumber: number;
}

/**
 * Parses @test metadata block format:
 *
 *   name = value
 *   category = value
 *   expect = pass | fail
 *   error = ERROR_CODE
 *   stdout = multiline content
 *   stderr = multiline content
 */
function parseMetadata(block: string): Partial<TestMetadata> {
  const metadata: Partial<TestMetadata> = {};
  const lines = block.split("\n").map((l) => l.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines and @test marker
    if (!line || line === "@test") {
      i++;
      continue;
    }

    // Handle multiline values (stdout, stderr, description)
    if (line.startsWith("stdout") || line.startsWith("stderr") || line.startsWith("description")) {
      const [key] = line.split("=");
      const keyTrimmed = key.trim();

      const valueStart = line.indexOf("=");
      let value = valueStart !== -1 ? line.slice(valueStart + 1).trim() : "";

      // Collect following lines until next key or end
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine && /^[a-z_]+ *=/.test(nextLine)) break;
        if (nextLine === "*/" || !nextLine) break;
        value += (value ? "\n" : "") + nextLine;
        i++;
      }

      (metadata as Record<string, string>)[keyTrimmed] = value;
      continue;
    }

    // Single-line key=value
    const eqIdx = line.indexOf("=");
    if (eqIdx > 0) {
      const key = line.slice(0, eqIdx).trim();
      const value = line.slice(eqIdx + 1).trim();
      if (key && value) {
        (metadata as Record<string, string>)[key] = value;
      }
    }

    i++;
  }

  return metadata;
}

/**
 * Extracts all test cases from a spec file
 */
function extractTestCases(filePath: string): TestCase[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const cases: TestCase[] = [];

  // Find all @test blocks: /* @test ... */
  const regex = /\/\*\s*@test([\s\S]*?)\*\/([\s\S]*?)(?=\/\*\s*@test|\Z)/g;
  let match;
  let lineNumber = 1;

  const linesBefore = content.slice(0, 0).split("\n").length;

  while ((match = regex.exec(content)) !== null) {
    const metadataBlock = match[1];
    const sourceBlock = match[2];

    // Count lines before this match
    const beforeText = content.slice(0, match.index);
    const currentLineNumber = beforeText.split("\n").length;

    const rawMetadata = parseMetadata(metadataBlock);

    // Validate required fields
    if (!rawMetadata.name) {
      console.error(
        `⚠ ${path.basename(filePath)}:${currentLineNumber} missing required 'name' field`,
      );
      continue;
    }

    if (!rawMetadata.category) {
      console.error(
        `⚠ ${path.basename(filePath)}:${currentLineNumber} missing required 'category' field`,
      );
      continue;
    }

    const metadata: TestMetadata = {
      name: String(rawMetadata.name),
      category: rawMetadata.category as TestMetadata["category"],
      expect: (rawMetadata.expect as "pass" | "fail") || undefined,
      error: rawMetadata.error ? String(rawMetadata.error) : undefined,
      stdout: rawMetadata.stdout ? String(rawMetadata.stdout) : undefined,
      stderr: rawMetadata.stderr ? String(rawMetadata.stderr) : undefined,
      // @ts-ignore
      snapshot: rawMetadata.snapshot ? rawMetadata.snapshot === "true" : false,
      description: rawMetadata.description ? String(rawMetadata.description) : undefined,
    };

    // Trim source code
    const source = sourceBlock.trim();
    if (!source) {
      console.error(`⚠ ${path.basename(filePath)}:${currentLineNumber} test has no source code`);
      continue;
    }

    cases.push({
      metadata,
      source,
      specFile: filePath,
      lineNumber: currentLineNumber,
    });
  }

  return cases;
}

/**
 * Generates a test file and metadata for a single test case
 */
function generateTest(testCase: TestCase): void {
  const { metadata, source, specFile } = testCase;
  const categoryDir = path.join(GENERATED_DIR, metadata.category);

  // Create category directory
  fs.mkdirSync(categoryDir, { recursive: true });

  // Generate test source file
  const testFileName = `${metadata.name}.drj`;
  const testFilePath = path.join(categoryDir, testFileName);
  fs.writeFileSync(testFilePath, source, "utf-8");

  // Generate metadata file
  const metaFileName = `${metadata.name}.meta.json`;
  const metaFilePath = path.join(categoryDir, metaFileName);

  const metaContent = {
    name: metadata.name,
    category: metadata.category,
    source: metadata.description || null,
    spec: path.relative(ROOT, specFile),
    line: testCase.lineNumber,

    // Expected outcome
    ...(metadata.expect && { expect: metadata.expect }),
    ...(metadata.error && { error: metadata.error }),
    ...(metadata.stdout !== undefined && { stdout: metadata.stdout }),
    ...(metadata.stderr !== undefined && { stderr: metadata.stderr }),
    ...(metadata.snapshot && { snapshot: true }),
  };

  fs.writeFileSync(metaFilePath, JSON.stringify(metaContent, null, 2) + "\n", "utf-8");
}

/**
 * Main generator
 */
function main(): void {
  // Clean generated directory
  if (fs.existsSync(GENERATED_DIR)) {
    fs.rmSync(GENERATED_DIR, { recursive: true });
  }
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  if (!fs.existsSync(SPECS_DIR)) {
    console.error(`Error: ${SPECS_DIR} does not exist`);
    process.exit(1);
  }

  // Collect all spec files
  const specFiles = fs
    .readdirSync(SPECS_DIR)
    .filter((f) => f.endsWith(".drj"))
    .map((f) => path.join(SPECS_DIR, f))
    .sort();

  if (specFiles.length === 0) {
    console.warn(`No .drj files found in ${SPECS_DIR}`);
    return;
  }

  console.log(`📋 Scanning ${specFiles.length} spec file(s)...`);

  let totalTests = 0;
  const categoryCounts: Record<string, number> = {};

  for (const specFile of specFiles) {
    const cases = extractTestCases(specFile);

    for (const testCase of cases) {
      generateTest(testCase);
      totalTests++;
      categoryCounts[testCase.metadata.category] =
        (categoryCounts[testCase.metadata.category] || 0) + 1;
    }
  }

  // Print summary
  console.log(`\n✓ Generated ${totalTests} test(s):`);
  for (const [category, count] of Object.entries(categoryCounts).sort()) {
    console.log(`  ${category}: ${count}`);
  }
}

main();

