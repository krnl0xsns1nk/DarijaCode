
import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';
import { lexer } from "./lexer";
import { parser } from "./parser";
import { TokenType } from "./tokens";
import { genC } from "./genC";

export default function compile(code : string):void{
  const myLexer = new lexer(code);
  const tokens = myLexer.tokenize();
  const myTree = new parser(tokens);
  const ast = myTree.create();
  const generator = new genC();
  const program = generator.gen(ast)
  console.log(
  tokens.map(t => ({
    type: TokenType[t.type],
    value: t.value
  }))
);
//console.log(JSON.stringify(ast));
console.log(JSON.stringify(ast, null, 2));
console.log(JSON.stringify(program, null, 2));

const FOLDER = "./src/compile/.cCode";
const C_FILE = join(FOLDER, "main.c");
const BIN_FILE = join(FOLDER, "main");

mkdirSync(FOLDER, { recursive: true });

writeFileSync(C_FILE, program);
console.log(`Wrote C code to ${C_FILE}`);

try {
    console.log("Compiling...");
    execSync(`clang "${C_FILE}" -o "${BIN_FILE}"`, { stdio: 'inherit' });
    console.log("Compiled.");
} catch (e) {
    console.error("Compilation failed : \n", e);
    process.exit(1);
}

console.log("--- Running ---");
execSync(`"${BIN_FILE}"`, { stdio: 'inherit' });

}
