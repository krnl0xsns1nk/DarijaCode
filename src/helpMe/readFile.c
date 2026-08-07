#include <stdio.h>
#include <stdlib.h>
#include "readfile.h"

char *readFile(const char *path){
  FILE *file = fopen(path, "rb");

  if (file == NULL){
    return NULL;
  }
  fseek(file, 0, SEEK_END);

  long fileSize = ftell(file);

  if (fileSize < 0){
    return NULL;
  }
  rewind(file);
  size_t size = (size_t)fileSize;

  char *buffer = malloc(size + 1);

  if (buffer == NULL){
    fclose(file);
    return NULL;
  }
  fread(buffer, 1, size, file);

  buffer[size] = 0;
  fclose(file);

  return buffer;

}
