#[derive(Debug, PartialEq)]
pub enum Instruction {
    // print
    Print,

    //push value
    PushString(String),
    PushInt(i64),
    PushFloat(f64),
    PushBool(bool),

    // store && Load
    Store(String),
    Load(String),

    // operations:
    Add,
    Sub,
    Mul,
    Div,

    // unary
    Neg,
}
