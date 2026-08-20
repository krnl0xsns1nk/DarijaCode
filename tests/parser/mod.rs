mod assign;
mod binary_expr;
mod declare_var;

pub fn parse_source(src: &str) -> drj::ast::Program {
    let tokens = drj::lexer::Lexer::new(src)
        .run()
        .expect("lexer should succeed for this test input");

    drj::parser::Parser::new(&tokens)
        .run()
        .expect("parser should succeed for this test input")
}
