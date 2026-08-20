use super::parse_source;

#[test]
fn add_and_mul_precedence() {
    let ast = parse_source("x : 3dd = 2 + 3 * 4");
    insta::assert_debug_snapshot!(ast);
}

#[test]
fn div_and_add_precedence() {
    let ast = parse_source("x : 3xr = 10 / 5 + 1 * 90 / 2");
    insta::assert_debug_snapshot!(ast);
}

#[test]
fn parens_override_precedence() {
    let ast = parse_source("x : 3dd = (2 + 3) * 4");
    insta::assert_debug_snapshot!(ast);
}

#[test]
fn ident_in_expr() {
    let ast = parse_source("y : 3dd = 5\nx : 3dd = y + 1");
    insta::assert_debug_snapshot!(ast);
}
