#include "ext.h"

bool hasExt(const char *filename, const char *ext){
  size_t filenameLen = strlen(filename);
  size_t extLen = strlen(ext);

  if (filenameLen < extLen){
    return false;
  }
  return strcmp(filename + filenameLen - extLen ,ext) == 0;
}
