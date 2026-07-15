export type ErrorStage = "lexer" | "parser" | "checker" | "codegen";

export interface ErrorLocation {
  line: number;
  column: number;
}


export class CodegenError extends Error {
  constructor(message: string, line: number = -1, column: number = -1) {
    super();
    throw new DarijaError({
  code: "DCE-0",
  stage: "codegen",
  message: `DarijaCode Codegen Error: ${message} at ${line}:${column}`,
  location: {
    line: line,
    column: column
  }
})
  }
}





export class DarijaError extends Error {
  public readonly stage: ErrorStage;
  public readonly code: string;
  public readonly location: ErrorLocation;
  public readonly hint?: string;

  constructor(options: {
    stage: ErrorStage;
    code: string;
    message: string;
    location: ErrorLocation;
    hint?: string;
  }) {
    super(options.message);
    this.name = "DarijaError";
    this.stage = options.stage;
    this.code = options.code;
    this.location = options.location;
    this.hint = options.hint;
  }
}

const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
};
export function printDarijaError(
  err: DarijaError,
  file: string,
  source: string
) {
  const { stage, code, location, message, hint } = err;

  console.error(
    `${colors.red}DarijaCode error${colors.reset}[${colors.gray}${stage}:${code}${colors.reset}] ${message}`
  );

  console.error(
    `${colors.gray}-->${colors.reset} ${file}:${location.line}:${location.column}`
  );

  if (source) {
    const lines = source.split("\n");
    const line = lines[location.line - 1];

    if (line) {
      console.error(
        `${colors.blue}${location.line} |${colors.reset} ${line}`
      );

      console.error(
        `${colors.blue}  |${colors.reset} ` +
        " ".repeat(location.column - 1) +
        `${colors.red}^${colors.reset}`
      );
    }
  }

  if (hint) {
    console.error(
      `${colors.yellow}jrb/chof${colors.reset}: ${hint}`
    );
  }
}
