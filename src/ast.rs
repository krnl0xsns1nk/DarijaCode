#[derive(Debug)]
pub enum Expr {
    String(String),
    Number(i64),
    Ident(String),
}

#[derive(Debug)]
pub enum Stmt {
    Print(Expr),

    DeclarVar {
        name: String,
        type_: Type,
        value: Expr
    },

    Assign {
        name: String,
        value: Expr
    }
}

#[derive(Debug)]
pub enum Type {
    Nss,
    Edd,
    Tona2i,
    Likan

}

#[derive(Debug)]
pub struct Program {
    pub stmts: Vec<Stmt>,
}
