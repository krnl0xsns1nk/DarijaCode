const compile = require("./compile/index.ts");
const fs = require("fs");
// const { execSync } = require("child_process");

const file = process.argv[2];

if (!file) {
  console.log("Usage: node src/cli.js file.drj");
  process.exit(1);
}

const code = fs.readFileSync(file, "utf-8").trim();

compile(code)

