use crate::parser::*;

impl<'a> Parser<'a> {
    pub fn read_kteb(&mut self) -> Result<(), CompilerError> {
        self.advance();
        self.expect(TokenType::Lparen)?;
        let value = self.parse_expr()?;
        self.expect(TokenType::Rparen)?;
        self.ast.stmts.push(Stmt::Print(value));
        Ok(())
    }
    pub fn read_ident(&mut self) -> Result<(), CompilerError> {
        let ident = self.current(0);
        let ident0 = Ident {
            name: ident.value.clone(),
            span: ident.span.clone(),
        };

        self.advance();
        match self.current(0).token_type {
            TokenType::Colon => {
                self.advance();
                let type0 = self.current(0).clone();
                let type_ = self.type_expect()?;
                self.expect(TokenType::Equal)?;
                let value = self.parse_expr()?;
                self.ast.stmts.push(Stmt::DeclarVar {
                    name: ident0,
                    type_: Some(TypeName {
                        name: type0.value.clone(),
                        type_,
                        span: type0.span.clone(),
                    }),
                    value,
                });
                Ok(())
            }
            TokenType::Equal => {
                self.advance();
                let value = self.parse_expr()?;
                self.ast.stmts.push(Stmt::Assign {
                    name: ident0,
                    value,
                });
                Ok(())
            }
            TokenType::ColonEqual => {
                self.advance();
                let value = self.parse_expr()?;
                self.ast.stmts.push(Stmt::DeclarVar {
                    name: ident0,
                    type_: None,
                    value,
                });
                Ok(())
            }
            _ => Err(self
                .err(Er::NeedExpr)
                .info("tw93na chi w7da mn hado: ':' awla '='")),
        }
    }
}
