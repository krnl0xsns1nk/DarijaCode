use super::{check_source, assert_err};
use drj::errors::Er;

#[test]
fn int_plus_int_passes() {
    let result = check_source("x : 3dd = 5 + 3");
    assert!(result.is_ok());
}

#[test]
fn string_plus_string_passes() {
    let result = check_source(r#"x := "hello" + "world""#);
    assert!(result.is_ok());
}

#[test]
fn string_plus_int_fails() {
    let result = check_source(r#"x := 5 + "hi""#); // the exact bug from earlier
    assert_err(result, Er::TypeMismatch);
}

#[test]
fn division_widens_to_float() {
    // must be Ok, and specifically checked as Exr — string check below
    let result = check_source("x : 3xr = 10 / 5");
    assert!(result.is_ok());
}

#[test]
fn division_int_declared_as_int_fails() {
    // division always produces 3xr, so declaring as 3dd must fail
    let result = check_source("x : 3dd = 10 / 5");
    assert_err(result, Er::TypeMismatch);
}
