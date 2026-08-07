#include "tokensHelpers.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

void initTokens(TokenList *List){
  List->items = malloc(sizeof(Token) * 5);
  List->count = 0;
  List->capacity = 5;
}

Result pushToken(TokenList *List, TokenType type, char *value){
  if (List->capacity <= List->count){
    List->capacity += 5;
    Token *tmp = realloc(List->items, List->capacity * sizeof(Token));
    if (tmp == NULL){
      printf("oops!");
      return (Result){
        .status = memoryErr,
        .msg = "no availabe memory !"
      };
    }
    List->items = tmp;
  }
  List->items[List->count] = (Token){
    .type = type,
    .value = strdup(value)
  };
  List->count++;

  return (Result){
    .status = ok
  };
}

void freeTokens(TokenList *List){
  for (size_t i=0; i < List->count; i++){
    free(List->items[i].value);
  }
  free(List->items);
  List->count=0;
  List->capacity = 0;
}

void printTokens(TokenList *List){
  static const char *keys[] = {
    "IDENT",
    "KTEB",
    "LPAREN",
    "STRING",
    "RPAREN"
  };

  for (size_t i=0; i < List->count; i++){
    printf("token: %s 》type: %s\n", List->items[i].value, keys[List->items[i].type]);
  };
}
