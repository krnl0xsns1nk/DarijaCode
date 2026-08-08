#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include "lexer.h"
#include "readfile.h"
#include "types.h"
#include "tokensHelpers.h"
#include "lexerHelpers.h"


Result Lexer(const char *code, TokenList *List){
  Result result = { .status = ok };
  const char *cursor = code;

  Tmp TMP;

 // char mode[] = "IDENTF";

  while (*cursor != '\0'){
    char c = *cursor;
    if (!initTmp(&TMP)){ return memErr(); }
    if (!checkTmp(&TMP)){ return memErr(); }

    // start lexing   
    if (maybeIdent(c)){
      TMP.tmp[TMP.i] = c;
      TMP.i++;
      cursor++;
         while (canItBeIdent(*cursor)){
          char c = *cursor;
          if (!checkTmp(&TMP)){ return memErr();}
          TMP.tmp[TMP.i] = c;
          TMP.i++;
          cursor++;
         }
      TMP.tmp[TMP.i] = '\0';

      cursor--;
      result = pushToken(List, IDENT, TMP.tmp);
      freeTmp(&TMP); if (result.status != ok){ return result; }

    } else if (isNewLine(c)){
      char value[] = "newline";
      result = pushToken(List, NEWLINE, value); if (result.status != ok){ return result; }

    } else if (isSymbol(c)){
      printf("%c\n", c);
      TokenType type = getSymbol(c);
      if (type == UNKNOWN){
        char data[2]; data[0] = c; data[1] = '\0';
        return (Result){
          .status = lexerErr,
          .msg = "hada machi ramz kan3rfoh\n",
          .data = strdup(data)
        };
      }
      char value[2]; value [0] = c; value [1] = '\0';
      result = pushToken(List, type, value); if (result.status != ok){ return result;}
      
    } else {
      char data[2]; data[0] = c; data[1] = '\0';
      return (Result){ .status = lexerErr, .msg = "no valid symbol", .data = strdup(data) };
    }
    cursor++;
  }
  return result;
}
