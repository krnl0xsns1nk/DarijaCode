import { DjType } from "@/compiler/codegen/types";

export function showType(type: DjType){
  return type.d ? type.base + "[]".repeat(type.d) : type.base
}
export function isType(type: DjType, base: DjType["base"], d = 0): boolean {
     return type.base === base && type.d === d;
}
