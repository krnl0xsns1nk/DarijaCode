import { Token, TokenType } from "./tokens";
import { DarijaError } from "./errors";
const keywords: Record<string, TokenType> = {
  dir: TokenType.DIR,
  khli: TokenType.KHLI,
  kteb: TokenType.KTEB,

  dalla: TokenType.FN,
  raj3: TokenType.RAJ3,

  ila: TokenType.ILA,
  awla: TokenType.AWLA,
  wla: TokenType.WLA,

  mahd: TokenType.MAHD,
  dwr: TokenType.DWR,

  qta3: TokenType.QTA3,
  kml: TokenType.KAML,

  class: TokenType.CLASS,

  lbnnay: TokenType.DIRFLBLASA,

  wratmn: TokenType.WRAATMN,

  sa7i7: TokenType.TRUE,
  ghalat: TokenType.FALSE,
  khawi: TokenType.NULL,
};

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private cursor = 0;
  private line = 1;
  private column = 1;
  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    while (!this.isEnd()) {
      const startLine = this.line;
      const startColumn = this.column;
      const char = this.peek();

      if (char === " " || char === "\t" || char === "\r") {
        this.advance();
        continue;
      }

      if (char === "\n") {
        this.advance();
        this.add(TokenType.NEWLINE, "\\n", startLine, startColumn);
        continue;
      }

      if (char === "/" && this.peek(1) === "/") {
        while (!this.isEnd() && this.peek() !== "\n") {
          this.advance();
        }
        continue;
      }

      if (char === "/" && this.peek(1) === "*") {
        this.advance();
        this.advance();

        while (
          !this.isEnd() &&
          !(this.peek() === "*" && this.peek(1) === "/")
        ) {
          this.advance();
        }
        this.advance();
        this.advance();

        continue;
      }

      if (char === '"' || char === "'") {
        this.readString(char);
        continue;
      }

      if (this.isDigit(char)) {
        this.readNumber();
        continue;
      }

      if (this.isIdentifierStart(char)) {
        this.readIdentifier();
        continue;
      }

      switch (char) {
        case "(":
          this.simple(TokenType.LPAREN);
          break;

        case ")":
          this.simple(TokenType.RPAREN);
          break;

        case "{":
          this.simple(TokenType.LBRACE);
          break;

        case "}":
          this.simple(TokenType.RBRACE);
          break;

        case "[":
          this.simple(TokenType.LBRACT);
          break;

        case "]":
          this.simple(TokenType.RBRACT);
          break;

        case "+":
          if (this.match("+")) this.simple(TokenType.PLUSPLUS, "++");
          else this.simple(TokenType.PLUS);
          break;

        case "-":
          if (this.match("-")) this.simple(TokenType.MINUSMINUS, "--");
          else this.simple(TokenType.MINUS);
          break;

        case "*":
          if (this.match("*")) this.simple(TokenType.POWER, "**");
          else this.simple(TokenType.STAR);
          break;

        case "/":
          this.simple(TokenType.SLASH);
          break;

        case "%":
          this.simple(TokenType.PERCENT);
          break;

        case "=":
          if (this.match("=")) this.simple(TokenType.EQEQ, "==");
          else this.simple(TokenType.EQUAL);
          break;

        case ":":
          if (this.match("=")) this.simple(TokenType.COLONEQUAL, ":=");
          else this.simple(TokenType.COLON);
          break;

        case "!":
          if (this.match("=")) this.simple(TokenType.NOTEQ, "!=");
          else this.simple(TokenType.NOT);
          break;

        case "<":
          if (this.match("=")) this.simple(TokenType.LTEQ, "<=");
          else this.simple(TokenType.LT);
          break;

        case ">":
          if (this.match("=")) this.simple(TokenType.GTEQ, ">=");
          else this.simple(TokenType.GT);
          break;

        case "&":
          if (this.match("&")) this.simple(TokenType.AND, "&&");
          else this.error("twa93na &&", "DCE12");
          break;

        case "|":
          if (this.match("|")) this.simple(TokenType.OR, "||");
          else this.error("twa93na ||", "DCE12");
          break;

        case ".":
          this.simple(TokenType.DOT);
          break;

        case ",":
          this.simple(TokenType.COMMA);
          break;

        case "?":
          this.simple(TokenType.QUESTION);
          break;

        case ";":
          this.simple(TokenType.EOS);
          break;

        default:
          this.error(`7arf mam3rofch '${char}'`, "DCE1");
      }
    }

    this.tokens.push({
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    });

    return this.tokens;
  }

  private readIdentifier() {
    const line = this.line;
    const column = this.column;
    let value = "";

    while (this.isIdentifierPart(this.peek())) {
      value += this.advance();
    }

    const type = keywords[value] ?? TokenType.IDENTF;
    this.add(type, value, line, column);
  }

  private readNumber() {
    const line = this.line;
    const column = this.column;
    let value = "";

    while (this.isDigit(this.peek()) || this.peek() === "_") {
      value += this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peek(1))) {
      value += this.advance();
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    this.add(TokenType.NUMBER, value.replaceAll("_", ""), line, column);
  }

  private readString(quote: string) {
    const start = {
  line: this.line,
  column: this.column
};
    this.advance();
    let value = "";

    while (!this.isEnd() && this.peek() !== quote) {
      const char = this.advance();
      if (char === "\\") {
        const next = this.advance();
        switch (next) {
          case "n":
            value += "\n";
            break;
          case "t":
            value += "\t";
            break;
          default:
            value += next;
        }
      } else {
        value += char;
      }
    }

      if (this.isEnd()) {
  this.error(
    "nass mamkmolch",
    "DCE11",
    "bhal haka -> \"wafin, al3alam !\"",
    start
  );
    }

    this.advance();
    this.add(TokenType.STRING, value, start.line, start.column);
  }

  private simple(type: TokenType, value?: string) {
    const line = this.line;
    const column = this.column;
    const char = this.advance();
    this.add(type, value ?? char, line, column);
  }

  private match(expected: string) {
    if (this.peek(1) !== expected) return false;
    this.advance();
    return true;
  }

  private add(type: TokenType, value: string, line: number, column: number) {
    this.tokens.push({
      type,
      value,
      line,
      column,
    });
  }

  private advance() {
    const char = this.source[this.cursor++];
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private peek(offset = 0) {
    return this.source[this.cursor + offset] ?? "\0";
  }

  private isEnd() {
    return this.cursor >= this.source.length;
  }

  private isDigit(c: string) {
    return c >= "0" && c <= "9";
  }

  private isIdentifierStart(c: string) {
    return /[a-zA-Z_]/.test(c);
  }

  private isIdentifierPart(c: string) {
    return /[a-zA-Z0-9_]/.test(c);
  }


private error(
  message: string,
  ecode: string,
  hint?: string,
  location = {
    line: this.line,
    column: this.column
  }
): never {
  throw new DarijaError({
    code: ecode,
    stage: "lexer",
    message,
    location,
    hint: hint ?? ""
  });
}

}




