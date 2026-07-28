import { DjType } from "./types";
import { CodegenError } from "../errors";
export function dj_print(value: string, type: DjType, line : number, column: number): string {
  if (type.d) {
    if (type.d > 0) throw new CodegenError(
        "tba3t lmasfofat mazal mamd3omch",
        line,
        column
    );
}
return `dj_print(${value});`
}
