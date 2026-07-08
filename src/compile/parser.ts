import {
  type Token,
  TokenType,
  Stmt,
  PrintStmt,
  display
} from "./tokens";
import { CompileError } from "../cli";

export class parser {
  constructor(tokens: Token[]){
    this.tokens = tokens;
  };
  private tokens: Token[] = [];
  private cusror: number = 0;
  private that(n: number = 0){
    return this.tokens[this.cusror + n];
  };
  private type(n: number = 0){
    console.log(JSON.stringify(this.that()))
    return this.that(n).type;
  }
  /*
  private value(){
    return this.that().value;
  }*/
  private move(){
    return this.tokens[this.cusror++]
  }
  private expect(typ: TokenType, hint:string){
    if(!this.that() || this.type() !== typ){
      throw new CompileError(
        `tw9a3na ${display[typ]} wlkin l9ina ${display[this.type()]}`,
        this.that().line,
        this.that().column,
        `jrb : ${display[this.type(-2)]}${display[this.type(-1)]}${display[typ]}
tari9a S7i7a : ${hint}
        `
      )
    } 

    return this.move()
  }
  private stmts: Stmt[] = []
  private program(stmt: Stmt[]): Stmt{

    return {
      type: "program",
      body: stmt
    }
  }
  private printStmt(): PrintStmt {
    const hint: string = 'kteb("chi haja")'
    this.expect(TokenType.KTEB, hint)
    this.expect(TokenType.LPAREN, hint);
    const value = this.expect(TokenType.STRING, hint);
    this.expect(TokenType.RPAREN, hint);

    return {
      type: "printStmt",
      value: value.value
    }
  } 
  public create(): Stmt{
    console.log("parsing...")
    while (this.tokens.length > this.cusror){

  switch (this.type()) {
    case TokenType.KTEB:
      this.stmts.push(this.printStmt());
    break;

    default:
      throw new Error(`Unknown statement ${TokenType[this.type()]}`);
  }
    }
    return this.program(this.stmts)
  }
}
