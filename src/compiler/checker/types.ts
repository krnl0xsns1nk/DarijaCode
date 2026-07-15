import { DjType } from "../codegen/types";
import { DarijaError } from "../errors";
import { showType, isType} from "@/utils/showType";

export const UNKNOWN = "unknown";

export class TypeChecker {
  
  resolveType(type: DjType, line: number, column: number): DjType {
    if (!["ra9m", "nass", "tona2i", "khawi"].includes(type.base)) {
      throw new DarijaError({
        code: "DCE18",
        stage: "checker",
        message: `had naw3 '${showType(type)}' mkaynch awla mmd3omch`,
        location: { line, column },
        hint: "stkhdm chi naw3 dija kayn bhal : 'ra9m', 'nass' etc..",
      });
    }
    return { base: type.base, d: type.d };
  }

  /**
   * Check if two types are compatible.
   * Returns true if types match or either is UNKNOWN (dynamic).
   */
  compatible(declared: DjType, actual: DjType): boolean {
    if (declared.base === UNKNOWN || actual.base === UNKNOWN) return true;
    return showType(declared) === showType(actual);
  }

  isType(type: DjType, base: DjType["base"], d = 0): boolean {
    return isType(type, base, d)
  }

  /**
   * Assert that actual type matches expected base type.
   * Throws DCE15 on mismatch (unless actual is UNKNOWN).
   */
  expectType(
    actual: DjType,
    expected: DjType["base"],
    pos: { line: number; column: number }
  ) {
    if (!this.isType(actual, expected) && actual.base !== UNKNOWN) {
      throw new DarijaError({
        code: "DCE15",
        stage: "checker",
        message: `twa93na ${expected}, wlkin l9ina ${showType(actual)}`,
        location: { line: pos.line, column: pos.column },
      });
    }
  }
}

