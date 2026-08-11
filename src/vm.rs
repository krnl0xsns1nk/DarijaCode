

use crate::bytecode::Instruction;

pub fn the_vm(code: &[Instruction]){
    let mut ip = 0;
    while ip < code.len() {
        match &code[ip] {
            Instruction::Print(value) => {
                println!("{}", value);
            }
        }
        ip += 1;
    }

}
