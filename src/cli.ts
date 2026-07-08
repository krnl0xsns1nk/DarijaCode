import compile from "./compile/index"
import fs from "fs"
// const { execSync } = require("child_process");

const file = process.argv[2];

if (!file) {
  console.log("Usage: node src/cli.js file.drj");
  process.exit(1);
}

const code = fs.readFileSync(file, "utf-8").trim();


function error(msg: string, line: number, column: number, hint: string | undefined) {
    console.error(`\x1b[2m\nDarijaCode Error : \n \x1b[0m`);
    console.error(`\t${msg}`);
      const lines = code.split("\n");
      console.error(`\x1b[4m${line} | ${lines[line - 1]}\x1b[0m`);
      console.error(" ".repeat(line.toString().length + 3 + column - 1) + "^  " 
                   + `\x1b[3m${hint}`);
    process.exit(1);
}

export class CompileError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
    public hint?: string
  ) {
    super(message);
  }
}

try {
  compile(code);
} catch (err) {
  if (err instanceof CompileError) {
    error(err.message, err.line, err.column, err.hint)
  } else {
    throw err;
  }
}


