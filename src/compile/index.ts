
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { lexer } from "./lexer";
import { parser } from "./parser";
import { TokenType } from "./tokens";
import { genC } from "./genC";



export default class compiler {
  public code: string;
  constructor(code : string){
    this.code = code;
  }
  private FOLDER = "./src/compile/.cCode"
  private C_FILE = join(this.FOLDER, "main.c");
  private BIN_FILE = join(this.FOLDER, "main");
  public compile(){
  const myLexer = new lexer(this.code);
  const tokens = myLexer.tokenize();
  const myTree = new parser(tokens);
  const ast = myTree.create();
  const generator = new genC();
  const program = generator.gen(ast);

  console.log(
  tokens.map(t => ({
    type: TokenType[t.type],
    value: t.value
  }))
);

console.log(JSON.stringify(ast, null, 2));
console.log(JSON.stringify(program, null, 2));


mkdirSync(this.FOLDER, { recursive: true });

writeFileSync(this.C_FILE, program);
console.log(`Wrote C code to ${this.C_FILE}`);

try {
    console.log("Compiling...");
    execSync(`clang "${this.C_FILE}" -o "${this.BIN_FILE}"`, { stdio: 'inherit' });
    console.log("Compiled.");
} catch (e) {
    console.error("Compilation failed : \n", e);
    process.exit(1);
}

console.log("--- Running ---");
execSync(`"${this.BIN_FILE}"`, { stdio: 'inherit' });
  }
  public error(msg: string, line: number, column: number, hint: string | undefined) {
    console.error(`\x1b[2m\nDarijaCode Error : \n \x1b[0m`);
    console.error(`\t${msg}`);
      const lines = this.code.split("\n");
      console.error(`\x1b[4m${line} | ${lines[line - 1]}\x1b[0m`);
      console.error(" ".repeat(line.toString().length + 3 + column - 1) + "^  "
                   + `\x1b[3m${hint}`);
    process.exit(1);
  }
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

export function start(code: string){
const complie = new compiler(code);
try {
  complie.compile()
} catch (err) {
  if (err instanceof CompileError) {
    complie.error(err.message, err.line, err.column, err.hint)
  } else {
    throw err;
  }
}
}

