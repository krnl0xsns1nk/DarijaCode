import * as fs from "fs";
import { compile } from "./compiler";
import { DarijaError, printDarijaError } from "./errors";

const file = process.argv[2];

try {
  compile(file);
} catch (err) {
  if (err instanceof DarijaError) {
    const source = fs.readFileSync(file, "utf-8");
    printDarijaError(err, file, source);
    process.exit(1);
  }

  throw err;
}
