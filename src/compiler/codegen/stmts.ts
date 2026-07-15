import Scope from "./scope";
import { CodegenError } from "../errors";
import { Codegen } from "./codegen";
import { Statement } from "../ast";
export default function statementGen(codegen: Codegen, stmt: Statement, scope: Scope) {
    switch (stmt.type) {
      case "VariableDeclaration": {
        if (!stmt.init) {
          throw new CodegenError(`'${stmt.name}' khas t3ta liha 9ima`, stmt.pos.line, stmt.pos.column);
        }
        const type = stmt.typeAnnotation ?? codegen.inferType(stmt.init, scope);
        scope.declare(stmt.name, type);

        if (!type.d && stmt.init.type === "ArrayExpression") {
          const values = stmt.init.elements.map((e: any) => codegen.genExpression(e, scope));
          codegen.emit(`${codegen.cType(type)} ${stmt.name}[] = {${values.join(", ")}};`);
        } else {
          codegen.emit(`${codegen.cType(type)} ${stmt.name} = ${codegen.genExpression(stmt.init, scope)};`);
        }
        return;
      }

      case "FunctionDeclaration":
        // handled at the top level; nested function declarations aren't supported yet
        throw new CodegenError("ddawal lmtad5lin mmd3ominch l7ad sa3a", stmt.pos.line, stmt.pos.column);

      case "ReturnStatement":
        codegen.emit(stmt.argument ? `return ${codegen.genExpression(stmt.argument, scope)};` : "return;");
        return;

      case "IfStatement": {
        codegen.emit(`if (${codegen.genExpression(stmt.condition, scope)}) {`);
        codegen.genNestedBlock(stmt.consequent, scope);
        for (const branch of stmt.elseIfs) {
          codegen.emit(`} else if (${codegen.genExpression(branch.condition, scope)}) {`);
          codegen.genNestedBlock(branch.consequent, scope);
        }
        if (stmt.alternate) {
          codegen.emit(`} else {`);
          codegen.genNestedBlock(stmt.alternate, scope);
        }
        codegen.emit(`}`);
        return;
      }

      case "WhileStatement":
        codegen.emit(`while (${codegen.genExpression(stmt.condition, scope)}) {`);
        codegen.genNestedBlock(stmt.body, scope);
        codegen.emit(`}`);
        return;

      case "ForStatement": {
        const forScope = scope.child();
        let initStr = "";
        if (stmt.init?.type === "VariableDeclaration") {
          if (!stmt.init.init) {
            throw new CodegenError(`'${stmt.init.name}' khas t3ta liha 9ima`, stmt.pos.line, stmt.pos.column);
          }
          const type = stmt.init.typeAnnotation ?? codegen.inferType(stmt.init.init, forScope);
          forScope.declare(stmt.init.name, type);
          initStr = `${codegen.cType(type)} ${stmt.init.name} = ${codegen.genExpression(stmt.init.init, forScope)}`;
        } else if (stmt.init?.type === "ExpressionStatement") {
          initStr = codegen.genExpression(stmt.init.expression, forScope);
        }
        const condStr = stmt.condition ? codegen.genExpression(stmt.condition, forScope) : "";
        const updateStr = stmt.update ? codegen.genExpression(stmt.update, forScope) : "";

        codegen.emit(`for (${initStr}; ${condStr}; ${updateStr}) {`);
        codegen.genNestedBlock(stmt.body, forScope);
        codegen.emit(`}`);
        return;
      }

      case "BreakStatement":
        codegen.emit("break;");
        return;

      case "ContinueStatement":
        codegen.emit("continue;");
        return;

      case "BlockStatement":
        codegen.emit("{");
        codegen.genNestedBlock(stmt, scope);
        codegen.emit("}");
        return;

      case "PrintStatement": {
        const type = codegen.inferType(stmt.argument, scope);
        codegen.emit(codegen.genPrint(stmt.argument, type, scope));
        return;
      }

      case "ExpressionStatement":
        codegen.emit(`${codegen.genExpression(stmt.expression, scope)};`);
        return;

      default:
        throw new CodegenError(`'${stmt.type}' ba9i mmd3omach`, stmt.pos.line, stmt.pos.column);
    }
  }

