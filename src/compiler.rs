
use std::fs::read_to_string;
use crate::lexer::lexer;
use crate::tokens::Token;
use crate::parser::parser;
use crate::AST::Program;

pub fn compile(filename: &str){
    let source = match read_to_string(filename){
        Ok(source) => source,
        Err(_error) => {
            eprintln!("mal9inach had lmilf: '{}', 7awl tchof mzyan", filename);
            return;
        }
    };
    let tokens: Vec<Token> = match lexer(&source) {
        Ok(tokens) => { tokens }
        Err(error) => { eprintln!("lexer error: {}", error); return;}
    };
    let ast: Program = match parser(&tokens){
        Ok(ast) => { ast }
        Err(error) => {  eprintln!("parser error: {}" error); return; }
    }:
    println!("{}", source);
    println!("{:#?}", tokens);
    println!("{:#?}", ast);
}
