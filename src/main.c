#include <stdio.h>
#include <string.h>
#include "cli.h"

/*
int showHelp(int argc, char *argv[]){
  printf("\tDarijaCode v0.3\nbash tbda st3ml lawamir lmota7a:\n\tdrj khdm <milf.drj>\n\tdrj bni <milf.drj>\n\tdrj kfx\n");
  return 0;
}

typedef struct {
  const char *name;
  int (*fn)(int argc, char **argv);
} Command;

*/
int main(int argc, char **argv){
  if (argc < 2){
    showHelp(argc, argv);
    return 0;
  }
  for (int i=0; i < sizeof(commands)/sizeof(commands[0]); i++){
    if(strcmp(argv[1], commands[i].name) ==0){
      return commands[i].fn(argc, argv);
    }
  }
  showHelp(argc, argv);
  return 0;
}
