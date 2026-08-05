#pragma once 

typedef enum {
  ok = 0,
  cliErr,
  lexerErr,
} Status;

typedef struct {
  Status status;
  char *msg;
} Result;
