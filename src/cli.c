#include <stdio.h>
#include "cli.h"
#include "compile.h"
#include "readfile.h"

Command commands[] = {
  {"khdm", run},
  {"kfx", showHelp}
};

const size_t cmdsCount = sizeof(commands) / sizeof(commands[0]);

Result showHelp(int argc, char *argv[]){
  (void)argc; (void)argv;

    printf(
    "\nDarijaCode v0.3\n"
    "\n"
    "St3ml:\n"
    "  drj khdm <milf.drj>    tkhdem chi barnamej\n"
    "  drj bni  <milf.drj>    tbni chi proji\n"
    "  drj kfx                Wri had lwajiha\n"
    "  drj version            twri lisdar dyal had logha\n"
    "\n"
    "lilmazid:\n"
    "  https://github.com/krnl0xsns1nk/DarijaCode\n"
    );
  return (Result){
    .status = ok
  };
}
Result run(int argc, char *argv[]){
  if (argc < 3){
    return (Result){
      .status = cliErr,
      .msg = "khtar chi milf b3da bach tkhdm.\n"
    };
  }

  Result result;

  char *code = readFile(argv[2]);

  if (code == NULL){
    free(code);
    return (Result){
      .status = cliErr,
      .msg = "ma9inach lmilf, t2akd mn lmasar o lhajm dyalo\n"
    };
  }
  result = compile(code);
  free(code);
  return result;
}
