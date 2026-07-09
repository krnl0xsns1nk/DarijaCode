
export enum TokenType {
  IDENTF,
  STRING,
  NUMBER,
  LPAREN,
  RPAREN,
  LBRACT,
  RBRACT,
  KTEB,
}

export type Token = {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}; 

export type PrintStmt = {
  type: "printStmt";
  value: string;
};

export type Program = {
  type: "program";
  body: Stmt[];
};

export const display: Partial<Record<TokenType, string>> = {
  [TokenType.LPAREN]: "(",
  [TokenType.RPAREN]: ")",
  [TokenType.STRING]: "\"text\"",
  [TokenType.NUMBER]: "ra9m",
  [TokenType.IDENTF]: "smiya-dl-mutaghayer",
  [TokenType.KTEB]: "kteb",
};


export type Stmt = PrintStmt | Program


/*export type stmT = {
  type: string,
  value: stmT[] | string
}

*/

const KEYWORDS: Record<string, TokenType> = {
  'kteb': TokenType.KTEB
}

export function getKeywordToken(word: string): TokenType {
  return KEYWORDS[word]?? TokenType.IDENTF
}









//export const keywords: Record<string, TokenType> = {
//  kteb: TokenType.KTEB,
//};
