use crate::ast::*;
use crate::bytecode::Instruction;

fn compile_expr(code: &mut Vec<Instruction>, expr: Expr) {
    match expr {
        Expr::String(value) => code.push(Instruction::PushString(value)),
        Expr::Number(value) => code.push(Instruction::PushInt(value)),
        Expr::Float(value) => code.push(Instruction::PushFloat(value)),
        Expr::Mnt(value) => code.push(Instruction::PushBool(value)),
        Expr::Ident(value) => code.push(Instruction::Load(value)),
        Expr::Binary{left, op, right } => {
            compile_expr(code, *left);
            compile_expr(code, *right);
            code.push(push_op(op));
        },
    }
}
fn push_op(op: BinaryOp) -> Instruction {
    match op {
        BinaryOp::Add => Instruction::Add,
        BinaryOp::Sub => Instruction::Sub,
        BinaryOp::Mul => Instruction::Mul,
        BinaryOp::Div => Instruction::Div,
    }
}
pub fn compile(program: Program) -> Vec<Instruction> {
    let mut code: Vec<Instruction> = Vec::new();

    for stmt in program.stmts {
        match stmt {
            Stmt::Print(expr) => {
                compile_expr(&mut code, expr);
                code.push(Instruction::Print);
            }
            Stmt::DeclarVar { name, type_, value } => match type_ {
                Type::Nss => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name));
                }
                Type::Edd => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name));
                }
                Type::Exr => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name));
                }
                Type::Mnt => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name));
                }
            },
            Stmt::Assign { name, value } => {
                compile_expr(&mut code, value);
                code.push(Instruction::Store(name));
            },
        }
    }
    code
}
