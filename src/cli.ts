import { start } from "./compile/index"
import fs from "fs"

const file = process.argv[2];

if (!file) {
  console.log("Usage: node src/cli.js file.drj");
  process.exit(1);
}

  const code = fs.readFileSync(file, "utf-8").trim();
  start(code)
