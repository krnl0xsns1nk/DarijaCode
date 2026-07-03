import  { type Token, TokenType } from "./tokens";
const symbols: string[] = ["(", ")", "=", "+"]
const isChar = (char: string): boolean => {
  return char.toUpperCase() !== char.toLowerCase()
}
interface WordType  {
  type: TokenType.KEYWORD | TokenType.STRING;
  value: string,
}
export class lexer {
  private code: string;
  private tokens: Token[] = [];
  private cursor: number = 0;
  private waiting: WordType = {type: TokenType.KEYWORD, value: ''};
  private that(){
    return this.code[this.cursor]
  }
  private move(){
    return this.code[this.cursor++]
  }
  private pushWaiter(){
       let item: Token = {type: this.waiting.type, value: this.waiting.value}
      this.tokens.push(item)
      console.log(`pushing : ${JSON.stringify(item)}`)
      this.waiting.value = '';
      this.waiting.type = TokenType.KEYWORD;
    }
  private push(typ: TokenType){
    console.log(`pushing : ${this.that()} as ${typ}`)
    this.tokens.push({type: typ, value: this.that()});
//    this.cursor++;
  }
  private wait(typ: TokenType.KEYWORD | TokenType.STRING){
    console.log(`waiting : ${JSON.stringify(this.waiting)}`)
    this.waiting.type = typ;
    this.waiting.value += this.that() === "\"" ? '' : this.that();
//    this.cursor++;
  }
  private weOnString(): boolean{
    return this.waiting.type === TokenType.STRING;
  }
  constructor(code: string){
    this.code = code.trim()
  };
  public tokenize(): Token[] {
    while (this.code.length > this.cursor){

      if(this.weOnString()){
      }

        if(this.that() === " "){
          this.wait(TokenType.STRING)
        }
      if(this.that() === "\""){ 
        if(this.waiting.type === TokenType.STRING){
          this.pushWaiter();
          //this.move();
          //continue;
        }
        this.wait(TokenType.STRING);
        this.move();
        continue;
      }

      if(symbols.includes(this.that())){ 
        this.pushWaiter();
        this.push(TokenType.SYMBOLE); 
        this.move();
        continue 
      }


      if (isChar(this.that())){
      this.wait(TokenType.KEYWORD); 
      this.move();
      continue;  
    }

    this.move();
  }
  return this.tokens
  }
}
