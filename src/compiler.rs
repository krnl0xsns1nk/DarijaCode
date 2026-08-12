use crate::ast::Program;
use crate::bytecode::Instruction;
use crate::codegen::compile;
use crate::lexer::lexer;
use crate::parser::parser;
use crate::tokens::Token;
use crate::vm::the_vm;
use std::fs::read_to_string;

pub fn run(filename: &str) {
    let source = match read_to_string(filename) {
        Ok(source) => source,
        Err(_error) => {
            eprintln!("mal9inach had lmilf: '{}', 7awl tchof mzyan", filename);
            return;
        }
    };
    //    println!("{}", source);
    let tokens: Vec<Token> = match lexer(&source) {
        Ok(tokens) => tokens,
        Err(error) => {
            eprintln!("lexer error: {}", error);
            return;
        }
    };
    //    println!("{:#?}", tokens);
    let ast: Program = match parser(&tokens) {
        Ok(ast) => ast,
        Err(error) => {
            eprintln!("parser error: {}", error);
            return;
        }
    };
    //    println!("{:#?}", ast);
    let codegen: Vec<Instruction> = compile(ast);
    //    println!("{:#?}", codegen);
    the_vm(&codegen);
}
