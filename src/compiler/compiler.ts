import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Checker } from "./checker";
import { Codegen } from "./codegen";
import { DarijaCodeError, formatError, wrapUnknown } from "./errors";

export interface CompileOptions {
  outputPath?: string; 
  keepCFile?: boolean;
  cc?: string; 
}

export interface CompileResult {
  binaryPath: string;
  cFilePath: string | null;
}

export function compile(sourcePath: string, options: CompileOptions = {}): CompileResult {
  const source = fs.readFileSync(sourcePath, "utf-8");

  let cSource: string;
  try {
    const tokens = new Lexer(source).tokenize();
    const ast = new Parser(tokens).parse();
    new Checker().check(ast);
    cSource = new Codegen().generate(ast);
  } catch (err) {
    throw reportAndRethrow(err, source);
  }

  const outputPath = options.outputPath ?? defaultOutputPath(sourcePath);
  const cFilePath = writeCFile(sourcePath, outputPath, cSource, options.keepCFile ?? false);

  try {
    compileCFile(cFilePath, outputPath, options.cc);
  } finally {
    if (!options.keepCFile) fs.rmSync(cFilePath, { force: true });
  }

  return {
    binaryPath: outputPath,
    cFilePath: options.keepCFile ? cFilePath : null,
  };
}

export function checkOnly(sourcePath: string): void {
  const source = fs.readFileSync(sourcePath, "utf-8");
  try {
    const tokens = new Lexer(source).tokenize();
    const ast = new Parser(tokens).parse();
    new Checker().check(ast);
  } catch (err) {
    throw reportAndRethrow(err, source);
  }
}

function reportAndRethrow(err: unknown, source: string): Error {
  const stage = guessStage(err);
  const darijaError = wrapUnknown(err, stage);
  const formatted = formatError(darijaError, source);
  return new Error(formatted);
}

function guessStage(err: unknown): "lexer" | "parser" | "checker" | "codegen" {
  if (err instanceof DarijaCodeError) return err.stage;
  const message = err instanceof Error ? err.message : "";
  if (message.includes("Codegen")) return "codegen";
  if (/^DarijaCode Error:/.test(message)) return "checker";
  if (/expected|unexpected token/.test(message)) return "parser";
  return "lexer";
}

function defaultOutputPath(sourcePath: string): string {
  const dir = path.dirname(sourcePath);
  const name = path.basename(sourcePath, path.extname(sourcePath));
  return path.join(dir, name);
}

function writeCFile(sourcePath: string, outputPath: string, cSource: string, keep: boolean): string {
  const cPath = keep
    ? `${outputPath}.c`
    : path.join(os.tmpdir(), `${path.basename(outputPath)}-${Date.now()}.c`);
  fs.writeFileSync(cPath, cSource, "utf-8");
  return cPath;
}

function compileCFile(cFilePath: string, outputPath: string, preferredCC?: string) {
  const candidates = preferredCC ? [preferredCC] : ["clang", "gcc"];
  let lastError: unknown;

  for (const cc of candidates) {
    try {
      execFileSync(cc, [cFilePath, "-lm", "-o", outputPath], { stdio: "pipe" });
      return;
    } catch (err) {
      lastError = err;
    }
  }

  const stderr =
    lastError instanceof Error && "stderr" in lastError
      ? String((lastError as { stderr?: Buffer }).stderr ?? "")
      : String(lastError);

  throw new Error(`C compilation failed:\n${stderr}`);
}

