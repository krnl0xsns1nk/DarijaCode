use crate::ast::*;
use crate::errors::*;
use crate::lexer::tokens::Span;
use std::collections::HashMap;

pub struct Checker<'a> {
    ast: &'a Program,
    varibales: HashMap<String, Type>,
}

impl<'a> Checker<'a> {
    pub fn new(ast: &'a Program) -> Self {
        Self {
            ast,
            varibales: HashMap::new(),
        }
    }
    fn err(&mut self, er: Er, span: Span) -> CompilerError {
        CompilerError {
            er,
            span,
            info: None,
        }
    }
    fn get(&self, name: &Ident) -> Option<&Type> {
        self.varibales.get(&name.name)
    }
    fn insert(&mut self, name: String, type_: Type) {
        self.varibales.insert(name, type_);
    }
    pub fn run(&mut self) -> Result<(), CompilerError> {
        for stmt in &self.ast.stmts {
            self.check_stmt(stmt)?;
        }
        Ok(())
    }
    fn check_stmt(&mut self, stmt: &Stmt) -> Result<(), CompilerError> {
        match stmt {
            Stmt::Print(expr) => match self.check_expr(expr) {
                Ok(_) => Ok(()),
                Err(er) => Err(er),
            },
            Stmt::DeclarVar { name, type_, value } => {
                if self.get(name).is_some() {
                    return Err(self.err(Er::DeclarDeclared, name.span.clone()));
                }
                let typ = self.check_expr(value)?;
                let mut name_ = String::from("li dayro");
                let type__ = match type_ {
                    Some(type_) => {
                        name_ = type_.name.clone();
                        type_.type_.clone()
                    }
                    None => typ.clone(),
                };
                if typ != type__ {
                    return Err(self
                        .err(Er::TypeMismatch, value.span.clone())
                        .info(format!("hada naw3 dyal '{}' machi '{}'", typ, name_)));
                }
                self.insert(name.name.to_string(), typ.clone());
                Ok(())
            }
            Stmt::Assign { name, value } => {
                let original_type = match self.get(name) {
                    Some(original_type) => original_type.clone(),
                    None => return Err(self.err(Er::VariableNotDeclared, name.span.clone())),
                };
                let typ = self.check_expr(value)?;

                if typ != original_type {
                    return Err(self.err(Er::TypeMismatch, value.span.clone()).info(format!(
                        "hada naw3 dyal '{}' machi '{}'",
                        typ, original_type
                    )));
                }

                self.insert(name.name.to_string(), typ.clone());
                Ok(())
            }
        }
    }
    fn check_expr(&mut self, expr: &Expr) -> Result<Type, CompilerError> {
        match &expr.node {
            ExprKind::String(_) => Ok(Type::Nss),
            ExprKind::Number(_) => Ok(Type::Edd),
            ExprKind::Float(_) => Ok(Type::Exr),
            ExprKind::Mnt(_) => Ok(Type::Mnt),
            ExprKind::Ident(name) => match self.get(name) {
                Some(typ) => Ok(typ.clone()),
                None => Err(self.err(Er::UnknownVariable, expr.span.clone())),
            },
            ExprKind::Binary { left, op, right } => {
                let left_type = self.check_expr(left)?;
                let right_type = self.check_expr(right)?;

                match op {
                    BinaryOp::Add => match (&left_type, &right_type) {
                        (Type::Edd, Type::Edd) => Ok(Type::Edd),
                        (Type::Edd, Type::Exr) => Ok(Type::Exr),
                        (Type::Exr, Type::Edd) => Ok(Type::Exr),
                        (Type::Exr, Type::Exr) => Ok(Type::Exr),
                        (Type::Nss, Type::Nss) => Ok(Type::Nss),
                        _ => Err(self.err(Er::TypeMismatch, expr.span.clone()).info(format!(
                            "makayn9dch tjm3 '{}' m3a '{}'",
                            left_type, right_type
                        ))),
                    },
                    BinaryOp::Sub => match (&left_type, &right_type) {
                        (Type::Edd, Type::Edd) => Ok(Type::Edd),
                        (Type::Edd, Type::Exr) => Ok(Type::Exr),
                        (Type::Exr, Type::Edd) => Ok(Type::Exr),
                        (Type::Exr, Type::Exr) => Ok(Type::Exr),
                        _ => Err(self.err(Er::TypeMismatch, expr.span.clone())),
                    },
                    BinaryOp::Mul => match (&left_type, &right_type) {
                        (Type::Edd, Type::Edd) => Ok(Type::Edd),
                        (Type::Edd, Type::Exr) => Ok(Type::Exr),
                        (Type::Exr, Type::Edd) => Ok(Type::Exr),
                        (Type::Exr, Type::Exr) => Ok(Type::Exr),
                        (Type::Nss, Type::Edd) => Ok(Type::Nss),
                        _ => Err(self.err(Er::TypeMismatch, expr.span.clone())),
                    },
                    BinaryOp::Div => match (&left_type, &right_type) {
                        (Type::Edd, Type::Edd) => Ok(Type::Exr),
                        (Type::Edd, Type::Exr) => Ok(Type::Exr),
                        (Type::Exr, Type::Edd) => Ok(Type::Exr),
                        (Type::Exr, Type::Exr) => Ok(Type::Exr),
                        _ => Err(self.err(Er::TypeMismatch, expr.span.clone())),
                    },
                }
            }
            ExprKind::Unary { op, value } => {
                let typ = self.check_expr(value)?;

                match op {
                    UnaryOp::Neg => match typ {
                        Type::Edd => Ok(Type::Edd),
                        Type::Exr => Ok(Type::Exr),

                        _ => Err(self.err(Er::TypeMismatch, expr.span.clone())),
                    },
                }
            }
        }
    }
}
