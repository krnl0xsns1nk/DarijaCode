

use crate::AST::Program;
use crate::tokens::{Token, TokenType};

pub fn parser(tokens: &[Token]) -> Result<Program, String>{
    let mut pos: usize = 0;
    while pos < tokens.len() {
        let token = &tokens[pos];

        match token.token_type {
            TokenType::KTEB => {}
            _ => {
            }
            
        }

        pos +=1;
    }
}
