use drj::compiler::run;
use std::env;

#[cfg(not(debug_assertions))]
fn hide_panics() {
    std::panic::set_hook(Box::new(|_| {
        eprintln!(
            "drj: w9a3 wahd lmochkil da5ily;\n\"please\" 7l issue m3a lcode dyalk f github.com/krnl0xsns1nk/drj bach t3lmna onsl7o lmochkil."
        );
    }));
}

fn main() {
    #[cfg(not(debug_assertions))]
    hide_panics();
    let mut args = env::args();
    args.next().unwrap();
    match args.next() {
        Some(x) => match x.as_str() {
            "khdm" => match args.next() {
                Some(x) => run(&x),
                None => println!("listi5dam: drj khdm <milf.drj>"),
            },
            _ if x.ends_with(".drj") => run(&x),
            _ => println!("had l2amr mm3rofch: {}", x),
        },
        None => println!("listi5dam: drj khdm <milf.drj>"),
    }
}
