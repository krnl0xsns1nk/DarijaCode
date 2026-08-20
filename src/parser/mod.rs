use crate::ast::*;
use crate::errors::*;
use crate::lexer::tokens::*;
mod stmts;

pub struct Parser<'a> {
    tokens: &'a [Token],
    pos: usize,
    ast: Program,
}

impl<'a> Parser<'a> {
    pub fn new(tokens: &'a [Token]) -> Self {
        Self {
            tokens,
            pos: 0,
            ast: Program { stmts: Vec::new() },
        }
    }
    pub fn run(mut self) -> Result<Program, CompilerError> {
        while self.pos < self.tokens.len() && self.current(0).token_type != TokenType::Eof {
            self.scan()?;
        }
        Ok(self.ast)
    }
    fn current(&self, offest: usize) -> &Token {
        &self.tokens[self.pos + offest]
    }
    fn advance(&mut self) {
        self.pos += 1;
    }
    fn err(&mut self, er: Er) -> CompilerError {
        CompilerError {
            er,
            span: self.current(0).span.clone(),
            info: None,
        }
    }
    fn expect(&mut self, expected: TokenType) -> Result<String, CompilerError> {
        if self.current(0).token_type != expected {
            return Err(self
                .err(Er::UnExpectedToken)
                .info(self.current(0).value.clone()));
        }
        let value = self.current(0).value.clone();
        self.advance();
        Ok(value)
    }
    fn type_expect(&mut self) -> Result<Type, CompilerError> {
        let token = self.current(0).clone();
        self.advance();
        match token.token_type {
            TokenType::EddType => Ok(Type::Edd),
            TokenType::NssType => Ok(Type::Nss),
            TokenType::ExrType => Ok(Type::Exr),
            TokenType::MntType => Ok(Type::Mnt),
            //            TokenType::Ident => Ok(self.current(0).value),  //custom typrs in the futur
            _ => Err(self.err(Er::UnknownType)),
        }
    }
    fn push0(&mut self, node: ExprKind, span: Span) -> Expr {
        Spanned { node, span }
    }
    fn parse_primary(&mut self) -> Result<Expr, CompilerError> {
        match self.current(0).token_type {
            TokenType::Nss => {
                let value = self.current(0).value.clone();
                let span = self.current(0).span.clone();
                self.advance();
                Ok(self.push0(ExprKind::String(value), span))
            }
            TokenType::Edd => {
                let number = self
                    .current(0)
                    .value
                    .parse::<i64>()
                    .map_err(|_| self.err(Er::InvalidNumber))?;
                let span = self.current(0).span.clone();
                self.advance();

                Ok(self.push0(ExprKind::Number(number), span))
            }
            TokenType::Exr => {
                let float = self
                    .current(0)
                    .value
                    .parse::<f64>()
                    .map_err(|_| self.err(Er::InvalidFloat))?;
                let span = self.current(0).span.clone();
                self.advance();

                Ok(self.push0(ExprKind::Float(float), span))
            }
            TokenType::Mnt(value) => {
                let span = self.current(0).span.clone();
                self.advance();
                Ok(self.push0(ExprKind::Mnt(value), span))
            }
            TokenType::Ident => {
                let value = self.current(0).value.clone();
                let span = self.current(0).span.clone();
                self.advance();

                let v = Ident {
                    name: value,
                    span: span.clone(),
                };

                Ok(self.push0(ExprKind::Ident(v), span.clone()))
            }
            TokenType::Lparen => {
                self.advance();
                let expr = self.parse_expr()?;
                self.expect(TokenType::Rparen)?;

                // self.advance();
                Ok(expr)
            }
            _ => Err(self.err(Er::InvalidValue)),
        }
    }
    fn parse_expr(&mut self) -> Result<Expr, CompilerError> {
        self.parse_add()
    }

    fn parse_add(&mut self) -> Result<Expr, CompilerError> {
        let start = self.current(0).span.start;
        let mut left = self.parse_mul()?;

        loop {
            let op = match self.current(0).token_type {
                TokenType::Plus => BinaryOp::Add,
                TokenType::Minus => BinaryOp::Sub,
                _ => break,
            };
            self.advance();
            let right = self.parse_mul()?;
            let end = right.span.end;
            left = self.push0(
                ExprKind::Binary {
                    left: Box::new(left),
                    op,
                    right: Box::new(right),
                },
                Span { start, end },
            );
        }
        Ok(left)
    }

    fn parse_mul(&mut self) -> Result<Expr, CompilerError> {
        let start = self.current(0).span.start;
        let mut left = self.parse_primary()?;

        loop {
            let op = match self.current(0).token_type {
                TokenType::Mul => BinaryOp::Mul,
                TokenType::Div => BinaryOp::Div,
                _ => break,
            };
            self.advance();
            let end = self.current(0).span.end;
            let right = self.parse_primary()?;
            left = self.push0(
                ExprKind::Binary {
                    left: Box::new(left),
                    op,
                    right: Box::new(right),
                },
                Span { start, end },
            );
        }
        Ok(left)
    }

    fn scan(&mut self) -> Result<(), CompilerError> {
        match self.current(0).token_type {
            TokenType::NewLine | TokenType::Eos => self.advance(),
            TokenType::Kteb => self.read_kteb()?,
            TokenType::Ident => self.read_ident()?,
            _ => return Err(self.err(Er::NeedStmt)),
        }
        Ok(())
    }
}
