
import { DjType } from "./types";
import { Codegen } from "./codegen"
export function cType(codegen: Codegen, type: DjType): string {
  let c: string;

switch (type.base) {
    case "ra9m":
        c = "double";
        break;
    case "nass":
        c = "char*";
        break;
    case "tona2i":
        c = "bool";
        break;
    case "khawi":
        c = "void*";
        break;
    default:
        c = "void*";
}
  return type.d !== undefined && type.d > 0 ? (c + "*".repeat(type.d)) : c
}

