#pragma once

typedef struct {
  const char *name;
  int (*fn)(int argc, char *argv[]);
} Command;

extern Command commands[];

int showHelp(int argc, char *argv[]);
int run(int argc, char *argv[]);
