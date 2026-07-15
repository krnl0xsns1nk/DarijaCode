import { Expression } from "../ast";
import { DjType } from "../codegen/types";
import { DarijaError } from "../errors";
import { showType } from "@/utils/showType";
import { Scope, FunctionRegistry, FunctionInfo } from "./scope";
import { TypeChecker, UNKNOWN } from "./types";

/**
 * ExpressionChecker handles type inference for all expression types.
 * Validates expressions and returns their inferred types.
 */
export class ExpressionChecker {
  private typeChecker: TypeChecker;

  constructor(private functions: FunctionRegistry) {
    this.typeChecker = new TypeChecker();
  }

  /**
   * Infer the type of an expression.
   * Performs semantic validation and returns the resulting type.
   */
  inferType(expr: Expression, scope: Scope): DjType {
    switch (expr.type) {
      case "NumericLiteral":
        return { base: "ra9m", d: 0 };

      case "StringLiteral":
        return { base: "nass", d: 0 };

      case "BooleanLiteral":
        return { base: "tona2i", d: 0 };

      case "NullLiteral":
        return { base: "khawi", d: 0 };

      case "ArrayExpression":
        return this.checkArrayExpression(expr, scope);

      case "Identifier":
        return this.checkIdentifier(expr, scope);

      case "AssignmentExpression":
        return this.checkAssignmentExpression(expr, scope);

      case "BinaryExpression":
        return this.checkBinaryExpression(expr, scope);

      case "LogicalExpression":
        return this.checkLogicalExpression(expr, scope);

      case "UnaryExpression":
        return this.checkUnaryExpression(expr, scope);

      case "UpdateExpression":
        return this.checkUpdateExpression(expr, scope);

      case "ConditionalExpression":
        return this.checkConditionalExpression(expr, scope);

      case "CallExpression":
        return this.checkCallExpression(expr, scope);

      case "MemberExpression":
        return this.checkMemberExpression(expr, scope);

      default:
        throw new DarijaError({
          code: "DCE-2",
          stage: "checker",
          message: `'${(expr as any).type}' ba9i mmd3omach`,
          location: {
            line: expr.pos.line,
            column: expr.pos.column,
          },
        });
    }
  }

  private checkArrayExpression(expr: any, scope: Scope): DjType {
    if (expr.elements.length === 0) {
      return { base: "unknown", d: 1 };
    }

    const elementType = this.inferType(expr.elements[0], scope);
    for (const element of expr.elements) {
      this.inferType(element, scope);
    }
    return {
      base: elementType.base,
      d: (elementType.d ?? 0) + 1,
    };
  }

  private checkIdentifier(expr: any, scope: Scope): DjType {
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

  private checkAssignmentExpression(expr: any, scope: Scope): DjType {
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
            column: expr.pos.column,
          },
        });
      }

      if (info.kind === "khli") {
        throw new DarijaError({
          code: "DCE16",
          stage: "checker",
          message: `mat9drh t3ti 9ima l '${expr.target.name}', la79ach how tabit (m3rf b 'khli')`,
          location: {
            line: expr.pos.line,
            column: expr.pos.column,
          },
        });
      }

      if (
        info.type.base !== UNKNOWN &&
        !this.typeChecker.compatible(info.type, valueType)
      ) {
        throw new DarijaError({
          code: "DCE15",
          stage: "checker",
          message: `twa93na ${showType(info.type)}, wlkin l9ina ${showType(
            valueType
          )}`,
          location: {
            line: expr.pos.line,
            column: expr.pos.column,
          },
        });
      }
    } else {
      this.inferType(expr.target, scope);
    }

    return valueType;
  }

  private checkBinaryExpression(expr: any, scope: Scope): DjType {
    const leftType = this.inferType(expr.left, scope);
    const rightType = this.inferType(expr.right, scope);

    if (["==", "!=", "<", "<=", ">", ">="].includes(expr.operator)) {
      return { base: "tona2i", d: 0 };
    }

    if (expr.operator === "+") {
      if (this.typeChecker.isType(leftType, "nass") || this.typeChecker.isType(rightType, "nass")) {
        return { base: "nass", d: 0 };
      }
      this.typeChecker.expectType(leftType, "ra9m", expr.pos);
      this.typeChecker.expectType(rightType, "ra9m", expr.pos);
      return { base: "ra9m", d: 0 };
    }

    // Other arithmetic operators require numbers
    this.typeChecker.expectType(leftType, "ra9m", expr.pos);
    this.typeChecker.expectType(rightType, "ra9m", expr.pos);
    return { base: "ra9m", d: 0 };
  }

  private checkLogicalExpression(expr: any, scope: Scope): DjType {
    this.inferType(expr.left, scope);
    this.inferType(expr.right, scope);
    return { base: "tona2i", d: 0 };
  }

  private checkUnaryExpression(expr: any, scope: Scope): DjType {
    const argType = this.inferType(expr.argument, scope);

    if (expr.operator === "!") {
      return { base: "tona2i", d: 0 };
    }

    this.typeChecker.expectType(argType, "ra9m", expr.pos);
    return { base: "ra9m", d: 0 };
  }

  private checkUpdateExpression(expr: any, scope: Scope): DjType {
    const argType = this.inferType(expr.argument, scope);
    this.typeChecker.expectType(argType, "ra9m", expr.pos);
    return { base: "ra9m", d: 0 };
  }

  private checkConditionalExpression(expr: any, scope: Scope): DjType {
    this.inferType(expr.condition, scope);
    const consequentType = this.inferType(expr.consequent, scope);
    const alternateType = this.inferType(expr.alternate, scope);

    return consequentType === alternateType
      ? consequentType
      : { base: UNKNOWN, d: 0 };
  }

  private checkCallExpression(expr: any, scope: Scope): DjType {
    if (expr.callee.type !== "Identifier") {
      throw new DarijaError({
        code: "DCE-2",
        stage: "checker",
        message: "ghir dawal direct lli md3omim",
        location: {
          line: expr.pos.line,
          column: expr.pos.column,
        },
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
          column: expr.pos.column,
        },
        hint: `dir ta3rif l dala ${expr.callee.name} bhal haka : dalla ${expr.callee.name}(){ chi logic }}`,
      });
    }

    const required = fn.params.filter((p) => !p.defaultValue).length;
    if (
      expr.args.length < required ||
      expr.args.length > fn.params.length
    ) {
      throw new DarijaError({
        code: "DCE17",
        stage: "checker",
        message: `'${expr.callee.name}' twa93 ${
          required === fn.params.length
            ? required
            : `${required}-${fn.params.length}`
        } dyal lhojaj, wlkin l9a ${expr.args.length}`,
        location: {
          line: expr.pos.line,
          column: expr.pos.column,
        },
      });
    }

    expr.args.forEach((arg: Expression, i: number) => {
      const argType = this.inferType(arg, scope);
      const param = fn.params[i];

      if (
        param.typeAnnotation &&
        !this.typeChecker.compatible(param.typeAnnotation, argType)
      ) {
        throw new DarijaError({
          code: "DCE15",
          stage: "checker",
          message: `twa93na ${showType(param.typeAnnotation)}, wlkin l9ina ${showType(
            argType
          )}`,
          location: {
            line: expr.pos.line,
            column: expr.pos.column,
          },
        });
      }
    });

    return fn.returnType ?? { base: UNKNOWN, d: 0 };
  }

  private checkMemberExpression(expr: any, scope: Scope): DjType {
    const objectType = this.inferType(expr.object, scope);
    if (expr.computed) this.inferType(expr.property, scope);

    return objectType.d
      ? { base: objectType.base, d: objectType.d - 1 }
      : { base: UNKNOWN, d: 0 };
  }
}

