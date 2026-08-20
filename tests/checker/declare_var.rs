use super::{assert_err, check_source};
use drj::errors::Er;

#[test]
fn valid_string_declaration_passes() {
    let result = check_source(r#"x : nss = "hi""#);
    assert!(result.is_ok());
}

#[test]
fn type_mismatch_fails() {
    let result = check_source("x : nss = 10"); // declared nss, given int
    assert_err(result, Er::TypeMismatch);
}

#[test]
fn redeclared_variable_fails() {
    let result = check_source("x : 3dd = 10\nx : 3dd = 20");
    assert_err(result, Er::DeclarDeclared);
}

#[test]
fn inferred_declaration_passes() {
    let result = check_source(r#"x := "hi""#);
    assert!(result.is_ok());
}
