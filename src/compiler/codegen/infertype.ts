import { Codegen } from "./codegen";
import { CodegenError} from "../errors";
import Scope from "./scope";
import { DjType } from "./types";
import { Expression } from "../ast";
import { isType } from "@/utils/showType";


export default function inferType(codegen: Codegen, expr: Expression, scope: Scope): DjType {
    switch (expr.type) {
      case "NumericLiteral":
        return {base:"ra9m"};
      case "StringLiteral":
        return {base:"nass"};
      case "BooleanLiteral":
        return {base: "tona2i"};
      case "NullLiteral":
        return {base: "khawi"};
      case "Identifier": {
        const type = scope.resolve(expr.name);
        if (!type) {
          throw new CodegenError(`'${expr.name}' mm3rofach`, expr.pos.line, expr.pos.column);
        }
        return type;
      }
      case "ArrayExpression": {
        if (expr.elements.length === 0) return { base: "unknown", d: 1 };
        const t = codegen.inferType(expr.elements[0], scope);
        return { base: t.base, d: t.d ? t.d + 1 : 0 };
      }
      case "AssignmentExpression":
        return codegen.inferType(expr.value, scope);
      case "BinaryExpression": {
        if (["==", "!=", "<", "<=", ">", ">="].includes(expr.operator)) return {base: "tona2i"};
        if (expr.operator === "+") {
          const leftType = codegen.inferType(expr.left, scope);
          const rightType = codegen.inferType(expr.right, scope);
          if (isType(leftType, "nass") || isType(rightType, "nass")) {
            return { base: "nass", d: 0 }
          }
          return { base: "ra9m", d: 0 };

        }
        return {base: "ra9m"};
      }
      case "LogicalExpression":
        return { base: "tona2i"};
      case "UnaryExpression":
        return expr.operator === "!" ? {base: "tona2i"} : {base: "ra9m"};
      case "UpdateExpression":
        return {base: "ra9m"};
      case "ConditionalExpression": {
        const consequentType = codegen.inferType(expr.consequent, scope);
        const alternateType = codegen.inferType(expr.alternate, scope);
        return consequentType === alternateType ? consequentType : {base: "unknown"}
      }
      case "CallExpression": {
        if (expr.callee.type !== "Identifier") return {base: "unknown"}
        return codegen.functions.get(expr.callee.name)?.returnType ?? { base: "unknown", d: 0 }
      }
      case "MemberExpression": {
        const objectType = codegen.inferType(expr.object, scope);
        if (objectType.d && objectType.d > 0) {
          return { base: objectType.base, d: objectType.d - 1};
        }
        return { base: "unknown"};

      }
      default:
        return {base: "unknown"};
    }
  }

