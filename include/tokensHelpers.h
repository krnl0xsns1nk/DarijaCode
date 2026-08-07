#pragma once
#include "types.h"

void initTokens(TokenList *List);

Result pushToken(TokenList *List, TokenType type, char *value);

void freeTokens(TokenList *List);

void printTokens(TokenList *List);
