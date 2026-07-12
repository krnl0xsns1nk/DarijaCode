import { execFileSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { Checker } from "./checker";
import { Codegen } from "./codegen";
import { DarijaError } from "./errors";

export interface CompileOptions {
  outputPath?: string;
  keepCFile?: boolean;
  cc?: string;
}

export interface CompileResult {
  binaryPath: string;
  cFilePath: string | null;
}

export function compile(
  sourcePath: string,
  options: CompileOptions = {}
): CompileResult {

  const source = fs.readFileSync(sourcePath, "utf8");

  const tokens = new Lexer(source).tokenize();
  const ast = new Parser(tokens).parse();

  new Checker().check(ast);

  const cSource = new Codegen().generate(ast);

  const outputPath =
    options.outputPath ?? defaultOutputPath(sourcePath);

  const cFile =
    writeCFile(
      sourcePath,
      outputPath,
      cSource,
      options.keepCFile ?? false
    );

  try {
    compileCFile(cFile, outputPath, options.cc);
  } finally {
    if (!options.keepCFile) {
      fs.rmSync(cFile, { force: true });
    }
  }

  return {
    binaryPath: outputPath,
    cFilePath: options.keepCFile ? cFile : null
  };
}

export function checkOnly(sourcePath: string) {

  const source = fs.readFileSync(sourcePath, "utf8");

  const tokens = new Lexer(source).tokenize();
  const ast = new Parser(tokens).parse();

  new Checker().check(ast);
}

function defaultOutputPath(sourcePath: string): string {
  const dir = path.dirname(sourcePath);
  const name = path.basename(sourcePath, path.extname(sourcePath));
  return path.join(dir, name);
}

function writeCFile(
  sourcePath: string,
  outputPath: string,
  code: string,
  keep: boolean
): string {

  const cFile = keep
    ? `${outputPath}.c`
    : path.join(
        os.tmpdir(),
        `${path.basename(sourcePath)}-${Date.now()}.c`
      );

  fs.writeFileSync(cFile, code);

  return cFile;
}

function compileCFile(
  cFile: string,
  output: string,
  preferred?: string
) {

  const compilers =
    preferred
      ? [preferred]
      : ["clang", "gcc"];

  let last: unknown;

  for (const cc of compilers) {
    try {
      execFileSync(
        cc,
        [cFile, "-lm", "-o", output],
        { stdio: "pipe" }
      );
      return;
    } catch (err) {
      last = err;
    }
  }

  const stderr =
    last &&
    typeof last === "object" &&
    "stderr" in last
      ? String((last as any).stderr)
      : String(last);

  throw new DarijaError({
    code: "DCE-1",
    stage: "codegen",
    message: "C compiler failed.",
    location: {
      line: 0,
      column: 0
    },
    hint: stderr
  });
}
