#pragma once

#include <stdlib.h>
#include <stdbool.h>
#include "lexer.h"

bool isChar(char c);
bool isDigit(char c);
bool isWhiteSpace(char c);
bool isNewLine(char c);
bool isUnderScore(char c);
bool isDollar(char c);
bool maybeIdent(char c);
bool canItBeIdent(char c);
Result memErr(void);
bool isSymbol(char c);
TokenType getSymbol(char c);

bool initTmp(Tmp *TMP);
bool growTmp(Tmp *TMP);
void freeTmp(Tmp *TMP);

bool checkTmp(Tmp *TMP);

bool isNotOk(Result *reslut);

// Result readIdent(const char **cursor, Tmp *TMP);
