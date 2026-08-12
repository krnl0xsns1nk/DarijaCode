#[derive(Debug, PartialEq)]
pub enum TokenType {
    Ident,
    Kteb,
    Lparen,
    String,
    Rparen,
}

#[derive(Debug)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
}
