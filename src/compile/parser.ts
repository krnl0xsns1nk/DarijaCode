import {
  type Token,
  TokenType,
  Stmt,
  PrintStmt
} from "./tokens"

export class parser {
  constructor(tokens: Token[]){

    this.tokens = tokens;
  };
  private tokens: Token[] = [];
  private cusror: number = 0;
  private that(){
    return this.tokens[this.cusror];
  };
  private type(){
    return this.that().type;
  }
  /*
  private value(){
    return this.that().value;
  }*/
  private move(){
    return this.tokens[this.cusror++]
  }
  private expect(typ: TokenType){

    if(!this.that() || this.type() !== typ){
      throw new Error(`tw9a3na type ${TokenType[typ]} wlkin l9ina ${TokenType[this.type()]}`)
    } 

    return this.move()
  }
  private stmts: Stmt[] = []
  private program(stmt: Stmt[]): Stmt{

    console.log("final")
    return {
      type: "program",
      body: stmt
    }
  }
  private printStmt(): PrintStmt {

    this.expect(TokenType.KTEB)
    this.expect(TokenType.LPAREN);
    const value = this.expect(TokenType.STRING);
    this.expect(TokenType.RPAREN);

    return {
      type: "printStmt",
      value: value.value
    }
  } 
  public create(): Stmt{
    console.log("hi")
    while (this.tokens.length > this.cusror){
      console.log("hi2")

  switch (this.type()) {
    case TokenType.KTEB:
      this.stmts.push(this.printStmt());
    break;

    default:
      throw new Error(`Unknown statement ${TokenType[this.type()]}`);
  }
    }
    console.log("reach");
    return this.program(this.stmts)
  }
}
