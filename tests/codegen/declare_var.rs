use super::compile_source;
use drj::bytecode::Instruction;

#[test]
fn declares_and_stores_string() {
    let code = compile_source(r#"x : nss = "hi""#);
    assert_eq!(
        code,
        vec![
            Instruction::PushString("hi".to_string()),
            Instruction::Store("x".to_string()),
        ]
    );
}

#[test]
fn declares_and_stores_bool() {
    let code = compile_source("x : mnt = ah");
    assert_eq!(
        code,
        vec![
            Instruction::PushBool(true),
            Instruction::Store("x".to_string()),
        ]
    );
}
