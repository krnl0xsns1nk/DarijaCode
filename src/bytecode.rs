#[derive(Debug)]
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
}
