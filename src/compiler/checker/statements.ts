import { Statement, BlockStatement, VariableDeclaration, FunctionDeclaration } 
from "../ast";
import { DjType } from "../codegen/types";
import { DarijaError } from "../errors";
import { showType } from "@/utils/showType";
import { Scope, FunctionRegistry, FunctionInfo } from "./scope";
import { TypeChecker, UNKNOWN } from "./types";
import { ExpressionChecker } from "./expressions";

export class StatementChecker {
  private typeChecker: TypeChecker;
  private expressionChecker: ExpressionChecker;
  private loopDepth = 0;
  private functionStack: FunctionInfo[] = [];

  constructor(
    private functions: FunctionRegistry,
    private globalScope: Scope
  ) {
    this.typeChecker = new TypeChecker();
    this.expressionChecker = new ExpressionChecker(functions);
  }

  /**
   * Check a statement and validate it semantically.
   */
  checkStatement(stmt: Statement, scope: Scope) {
    switch (stmt.type) {
      case "VariableDeclaration":
        return this.checkVariableDeclaration(stmt, scope);

      case "FunctionDeclaration":
        return this.checkFunctionDeclaration(stmt);

      case "ReturnStatement":
        return this.checkReturnStatement(stmt, scope);

      case "IfStatement":
        return this.checkIfStatement(stmt, scope);

      case "WhileStatement":
        return this.checkWhileStatement(stmt, scope);

      case "ForStatement":
        return this.checkForStatement(stmt, scope);

      case "BreakStatement":
        return this.checkBreakStatement(stmt);

      case "ContinueStatement":
        return this.checkContinueStatement(stmt);

      case "BlockStatement":
        return this.checkBlock(stmt, scope);

      case "PrintStatement":
        return this.checkPrintStatement(stmt, scope);

      case "ExpressionStatement":
        return this.checkExpressionStatement(stmt, scope);

      default:
        throw new DarijaError({
          code: "DCE1",
          stage: "checker",
          message: `'${(stmt as any).type}' mmd3omach`,
          location: {
            line: stmt.pos.line,
            column: stmt.pos.column,
          },
        });
    }
  }

  private checkVariableDeclaration(
    decl: VariableDeclaration,
    scope: Scope
  ) {
    let type: DjType = decl.typeAnnotation
      ? this.typeChecker.resolveType(
          decl.typeAnnotation,
          decl.pos.line,
          decl.pos.column
        )
      : { base: "unknown", d: 0 };

    if (decl.init) {
      const initType = this.expressionChecker.inferType(decl.init, scope);

      if (
        decl.typeAnnotation &&
        !this.typeChecker.compatible(decl.typeAnnotation, initType)
      ) {
        throw new DarijaError({
          code: "DCE15",
          stage: "checker",
          message: `twa93na ${showType(decl.typeAnnotation)}, wlkin l9ina ${showType(
            initType
          )}`,
          location: {
            line: decl.pos.line,
            column: decl.pos.column,
          },
          hint: `ach ban link tstkhdm ${showType(
            decl.typeAnnotation
          )} fbalst ${showType(initType)}`,
        });
      }

      if (decl.typeAnnotation) {
        type = initType;
      }
    } else if (decl.kind === "khli") {
      throw new DarijaError({
        code: "DCE16",
        stage: "checker",
        message: `'${decl.name}' howa tabit idan khaso 9ima flwl`,
        location: {
          line: decl.pos.line,
          column: decl.pos.column,
        },
      });
    }

    scope.declare(
      decl.name,
      { kind: decl.kind, type },
      decl.pos.line,
      decl.pos.column
    );
  }

  private checkFunctionDeclaration(fn: FunctionDeclaration) {
    if (!this.functions.has(fn.name)) {
      this.registerFunction(fn);
    }

    const info = this.functions.get(fn.name)!;
    const fnScope = this.globalScope.child();

    // Declare parameters in function scope
    for (const param of fn.params) {
      if (param.defaultValue && param.typeAnnotation) {
        const defaultType = this.expressionChecker.inferType(
          param.defaultValue,
          fnScope
        );

        if (
          !this.typeChecker.compatible(param.typeAnnotation, defaultType)
        ) {
          throw new DarijaError({
            code: "DCE15",
            stage: "checker",
            message: `twa93na ${showType(param.typeAnnotation)}, wlkin l9ina ${showType(
              defaultType
            )}`,
            location: {
              line: param.pos.line,
              column: param.pos.column,
            },
            hint: `ach ban link tstkhdm ${showType(
              param.typeAnnotation
            )} fbalst ${showType(defaultType)}`,
          });
        }
      }

      fnScope.declare(
        param.name,
        {
          kind: "param",
          type: param.typeAnnotation ?? { base: UNKNOWN, d: 0 },
        },
        param.pos.line,
        param.pos.column
      );
    }

    this.functionStack.push(info);
    this.checkBlock(fn.body, fnScope);
    this.functionStack.pop();
  }

  private registerFunction(fn: FunctionDeclaration) {
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
        returnType: fn.returnType ?? { base: "khawi", d: 0 },
      },
      fn.pos.line,
      fn.pos.column
    );
  }

  private checkReturnStatement(stmt: any, scope: Scope) {
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
        hint: "dirha lldakhl dyal dalla",
      });
    }

    if (stmt.argument) {
      const argType = this.expressionChecker.inferType(stmt.argument, scope);
      const tp: DjType = { base: fn.returnType.base, d: fn.returnType.d };

      if (fn.returnType && !this.typeChecker.compatible(tp, argType)) {
        throw new DarijaError({
          code: "DCE15",
          stage: "checker",
          message: `mknach kanstaw l9ima dyal '${showType(
            argType
          )}', kona mtw93in '${showType(fn.returnType)}'`,
          location: {
            line: stmt.pos.line,
            column: stmt.pos.column,
          },
          hint: `ach ban lik traj3 ${showType(fn.returnType)} fbalst ${showType(
            argType
          )} ?`,
        });
      }
    }
  }

  private checkIfStatement(stmt: any, scope: Scope) {
    this.expressionChecker.inferType(stmt.condition, scope);
    this.checkBlock(stmt.consequent, scope);

    for (const branch of stmt.elseIfs) {
      this.expressionChecker.inferType(branch.condition, scope);
      this.checkBlock(branch.consequent, scope);
    }

    if (stmt.alternate) {
      this.checkBlock(stmt.alternate, scope);
    }
  }

  private checkWhileStatement(stmt: any, scope: Scope) {
    this.expressionChecker.inferType(stmt.condition, scope);

    this.loopDepth++;
    this.checkBlock(stmt.body, scope);
    this.loopDepth--;
  }

  private checkForStatement(stmt: any, scope: Scope) {
    const forScope = scope.child();

    if (stmt.init) {
      if (stmt.init.type === "VariableDeclaration") {
        this.checkVariableDeclaration(stmt.init, forScope);
      } else {
        this.expressionChecker.inferType(stmt.init.expression, forScope);
      }
    }

    if (stmt.condition) {
      this.expressionChecker.inferType(stmt.condition, forScope);
    }

    if (stmt.update) {
      this.expressionChecker.inferType(stmt.update, forScope);
    }

    this.loopDepth++;
    this.checkBlock(stmt.body, forScope);
    this.loopDepth--;
  }

  private checkBreakStatement(stmt: any) {
    if (this.loopDepth === 0) {
      throw new DarijaError({
        code: "DCE14",
        stage: "checker",
        message: "'qta3' mst5dma bra dyal dwara",
        location: {
          line: stmt.pos.line,
          column: stmt.pos.column,
        },
        hint: "dir '9ta3' fldakhl dyal chi dwara",
      });
    }
  }

  private checkContinueStatement(stmt: any) {
    if (this.loopDepth === 0) {
      throw new DarijaError({
        code: "DCE14",
        stage: "checker",
        message: "'kml' mst5dma bra by dwara",
        location: {
          line: stmt.pos.line,
          column: stmt.pos.column,
        },
        hint: "dir 'kml' fldakhl dyal chi dwara",
      });
    }
  }

  private checkBlock(block: BlockStatement, parentScope: Scope) {
    const scope = parentScope.child();
    for (const stmt of block.body) {
      this.checkStatement(stmt, scope);
    }
  }

  private checkPrintStatement(stmt: any, scope: Scope) {
    this.expressionChecker.inferType(stmt.argument, scope);
  }

  private checkExpressionStatement(stmt: any, scope: Scope) {
    this.expressionChecker.inferType(stmt.expression, scope);
  }
}

