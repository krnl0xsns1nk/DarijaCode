#include <stdio.h>
#include "lexer.h"

Result compile(const char *code){
  Result result;

  result = Lexer(code);

  return result; 
}
