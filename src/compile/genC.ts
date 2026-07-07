import { Stmt } from "./tokens";
/*type program = {
  type: "program",
  body: stmT[]
}
type nodeType = stmT | program*/
export class genC {
  public gen(node: Stmt): string{

    switch (node.type) {

      case "program":
        return `#include <stdio.h>
int main() {
${node.body.map((stmt: any) => "    " + this.gen(stmt)).join("\n")}
    return 0;
}`;

      case "printStmt":
        return `printf("${node.value}");`;

      default:
      // @ts-expect-error
        throw new Error(`Unknown node: ${node.type}`);
    }
  }
}
