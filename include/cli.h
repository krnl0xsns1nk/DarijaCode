#pragma once
#include "types.h"

typedef struct {
  const char *name;
  Result (*fn)(int argc, char *argv[]);
} Command;

extern Command commands[];
extern const size_t cmdsCount;

Result showHelp(int argc, char *argv[]);
Result run(int argc, char *argv[]);
