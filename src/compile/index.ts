import { lexer } from "./lexer";
import { parser } from "./parser";
import { TokenType } from "./tokens";
import { genC } from "./genC";

module.exports = function compile(code : string): void{
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
}
