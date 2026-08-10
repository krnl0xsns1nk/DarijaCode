use std::env;
mod hello;
use hello::itIsWorking;

fn main() {
    println!("wafin, al3alm!");
    let ans: &str = "yes";
    let mut args = env::args();
    args.next().unwrap();
    match args.next() {
        Some(x) => match x.as_str() {
            "khdm" => itIsWorking(&ans),
            _ => println!("had l2amr mm3rofch: {}", x),
        },
        None => println!("listi5dam: drj khdm <milf.drj>"),
    }
}
