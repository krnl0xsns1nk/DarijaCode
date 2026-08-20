use drj::bytecode::*;
use drj::vm::*;

#[test]
fn adds_two_ints() {
    let code = vec![
        Instruction::PushInt(2),
        Instruction::PushInt(3),
        Instruction::Add,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::Int(5));
}

#[test]
fn subtracts_in_correct_order() {
    // 10 - 3, must be 7, NOT -7 (this is the bug class we just fixed)
    let code = vec![
        Instruction::PushInt(10),
        Instruction::PushInt(3),
        Instruction::Sub,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::Int(7));
}

#[test]
fn divides_in_correct_order_and_widens_to_float() {
    // 10 / 5, must be 2.0, NOT 5/10 = 0.5
    let code = vec![
        Instruction::PushInt(10),
        Instruction::PushInt(5),
        Instruction::Div,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::Float(2.0));
}

#[test]
fn concatenates_strings_in_source_order() {
    // the exact bug: "hello" + "world" must NOT become "worldhello"
    let code = vec![
        Instruction::PushString("hello".to_string()),
        Instruction::PushString("world".to_string()),
        Instruction::Add,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::String("helloworld".to_string()));
}

#[test]
fn repeats_string_by_int() {
    // "ab" * 3 -> "ababab"
    let code = vec![
        Instruction::PushString("ab".to_string()),
        Instruction::PushInt(3),
        Instruction::Mul,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::String("ababab".to_string()));
}

#[test]
fn nested_precedence_evaluates_correctly() {
    // 2 + 3 * 4 => 14, not 20
    let code = vec![
        Instruction::PushInt(2),
        Instruction::PushInt(3),
        Instruction::PushInt(4),
        Instruction::Mul,
        Instruction::Add,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::Int(14));
}
#[test]
fn negative_multiplier_reverses_string() {
    let code = vec![
        Instruction::PushString("hello".to_string()),
        Instruction::PushInt(-2),
        Instruction::Mul,
        Instruction::Store("x".to_string()),
    ];
    let mut vm = VM::new(&code);
    vm.run();
    assert_eq!(vm.get("x"), Value::String("olleholleh".to_string()));
}
