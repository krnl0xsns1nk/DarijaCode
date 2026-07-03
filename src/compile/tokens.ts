
export enum TokenType {
  KEYWORD,
  SYMBOLE,
  STRING,
}

//export enum KeywordType {
//  KTEB,
//}


export type Token = {
  type: TokenType
  value: string;
}; 



//export const keywords: Record<string, TokenType> = {
//  kteb: TokenType.KTEB,
//};
