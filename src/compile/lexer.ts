import  { type Token, TokenType, getKeywordToken } from "./tokens";
const symbol: string[] = ["(", ")"]
const symbols: Record<string, TokenType> = {
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
/*  ["+", TokenType.PLUS],
  ["=", TokenType.EQUAL],*/
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
  private waiting: WordType = {type: TokenType.IDENTF, value: ''};
  private that(){
    return this.code[this.cursor]
  }
  private reset(){
    this.waiting = {type: TokenType.IDENTF, value: ''}
    this.isString = false;
  }
  private move(){
    return this.code[this.cursor++]
  }
  private pushWaiter(){
    const { value } = this.waiting;
    if (value.length < 1) return

      const type = this.isString ? TokenType.STRING : getKeywordToken(value)

      this.tokens.push({type, value})
      console.log(`pushing : ${value} as ${TokenType[type]}`)

      this.reset();
    }
  private push(typ: TokenType){

    console.log(`pushing : ${this.that()} as ${TokenType[typ]}`)
    this.tokens.push({type: typ, value: this.that()});

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

        if(this.that() === " " && this.isString){
          this.wait(TokenType.STRING)
          this.move();
          continue
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
