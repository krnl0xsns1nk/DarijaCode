#include <stdio.h>
#include "cli.h"

int main(int argc, char **argv){
  if (argc < 2){
    showHelp(argc, argv);
    return 0;
  }
  for (int i=0; i < cmdsCount; i++){
    
    if(strcmp(argv[1], commands[i].name) ==0){
      return commands[i].fn(argc, argv);
    }
  }
  showHelp(argc, argv);
  return 0;
}
