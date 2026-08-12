use crate::ast::*;
use crate::tokens::{Token, TokenType};

fn expect(token: &[Token], pos: &mut usize, expected: TokenType) -> Result<String, String> {
    if token[*pos].token_type != expected {
        return Err(format!(
            "kna kantsnaw mnk {:?}, wlkin l9inak dayr {:?}",
            expected, token[*pos].token_type
        ));
    }
    let value = token[*pos].value.clone();
    *pos += 1;
    Ok(value)
}
pub fn parser(tokens: &[Token]) -> Result<Program, String> {
    let mut pos: usize = 0;
    let mut ast: Program = Program { stmts: Vec::new() };

    while pos < tokens.len() {
        let token = &tokens[pos];

        match token.token_type {
            TokenType::Kteb => {
                pos += 1;
                expect(tokens, &mut pos, TokenType::Lparen)?;
                let value = expect(tokens, &mut pos, TokenType::String)?;
                expect(tokens, &mut pos, TokenType::Rparen)?;
                ast.stmts.push(Stmt::Print(Expr::String(value)))
            }
            _ => {
                return Err("had nwa3 mm3rofch".to_string());
            }
        }

        //        pos +=1;
    }
    Ok(ast)
}
