mod assign;
mod binary_expr;
mod declare_var;

use drj::checker::Checker;
use drj::errors::{CompilerError, Er};
use drj::lexer::Lexer;
use drj::parser::Parser;

pub fn check_source(src: &str) -> Result<(), CompilerError> {
    let tokens = Lexer::new(src).run().expect("lexer should succeed");
    let ast = Parser::new(&tokens).run().expect("parser should succeed");
    Checker::new(&ast).run()
}

// helper so test bodies read cleanly: assert_err(result, Er::TypeMismatch)
pub fn assert_err(result: Result<(), CompilerError>, expected: Er) {
    match result {
        Ok(_) => panic!("expected error {:?}, but checker returned Ok", expected),
        Err(e) => assert_eq!(e.er, expected, "wrong error variant"),
    }
}
