use super::compile_source;
use drj::bytecode::Instruction;

#[test]
fn print_loads_ident_then_prints() {
    let code = compile_source("x : 3dd = 5\nkteb(x);");
    assert_eq!(code, vec![
        Instruction::PushInt(5),
        Instruction::Store("x".to_string()),
        Instruction::Load("x".to_string()),
        Instruction::Print,
    ]);
}
