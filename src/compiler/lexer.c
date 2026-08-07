#include <stdio.h>
#include <stdlib.h>
#include "lexer.h"
#include "readfile.h"
#include "types.h"
#include "tokensHelpers.h"

Result Lexer(const char *code, TokenList *List){
  Result result = { .status = ok };
  const char *cursor = code;
  char *tmpValue = NULL;

  for (int i=0; *cursor != '\0'; i++){
    tmpValue += *cursor;
    result = pushToken(List, IDENT, tmpValue);
    if (result.status != ok){ return result; }
    cursor++;
  }
  return result;
}
