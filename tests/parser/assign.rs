use super::parse_source;

#[test]
fn reassigns_existing_var() {
    let ast = parse_source("x : 3dd = 10\nx = 20");
    insta::assert_debug_snapshot!(ast);
}
