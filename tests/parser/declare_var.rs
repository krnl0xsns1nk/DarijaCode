use super::parse_source;

#[test]
fn declares_string() {
    let ast = parse_source(r#"x : nss = "hi""#);
    insta::assert_debug_snapshot!(ast);
}

#[test]
fn declares_number() {
    let ast = parse_source("x : 3dd = 10");
    insta::assert_debug_snapshot!(ast);
}

#[test]
fn declares_float() {
    let ast = parse_source("x : 3xr = ~10.5");
    insta::assert_debug_snapshot!(ast);
}

#[test]
fn declares_bool() {
    let ast = parse_source("x : mnt = ah");
    insta::assert_debug_snapshot!(ast);
}
