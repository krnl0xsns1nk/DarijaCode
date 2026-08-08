#pragma once
#include "compile.h"

typedef struct {
  size_t tmpSize;
  char *tmp;
  size_t i;
} Tmp;

Result Lexer(const char *file, TokenList *tokens);
