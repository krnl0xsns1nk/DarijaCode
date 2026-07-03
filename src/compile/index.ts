import { lexer } from "./lexer";
import { TokenType } from "./tokens";

module.exports = function compile(code : string): void{
  const myLexer = new lexer(code) 
  const tokens = myLexer.tokenize();
  console.log(
  tokens.map(t => ({
    type: TokenType[t.type],
    value: t.value
  }))
);
}
