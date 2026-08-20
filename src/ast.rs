use crate::lexer::tokens::Span;
use std::fmt;

#[derive(Debug)]
pub enum ExprKind {
    String(String),
    Number(i64),
    Float(f64),
    Ident(Ident),
    Mnt(bool),

    Binary {
        left: Box<Expr>,
        op: BinaryOp,
        right: Box<Expr>,
    },
}

pub type Expr = Spanned<ExprKind>;
#[derive(Debug)]
pub struct Spanned<T> {
    pub node: T,
    pub span: Span,
}
#[derive(Debug)]
pub enum BinaryOp {
    Add,
    Mul,
    Sub,
    Div,
}

#[derive(Debug, Clone)]
pub struct Ident {
    pub name: String,
    pub span: Span,
}

#[derive(Debug, Clone)]
pub struct TypeName {
    pub name: String,
    pub type_: Type,
    pub span: Span,
}

#[derive(Debug)]
pub enum Stmt {
    Print(Expr),

    DeclarVar {
        name: Ident,
        type_: Option<TypeName>,
        value: Expr,
    },

    Assign {
        name: Ident,
        value: Expr,
    },
}

impl fmt::Display for Type {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        match self {
            Type::Nss => write!(f, "nss"),
            Type::Edd => write!(f, "3dd"),
            Type::Exr => write!(f, "3xr"),
            Type::Mnt => write!(f, "mnt"),
        }
        .expect("ops");
        Ok(())
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum Type {
    Nss,
    Edd,
    Exr,
    Mnt,
}

#[derive(Debug)]
pub struct Program {
    pub stmts: Vec<Stmt>,
}
