use super::{check_source, assert_err};
use drj::errors::Er;

#[test]
fn valid_reassignment_passes() {
    let result = check_source("x : 3dd = 10\nx = 20");
    assert!(result.is_ok());
}

#[test]
fn assign_type_mismatch_fails() {
    let result = check_source(r#"x : 3dd = 10
x = "hi""#);
    assert_err(result, Er::TypeMismatch);
}

#[test]
fn assign_to_undeclared_var_fails() {
    let result = check_source("x = 10"); // never declared
    assert_err(result, Er::VariableNotDeclared);
}
