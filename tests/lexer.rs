use drj::lexer::tokens::*;
use drj::lexer::*;

#[test]
fn lex_success() {
    let src = "kteb(name)";
    let mut lexer = Lexer::new(src);

    let tokens = lexer.run().expect("valid source should lex successfully");

    assert_eq!(tokens[0].token_type, TokenType::Kteb);
    assert_eq!(tokens[1].token_type, TokenType::Lparen);
    assert_eq!(tokens[2].token_type, TokenType::Ident);
    assert_eq!(tokens[3].token_type, TokenType::Rparen);
}

#[test]
fn lex_punctuation() {
    let src = "@ # ^ ( ) [ ] { } : × , . % ; $";
    let mut lexer = Lexer::new(src);

    let tokens = lexer
        .run()
        .expect("valid punctuation should lex successfully");

    let expected = [
        TokenType::At,
        TokenType::Hash,
        TokenType::Xor,
        TokenType::Lparen,
        TokenType::Rparen,
        TokenType::Lbrack,
        TokenType::Rbrack,
        TokenType::QLbrack,
        TokenType::QRbrack,
        TokenType::Colon,
        TokenType::Mul,
        TokenType::Comma,
        TokenType::Point,
        TokenType::Percent,
        TokenType::Eos,
        TokenType::Dollar,
    ];

    for (token, expected_type) in tokens.iter().zip(expected.iter()) {
        assert_eq!(&token.token_type, expected_type);
    }
}

#[test]
fn lex_double_operators() {
    let src = "** ++ -- ?? == || &&";
    let mut lexer = Lexer::new(src);

    let tokens = lexer
        .run()
        .expect("valid operators should lex successfully");

    let expected = [
        TokenType::Power,
        TokenType::PlusPlus,
        TokenType::MinusMinus,
        TokenType::WhatWhat,
        TokenType::EqualEqual,
        TokenType::OrOr,
        TokenType::AndAnd,
    ];

    for (token, expected_type) in tokens.iter().zip(expected.iter()) {
        assert_eq!(&token.token_type, expected_type);
    }
}

#[test]
fn lex_single_and_comparison_operators() {
    let src = "* + - ? = | & ! != < <= > >=";
    let mut lexer = Lexer::new(src);

    let tokens = lexer
        .run()
        .expect("valid operators should lex successfully");

    let expected = [
        TokenType::Mul,
        TokenType::Plus,
        TokenType::Minus,
        TokenType::What,
        TokenType::Equal,
        TokenType::Or,
        TokenType::And,
        TokenType::Bang,
        TokenType::BangEqual,
        TokenType::Less,
        TokenType::LessE,
        TokenType::Greater,
        TokenType::GtrE,
    ];

    for (token, expected_type) in tokens.iter().zip(expected.iter()) {
        assert_eq!(&token.token_type, expected_type);
    }
}

#[test]
fn lex_division_and_one_mul() {
    let src = "/ ÷ ×";
    let mut lexer = Lexer::new(src);

    let tokens = lexer
        .run()
        .expect("division operators should lex successfully");

    assert_eq!(tokens[0].token_type, TokenType::Div);
    assert_eq!(tokens[1].token_type, TokenType::Div);
    assert_eq!(tokens[2].token_type, TokenType::Mul);
}

#[test]
fn lex_decimal() {
    let src = "~5.25";
    let mut lexer = Lexer::new(src);

    let tokens = lexer.run().expect("valid decimal should lex successfully");

    assert_eq!(tokens[0].token_type, TokenType::Exr);
    assert_eq!(tokens[0].value, "5.25");
}

#[test]
fn lex_newline() {
    let src = "kteb\nname";
    let mut lexer = Lexer::new(src);

    let tokens = lexer.run().expect("newline should lex successfully");

    assert_eq!(tokens[0].token_type, TokenType::Kteb);
    assert_eq!(tokens[1].token_type, TokenType::NewLine);
    assert_eq!(tokens[2].token_type, TokenType::Ident);
}

#[test]
fn lex_invalid_symbol() {
    let src = "¤";
    let mut lexer = Lexer::new(src);

    let result = lexer.run();

    assert!(result.is_err());

    let error = result.unwrap_err();

    assert_eq!(error.er.code(), "DCE2");
}

#[test]
fn lex_variable_declaration() {
    let src = "name: nss = \":)\"";
    let mut lexer = Lexer::new(src);

    let tokens = lexer
        .run()
        .expect("valid declaration should lex successfully");

    assert_eq!(tokens[0].token_type, TokenType::Ident);
    assert_eq!(tokens[0].value, "name");

    assert_eq!(tokens[1].token_type, TokenType::Colon);
    assert_eq!(tokens[2].token_type, TokenType::NssType);
    assert_eq!(tokens[3].token_type, TokenType::Equal);
    assert_eq!(tokens[4].token_type, TokenType::Nss);
}
