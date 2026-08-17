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
    fn add(&mut self){
        let v1 = self.pop();
        let v2 = self.pop();
        let v3 =match (v1, v2) {
            (Value::Int(a), Value::Int(b)) => Value::Int(a + b),
            (Value::Float(a), Value::Float(b)) => Value::Float(a + b),
            (Value::Float(a), Value::Int(b)) => Value::Float(a + b as f64),
            (Value::Int(a), Value::Float(b)) => Value::Float(a as f64 + b),
            (Value::String(a), Value::String(b)) => Value::String(format!("{}{}", a, b)),
            _ => panic!("\x1b[31m4alat[DVE1]\x1b[0m"),
        };
        self.push(v3);
    }
    fn sub(&mut self){
        let right = self.pop();
        let left = self.pop();
        let v3 =match (left, right) {
            (Value::Int(a), Value::Int(b)) => Value::Int(a - b),
            (Value::Float(a), Value::Float(b)) => Value::Float(a - b),
            (Value::Float(a), Value::Int(b)) => Value::Float(a - b as f64),
            (Value::Int(a), Value::Float(b)) => Value::Float(a as f64 - b),
            _ => panic!("\x1b[31m4alat[DVE1]\x1b[0m"),
        };
        self.push(v3);
    }
    fn mul(&mut self){
        let right = self.pop();
        let left = self.pop();
        let v3 =match (left, right) {
            (Value::Int(a), Value::Int(b)) => Value::Int(a * b),
            (Value::Float(a), Value::Float(b)) => Value::Float(a * b),
            (Value::Float(a), Value::Int(b)) => Value::Float(a * b as f64),
            (Value::Int(a), Value::Float(b)) => Value::Float(a as f64 * b),
            (Value::String(a), Value::Int(b)) => Value::String(format!("{}", a.repeat(b as usize))),
            _ => panic!("\x1b[31m4alat[DVE1]\x1b[0m"),
        };
        self.push(v3);
    }
    // oh my html <div>
    fn div(&mut self){
        let right = self.pop();
        let left = self.pop();
        let v3 =match (left, right) {
            (Value::Int(a), Value::Int(b)) => Value::Int(a / b),
            (Value::Float(a), Value::Float(b)) => Value::Float(a / b),
            (Value::Float(a), Value::Int(b)) => Value::Float(a / b as f64),
            (Value::Int(a), Value::Float(b)) => Value::Float(a as f64 / b),
            _ => panic!("\x1b[31m4alat[DVE1]\x1b[0m"),
        };
        self.push(v3);
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
                Instruction::Add => self.add(),
                Instruction::Sub => self.sub(),
                Instruction::Mul => self.mul(),
                Instruction::Div => self.div(),
            }
            self.ip += 1;
        }
    }
}
