
#[derive(Debug)]
pub enum Expr {
    String(String)
}

#[derive(Debug)]
pub enum Stmt {
    Print(Expr)
}

#[derive(Debug)]
pub struct Program{
    pub stmts: Vec<Stmt>
}

