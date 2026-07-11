import {
  Program,
  Statement,
  Expression,
  FunctionDeclaration,
  BlockStatement,
} from "./ast";

// NOTE: this targets the statically-typed core only. DarijaCode's dynamic
// `dir` (reassigning across types with no annotation, see about.md) needs a
// tagged runtime value (DjValue) to compile correctly — not implemented
// yet. Every variable here is locked to one C type: its annotation, or the
// type inferred from its initializer.
//
// Also not implemented yet (all throw CodegenError, nothing is faked):
// - object/member field access (`obj.field`) — no struct/object codegen
// - arrays outside of a direct literal initializer
// - classes

export class CodegenError extends Error {
  constructor(message: string, line: number, column: number) {
    super(`DarijaCode Codegen Error: ${message} at ${line}:${column}`);
  }
}

type DjType = string; // "ra9m" | "string" | "bool" | "null" | "T[]" | "unknown"

class Scope {
  private vars = new Map<string, DjType>();
  constructor(private parent: Scope | null = null) {}

  declare(name: string, type: DjType) {
    this.vars.set(name, type);
  }

  resolve(name: string): DjType | undefined {
    return this.vars.get(name) ?? this.parent?.resolve(name);
  }

  child(): Scope {
    return new Scope(this);
  }
}

interface FunctionSig {
  paramTypes: DjType[];
  returnType: DjType;
}

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
  private globalScope = new Scope();
  private functions = new Map<string, FunctionSig>();
  private out: string[] = [];
  private indentLevel = 0;

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

  private registerFunction(fn: FunctionDeclaration) {
    const paramTypes = fn.params.map((p) => p.typeAnnotation ?? "ra9m");
    this.functions.set(fn.name, {
      paramTypes,
      returnType: fn.returnType ?? "ra9m",
    });
  }

  private genPrototype(fn: FunctionDeclaration): string {
    const sig = this.functions.get(fn.name)!;
    const params = fn.params
      .map((p, i) => `${this.cType(sig.paramTypes[i])} ${p.name}`)
      .join(", ");
    return `${this.cType(sig.returnType)} ${fn.name}(${params || "void"})`;
  }

  private genFunction(fn: FunctionDeclaration): string {
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


  private genStatement(stmt: Statement, scope: Scope) {
    switch (stmt.type) {
      case "VariableDeclaration": {
        if (!stmt.init) {
          throw new CodegenError(`'${stmt.name}' khas t3ta liha 9ima`, stmt.pos.line, stmt.pos.column);
        }
        const type = stmt.typeAnnotation ?? this.inferType(stmt.init, scope);
        scope.declare(stmt.name, type);

        if (type.endsWith("[]") && stmt.init.type === "ArrayExpression") {
          const elementType = type.slice(0, -2);
          const values = stmt.init.elements.map((e) => this.genExpression(e, scope));
          this.emit(`${this.cType(elementType)} ${stmt.name}[] = {${values.join(", ")}};`);
        } else {
          this.emit(`${this.cType(type)} ${stmt.name} = ${this.genExpression(stmt.init, scope)};`);
        }
        return;
      }

      case "FunctionDeclaration":
        // handled at the top level; nested function declarations aren't supported yet
        throw new CodegenError("nested functions are not supported yet", stmt.pos.line, stmt.pos.column);

      case "ReturnStatement":
        this.emit(stmt.argument ? `return ${this.genExpression(stmt.argument, scope)};` : "return;");
        return;

      case "IfStatement": {
        this.emit(`if (${this.genExpression(stmt.condition, scope)}) {`);
        this.genNestedBlock(stmt.consequent, scope);
        for (const branch of stmt.elseIfs) {
          this.emit(`} else if (${this.genExpression(branch.condition, scope)}) {`);
          this.genNestedBlock(branch.consequent, scope);
        }
        if (stmt.alternate) {
          this.emit(`} else {`);
          this.genNestedBlock(stmt.alternate, scope);
        }
        this.emit(`}`);
        return;
      }

      case "WhileStatement":
        this.emit(`while (${this.genExpression(stmt.condition, scope)}) {`);
        this.genNestedBlock(stmt.body, scope);
        this.emit(`}`);
        return;

      case "ForStatement": {
        const forScope = scope.child();
        let initStr = "";
        if (stmt.init?.type === "VariableDeclaration") {
          if (!stmt.init.init) {
            throw new CodegenError(`'${stmt.init.name}' khas t3ta liha 9ima`, stmt.pos.line, stmt.pos.column);
          }
          const type = stmt.init.typeAnnotation ?? this.inferType(stmt.init.init, forScope);
          forScope.declare(stmt.init.name, type);
          initStr = `${this.cType(type)} ${stmt.init.name} = ${this.genExpression(stmt.init.init, forScope)}`;
        } else if (stmt.init?.type === "ExpressionStatement") {
          initStr = this.genExpression(stmt.init.expression, forScope);
        }
        const condStr = stmt.condition ? this.genExpression(stmt.condition, forScope) : "";
        const updateStr = stmt.update ? this.genExpression(stmt.update, forScope) : "";

        this.emit(`for (${initStr}; ${condStr}; ${updateStr}) {`);
        this.genNestedBlock(stmt.body, forScope);
        this.emit(`}`);
        return;
      }

      case "BreakStatement":
        this.emit("break;");
        return;

      case "ContinueStatement":
        this.emit("continue;");
        return;

      case "BlockStatement":
        this.emit("{");
        this.genNestedBlock(stmt, scope);
        this.emit("}");
        return;

      case "PrintStatement": {
        const type = this.inferType(stmt.argument, scope);
        this.emit(this.genPrint(stmt.argument, type, scope));
        return;
      }

      case "ExpressionStatement":
        this.emit(`${this.genExpression(stmt.expression, scope)};`);
        return;

      default:
        throw new CodegenError(`'${stmt.type}' ba9i mmd3omach`, stmt.pos.line, stmt.pos.column);
    }
  }

  private genNestedBlock(block: BlockStatement, parentScope: Scope) {
    this.indentLevel++;
    const scope = parentScope.child();
    for (const stmt of block.body) this.genStatement(stmt, scope);
    this.indentLevel--;
  }

  private genPrint(expr: Expression, type: DjType, scope: Scope): string {
    const value = this.genExpression(expr, scope);
    if (type === "ra9m") return `printf("%g\\n", ${value});`;
    if (type === "string") return `printf("%s\\n", ${value});`;
    if (type === "bool") return `printf("%s\\n", (${value}) ? "true" : "false");`;
    throw new CodegenError(`m9adrinch nktbo '${type}' l7d sa3a`, expr.pos.line, expr.pos.column);
  }


  private genExpression(expr: Expression, scope: Scope): string {
    switch (expr.type) {
      case "NumericLiteral":
        return String(expr.value);
      case "StringLiteral":
        return `"${this.escapeString(expr.value)}"`;
      case "BooleanLiteral":
        return expr.value ? "true" : "false";
      case "NullLiteral":
        return "NULL";

      case "Identifier":
        return expr.name;

      case "AssignmentExpression":
        return `${this.genExpression(expr.target, scope)} = ${this.genExpression(expr.value, scope)}`;

      case "BinaryExpression": {
        const leftType = this.inferType(expr.left, scope);
        const rightType = this.inferType(expr.right, scope);
        const left = this.genExpression(expr.left, scope);
        const right = this.genExpression(expr.right, scope);

        if (expr.operator === "+" && (leftType === "string" || rightType === "string")) {
          return `dj_concat(${left}, ${right})`;
        }
        if (expr.operator === "**") {
          return `pow(${left}, ${right})`;
        }
        return `(${left} ${expr.operator} ${right})`;
      }

      case "LogicalExpression": {
        const op = expr.operator === "&&" ? "&&" : "||";
        return `(${this.genExpression(expr.left, scope)} ${op} ${this.genExpression(expr.right, scope)})`;
      }

      case "UnaryExpression":
        return `(${expr.operator}${this.genExpression(expr.argument, scope)})`;

      case "UpdateExpression": {
        const arg = this.genExpression(expr.argument, scope);
        return expr.prefix ? `(${expr.operator}${arg})` : `(${arg}${expr.operator})`;
      }

      case "ConditionalExpression":
        return `(${this.genExpression(expr.condition, scope)} ? ${this.genExpression(
          expr.consequent,
          scope,
        )} : ${this.genExpression(expr.alternate, scope)})`;

      case "CallExpression": {
        if (expr.callee.type !== "Identifier") {
          throw new CodegenError("ghir dawal lli direct lli md3omin", expr.pos.line, expr.pos.column);
        }
        const args = expr.args.map((a) => this.genExpression(a, scope)).join(", ");
        return `${expr.callee.name}(${args})`;
      }

      case "MemberExpression": {
        if (!expr.computed) {
          throw new CodegenError("lwosol llmajal mmd3omch l7d sa3a", expr.pos.line, expr.pos.column);
        }
        return `${this.genExpression(expr.object, scope)}[${this.genExpression(expr.property, scope)}]`;
      }

      case "ArrayExpression":
        throw new CodegenError(
          "l9yam dyal lmasfofat mmd3ominch bchakl kaml l7d sa3a",
          expr.pos.line,
          expr.pos.column,
        );

      default:
        throw new CodegenError(`'${expr.type}' ba9i mmd3omach`, expr.pos.line, expr.pos.column);
    }
  }

  // ---------------------------------------------
  // Types
  // ---------------------------------------------

  private inferType(expr: Expression, scope: Scope): DjType {
    switch (expr.type) {
      case "NumericLiteral":
        return "ra9m";
      case "StringLiteral":
        return "string";
      case "BooleanLiteral":
        return "bool";
      case "NullLiteral":
        return "null";
      case "Identifier": {
        const type = scope.resolve(expr.name);
        if (!type) {
          throw new CodegenError(`'${expr.name}' mm3rofach`, expr.pos.line, expr.pos.column);
        }
        return type;
      }
      case "ArrayExpression": {
        if (expr.elements.length === 0) return "unknown[]";
        return `${this.inferType(expr.elements[0], scope)}[]`;
      }
      case "AssignmentExpression":
        return this.inferType(expr.value, scope);
      case "BinaryExpression": {
        if (["==", "!=", "<", "<=", ">", ">="].includes(expr.operator)) return "bool";
        if (expr.operator === "+") {
          const leftType = this.inferType(expr.left, scope);
          const rightType = this.inferType(expr.right, scope);
          return leftType === "string" || rightType === "string" ? "string" : "ra9m";
        }
        return "ra9m";
      }
      case "LogicalExpression":
        return "bool";
      case "UnaryExpression":
        return expr.operator === "!" ? "bool" : "ra9m";
      case "UpdateExpression":
        return "ra9m";
      case "ConditionalExpression": {
        const consequentType = this.inferType(expr.consequent, scope);
        const alternateType = this.inferType(expr.alternate, scope);
        return consequentType === alternateType ? consequentType : "unknown";
      }
      case "CallExpression": {
        if (expr.callee.type !== "Identifier") return "unknown";
        return this.functions.get(expr.callee.name)?.returnType ?? "unknown";
      }
      case "MemberExpression": {
        const objectType = this.inferType(expr.object, scope);
        return objectType.endsWith("[]") ? objectType.slice(0, -2) : "unknown";
      }
      default:
        return "unknown";
    }
  }

  private cType(type: DjType): string {
    if (type === "ra9m") return "double";
    if (type === "string") return "char*";
    if (type === "bool") return "bool";
    if (type === "null") return "void*";
    if (type.endsWith("[]")) return `${this.cType(type.slice(0, -2))}*`;
    return "void*"; // unknown — best effort, will likely fail to compile
  }

  private emit(line: string) {
    this.out.push("    ".repeat(this.indentLevel) + line);
  }

  private escapeString(value: string): string {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\t/g, "\\t");
  }
}

