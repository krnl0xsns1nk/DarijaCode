import {
  Program,
  Statement,
  Expression,
  FunctionDeclaration,
  BlockStatement,
} from "../ast";
import { CodegenError } from "../errors";
import Scope from "./scope";
import { DjType, FunctionSig } from "./types";
import statementGen from "./stmts";
import expressionGen from  "./expr";
import infertype from "./infertype"
import { cType } from "./ctype";
import { dj_print } from "./runtime";
const RUNTIME_PRELUDE = `
static char* dj_concat(const char* a, const char* b) {
    size_t len = strlen(a) + strlen(b) + 1;
    char* out = (char*)malloc(len);
    strcpy(out, a);
    strcat(out, b);
    return out;
}
`.trim();

export class Codegen {
  public globalScope = new Scope();
  public functions = new Map<string, FunctionSig>();
  public out: string[] = [];
  public indentLevel = 0;
  public generate(program: Program): string {
    const functionDecls = program.body.filter(
      (s): s is FunctionDeclaration => s.type === "FunctionDeclaration",
    );
    const topLevel = program.body.filter((s) => s.type !== "FunctionDeclaration");

    for (const fn of functionDecls) this.registerFunction(fn);

    const header = [
      "#include <stdio.h>",
      "#include <stdlib.h>",
      "#include <string.h>",
      "#include <stdbool.h>",
      "#include <math.h>",
      "",
      RUNTIME_PRELUDE,
      "",
    ];

    const prototypes = functionDecls.map((fn) => this.genPrototype(fn) + ";");

    const bodies: string[] = [];
    for (const fn of functionDecls) {
      bodies.push(this.genFunction(fn));
      bodies.push("");
    }

    const main: string[] = ["int main(void) {"];
    this.indentLevel = 1;
    this.out = [];
    for (const stmt of topLevel) this.genStatement(stmt, this.globalScope);
    main.push(...this.out);
    main.push("    return 0;", "}");
    this.indentLevel = 0;

    return [...header, ...prototypes, "", ...bodies, ...main].join("\n");
  }

  public registerFunction(fn: FunctionDeclaration) {
    // uses of as 
    const paramTypes = fn.params.map((p) => p.typeAnnotation ?? {base: "nass", d:0} as DjType);
    this.functions.set(fn.name, {
      paramTypes,
      returnType: fn.returnType ?? { base: "khawi", d:0}
    });
  }

  public genPrototype(fn: FunctionDeclaration): string {
    const sig = this.functions.get(fn.name)!;
    const params = fn.params
      .map((p, i) => `${this.cType(sig.paramTypes[i])} ${p.name}`)
      .join(", ");
    return `${this.cType(sig.returnType)} ${fn.name}(${params || "void"})`;
  }

  public genFunction(fn: FunctionDeclaration): string {
    const sig = this.functions.get(fn.name)!;
    const fnScope = this.globalScope.child();
    fn.params.forEach((p, i) => fnScope.declare(p.name, sig.paramTypes[i]));

    this.out = [];
    this.indentLevel = 1;
    for (const stmt of fn.body.body) this.genStatement(stmt, fnScope);
    const body = this.out;
    this.indentLevel = 0;

    return [`${this.genPrototype(fn)} {`, ...body, "}"].join("\n");
  }


  public genStatement(stmt: Statement, scope: Scope) {
    return statementGen(this, stmt, scope) 
  }

  public genNestedBlock(block: BlockStatement, parentScope: Scope) {
    this.indentLevel++;
    const scope = parentScope.child();
    for (const stmt of block.body) this.genStatement(stmt, scope);
    this.indentLevel--;
  }

  public genPrint(expr: Expression, type: DjType, scope: Scope): string {
    const value = this.genExpression(expr, scope);
    return dj_print(value, type, expr.pos.line, expr.pos.column)
  }


  public genExpression(expr: Expression, scope: Scope): string {
    return expressionGen(this, expr, scope)
  }

  // ---------------------------------------------
  // Types
  // ---------------------------------------------

  public inferType(expr: Expression, scope: Scope): DjType {
    return infertype(this, expr, scope)
  }

  public cType(type: DjType): string {
    return cType(this, type);
  }

  public emit(line: string) {
    this.out.push("    ".repeat(this.indentLevel) + line);
  }

  public escapeString(value: string): string {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
  }
}

