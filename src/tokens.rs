#[derive(Debug, Clone, PartialEq)]
pub enum TokenType {
    Ident,

    // \n
    NewLine,

    // symbols -_-
    Plus,
    Mul,
    Div,
    Equal,
    Power,
    EqualEqual,
    SingleQ,
    BackQ,
    DoubleQ,
    Minus,
    Bang,
    BangEqual,
    At,
    Dollar,
    Lparen,
    Rparen,
    Lbrack,
    Rbrack,
    What,
    WhatWhat,
    Comma,
    Eos,
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
    Underscore,
    Greater,
    Less,
    Star,
    DoubleStar,
    QRbrack,
    QLbrack,

    // types :)
    Nss,
    Edd,
    Tona2i,
    Likan,

    // types in keywrod :)
    NssType,
    EddType,
    Tona2iType,
    LikanType,

    // boolean (they should de sa7i7 and ghalat but anyway, i like those more
    Ah,
    La,

    // built in functions
    Kteb,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub token_type: TokenType,
    pub value: String,
}
