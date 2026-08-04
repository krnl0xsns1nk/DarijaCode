#include <stdio.h>
#include "cli.h"

Command commands[] = {
  {"run", run},
  {"kfx", showHelp}
};

const size_t cmdsCount = sizeof(commands) / sizeof(commands[0]);

int showHelp(int argc, char *argv[]){
  printf("%s", commands[0].name);
  return 0;
}
int run(int argc, char *argv[]){
  printf("%s", commands[1].name);
  return 0;
}
