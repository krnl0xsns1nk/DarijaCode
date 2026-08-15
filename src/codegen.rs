use crate::ast::*;
use crate::bytecode::Instruction;


fn compile_expr(expr: Expr) -> Instruction {
    match expr {
        Expr::String(value) => Instruction::PushString(value),
        Expr::Number(value) => Instruction::PushInt(value),
        Expr::Float(value) => Instruction::PushFloat(value),
        Expr::Mnt(value) => Instruction::PushBool(value),
        Expr::Ident(value) => Instruction::Load(value),
    }

}
pub fn compile(program: Program) -> Vec<Instruction> {
    let mut code: Vec<Instruction> = Vec::new();
    
    for stmt in program.stmts {
        match stmt {
            Stmt::Print(expr) => {
                code.push(compile_expr(expr));
                code.push(Instruction::Print);
            }
            Stmt::DeclarVar{name, type_, value} => {
                match type_ {
                    Type::Nss => {
                        code.push(compile_expr(value));
                        code.push(Instruction::Store(name));
                    },
                    Type::Edd => {
                        code.push(compile_expr(value));
                        code.push(Instruction::Store(name));
                    },
                    Type::Exr => {
                        code.push(compile_expr(value));
                        code.push(Instruction::Store(name));
                    },
                    Type::Mnt => {
                        code.push(compile_expr(value));
                        code.push(Instruction::Store(name));
                    },
                }
            }
            Stmt::Assign {name, value} => {
                        code.push(compile_expr(value));
                        code.push(Instruction::Store(name));
            }
        }
    }
    code
}
