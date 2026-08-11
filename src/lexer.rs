

use crate::tokens::{TokenType, Token};

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
                   "kteb" => TokenType::KTEB,
                   _ => TokenType::IDENT,
               },
               value: tmp.clone()
           });
        tmp.clear();
       }

       if chars[pos].is_alphabetic() || chars[pos] == '_' {
           tmp.push(chars[pos]);
           pos +=1;
       } 
       else if chars[pos] == '(' {
           tokens.push(Token {
               token_type: TokenType::LPAREN,
               value: '('.to_string()
           });
           pos +=1;
       }
      else if chars[pos] == ')' {
           tokens.push(Token {
               token_type: TokenType::RPAREN,
               value: ')'.to_string()
           });
           pos += 1;
       }
      else if chars[pos] == '"' {
           pos += 1;
           while pos < chars.len() && chars[pos] != '"' {
               tmp.push(chars[pos]);
               pos +=1
           }
           if pos >= chars.len() && chars[pos-1] != '"' {
               return Err(format!("nass khaso isali b \" 9bal maysali lmifl"))
           }
           tokens.push(Token {
               token_type: TokenType::STRING,
               value: tmp.clone()
           });
           tmp.clear();
           pos+=1;
       } else if chars[pos].is_whitespace() {
           pos +=1;
       } else {
//       println!("error?");
       return Err(format!("7arf mm3rofch: {}", chars[pos]))
       }
   }
   Ok(tokens)
}
