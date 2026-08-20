use crate::ast::*;
use crate::bytecode::Instruction;

fn compile_expr(code: &mut Vec<Instruction>, expr: Expr) {
    match expr.node {
        ExprKind::String(value) => code.push(Instruction::PushString(value)),
        ExprKind::Number(value) => code.push(Instruction::PushInt(value)),
        ExprKind::Float(value) => code.push(Instruction::PushFloat(value)),
        ExprKind::Mnt(value) => code.push(Instruction::PushBool(value)),
        ExprKind::Ident(value) => code.push(Instruction::Load(value.name)),
        ExprKind::Binary { left, op, right } => {
            compile_expr(code, *left);
            compile_expr(code, *right);
            code.push(push_op(op));
        }
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
            Stmt::DeclarVar { name, value, .. } => {
                compile_expr(&mut code, value);
                code.push(Instruction::Store(name.name));

                /*                Type::Nss => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name.name));
                }
                Type::Edd => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name.name));
                }
                Type::Exr => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name.name));
                }
                Type::Mnt => {
                    compile_expr(&mut code, value);
                    code.push(Instruction::Store(name.name));
                }*/
            }
            Stmt::Assign { name, value } => {
                compile_expr(&mut code, value);
                code.push(Instruction::Store(name.name));
            }
        }
    }
    code
}
