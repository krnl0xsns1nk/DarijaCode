# DarijaCode Error Codes

| Code | Description | Possible Solution |
|------|-------------|-------------------|
| DCE-2 | This language feature is not supported yet. | Rewrite the code using currently supported language features or wait for a future compiler version. |
| DCE-1 | The C compilation step failed. | Ensure a C compiler is installed, inspect the compiler output, and fix any reported C errors. |
| DCE1 | Invalid or unrecognized character. | Remove or replace the unsupported character. |
| DCE2 | Expected a semicolon (`;`). | Add the missing `;` at the end of the statement. |
| DCE3 | Expected a closing square bracket (`]`). | Close the array type with `]`. |
| DCE4 | Expected a comma (`,`). | Separate parameters or arguments with a comma. |
| DCE5 | Expected a parenthesis (`(` or `)`). | Ensure the parameter or argument list is correctly enclosed in parentheses. |
| DCE7 | Expected a property name after `.`. | Add a valid identifier after the dot operator. |
| DCE8 | Expected a colon (`:`) in a conditional expression. | Complete the ternary expression using `condition ? value1 : value2`. |
| DCE9 | Expected an opening or closing brace (`{}`) for a block. | Make sure every block is correctly enclosed with braces. |
| DCE10 | Expected a variable name. | Provide a valid identifier after the declaration keyword. |
| DCE11 | Unterminated string literal. | Close the string with a matching quotation mark (`"`). |
| DCE12 | Invalid logical operator. | Use `&&` for logical AND or `||` for logical OR. |
| DCE13 | Duplicate declaration. | Rename the identifier or remove the duplicate declaration. |
| DCE14 | Invalid control statement usage. | Use `raj3` only inside functions, and `qta3` / `kml` only inside loops. |
| DCE15 | Type mismatch. | Ensure the provided value matches the expected type or perform a valid conversion. |
| DCE16 | Invalid constant usage. | Initialize constants when declaring them and never assign to them afterward. |
| DCE17 | Incorrect number of function arguments. | Pass the required number of arguments defined by the function. |
| DCE18 | Unknown or unsupported type. | Check the type name for spelling mistakes or use a supported built-in type. |
