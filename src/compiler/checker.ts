import {
  Program,
  Statement,
  Expression,
  VariableDeclaration,
  FunctionDeclaration,
  Param,
  BlockStatement,
} from "./ast";
import { DarijaError } from "./errors";

// NOTE: classes, member/index type tracking, and the stdlib (kteb aside)
// are not covered here yet — none of that is emitted by the parser yet
// either. This checker only validates what can currently be parsed:
// variables, functions, control flow, and expressions.

interface VarInfo {
  kind: "dir" | "khli" | "param";
  type: string;
}

interface FunctionInfo {
  params: Param[];
  returnType: string | null;
}

class Scope {
  private vars = new Map<string, VarInfo>();
  constructor(private parent: Scope | null = null) {}

  declare(name: string, info: VarInfo, line: number, column: number) {
    if (this.vars.has(name)) {
      throw new DarijaError({
  code: "DCE13",
  stage: "checker",
  message: `'${name}' dija mdeclaria`,
  location: {
    line,
    column,
  },
  hint: "",
});
    }
    this.vars.set(name, info);
  }

  resolve(name: string): VarInfo | undefined {
    return this.vars.get(name) ?? this.parent?.resolve(name);
  }

  child(): Scope {
    return new Scope(this);
  }
}

const UNKNOWN = "mm3rofch";

export class Checker {
  private globalScope = new Scope();
  private functions = new Map<string, FunctionInfo>();
  private loopDepth = 0;
  private functionStack: FunctionInfo[] = [];
  public check(program: Program) {
    // Pass 1: hoist function signatures so calls can appear before the
    // declaration in source order (and so recursion always works).
    for (const stmt of program.body) {
      if (stmt.type === "FunctionDeclaration") {
        this.registerFunction(stmt);
      }
    }

    // Pass 2: validate every statement, including function bodies.
    for (const stmt of program.body) {
      this.checkStatement(stmt, this.globalScope);
    }
  }

  private registerFunction(fn: FunctionDeclaration) {
    if (this.functions.has(fn.name)) {
        throw new DarijaError({
  code: "DCE13",
  stage: "checker",
  message: `dala '${fn.name}' dija mdeclaria`,
  location: {
        line: fn.pos.line,
    column: fn.pos.column,
  },
  hint: '',
});
    }
    this.functions.set(fn.name, { params: fn.params, returnType: fn.returnType });
  }

  private checkStatement(stmt: Statement, scope: Scope) {
    switch (stmt.type) {
      case "VariableDeclaration":
        return this.checkVariableDeclaration(stmt, scope);
      case "FunctionDeclaration":
        return this.checkFunctionDeclaration(stmt);
      case "ReturnStatement": {
        const fn = this.functionStack[this.functionStack.length - 1];
        if (!fn) {
          throw new DarijaError({
  code: "DCE14",
  stage: "checker",
  message: "'raj3' mst5dma bra dyal ddalla",
  location: {
        line: stmt.pos.line,
    column: stmt.pos.column,
  },
  hint: '',
});
        }
        if (stmt.argument) {
          const argType = this.inferType(stmt.argument, scope);
          if (fn.returnType && !this.compatible(fn.returnType, argType)) {
            throw new DarijaError({
  code: "DCE15",
  stage: "checker",
  message: `twa93n ${fn.returnType}, wlkin l9ina ${argType}`,
  location: {
        line: stmt.pos.line,
    column: stmt.pos.column,
  }
});
          }
        }
        return;
      }
      case "IfStatement": {
        this.inferType(stmt.condition, scope);
        this.checkBlock(stmt.consequent, scope);
        for (const branch of stmt.elseIfs) {
          this.inferType(branch.condition, scope);
          this.checkBlock(branch.consequent, scope);
        }
        if (stmt.alternate) this.checkBlock(stmt.alternate, scope);
        return;
      }
      case "WhileStatement": {
        this.inferType(stmt.condition, scope);
        this.loopDepth++;
        this.checkBlock(stmt.body, scope);
        this.loopDepth--;
        return;
      }
      case "ForStatement": {
        const forScope = scope.child();
        if (stmt.init) {
          if (stmt.init.type === "VariableDeclaration") {
            this.checkVariableDeclaration(stmt.init, forScope);
          } else {
            this.inferType(stmt.init.expression, forScope);
          }
        }
        if (stmt.condition) this.inferType(stmt.condition, forScope);
        if (stmt.update) this.inferType(stmt.update, forScope);
        this.loopDepth++;
        this.checkBlock(stmt.body, forScope);
        this.loopDepth--;
        return;
      }
      case "BreakStatement":
        if (this.loopDepth === 0) {
        throw new DarijaError({
  code: "DCE14",
  stage: "checker",
  message: "'qta3' mst5dma bra dyal dwara",
  location: {
        line: stmt.pos.line,
    column: stmt.pos.column,
  }
});
        }
        return;
      case "ContinueStatement":
        if (this.loopDepth === 0) {
        throw new DarijaError({
  code: "DCE14",
  stage: "checker",
  message: "'kml' mst5dma bra by dwara",
  location: {
        line: stmt.pos.line,
    column: stmt.pos.column,
  }
});
        }
        return;
      case "BlockStatement":
        return this.checkBlock(stmt, scope);
      case "PrintStatement":
        this.inferType(stmt.argument, scope);
        return;
      case "ExpressionStatement":
        this.inferType(stmt.expression, scope);
        return;
      default:
        throw new DarijaError({
  code: "DCE1",
  stage: "checker",
  message: `'${stmt.type}' mmd3omach hna`,
  location: {
        line: stmt.pos.line,
    column: stmt.pos.column,
  }
});
    }
  }

  private checkVariableDeclaration(decl: VariableDeclaration, scope: Scope) {
    let type = decl.typeAnnotation ?? UNKNOWN;

    if (decl.init) {
      const initType = this.inferType(decl.init, scope);
      if (decl.typeAnnotation && !this.compatible(decl.typeAnnotation, initType)) {
        throw new DarijaError({
  code: "DCE15",
  stage: "checker",
  message: `twa93na ${decl.typeAnnotation}, wlkin l9ina ${initType}`,
  location: {
        line: decl.pos.line,
    column: decl.pos.column,
  }
});
      }
      // Only lock the variable to a concrete type when the user asked for
      // that with an explicit annotation. Without one, `dir` stays dynamic
      // (UNKNOWN) so later reassignment to a different type is allowed —
      // see about.md, "Flexibility over restrictions".
    } else if (decl.kind === "khli") {
      throw new DarijaError({
  code: "DCE16",
  stage: "checker",
  message: `'${decl.name}' howa tabit idan khaso 9ima`,
  location: {
        line: decl.pos.line,
    column: decl.pos.column,
  }
});
    }

    scope.declare(decl.name, { kind: decl.kind, type }, decl.pos.line, decl.pos.column);
  }

  private checkFunctionDeclaration(fn: FunctionDeclaration) {
    if (!this.functions.has(fn.name)) this.registerFunction(fn);

    const info = this.functions.get(fn.name)!;
    const fnScope = this.globalScope.child();

    for (const param of fn.params) {
      if (param.defaultValue && param.typeAnnotation) {
        const defaultType = this.inferType(param.defaultValue, fnScope);
        if (!this.compatible(param.typeAnnotation, defaultType)) {
          throw new DarijaError({
  code: "DCE15",
  stage: "checker",
  message: `twa93na ${param.typeAnnotation}, wlkin l9ina ${defaultType}`,
  location: {
        line: param.pos.line,
    column: param.pos.column
  }
});
        }
      }
      fnScope.declare(
        param.name,
        { kind: "param", type: param.typeAnnotation ?? UNKNOWN },
        param.pos.line,
        param.pos.column,
      );
    }

    this.functionStack.push(info);
    this.checkBlock(fn.body, fnScope);
    this.functionStack.pop();
  }

  private checkBlock(block: BlockStatement, parentScope: Scope) {
    const scope = parentScope.child();
    for (const stmt of block.body) {
      this.checkStatement(stmt, scope);
    }
  }

  // ---------------------------------------------
  // Expressions -> inferred type
  // ---------------------------------------------

  private inferType(expr: Expression, scope: Scope): string {
    switch (expr.type) {
      case "NumericLiteral":
        return "ra9m";
      case "StringLiteral":
        return "string";
      case "BooleanLiteral":
        return "bool";
      case "NullLiteral":
        return "null";

      case "ArrayExpression": {
        if (expr.elements.length === 0) return `${UNKNOWN}[]`;
        const elementType = this.inferType(expr.elements[0], scope);
        for (const element of expr.elements) this.inferType(element, scope);
        return `${elementType}[]`;
      }

      case "Identifier": {
        const info = scope.resolve(expr.name);
        if (!info) {
          throw new DarijaError({
  code: "DCE1",
  stage: "checker",
  message: `'${expr.name}' mm3rofach`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column,
  },
});
        }
        return info.type;
      }

      case "AssignmentExpression": {
        const valueType = this.inferType(expr.value, scope);
        if (expr.target.type === "Identifier") {
          const info = scope.resolve(expr.target.name);
          if (!info) {
            throw new DarijaError({
  code: "DCE1",
  stage: "checker",
  message: `'${expr.target.name}' mm3rofch`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
          }
          if (info.kind === "khli") {
            throw new DarijaError({
  code: "DCE16",
  stage: "checker",
  message: `mat9drh t3ti 9ima l '${expr.target.name}', la79ach how tabit (khli)`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
          }
          if (info.type !== UNKNOWN && !this.compatible(info.type, valueType)) {
            throw new DarijaError({
  code: "DCE15",
  stage: "checker",
  message: `twa93na ${info.type}, wlkin l9ina ${valueType}`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
          }
        } else {
          this.inferType(expr.target, scope);
        }
        return valueType;
      }

      case "BinaryExpression": {
        const leftType = this.inferType(expr.left, scope);
        const rightType = this.inferType(expr.right, scope);

        if (["==", "!=", "<", "<=", ">", ">="].includes(expr.operator)) {
          return "bool";
        }

        if (expr.operator === "+") {
          if (leftType === "string" || rightType === "string") return "string";
          this.expectType(leftType, "ra9m", expr.pos);
          this.expectType(rightType, "ra9m", expr.pos);
          return "ra9m";
        }

        this.expectType(leftType, "ra9m", expr.pos);
        this.expectType(rightType, "ra9m", expr.pos);
        return "ra9m";
      }

      case "LogicalExpression":
        this.inferType(expr.left, scope);
        this.inferType(expr.right, scope);
        return "bool";

      case "UnaryExpression": {
        const argType = this.inferType(expr.argument, scope);
        if (expr.operator === "!") return "bool";
        this.expectType(argType, "ra9m", expr.pos);
        return "ra9m";
      }

      case "UpdateExpression": {
        const argType = this.inferType(expr.argument, scope);
        this.expectType(argType, "ra9m", expr.pos);
        return "ra9m";
      }

      case "ConditionalExpression": {
        this.inferType(expr.condition, scope);
        const consequentType = this.inferType(expr.consequent, scope);
        const alternateType = this.inferType(expr.alternate, scope);
        return consequentType === alternateType ? consequentType : UNKNOWN;
      }

      case "CallExpression": {
        if (expr.callee.type !== "Identifier") {
          throw new DarijaError({
  code: "DCE-2",
  stage: "checker",
  message: "ghir dawal direct lli md3omim",
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
        }
        const fn = this.functions.get(expr.callee.name);
        if (!fn) {
          throw new DarijaError({
  code: "DCE1",
  stage: "checker",
  message: `dala '${expr.callee.name}' mm3rofach`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
        }

        const required = fn.params.filter((p) => !p.defaultValue).length;
        if (expr.args.length < required || expr.args.length > fn.params.length) {
          throw new DarijaError({
  code: "DCE17",
  stage: "checker",
  message: `'${expr.callee.name}' twa93 ${required === fn.params.length ? required : `${required}-${fn.params.length}`} dyal lhojaj, wlkin l9a ${expr.args.length}`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
        }

        expr.args.forEach((arg, i) => {
          const argType = this.inferType(arg, scope);
          const param = fn.params[i];
          if (param.typeAnnotation && !this.compatible(param.typeAnnotation, argType)) {
            throw new DarijaError({
  code: "DCE15",
  stage: "checker",
  message: `twa93na ${param.typeAnnotation}, wlkin l9ina ${argType}`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
          }
        });

        return fn.returnType ?? UNKNOWN;
      }

      case "MemberExpression": {
        const objectType = this.inferType(expr.object, scope);
        if (expr.computed) this.inferType(expr.property, scope);
        return objectType.endsWith("[]") ? objectType.slice(0, -2) : UNKNOWN;
      }

      default:
        throw new DarijaError({
  code: "DCE-2",
  stage: "checker",
  message: `'${expr.type}' ba9i mmd3omach`,
  location: {
        line: expr.pos.line,
    column: expr.pos.column
  }
});
    }
  }

  private expectType(actual: string, expected: string, pos: { line: number; column: number }) {
    if (actual !== expected && actual !== UNKNOWN) {
      throw new DarijaError({
  code: "DCE15",
  stage: "checker",
  message: `twa93na ${expected}, wlkin l9ina ${actual}`,
  location: {
    line: pos.line,
    column: pos.column
  }
});
    }
  }

  private compatible(declared: string, actual: string): boolean {
    if (declared === UNKNOWN || actual === UNKNOWN) return true;
    return declared === actual;
  }
}

