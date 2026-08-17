use crate::errors::*;
use crate::lexer::tokens::*;

pub mod tokens;

pub struct Lexer {
    chars: Vec<char>,
    tokens: Vec<Token>,
    pos: usize,
    start: usize,
    //    end: usize,
}

impl Lexer {
    pub fn new(source: &str) -> Self {
        Self {
            chars: source.chars().collect(),
            tokens: Vec::new(),
            pos: 0,
            start: 0,
            //            end: 0,
        }
    }

    pub fn run(&mut self) -> Result<Vec<Token>, CompilerError> {
        while self.pos < self.chars.len() {
            self.scan()?;
        }
        Ok(self.tokens.clone())
    }
    fn current(&self) -> char {
        if self.pos < self.chars.len() {
            self.chars[self.pos]
        } else {
            '\0'
        }
    }
    fn advance(&mut self) {
        self.pos += 1;
    }
    fn push(&mut self, token_type: TokenType, value: String) {
        self.tokens.push(Token {
            token_type,
            value,
            span: Span {
                start: self.start,
                end: self.pos,
            },
        });
    }
    fn err(&mut self, e: Er) -> CompilerError {
        CompilerError {
            er: e,
            span: Span {
                start: self.start,
                end: self.pos,
            },
            info: None,
        }
    }
    fn read_string(&mut self) -> Result<(), CompilerError> {
        let parent = self.current();
        self.advance();
        let mut value = String::new();
        while self.pos < self.chars.len() && self.current() != parent {
            if self.current() == '\n' && parent == '"' {
                return Err(self.err(Er::UnCompletString));
            }
            value.push(self.current());
            self.advance();
        }
        if self.pos >= self.chars.len() && self.chars[self.pos - 1] != parent {
            return Err(self.err(Er::NewLineString));
        }
        self.push(TokenType::Nss, value.clone());
        value.clear();
        self.advance();
        Ok(())
    }
    fn ident_or_maybe_number(&mut self) {
        let mut value = String::new();
        let first = self.current();
        while self.pos < self.chars.len()
            && (self.current().is_ascii_alphanumeric() || self.current() == '_')
        {
            value.push(self.current());
            self.advance();
        }

        let is_number =
            first.is_ascii_digit() && value.chars().all(|c| c.is_ascii_digit() || c == '_');
        if is_number && value.chars().any(|c| c.is_ascii_digit()) {
            value = value.replace('_', "");
            self.push(TokenType::Edd, value);
        } else {
            self.tokens.push(Token {
                token_type: match value.as_str() {
                    "kteb" => TokenType::Kteb,
                    "nss" => TokenType::NssType,
                    "3dd" => TokenType::EddType,
                    "3xr" => TokenType::ExrType,
                    "mnt" => TokenType::MntType,
                    "ah" => TokenType::Mnt(true),
                    "la" => TokenType::Mnt(false),
                    _ => TokenType::Ident,
                },
                value,
                span: Span {
                    start: self.start,
                    end: self.pos,
                },
            });
        }
    }
    fn read_float(&mut self) -> Result<(), CompilerError> {
        self.advance();
        let mut value = String::new();
        if self.current() == '-' || self.current() == '+' {
            value.push(self.current());
            self.advance();
        }
        if !self.current().is_ascii_digit() {
            return Err(self.err(Er::InvalidFloat));
        }

        while self.current().is_ascii_digit() {
            value.push(self.current());
            self.advance();
        }
        if self.current() != '.' {
            return Err(self.err(Er::InvalidFloat));
        }

        value.push(self.current());
        self.advance();

        if !self.current().is_ascii_digit() {
            return Err(self.err(Er::InvalidFloat));
        }

        value.push(self.current());
        self.advance();

        while self.current().is_ascii_digit() {
            value.push(self.current());
            self.advance();
        }

        self.push(TokenType::Exr, value.clone());
        Ok(())
    }
    fn check_double(&mut self, type1: TokenType, type2: TokenType) {
        let c = self.current();
        let c2 = self.chars[self.pos + 1];
        if c2 == c {
            let mut s = String::new();
            s.push(c);
            s.push(c2);
            self.tokens.push(Token {
                token_type: type2,
                value: s,
                span: Span {
                    start: self.start,
                    end: self.pos,
                },
            });
            self.advance();
            self.advance();
        } else {
            self.tokens.push(Token {
                token_type: type1,
                value: c.to_string(),
                span: Span {
                    start: self.start,
                    end: self.pos,
                },
            });
            self.advance();
        }
    }
    fn check_next(&mut self, type1: TokenType, cn: char, type2: TokenType) {
        let c = self.current();
        let c2 = self.chars[self.pos + 1];
        if c2 == cn {
            let mut s = String::new();
            s.push(c);
            s.push(cn);
            self.tokens.push(Token {
                token_type: type2,
                value: s,
                span: Span {
                    start: self.start,
                    end: self.pos,
                },
            });
            self.advance();
            self.advance();
        } else {
            self.tokens.push(Token {
                token_type: type1,
                value: c.to_string(),
                span: Span {
                    start: self.start,
                    end: self.pos,
                },
            });
            self.advance();
        }
    }
    fn scan(&mut self) -> Result<(), CompilerError> {
        //println!("{}", self.chars[self.pos]);
        self.start = self.pos;
        match self.current() {
            ' ' | '\r' | '\t' => self.advance(),
            '\n' => {
                self.push(TokenType::NewLine, "str jdid".to_string());
                self.advance()
            }
            '@' => {
                self.push(TokenType::At, self.current().to_string());
                self.advance()
            }
            '÷' | '/' => {
                self.push(TokenType::Div, self.current().to_string());
                self.advance()
            }
            '#' => {
                self.push(TokenType::Hash, self.current().to_string());
                self.advance()
            }
            '^' => {
                self.push(TokenType::Xor, self.current().to_string());
                self.advance()
            }
            '(' => {
                self.push(TokenType::Lparen, self.current().to_string());
                self.advance()
            }
            ')' => {
                self.push(TokenType::Rparen, self.current().to_string());
                self.advance()
            }
            '[' => {
                self.push(TokenType::Lbrack, self.current().to_string());
                self.advance()
            }
            ']' => {
                self.push(TokenType::Rbrack, self.current().to_string());
                self.advance()
            }
            '{' => {
                self.push(TokenType::QLbrack, self.current().to_string());
                self.advance()
            }
            '}' => {
                self.push(TokenType::QRbrack, self.current().to_string());
                self.advance()
            }
            ':' => {
                self.push(TokenType::Colon, self.current().to_string());
                self.advance()
            }
            '×' => {
                self.push(TokenType::Mul, self.current().to_string());
                self.advance()
            }
            ',' => {
                self.push(TokenType::Comma, self.current().to_string());
                self.advance()
            }
            '.' => {
                self.push(TokenType::Point, self.current().to_string());
                self.advance()
            }
            '%' => {
                self.push(TokenType::Percent, self.current().to_string());
                self.advance()
            }
            ';' => {
                self.push(TokenType::Eos, self.current().to_string());
                self.advance()
            }
            '"' | '\'' | '`' => {
                self.read_string()?;
            }
            '*' => {
                self.check_double(TokenType::Mul, TokenType::Power);
            }
            '+' => {
                self.check_double(TokenType::Plus, TokenType::PlusPlus);
            }
            '-' => {
                self.check_double(TokenType::Minus, TokenType::MinusMinus);
            }
            '?' => {
                self.check_double(TokenType::What, TokenType::WhatWhat);
            }
            '=' => {
                self.check_double(TokenType::Equal, TokenType::EqualEqual);
            }
            '|' => {
                self.check_double(TokenType::Or, TokenType::OrOr);
            }
            '&' => {
                self.check_double(TokenType::And, TokenType::AndAnd);
            }
            '$' => {
                self.push(TokenType::Dollar, self.current().to_string());
                self.advance();
            }
            '0'..='9' | 'a'..='z' | 'A'..='Z' | '_' => {
                self.ident_or_maybe_number();
            }
            '~' => {
                self.read_float()?;
            }
            '!' => {
                self.check_next(TokenType::Bang, '=', TokenType::BangEqual);
            }
            '<' => {
                self.check_next(TokenType::Less, '=', TokenType::LessE);
            }
            '>' => {
                self.check_next(TokenType::Greater, '=', TokenType::GtrE);
            }
            _ => {
                return Err(self.err(Er::UnknownSymbol));
            }
        }
        Ok(())
    }
}
