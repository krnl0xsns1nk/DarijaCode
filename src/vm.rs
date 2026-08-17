use crate::bytecode::Instruction;
use std::collections::HashMap;
use std::fmt;

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        match self {
            Value::String(value) => write!(f, "{}", value),
            Value::Int(value) => write!(f, "{}", value),
            Value::Float(value) => write!(f, "{}", value),
            Value::Bool(value) => write!(f, "{}", value),
        }
        .expect("ops");
        Ok(())
    }
}

#[derive(Debug, Clone)]
enum Value {
    String(String),
    Int(i64),
    Float(f64),
    Bool(bool),
}

pub struct VM<'a> {
    code: &'a [Instruction],
    ip: usize,
    stack: Vec<Value>,
    variables: HashMap<String, Value>,
}

impl<'a> VM<'a> {
    pub fn new(code: &'a [Instruction]) -> Self {
        Self {
            code,
            ip: 0,
            stack: Vec::new(),
            variables: HashMap::new(),
        }
    }
    fn pop(&mut self) -> Value {
        self.stack.pop().unwrap()
    }
    fn push(&mut self, v: Value) {
        self.stack.push(v)
    }
    fn insert(&mut self, name: &str, v: Value) {
        self.variables.insert(name.to_string(), v);
    }
    fn get(&self, name: &str) -> Value {
        self.variables.get(name).cloned().unwrap()
    }
    pub fn run(&mut self) {
        while self.ip < self.code.len() {
            match &self.code[self.ip] {
                Instruction::PushString(value) => self.push(Value::String(value.clone())),
                Instruction::PushInt(value) => self.push(Value::Int(*value)),
                Instruction::PushFloat(value) => self.push(Value::Float(*value)),
                Instruction::PushBool(value) => self.push(Value::Bool(*value)),
                Instruction::Store(value) => {
                    let val = self.pop();
                    self.insert(value, val);
                }
                Instruction::Load(value) => self.push(self.get(value)),
                Instruction::Print => println!("{}", self.pop()),
            }
            self.ip += 1;
        }
    }
}
