use std::env;
mod compiler;
mod lexer;
mod tokens;
mod AST;
mod parser;
use compiler::compile;

fn main() {
    let mut args = env::args();
    args.next().unwrap();
    match args.next() {
        Some(x) => match x.as_str() {
            "khdm" => match args.next(){
                Some(x) => compile(&x),
                None => println!("listi5dam: drj khdm <milf.drj>"),
            }
            _ if x.ends_with(".drj") => compile(&x),
            _ => println!("had l2amr mm3rofch: {}", x),
        },
        None => println!("listi5dam: drj khdm <milf.drj>"),
    }
}
