import { Token, TokenType } from "./tokens";
import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  FunctionDeclaration,
  Param,
  ReturnStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  BreakStatement,
  ContinueStatement,
  BlockStatement,
  PrintStatement,
  ExpressionStatement,
} from "./ast";

// NOTE: class parsing (jdid / this) is intentionally not implemented yet.
// The lexer does not tokenize `this` or `jdid` as keywords, so classes
// stay identifiers-only for now. Add THIS/JDID token types first.

// NOTE: `dwr (item in array)` and `dwr (index, value of items)` are not
// implemented yet either — the lexer has no IN/OF tokens. Only the
// classic C-style `dwr (init; condition; update)` form is supported.

export class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Program {
    const body: Statement[] = [];
    this.skipNewlines();
    while (!this.isEnd()) {
      body.push(this.statement());
      this.skipNewlines();
    }
    return { type: "Program", body, pos: { line: 1, column: 1 } };
  }

  private statement(): Statement {
    this.skipNewlines();
    const token = this.peek();

    switch (token.type) {
      case TokenType.DIR:
        return this.variableDeclaration("dir");
      case TokenType.KHLI:
        return this.variableDeclaration("khli");
      case TokenType.FN:
        return this.functionDeclaration();
      case TokenType.RAJ3:
        return this.returnStatement();
      case TokenType.ILA:
        return this.ifStatement();
      case TokenType.MAHD:
        return this.whileStatement();
      case TokenType.DWR:
        return this.forStatement();
      case TokenType.QTA3:
        return this.breakStatement();
      case TokenType.KAML:
        return this.continueStatement();
      case TokenType.KTEB:
        return this.printStatement();
      case TokenType.LBRACE:
        return this.block();
      default:
        return this.expressionStatement();
    }
  }

  private variableDeclaration(kind: "dir" | "khli"): VariableDeclaration {
    const pos = this.pos_();
    this.advance(); // dir | khli

    const name = this.expect(TokenType.IDENTF, "twa93na smya dyal mutaghayer").value;

    let typeAnnotation: string | null = null;
    if (this.match(TokenType.COLON)) {
      typeAnnotation = this.typeAnnotation();
    }

    let init: Expression | null = null;
    if (this.match(TokenType.EQUAL) || this.checkPrev(TokenType.COLONEQUAL)) {
      init = this.expression();
    } else if (this.match(TokenType.COLONEQUAL)) {
      init = this.expression();
    }

    this.consumeEOS();

    return { type: "VariableDeclaration", kind, name, typeAnnotation, init, pos };
  }

  private typeAnnotation(): string {
    // supports: string | ra9m | bool | ...  and array suffix: ra9m[]
    let type = this.expect(TokenType.IDENTF, "twa93na smya dyal chi naw3").value;
    while (this.check(TokenType.LBRACT)) {
      this.advance();
      this.expect(TokenType.RBRACT, "twa93na ']' mora '[' f naw3");
      type += "[]";
    }
    return type;
  }

  private params(): Param[] {
    const params: Param[] = [];
    this.expect(TokenType.LPAREN, "twa93na '(' 9bal mn lmo3amilat");

    while (!this.check(TokenType.RPAREN)) {
      const pos = this.pos_();
      const name = this.expect(TokenType.IDENTF, "twa93na smya llmo3amilat").value;

      let typeAnnotation: string | null = null;
      if (this.match(TokenType.COLON)) {
        typeAnnotation = this.typeAnnotation();
      }

      let defaultValue: Expression | null = null;
      if (this.match(TokenType.EQUAL)) {
        defaultValue = this.expression();
      }

      params.push({
        type: "Param",
        name,
        typeAnnotation,
        defaultValue,
        rest: false,
        pos,
      });

      if (!this.check(TokenType.RPAREN)) {
        this.expect(TokenType.COMMA, "twa93nz ',' bin lmo3amilat");
      }
    }

    this.expect(TokenType.RPAREN, "twa93na ')' mora lmo3amilat");
    return params;
  }

  private functionDeclaration(): FunctionDeclaration {
    const pos = this.pos_();
    this.advance(); // fn

    const name = this.expect(TokenType.IDENTF, "tw93na smya l ddalla").value;
    const fnParams = this.params();

    let returnType: string | null = null;
    if (this.match(TokenType.COLON)) {
      returnType = this.typeAnnotation();
    }

    const body = this.block();

    return { type: "FunctionDeclaration", name, params: fnParams, returnType, body, pos };
  }

  private returnStatement(): ReturnStatement {
    const pos = this.pos_();
    this.advance(); // raj3

    let argument: Expression | null = null;
    if (!this.check(TokenType.EOS) && !this.check(TokenType.RBRACE)) {
      argument = this.expression();
    }

    this.consumeEOS();
    return { type: "ReturnStatement", argument, pos };
  }

  private ifStatement(): IfStatement {
    const pos = this.pos_();
    this.advance(); // ila

    this.expect(TokenType.LPAREN, "tw93na '(' mora 'ila'");
    const condition = this.expression();
    this.expect(TokenType.RPAREN, "twa93na ')' more chart");
    const consequent = this.block();

    const elseIfs: { condition: Expression; consequent: BlockStatement }[] = [];
    this.skipNewlines();
    while (this.check(TokenType.AWLA)) {
      this.advance();
      this.expect(TokenType.LPAREN, "twa93na '(' mora 'awla'");
      const elseIfCondition = this.expression();
      this.expect(TokenType.RPAREN, "twa93na ')' mora chart");
      const elseIfBody = this.block();
      elseIfs.push({ condition: elseIfCondition, consequent: elseIfBody });
      this.skipNewlines();
    }

    let alternate: BlockStatement | null = null;
    if (this.check(TokenType.WLA)) {
      this.advance();
      alternate = this.block();
    }

    return { type: "IfStatement", condition, consequent, elseIfs, alternate, pos };
  }

  private whileStatement(): WhileStatement {
    const pos = this.pos_();
    this.advance(); // mahd

    this.expect(TokenType.LPAREN, "twa93na '(' mora 'mahd'");
    const condition = this.expression();
    this.expect(TokenType.RPAREN, "twa93na ')' mora chart");
    const body = this.block();

    return { type: "WhileStatement", condition, body, pos };
  }

  private forStatement(): ForStatement {
    const pos = this.pos_();
    this.advance(); // dwr

    this.expect(TokenType.LPAREN, "twa93na '(' mora 'dwr'");

    let init: VariableDeclaration | ExpressionStatement | null = null;
    if (!this.check(TokenType.EOS)) {
      init = this.check(TokenType.DIR)
        ? this.variableDeclaration("dir")
        : this.expressionStatement();
    } else {
      this.advance(); // consume the ';'
    }

    let condition: Expression | null = null;
    if (!this.check(TokenType.EOS)) {
      condition = this.expression();
    }
    this.expect(TokenType.EOS, "twa93na ';' mora chart dyal tdwar");

    let update: Expression | null = null;
    if (!this.check(TokenType.RPAREN)) {
      update = this.expression();
    }
    this.expect(TokenType.RPAREN, "twa93na ')' mora ljomla dyal 'dwr'");

    const body = this.block();

    return { type: "ForStatement", init, condition, update, body, pos };
  }

  private breakStatement(): BreakStatement {
    const pos = this.pos_();
    this.advance(); // qta3
    this.consumeEOS();
    return { type: "BreakStatement", pos };
  }

  private continueStatement(): ContinueStatement {
    const pos = this.pos_();
    this.advance(); // kml
    this.consumeEOS();
    return { type: "ContinueStatement", pos };
  }

  private printStatement(): PrintStatement {
    const pos = this.pos_();
    this.advance(); // kteb

    this.expect(TokenType.LPAREN, "twa93na '(' mora 'kteb'");
    const argument = this.expression();
    this.expect(TokenType.RPAREN, "twa93na ')' mora lhoja dyal kteb");
    this.consumeEOS();

    return { type: "PrintStatement", argument, pos };
  }

  private block(): BlockStatement {
    const pos = this.pos_();
    this.expect(TokenType.LBRACE, "twa93na '{'");
    this.skipNewlines();

    const body: Statement[] = [];
    while (!this.check(TokenType.RBRACE) && !this.isEnd()) {
      body.push(this.statement());
      this.skipNewlines();
    }

    this.expect(TokenType.RBRACE, "twa93na '}'");
    return { type: "BlockStatement", body, pos };
  }

  private expressionStatement(): ExpressionStatement {
    const pos = this.pos_();
    const expression = this.expression();
    this.consumeEOS();
    return { type: "ExpressionStatement", expression, pos };
  }

  // ---------------------------------------------
  // Expressions (precedence climbing)
  // ---------------------------------------------

  private expression(): Expression {
    return this.assignment();
  }

  private assignment(): Expression {
    const target = this.conditional();

    const assignOps: Record<string, "=" | "+=" | "-=" | "*=" | "/="> = {
      [TokenType.EQUAL]: "=",
    };

    if (this.check(TokenType.EQUAL)) {
      const pos = this.pos_();
      this.advance();
      const value = this.assignment();
      return { type: "AssignmentExpression", operator: "=", target, value, pos };
    }

    return target;
  }

  private conditional(): Expression {
    const condition = this.logicalOr();

    if (this.check(TokenType.QUESTION)) {
      const pos = this.pos_();
      this.advance();
      const consequent = this.assignment();
      this.expect(TokenType.COLON, "twa93na ':' f ta3bir chart tolaty");
      const alternate = this.assignment();
      return { type: "ConditionalExpression", condition, consequent, alternate, pos };
    }

    return condition;
  }

  private logicalOr(): Expression {
    let left = this.logicalAnd();
    while (this.check(TokenType.OR)) {
      const pos = this.pos_();
      this.advance();
      const right = this.logicalAnd();
      left = { type: "LogicalExpression", operator: "||", left, right, pos };
    }
    return left;
  }

  private logicalAnd(): Expression {
    let left = this.equality();
    while (this.check(TokenType.AND)) {
      const pos = this.pos_();
      this.advance();
      const right = this.equality();
      left = { type: "LogicalExpression", operator: "&&", left, right, pos };
    }
    return left;
  }

  private equality(): Expression {
    let left = this.relational();
    while (this.check(TokenType.EQEQ) || this.check(TokenType.NOTEQ)) {
      const pos = this.pos_();
      const operator = this.advance().type === TokenType.EQEQ ? "==" : "!=";
      const right = this.relational();
      left = { type: "BinaryExpression", operator, left, right, pos };
    }
    return left;
  }

  private relational(): Expression {
    let left = this.additive();
    while (
      this.check(TokenType.LT) ||
      this.check(TokenType.LTEQ) ||
      this.check(TokenType.GT) ||
      this.check(TokenType.GTEQ)
    ) {
      const pos = this.pos_();
      const opToken = this.advance();
      const operator = { LT: "<", LTEQ: "<=", GT: ">", GTEQ: ">=" }[
        opToken.type as "LT" | "LTEQ" | "GT" | "GTEQ"
      ] as "<" | "<=" | ">" | ">=";
      const right = this.additive();
      left = { type: "BinaryExpression", operator, left, right, pos };
    }
    return left;
  }

  private additive(): Expression {
    let left = this.multiplicative();
    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const pos = this.pos_();
      const operator = this.advance().type === TokenType.PLUS ? "+" : "-";
      const right = this.multiplicative();
      left = { type: "BinaryExpression", operator, left, right, pos };
    }
    return left;
  }

  private multiplicative(): Expression {
    let left = this.power();
    while (
      this.check(TokenType.STAR) ||
      this.check(TokenType.SLASH) ||
      this.check(TokenType.PERCENT)
    ) {
      const pos = this.pos_();
      const opToken = this.advance();
      const operator = { STAR: "*", SLASH: "/", PERCENT: "%" }[
        opToken.type as "STAR" | "SLASH" | "PERCENT"
      ] as "*" | "/" | "%";
      const right = this.power();
      left = { type: "BinaryExpression", operator, left, right, pos };
    }
    return left;
  }

  private power(): Expression {
    const left = this.unary();
    if (this.check(TokenType.POWER)) {
      const pos = this.pos_();
      this.advance();
      const right = this.power(); // right-associative
      return { type: "BinaryExpression", operator: "**", left, right, pos };
    }
    return left;
  }

  private unary(): Expression {
    if (this.check(TokenType.NOT) || this.check(TokenType.MINUS)) {
      const pos = this.pos_();
      const operator = this.advance().type === TokenType.NOT ? "!" : "-";
      const argument = this.unary();
      return { type: "UnaryExpression", operator, argument, pos };
    }
    return this.postfix();
  }

  private postfix(): Expression {
    let expr = this.call();

    if (this.check(TokenType.PLUSPLUS) || this.check(TokenType.MINUSMINUS)) {
      const pos = this.pos_();
      const operator = this.advance().type === TokenType.PLUSPLUS ? "++" : "--";
      expr = { type: "UpdateExpression", operator, argument: expr, prefix: false, pos };
    }

    return expr;
  }

  private call(): Expression {
    let expr = this.primary();

    while (true) {
      if (this.check(TokenType.LPAREN)) {
        const pos = this.pos_();
        this.advance();
        const args: Expression[] = [];
        while (!this.check(TokenType.RPAREN)) {
          args.push(this.expression());
          if (!this.check(TokenType.RPAREN)) {
            this.expect(TokenType.COMMA, "twa93na ',' bin lhojaj");
          }
        }
        this.expect(TokenType.RPAREN, "twa93na ')' mora lhojaj");
        expr = { type: "CallExpression", callee: expr, args, pos };
      } else if (this.check(TokenType.DOT)) {
        const pos = this.pos_();
        this.advance();
        const property = this.expect(TokenType.IDENTF, "twa93na smya dyal lkhasiya mora '.'").value;
        expr = {
          type: "MemberExpression",
          object: expr,
          property: { type: "Identifier", name: property, pos },
          computed: false,
          pos,
        };
      } else if (this.check(TokenType.LBRACT)) {
        const pos = this.pos_();
        this.advance();
        const property = this.expression();
        this.expect(TokenType.RBRACT, "twa93na ']' mora lfahras");
        expr = { type: "MemberExpression", object: expr, property, computed: true, pos };
      } else {
        break;
      }
    }

    return expr;
  }

  private primary(): Expression {
    const token = this.peek();
    const pos = this.pos_();

    if (this.match(TokenType.NUMBER)) {
      return { type: "NumericLiteral", value: Number(token.value), pos };
    }

    if (this.match(TokenType.STRING)) {
      return { type: "StringLiteral", value: token.value, pos };
    }

    if (this.match(TokenType.TRUE)) {
      return { type: "BooleanLiteral", value: true, pos };
    }

    if (this.match(TokenType.FALSE)) {
      return { type: "BooleanLiteral", value: false, pos };
    }

    if (this.match(TokenType.NULL)) {
      return { type: "NullLiteral", pos };
    }

    if (this.match(TokenType.IDENTF)) {
      return { type: "Identifier", name: token.value, pos };
    }

    if (this.match(TokenType.LPAREN)) {
      const expr = this.expression();
      this.expect(TokenType.RPAREN, "twa93na ')' mora tta3bir");
      return expr;
    }

    if (this.match(TokenType.LBRACT)) {
      const elements: Expression[] = [];
      while (!this.check(TokenType.RBRACT)) {
        elements.push(this.expression());
        if (!this.check(TokenType.RBRACT)) {
          this.expect(TokenType.COMMA, "twa93na ',' bin l3anasir dyal lmasfofa");
        }
      }
      this.expect(TokenType.RBRACT, "twa93na ']' mora l3anasir dyal lmasfofa");
      return { type: "ArrayExpression", elements, pos };
    }

    this.error(`token mmtw93ach: '${token.value}'`);
  }

  // ---------------------------------------------
  // Helpers
  // ---------------------------------------------

  private consumeEOS() {
    this.skipNewlines();
    this.expect(TokenType.EOS, "twa93na ';'");
  }

  private skipNewlines() {
    while (this.check(TokenType.NEWLINE)) {
      this.advance();
    }
  }

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset];
  }

  private check(type: TokenType): boolean {
    return this.peek().type === type;
  }

  private checkPrev(type: TokenType): boolean {
    return this.tokens[this.pos - 1]?.type === type;
  }

  private match(type: TokenType): boolean {
    if (!this.check(type)) return false;
    this.advance();
    return true;
  }

  private advance(): Token {
    const token = this.tokens[this.pos];
    if (!this.isEnd()) this.pos++;
    return token;
  }

  private expect(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    this.error(message);
  }

  private isEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private pos_(): { line: number; column: number } {
    const token = this.peek();
    return { line: token.line, column: token.column };
  }

  private error(message: string): never {
    const token = this.peek();
    throw new Error(`${message} at ${token.line}:${token.column}`);
  }
}

