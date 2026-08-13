use crate::tokens::{Token, TokenType};

pub struct Lexer {
    chars: Vec<char>,
    tokens: Vec<Token>,
    pos: usize,
}

impl Lexer {
    pub fn new(source: &str) -> Self {
        Self {
            chars: source.chars().collect(),
            tokens: Vec::new(),
            pos: 0,
        }
    }

    pub fn run(&mut self) -> Result<Vec<Token>, String> {
        while self.pos < self.chars.len() {
            self.scan()?;
        }
        Ok(self.tokens.clone())
    }
    fn current(&self) -> char {
        self.chars[self.pos]
    }
    fn advance(&mut self) {
        self.pos += 1;
    }
    fn push(&mut self, its_type: TokenType, its_value: String) {
        self.tokens.push(Token {
            token_type: its_type,
            value: its_value,
        });
    }
    fn read_string(&mut self) -> Result<(), String> {
        let parent = self.current();
        self.advance();
        let mut value = String::new();
        while self.pos < self.chars.len() && self.current() != parent {
            value.push(self.current());
            self.advance();
        }
        if self.pos >= self.chars.len() && self.chars[self.pos - 1] != parent {
            return Err("nass khaso isali bwah7da mmn hado  \", \', ` (bdakchi li bditi bih nass) 9bal maysali lmifl".to_string());
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

        let is_number = first.is_ascii_digit() && value.chars().all(|c| c.is_ascii_digit() || c == '_');
        if is_number && value.chars().any(|c| c.is_ascii_digit()) {
            value = value.replace('_', "");
            self.push(TokenType::Edd, value);
        } else {
            self.tokens.push(Token {
            token_type: match value.as_str() {
                "kteb" => TokenType::Kteb,
                "nss" => TokenType::NssType,
                "3dd" => TokenType::EddType,
                "tona2i" => TokenType::Tona2iType,
                "likan" => TokenType::LikanType,
                "ah" => TokenType::Ah,
                "la" => TokenType::La,
                _ => TokenType::Ident,
            },
            value: value
        });
        }
    }
    fn check_double(&mut self, type1: TokenType, type2: TokenType) {
        let c = self.current().clone();
        let c2 = self.chars[self.pos + 1].clone();
        if c2 == c {
            let mut  s = String::new();
            s.push(c);
            s.push(c2);
            self.tokens.push(Token {
                token_type: type2,
                value: s,
            });
            self.advance();
            self.advance();
        } else {
            self.tokens.push(Token {
                token_type: type1,
                value: c.to_string(),
            });
            self.advance();
        }
    }
    fn scan(&mut self) -> Result<(), String> {
        //println!("{}", self.chars[self.pos]);
        match self.current() {
            ' ' | '\r' | '\t' => self.advance(),
            '\n' => {
                self.push(TokenType::NewLine, "newline".to_string());
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
            '!' => {
                self.push(TokenType::Bang, self.current().to_string());
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
                self.push(TokenType::Rparen, self.current().to_string());
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
            '>' => {
                self.push(TokenType::Greater, self.current().to_string());
                self.advance()
            }
            '<' => {
                self.push(TokenType::Less, self.current().to_string());
                self.advance()
            }
            '"' | '\'' | '`' => {
                self.read_string()?;
            }
            '*' => {
                self.check_double(TokenType::Star, TokenType::Power);
            }
            '+' => {
                self.check_double(TokenType::Plus, TokenType::PlusPlus);
            }
            '-' => {
                self.check_double(TokenType::Minus, TokenType::Minus);
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
            _ => {
                return Err(format!("had ramz mm3rofch 3ndna: '{}'", self.current()));
            }
        }
        Ok(())
    }
}
