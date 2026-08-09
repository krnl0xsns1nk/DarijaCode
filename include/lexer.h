#pragma once
#include "compile.h"

typedef struct {
  size_t tmpSize;
  char *tmp;
  size_t i;
} Tmp;
typedef struct {
  size_t line;
  size_t column;
  const char *cursor;
} MoveInf;
Result Lexer(const char *file, TokenList *tokens);
