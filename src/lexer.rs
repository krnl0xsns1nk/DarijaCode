use crate::tokens::{Token, TokenType};

pub fn lexer(source: &str) -> Result<Vec<Token>, String> {
    let chars: Vec<char> = source.chars().collect();
    let mut tokens: Vec<Token> = Vec::new();
    let mut tmp = String::new();
    let mut pos = 0;

    while pos < chars.len() {
        //       println!("{}",  chars[pos]);
        if !(chars[pos].is_alphabetic() || chars[pos] == '_') && !tmp.is_empty() {
            tokens.push(Token {
                token_type: match tmp.as_str() {
                    "kteb" => TokenType::Kteb,
                    _ => TokenType::Ident,
                },
                value: tmp.clone(),
            });
            tmp.clear();
        }

        if chars[pos].is_alphabetic() || chars[pos] == '_' {
            tmp.push(chars[pos]);
            pos += 1;
        } else if chars[pos] == '(' {
            tokens.push(Token {
                token_type: TokenType::Lparen,
                value: '('.to_string(),
            });
            pos += 1;
        } else if chars[pos] == ')' {
            tokens.push(Token {
                token_type: TokenType::Rparen,
                value: ')'.to_string(),
            });
            pos += 1;
        } else if chars[pos] == '"' {
            pos += 1;
            while pos < chars.len() && chars[pos] != '"' {
                tmp.push(chars[pos]);
                pos += 1
            }
            if pos >= chars.len() && chars[pos - 1] != '"' {
                return Err("nass khaso isali b \" 9bal maysali lmifl".to_string());
            }
            tokens.push(Token {
                token_type: TokenType::String,
                value: tmp.clone(),
            });
            tmp.clear();
            pos += 1;
        } else if chars[pos].is_whitespace() {
            pos += 1;
        } else {
            //       println!("error?");
            return Err(format!("7arf mm3rofch: {}", chars[pos]));
        }
    }
    Ok(tokens)
}
