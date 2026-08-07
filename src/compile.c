#include <stdio.h>
#include <stdlib.h>
#include "lexer.h"
#include "tokensHelpers.h"

Result compile(const char *code){
  Result result;
  TokenList List;
  initTokens(&List);

  result = Lexer(code, &List); if (result.status != ok){ return result;}

  printTokens(&List);
  freeTokens(&List);

  return result; 
}
