import { Expression } from "../ast";
import Scope from "./scope";
import { Codegen } from "./codegen";
import { CodegenError } from "../errors";
import { isType } from "@/utils/showType";

export default function genExpression(codegen: Codegen, expr: Expression, scope: Scope): string {
    switch (expr.type) {
      case "NumericLiteral":
        return String(expr.value);
      case "StringLiteral":
        return `"${codegen.escapeString(expr.value)}"`;
      case "BooleanLiteral":
        return expr.value ? "true" : "false";
      case "NullLiteral":
        return "NULL";

      case "Identifier":
        return expr.name;

      case "AssignmentExpression":
        return `${codegen.genExpression(expr.target, scope)} = ${codegen.genExpression(expr.value, scope)}`;

      case "BinaryExpression": {
        const leftType = codegen.inferType(expr.left, scope);
        const rightType = codegen.inferType(expr.right, scope);
        const left = codegen.genExpression(expr.left, scope);
        const right = codegen.genExpression(expr.right, scope);

        if (expr.operator === "+" && (isType(leftType, "nass")) || isType(rightType, "nass")) {
          return `dj_concat(${left}, ${right})`;
        }
        if (expr.operator === "**") {
          return `pow(${left}, ${right})`;
        }
        return `(${left} ${expr.operator} ${right})`;
      }

      case "LogicalExpression": {
        const op = expr.operator === "&&" ? "&&" : "||";
        return `(${codegen.genExpression(expr.left, scope)} ${op} ${codegen.genExpression(expr.right, scope)})`;
      }

      case "UnaryExpression":
        return `(${expr.operator}${codegen.genExpression(expr.argument, scope)})`;

      case "UpdateExpression": {
        const arg = codegen.genExpression(expr.argument, scope);
        return expr.prefix ? `(${expr.operator}${arg})` : `(${arg}${expr.operator})`;
      }

      case "ConditionalExpression":
        return `(${codegen.genExpression(expr.condition, scope)} ? ${codegen.genExpression(
          expr.consequent,
          scope,
        )} : ${codegen.genExpression(expr.alternate, scope)})`;

      case "CallExpression": {
        if (expr.callee.type !== "Identifier") {
          throw new CodegenError("ghir dawal lli direct lli md3omin", expr.pos.line, expr.pos.column);
        }
        const args = expr.args.map((a) => codegen.genExpression(a, scope)).join(", ");
        return `${expr.callee.name}(${args})`;
      }

      case "MemberExpression": {
        if (!expr.computed) {
          throw new CodegenError("lwosol llmajal mmd3omch l7d sa3a", expr.pos.line, expr.pos.column);
        }
        return `${codegen.genExpression(expr.object, scope)}[${codegen.genExpression(expr.property, scope)}]`;
      }

      case "ArrayExpression":
        throw new CodegenError(
          "l9yam dyal lmasfofat mmd3ominch bchakl kaaml l7d sa3a",
          expr.pos.line,
          expr.pos.column,
        );

      default:
        throw new CodegenError(`'${expr.type}' ba9i mmd3omach`, expr.pos.line, expr.pos.column);
    }
  }

