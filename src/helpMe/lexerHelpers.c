#include "lexerHelpers.h"
#include <stdbool.h>
#include <stdlib.h>
#include <ctype.h>
#include "lexer.h"

bool isChar(char c){ return isalpha((unsigned char)c); }
bool isDigit(char c){ return c >= '0' && c <= '9'; }
bool isWhiteSpace(char c){ return c == ' '; }
bool isNewLine(char c){ return c == '\n'; }
bool isUnderScore(char c){ return c == '_'; }
bool isDollar(char c){ return c == '$'; }
bool maybeIdent(char c){ return isChar(c) || isDollar(c) || isUnderScore(c);}
bool canItBeIdent(char c){ return maybeIdent(c) || isDigit(c);}
Result memErr(void){ return (Result){ .status = memoryErr, .msg = "not enough memory" };}
bool isSymbol(char c){ 
  return c == '(' || c == ')';
}
TokenType getSymbol(char c){
  if (c == '(') return LPAREN;
  if (c == ')') return RPAREN;
  return UNKNOWN;
}

bool initTmp(Tmp *TMP){
  TMP->i = 0;
  TMP->tmpSize = 10;
  TMP->tmp = malloc(sizeof(char) * TMP->tmpSize);
  if (TMP->tmp == NULL){
    return false;
  }
  return true;
}
bool growTmp(Tmp *TMP){
      size_t newSize = TMP->tmpSize + 10;
      char *newTmp = realloc(TMP->tmp, newSize);
      if (newTmp == NULL){
        freeTmp(TMP);
        return false;
      }
      TMP->tmpSize = newSize;
      TMP->tmp = newTmp;
      return  true;
}
void freeTmp(Tmp *TMP){
  free(TMP->tmp);
  TMP->tmpSize = 10;
  TMP->i = 0;
  TMP->tmp = NULL;
};

bool checkTmp(Tmp *TMP){
   if (TMP->tmp == NULL){
      freeTmp(TMP);
    return false;
   }
    //make sure there is enough space
    if (TMP->i +1 >= TMP->tmpSize){
      growTmp(TMP);
    }
  return true;
}

void move(MoveInf *mvInf){
  mvInf->cursor++;
  if (isNewLine(*mvInf->cursor)){
    mvInf->line++;
    mvInf->column = 0;
    return;
  }
  mvInf->column++;
}
