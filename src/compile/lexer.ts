import  { type Token, TokenType, getKeywordToken } from "./tokens";
import { CompileError } from "../cli";
const symbol: string[] = ["(", ")"]
const symbols: Record<string, TokenType> = {
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
};
const isChar = (char: string): boolean => {
  return char.toUpperCase() !== char.toLowerCase()
}
interface WordType  {
  type: TokenType.IDENTF | TokenType.STRING;
  value: string,
}
export class lexer {
  private code: string;
  private tokens: Token[] = [];
  private cursor: number = 0;
  private line: number = 1;
  private column: number = 1;
  private waiting: WordType = {type: TokenType.IDENTF, value: ''};
  private that(){
    return this.code[this.cursor]
  }
  private reset(){
    this.waiting = {type: TokenType.IDENTF, value: ''}
    this.isString = false;
  }
  private move() {
    const current = this.code[this.cursor++];

    if (current === "\n") {
        this.line++;
        this.column = 1;
    } else {
        this.column++;
    }

    return current;
  }
  private pushWaiter(){
    const { value } = this.waiting;
    if (value.length < 1) return

      const type = this.isString ? TokenType.STRING : getKeywordToken(value)

      this.tokens.push({type, value, line: this.line, column: this.column})
      console.log(`pushing : ${value} as ${TokenType[type]}`)

      this.reset();
    }
  private push(typ: TokenType){

    console.log(`pushing : ${this.that()} as ${TokenType[typ]}`)
    this.tokens.push({type: typ, value: this.that(), line: this.line, column: this.column});

    this.reset();
  }

  private wait(typ: TokenType.IDENTF | TokenType.STRING){

    console.log(`waiting : ${this.waiting.value} as ${TokenType[this.waiting.type]}`)

    if (typ === TokenType.STRING){ this.isString = true; }
    this.waiting.type = typ;
    this.waiting.value += this.that() === "\"" ? '' : this.that();
//    
  }
  private isString: boolean = false;

  constructor(code: string){
    this.code = code.trim()
  };

  public tokenize(): Token[] {
    while (this.code.length > this.cursor){

      console.log(this.that())

        if(this.that() === " " && this.isString){
          this.wait(TokenType.STRING)
          this.move();
          continue
        }
        if (this.that() === "\n" && this.isString){
        throw new CompileError(
        "Ma tsedatch l string \"text\"",
        this.line,
        this.column,
        `jrb : tzid " `
        );
        }
      if(this.that() === "\""){ 
        if(this.isString){
          this.pushWaiter();
          this.move();
          continue;
        }
        this.wait(TokenType.STRING);
        this.move();
        continue;
      }

      if (symbol.includes(this.that())){
        if (this.isString){
          this.wait(TokenType.STRING);
          this.move();
          continue;
        }
        this.pushWaiter();
        const typ: TokenType = symbols[this.that()]
        this.push(typ)
        this.move();
        continue
      }
/*
      if(this.that() === "("){

        this.pushWaiter();
        this.push(TokenType.LPAREN); 
        this.move();
        continue 
      }
      if (this.that() === ")"){
        this.pushWaiter();
        this.push(TokenType.RPAREN)
        this.move();
        continue
      }

*/
      if (isChar(this.that())){
        if (this.isString){
      this.wait(TokenType.STRING)
      this.move();
      continue;  
    }
      this.wait(TokenType.IDENTF); 
    this.move();
    continue;
      }

    this.move();
  }
  return this.tokens
  }
}
