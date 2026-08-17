use crate::ast::*;
use crate::errors::*;
use crate::tokens::*;

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
        while self.pos < self.tokens.len() {
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
            return Err(self.err(Er::UnExpectedToken));
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
    fn expect_expr(&mut self) -> Result<Expr, CompilerError> {
        let mut tokens: Vec<Token> = Vec::new();
        while self.current(0).token_type != TokenType::NewLine
            && self.current(0).token_type != TokenType::Eos
            && self.current(0).token_type != TokenType::Rparen
        {
            tokens.push(self.current(0).clone());
            self.advance();
        }
        if tokens.is_empty() {
            return Err(self.err(Er::NeedExpr));
        }
        if tokens.len() == 1 {
            let that_token = tokens[0].clone();
            let expr = match that_token.token_type {
                TokenType::Nss => Expr::String(that_token.value),
                TokenType::Edd => {
                    let number = that_token
                        .value
                        .parse::<i64>()
                        .map_err(|_| self.err(Er::InvalidNumber))?;
                    Expr::Number(number)
                }
                TokenType::Exr => {
                    let float = that_token
                        .value
                        .parse::<f64>()
                        .map_err(|_| self.err(Er::InvalidFloat))?;
                    Expr::Float(float)
                }
                TokenType::Mnt(value) => Expr::Mnt(value),
                TokenType::Ident => Expr::Ident(that_token.value),
                _ => return Err(self.err(Er::InvalidValue)),
            };
            //            self.advance();
            return Ok(expr);
        }

        Err(self.err(Er::ALotOfExpr))
    }
    fn scan(&mut self) -> Result<(), CompilerError> {
        match self.current(0).token_type {
            TokenType::NewLine | TokenType::Eos => self.advance(),
            TokenType::Kteb => {
                self.advance();
                self.expect(TokenType::Lparen)?;
                let value = self.expect_expr()?;
                //                let value = self.expect(TokenType::Nss)?;
                self.expect(TokenType::Rparen)?;
                self.ast.stmts.push(Stmt::Print(value))
            }
            TokenType::Ident => {
                let ident = self.current(0).value.clone();
                self.advance();
                match self.current(0).token_type {
                    TokenType::Colon => {
                        self.advance();
                        let type_ = self.type_expect()?;
                        self.expect(TokenType::Equal)?;
                        let value = self.expect_expr()?;
                        self.ast.stmts.push(Stmt::DeclarVar {
                            name: ident.to_string(),
                            type_,
                            value,
                        });
                    }
                    TokenType::Equal => {
                        self.advance();
                        let value = self.expect_expr()?;
                        self.ast.stmts.push(Stmt::Assign { name: ident, value });
                    }
                    _ => return Err(self
                            .err(Er::NeedExpr)
                            .info("tw93na chi w7da mn hado: ':' awla '='")),
                }
            }
            _ => return Err(self.err(Er::NeedStmt)),
        }
        Ok(())
    }
}
