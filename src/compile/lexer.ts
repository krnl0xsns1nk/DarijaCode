import  { type Token, TokenType, getKeywordToken } from "./tokens";
import { CompileError } from "./index";
const symbol: string[] = ["(", ")"]
const symbols: Record<string, TokenType> = {
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
};
const isChar = (char: string): boolean => {
  return char.toUpperCase() !== char.toLowerCase()
}
const isNumber = (c: string): boolean => {
  const numbers: Record<string, boolean> = {
    "0": true, "1": true, "2": true, "3": true, 
    "4": true, "5": true, "6": true, "7": true,
    "8": true, "9": true
  }
  return numbers[c] ?? false
}
interface WordType  {
  type: TokenType.IDENTF | TokenType.STRING | TokenType.NUMBER;
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
    this.tokenMode = TokenType.IDENTF
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
      let typ: TokenType;
      if(this.waiting.type === TokenType.NUMBER){
        typ = this.waiting.type;
      } else {
        typ = this.tokenMode === TokenType.STRING ? 
        TokenType.STRING : getKeywordToken(value)
      }

      this.tokens.push({type: typ, value, line: this.line, column: this.column})
      console.log(`pushing : ${value} as ${TokenType[typ]}`)

      this.reset();
    }
  private push(typ: TokenType){

    console.log(`pushing : ${this.that()} as ${TokenType[typ]}`)
    this.tokens.push({type: typ, value: this.that(), line: this.line, column: this.column});

    this.reset();
  }

  private wait(typ: TokenType.IDENTF | TokenType.STRING | TokenType.NUMBER){

    console.log(`waiting : ${this.waiting.value} as ${TokenType[this.waiting.type]}`)

    if (typ === TokenType.STRING){ this.tokenMode = TokenType.STRING}
    this.waiting.type = typ;
    this.waiting.value += this.that() === "\"" ? '' : this.that();
//    
  }
  private tokenMode: TokenType = TokenType.IDENTF;

  constructor(code: string){
    this.code = code.trim()
  };

  public tokenize(): Token[] {
    while (this.code.length > this.cursor){

      console.log(this.that())
      if(this.that() === "\""){ 
        if(this.tokenMode === TokenType.STRING){
          this.pushWaiter();
          this.move();
          continue;
        }
        this.wait(TokenType.STRING);
        this.move();
        continue;
      }

      if (this.tokenMode === TokenType.STRING){
        if (this.that() === "\n"){
        throw new CompileError(
        "Ma tsedatch l string \"text\"",
        this.line,
        this.column,
        `jrb : tzid -> " `
        );
        }

        this.wait(TokenType.STRING);
        this.move();
        continue;
      }


      if (symbol.includes(this.that())){
        this.pushWaiter();
        const typ: TokenType = symbols[this.that()]
        this.push(typ)
        this.move();
        continue
      }

      if (isNumber(this.that())){
        this.tokenMode = TokenType.NUMBER;
        this.wait(TokenType.NUMBER);
        this.move();
        continue;
      }


      if (isChar(this.that())){
/*        if (this.tokenMode === TokenType.STRING){
      this.wait(TokenType.STRING)
      this.move();
      continue;  
    }*/
      this.wait(TokenType.IDENTF); 
    this.move();
    continue;
      }

    this.move();
  }
  return this.tokens
  }
}
