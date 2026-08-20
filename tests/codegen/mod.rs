mod binary_expr;
mod declare_var;
mod print;

use drj::bytecode::Instruction;
use drj::codegen::compile;
use drj::lexer::Lexer;
use drj::parser::Parser;

pub fn compile_source(src: &str) -> Vec<Instruction> {
    let tokens = Lexer::new(src).run().expect("lexer should succeed");
    let ast = Parser::new(&tokens).run().expect("parser should succeed");
    compile(ast)
}
