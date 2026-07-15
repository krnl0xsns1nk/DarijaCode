import { Program, FunctionDeclaration } from "../ast";
import { DarijaError } from "../errors";
import { Scope, FunctionRegistry } from "./scope";
import { StatementChecker } from "./statements";

export class Checker {
  private globalScope = new Scope();
  private functions = new FunctionRegistry();
  private statementChecker: StatementChecker;

  constructor() {
    this.statementChecker = new StatementChecker(this.functions, this.globalScope);
  }

  check(program: Program) {
    // Pass 1: Hoist function signatures
    for (const stmt of program.body) {
      if (stmt.type === "FunctionDeclaration") {
        this.registerFunctionSignature(stmt);
      }
    }

    // Pass 2: Validate all statements
    for (const stmt of program.body) {
      this.statementChecker.checkStatement(stmt, this.globalScope);
    }
  }

  private registerFunctionSignature(fn: FunctionDeclaration) {
    if (this.functions.has(fn.name)) {
      throw new DarijaError({
        code: "DCE13",
        stage: "checker",
        message: `dala '${fn.name}' dija m3rfa`,
        location: {
          line: fn.pos.line,
          column: fn.pos.column,
        },
        hint: `stkhdm dalla dyal ${fn.name}() awla dir dalla jdida`,
      });
    }

    this.functions.register(
      fn.name,
      {
        params: fn.params,
        returnType: fn.returnType ?? { base: "walo", d: 0 },
      },
      fn.pos.line,
      fn.pos.column
    );
  }
}

