
use std::fs::read_to_string;
use crate::lexer::Lexer;
use crate::tokens::Token;

pub fn compile(filename: &str){
    let source = match read_to_string(filename){
        Ok(source) => source,
        Err(_error) => {
            eprintln!("mal9inach had lmilf: '{}', 7awl tchof mzyan", filename);
            return;
        }
    };
    let tokens: Vec<Token> = match Lexer(&source) {
        Ok(tokens) => { tokens }
        Err(error) => { eprintln!("lexer error: {}", error); return;}
    };
    println!("{}", source);
    println!("{:#?}", tokens);
}
