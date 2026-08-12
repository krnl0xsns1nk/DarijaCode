use crate::ast::*;
use crate::bytecode::Instruction;

pub fn compile(program: Program) -> Vec<Instruction> {
    let mut code: Vec<Instruction> = Vec::new();
    for stmt in program.stmts {
        match stmt {
            Stmt::Print(Expr::String(value)) => {
                code.push(Instruction::Print(value));
            }
        }
    }
    code
}
