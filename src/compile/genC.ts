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
  /*const escaped = node.value
    .replace(/\\/g, '\\\\')  // escape backslashes first
    .replace(/"/g, '\\"')    // escape quotes
    .replace(/%/g, '%%')     // escape % for printf
//    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');  // handle \r too*/

  return `printf("${node.value}\\n");`;

      default:
      // @ts-expect-error
        throw new Error(`Unknown node: ${node.type}`);
    }
  }
}
