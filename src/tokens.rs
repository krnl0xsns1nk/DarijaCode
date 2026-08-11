

#[derive(Debug, PartialEq)]
pub enum TokenType {
    IDENT,
    KTEB,
    LPAREN,
    STRING,
    RPAREN
}

#[derive(Debug)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String
}
