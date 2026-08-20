#[derive(Debug, Clone, PartialEq)]
pub enum TokenType {
    Ident,

    // separators
    NewLine,
    Eos,
    Eof,

    // symbols -_-
    Plus,
    Mul,
    Div,
    Equal,
    Power,
    EqualEqual,
    ColonEqual,
    Minus,
    Bang,
    BangEqual,
    LessE,
    GtrE,
    At,
    Dollar,
    Lparen,
    Rparen,
    Lbrack,
    Rbrack,
    What,
    WhatWhat,
    Comma,
    Colon,
    Hash,
    Or,
    OrOr,
    AndAnd,
    And,
    Xor,
    Percent,
    Point,
    PlusPlus,
    MinusMinus,
    Greater,
    Less,
    Star,
    QRbrack,
    QLbrack,

    // types :)
    Nss,
    Edd,
    Exr,
    Mnt(bool),

    // types in keywrod :)
    NssType,
    EddType,
    ExrType,
    MntType,

    // boolean (they should de sa7i7 and ghalat but anyway, i like those more
    //Ah,
    //La,

    // built in functions
    Kteb,
}

#[derive(Debug, Clone)]
pub struct Span {
    pub start: usize,
    pub end: usize,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
    pub span: Span,
}
