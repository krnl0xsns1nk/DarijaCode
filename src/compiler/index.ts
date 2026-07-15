import * as fs from "fs";
import { execFileSync } from "child_process";
import { compile, checkOnly, CompileResult} from "./compiler";
export { compile };
import { DarijaError, printDarijaError } from "./errors";

type startOptions = "run" | "check" | "build"

export default function execute(option: startOptions, file:string){
  switch (option){
    case "check":
      checkOnly(file);
    break;

    case "build":
      compileItForMe(file);
    break;

    case "run": {
    const binpath = compileItForMe(file);
    execFileSync(binpath.binaryPath, { stdio: "inherit" });
    }
  }

}


function compileItForMe(file: string): CompileResult{
try {
  return compile(file);
} catch (err) {
  if (err instanceof DarijaError) {
    const source = fs.readFileSync(file, "utf-8");
    printDarijaError(err, file, source);
    process.exit(1);
  }

  throw err;
}
}
