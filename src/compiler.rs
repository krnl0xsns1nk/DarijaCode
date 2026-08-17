use crate::ast::Program;
use crate::bytecode::Instruction;
use crate::codegen::compile;
use crate::errors::*;
use crate::lexer::tokens::*;
use crate::lexer::*;
use crate::parser::Parser;
use crate::vm::VM;
use std::fs::read_to_string;

pub fn run(filename: &str) {
    let source = match read_to_string(filename) {
        Ok(source) => source,
        Err(_error) => {
            eprintln!("ghalat[DCE1]:");
            eprintln!("mal9inach had lmilf : '{}', 7awl tchof mzyan", filename);
            return;
        }
    };
    //println!("{}", source);
    let mut lexer: Lexer = Lexer::new(&source);
    let tokens: Vec<Token> = match lexer.run() {
        Ok(tokens) => tokens,
        Err(error) => {
            show_err(filename, error);
            return;
        }
    };
    //println!("{:#?}", tokens);

    let parser: Parser = Parser::new(&tokens);
    let ast: Program = match parser.run() {
        Ok(ast) => ast,
        Err(error) => {
            show_err(filename, error);
            return;
        }
    };
    // println!("{:#?}", ast);

    let codegen: Vec<Instruction> = compile(ast);
    // println!("{:#?}", codegen);
    let mut vm: VM = VM::new(&codegen);
    vm.run();
}
