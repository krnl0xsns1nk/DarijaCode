import { codeFrameColumns } from "@babel/code-frame";

// A single error shape shared by the lexer, parser, checker, and codegen,
// so the CLI only needs one formatter. checker.ts and codegen.ts currently
// throw their own local CheckerError/CodegenError — swap those to throw
// DarijaCodeError instead when it's time to wire this in.

export type ErrorStage = "lexer" | "parser" | "checker" | "codegen";

export class DarijaCodeError extends Error {
  public readonly stage: ErrorStage;
  public readonly line: number;
  public readonly column: number;
  public readonly hint?: string;

  constructor(stage: ErrorStage, message: string, line: number, column: number, hint?: string) {
    super(message);
    this.stage = stage;
    this.line = line;
    this.column = column;
    this.hint = hint;
  }
}

export interface FormatOptions {
  color?: boolean; // highlightCode in @babel/code-frame
}

export function formatError(error: DarijaCodeError, source: string, options: FormatOptions = {}): string {
  const location = { start: { line: error.line, column: error.column } };

  let frame = "";
  try {
    frame = codeFrameColumns(source, location, {
      highlightCode: options.color ?? true,
    });
  } catch {
    frame = "";
  }

  const parts = [`DarijaCode Error:`, frame, error.message];
  if (error.hint) parts.push("", `jrb : ${error.hint}`);

  return parts.filter((part) => part !== "").join("\n");
}

export function wrapUnknown(error: unknown, stage: ErrorStage): DarijaCodeError {
  if (error instanceof DarijaCodeError) return error;
  const message = error instanceof Error ? error.message : String(error);
  return new DarijaCodeError(stage, message, 1, 1);
}

