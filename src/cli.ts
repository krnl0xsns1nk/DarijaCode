#!/usr/bin/env node
import { existsSync } from "fs";
import { resolve, extname } from "path";
import execute from "./compiler/index";
const VERSION = "0.1.0";

function error(message: string) {
  console.error(`✗ ${message}`);
  process.exit(1);
}
function success(message: string) {
  console.log(`✓ ${message}`);
}
function validateFile(file: string): string {
  const path = resolve(file);
  if (!existsSync(path)) {
    error(`milaf mkaynch: ${path}`);
  }
  if (extname(path) !== ".drj") {
    error(`twa93t milf b .drj`);
  }
  return path;
}
function help() {
  console.log(`
DarijaCode ${VERSION}

listikhdam:
  drj run <file>
  drj build <file>
  drj check <file>

lawamir:
  run      Compile and execute
  build    Compile to binary
  check    Check syntax and types
`);
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    help();
    return;
  }
  const command = args[0];
  const v = ["--verion", "version", "-v", "--v", "-version", "lisdar", "--isdar"]
  if (v.includes(command)) {
    console.log(VERSION);
    return;
  }
  const file = args[1];
  if (!file) {
    error("khask milf dyal .drj");
  }
  const filePath = validateFile(file);
  switch (command) {
    case "check": {
      execute("check", filePath);
      break;
    }
    case "run": {
      execute("run", filePath);
      break;
    }
    case "build": {
      execute("build", filePath);
      break;
    }
    default:
     help();
  }
}
main();
