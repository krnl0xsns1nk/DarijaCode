use super::compile_source;
use drj::bytecode::Instruction;

#[test]
fn add_pushes_left_before_right() {
    let code = compile_source("x : 3dd = 5 + 3");
    assert_eq!(code, vec![
        Instruction::PushInt(5),
        Instruction::PushInt(3),
        Instruction::Add,
        Instruction::Store("x".to_string()),
    ]);
}

#[test]
fn string_concat_pushes_left_before_right() {
    // the exact case that exposed the bug: order here must match source order
    let code = compile_source(r#"x := "hello" + "world""#);
    assert_eq!(code, vec![
        Instruction::PushString("hello".to_string()),
        Instruction::PushString("world".to_string()),
        Instruction::Add,
        Instruction::Store("x".to_string()),
    ]);
}

#[test]
fn nested_binary_respects_precedence_in_bytecode() {
    // 2 + 3 * 4 -> should compile 3,4,Mul BEFORE the outer Add's right side resolves
    let code = compile_source("x : 3dd = 2 + 3 * 4");
    assert_eq!(code, vec![
        Instruction::PushInt(2),
        Instruction::PushInt(3),
        Instruction::PushInt(4),
        Instruction::Mul,
        Instruction::Add,
        Instruction::Store("x".to_string()),
    ]);
}

#[test]
fn sub_pushes_left_before_right() {
    // order matters for non-commutative ops: 10 - 3, not 3 - 10
    let code = compile_source("x : 3dd = 10 - 3");
    assert_eq!(code, vec![
        Instruction::PushInt(10),
        Instruction::PushInt(3),
        Instruction::Sub,
        Instruction::Store("x".to_string()),
    ]);
}
