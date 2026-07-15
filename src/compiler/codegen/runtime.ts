import { DjType } from "./types";
import { CodegenError } from "../errors";
export function dj_print(value: any, type: DjType, line : number, column: number): string {
  if (type.d) {
    if (type.d > 0) throw new CodegenError(
        "tba3t lmasfofat mazal mamd3omch",
        line,
        column
    );
}
  switch (type.base) {
    case "nass":
    return `printf("%s\\n", ${value});`;
    case "ra9m": 
      return `printf("%g\\n", ${value});`;
    case "tona2i":
      return `printf("%s\\n", ${value} ? "sa7i7" : "ghalat");`
    case "khawi":
      return `printf("khawi\\n");`
    case "unknown":
      return `printf("mm3rofch\\n");`
    default: 
      throw new CodegenError(`ma9drnach ntab3o had naw3 l7ad sa3a : ${type}`, line, column)
  }
}
