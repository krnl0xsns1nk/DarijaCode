#pragma once 
#include <stdlib.h>


// function result
typedef enum {
  ok = 0,
  cliErr,
  memoryErr,
  lexerErr,
} Status;
typedef struct {
  Status status;
  char *msg;
} Result;

// Token.Types
typedef enum {
  IDENT,
  KTEB,
  LPAREN,
  STRING,
  RPAREN,
  NEWLINE
} TokenType;

typedef struct {
  TokenType type;
  char *value;
} Token;

typedef struct {
  Token *items;
  size_t count;
  size_t capacity;
} TokenList;
