use crate::ast::*;
use crate::errors::*;
use crate::lexer::tokens::*;

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
        println!("expect: {:#?}", self.current(0));
        if self.current(0).token_type != expected {
            return Err(self.err(Er::UnExpectedToken).info(self.current(0).value.clone()));
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
    fn parse_primary(&mut self) -> Result<Expr, CompilerError> {
        println!("primary: {:#?}", self.current(0));
            match self.current(0).token_type {
                TokenType::Nss => {
                    let value = self.current(0).value.clone();
                    self.advance();
                    Ok(Expr::String(value))
                },
                TokenType::Edd => {
                    let number = self.current(0)
                        .value
                        .parse::<i64>()
                        .map_err(|_| self.err(Er::InvalidNumber))?;

                    self.advance();
                    Ok(Expr::Number(number))
                },
                TokenType::Exr => {
                    let float = self.current(0)
                        .value
                        .parse::<f64>()
                        .map_err(|_| self.err(Er::InvalidFloat))?;

                    self.advance();
                    Ok(Expr::Float(float))
                },
                TokenType::Mnt(value) => {
                    self.advance();
                    Ok(Expr::Mnt(value))
                },
                TokenType::Ident => {
                    let value = self.current(0).value.clone();

                    self.advance();
                    Ok(Expr::Ident(value))
                },
                TokenType::Lparen => {
                    self.advance();
                    let expr = self.parse_expr()?;
                    self.expect(TokenType::Rparen)?;


                   // self.advance();
                    Ok(expr)
                },
                _ => return Err(self.err(Er::InvalidValue)),
            }
    }
    fn parse_expr(&mut self) -> Result<Expr, CompilerError> {
        println!("parse expect: {:#?}", self.current(0));
        self.parse_add()
    }
    
    fn parse_add(&mut self) -> Result<Expr, CompilerError> {
        println!("parse addd: {:#?}", self.current(0));
        let mut left = self.parse_mul()?;

        loop {
            let op = match self.current(0).token_type {
            TokenType::Plus => BinaryOp::Add,
            TokenType::Minus => BinaryOp::Sub,
            _ => break,
        };
            self.advance();
            let right = self.parse_mul()?;
            left = Expr::Binary {
                    left: Box::new(left),
                    op,
                    right: Box::new(right),
        };
        }
        Ok(left)
    }

    fn parse_mul(&mut self) -> Result<Expr, CompilerError> {
        println!("parse mul: {:#?}", self.current(0));
        let mut left = self.parse_primary()?;

        loop {
            let op = match self.current(0).token_type {
            TokenType::Mul => BinaryOp::Mul,
            TokenType::Div => BinaryOp::Div,
            _ => break,
        };
            self.advance();
            let right = self.parse_primary()?;
            left = Expr::Binary {
                    left: Box::new(left),
                    op,
                    right: Box::new(right),
        };
        }
        Ok(left)
    }

    fn scan(&mut self) -> Result<(), CompilerError> {
        match self.current(0).token_type {
            TokenType::NewLine | TokenType::Eos => self.advance(),
            TokenType::Kteb => {
                self.advance();
                self.expect(TokenType::Lparen)?;
                println!("the self.current value before doing parse_expr: {:#?}", self.current(0));
                let value = self.parse_expr()?;
                println!("the self.current value after doing parse_expr: {:#?}, the value of the expr the value : {:#?}", self.current(0), value);
                self.expect(TokenType::Rparen)?;
                println!("the value immiditly before put it onside the ast : {:#?}", value);
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
                        let value = self.parse_expr()?;
                        self.ast.stmts.push(Stmt::DeclarVar {
                            name: ident.to_string(),
                            type_,
                            value,
                        });
                    }
                    TokenType::Equal => {
                        self.advance();
                        let value = self.parse_expr()?;
                        self.ast.stmts.push(Stmt::Assign { name: ident, value });
                    }
                    _ => {
                        return Err(self
                            .err(Er::NeedExpr)
                            .info("tw93na chi w7da mn hado: ':' awla '='"));
                    }
                }
            }
            _ => return Err(self.err(Er::NeedStmt)),
        }
        Ok(())
    }
}
