
export enum TokenType {
  KEYWORD,
  SYMBOLE,
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
  type: TokenType
  value: string;
}; 

export type PrintStmt = {
  type: "printStmt";
  value: string;
};

export type Program = {
  type: "program";
  body: Stmt[];
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
