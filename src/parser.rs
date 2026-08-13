use crate::ast::*;
use crate::tokens::{Token, TokenType};

pub struct Parser<'a> {
    tokens: &'a [Token],
    pos: usize,
    ast: Program
}

impl<'a> Parser<'a> {
    pub fn new(tokens: &'a [Token]) -> Self {
        Self {
            tokens: tokens,
            pos: 0,
            ast: Program {
                stmts: Vec::new()
            }
        }
    }
    pub fn run(mut self) -> Result<Program, String> {
        while self.pos < self.tokens.len() {
            self.scan()?;
        }
        Ok(self.ast)
    }
    fn current(&self, offest: usize) -> &Token {
        &self.tokens[self.pos + offest]
    }
    fn advance(&mut self){
        self.pos +=1;
    }
    fn expect(&mut self, expected: TokenType) -> Result<String, String> {
    if self.current(0).token_type != expected {
        return Err(format!(
            "kna kantsnaw mnk {:?}, wlkin l9inak dayr {:?}",
            expected, self.current(0).token_type
        ));
    }
    let value = self.current(0).value.clone();
    self.advance();
    Ok(value)
    }
    fn type_expect(&mut self) -> Result<Type, String> {
        let token = self.current(0).clone();
        self.advance();
        match token.token_type {
            TokenType::EddType => Ok(Type::Edd),
            TokenType::NssType => Ok(Type::Nss),
//            TokenType::Ident => Ok(self.current(0).value),  //custom typrs in the futur
            _ => Err(format!("hada machi naw3 m9ad: '{}', stkhdm chi naw3 mojod bhal: (nss, 3dd, tona2i, etc...)", self.current(0).value))
        }
    }
    fn expect_expr(&mut self) -> Result<Expr, String> {
        let mut tokens: Vec<Token> = Vec::new();
        let first = self.current(0).clone();
        while self.current(0).token_type != TokenType::NewLine && self.current(0).token_type != TokenType::Eos {
            tokens.push(self.current(0).clone());
            self.advance();
        }
        if tokens.len() < 1 { return Err(format!("khask chi ta3bir mora: '{}'", first.value)); }
        if tokens.len() == 1 {
            let that_token = tokens[0].clone();
            let expr = match that_token.token_type {
                TokenType::Nss => Expr::String(that_token.value),
                TokenType::Edd => {
                    let number = that_token.value.parse::<i64>().map_err(|_| format!("had l9ima machi 3dd: '{}'", that_token.value))?;
                    Expr::Number(number)
                }
                TokenType::Ident => Expr::Ident(that_token.value),
                _ => return Err(format!("had l9ima mmd3omach '{}', dir chi 9ima m9ada", that_token.value)),
            };
            self.advance();
            return Ok(expr);
        }
        return Err(format!("drti bzaf dyal ta3abir, hadchi mmd3omch 7alyan"))
    }
    fn scan(&mut self)-> Result<(), String> {
        match  self.current(0).token_type {
            TokenType::NewLine | TokenType::Eos => self.advance(),
            TokenType::Kteb => {
                self.advance();
                self.expect(TokenType::Lparen)?;
                let value = self.expect(TokenType::Nss)?;
                self.expect(TokenType::Rparen)?;
                self.ast.stmts.push(Stmt::Print(Expr::String(value)))
            },
            TokenType::Ident => {
                let ident = self.current(0).value.clone();
                self.advance();
                match self.current(0).token_type {
                    TokenType::Colon => {
                        self.advance();
                        let type_ = self.type_expect()?;;
                        self.expect(TokenType::Equal)?;
                        let value = self.expect_expr()?;
                        self.ast.stmts.push(Stmt::DeclarVar{
                            name: ident.to_string(),
                            type_: type_,
                            value: value,
                        });
                    }
                    TokenType::Equal => {
                        self.advance();
                        let value = self.expect_expr()?;
                        self.ast.stmts.push(Stmt::Assign{
                            name: ident,
                            value: value
                        });
                    }
                    _ => todo!(),
                }
            }
            _ => {
                return Err("had nwa3 mm3rofch".to_string());
            }
        }
        Ok(())
    }

}
