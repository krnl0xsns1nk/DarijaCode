#include <stdio.h>
#include "cli.h"

int main(int argc, char **argv){
  if (argc < 2){
    showHelp(argc, argv);
    return 0;
  }
  
  Result result = {
    .status = ok,
    .msg = NULL
  };

  // maping to see if the argv[1] exist in our commands to excute it
  for (size_t i=0; i < cmdsCount; i++){

    if(strcmp(argv[1], commands[i].name) ==0){
      result = commands[i].fn(argc, argv);

    if (result.status != ok){
      printf("%s '", result.msg);
      printf("%s' at ", result.data);
      free(result.data);
      printf("%zu:%zu\n", result.line, result.column);
      return 1;
    }
      return 0;
    }
  }


  showHelp(argc, argv);
  return 0;
}
