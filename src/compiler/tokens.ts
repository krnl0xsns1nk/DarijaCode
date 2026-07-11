export enum TokenType {
  // literals
  IDENTF = "IDENTF",
  NUMBER = "NUMBER",
  STRING = "STRING",
  TRUE = "TRUE",
  FALSE = "FALSE",
  NULL = "NULL",

  // declarations
  DIR = "DIR",
  KHLI = "KHLI",

  // functions
  FN = "FN",
  RAJ3 = "RAJ3",

  // control flow
  ILA = "ILA",
  AWLA = "AWLA",
  WLA = "WLA",
  MAHD = "MAHD",
  DWR = "DWR",
  QTA3 = "QTA3",
  KAML = "KAML",

  // classes
  CLASS = "CLASS",
  DIRFLBLASA = "DIRFLBLASA",
  WRAATMN = "WRAATMN",

  // built-in I/O
  KTEB = "KTEB",

  // punctuation
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LBRACT = "LBRACT",
  RBRACT = "RBRACT",
  DOT = "DOT",
  COMMA = "COMMA",
  QUESTION = "QUESTION",
  EOS = "EOS",

  // operators
  PLUS = "PLUS",
  PLUSPLUS = "PLUSPLUS",
  MINUS = "MINUS",
  MINUSMINUS = "MINUSMINUS",
  STAR = "STAR",
  POWER = "POWER",
  SLASH = "SLASH",
  PERCENT = "PERCENT",

  EQUAL = "EQUAL",
  EQEQ = "EQEQ",
  NOT = "NOT",
  NOTEQ = "NOTEQ",
  LT = "LT",
  LTEQ = "LTEQ",
  GT = "GT",
  GTEQ = "GTEQ",
  AND = "AND",
  OR = "OR",

  COLON = "COLON",
  COLONEQUAL = "COLONEQUAL",

  // structural
  NEWLINE = "NEWLINE",
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

