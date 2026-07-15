import { DarijaError } from "../errors";
import { DjType } from "../codegen/types";

export interface VarInfo {
  kind: "dir" | "khli" | "param";
  type: DjType;
}

export interface FunctionInfo {
  params: Array<{
    name: string;
    typeAnnotation?: DjType;
    defaultValue?: any;
    pos: { line: number; column: number };
  }>;
  returnType: DjType;
}

//welcome to the scope

export class Scope {
  private vars = new Map<string, VarInfo>();

  constructor(private parent: Scope | null = null) {}

  declare(name: string, info: VarInfo, line: number, column: number) {
    if (this.vars.has(name)) {
      throw new DarijaError({
        code: "DCE13",
        stage: "checker",
        message: `'${name}' dija m3rfa`,
        location: { line, column },
        hint: `${name} = 9ima fblast (dir/khli ${name} = 9ima)`,
      });
    }
    this.vars.set(name, info);
  }

  resolve(name: string): VarInfo | undefined {
    return this.vars.get(name) ?? this.parent?.resolve(name);
  }

  child(): Scope {
    return new Scope(this);
  }
}

/**
 * Global function registry.
 * Tracks all function signatures for validation during calls and recursion.
 */
export class FunctionRegistry {
  private functions = new Map<string, FunctionInfo>();

  register(name: string, info: FunctionInfo, line: number, column: number) {
    if (this.functions.has(name)) {
      throw new DarijaError({
        code: "DCE13",
        stage: "checker",
        message: `dala '${name}' dija m3rfa`,
        location: { line, column },
        hint: `stkhdm dalla dyal ${name}() awla dir dalla jdida`,
      });
    }
    this.functions.set(name, info);
  }

  get(name: string): FunctionInfo | undefined {
    return this.functions.get(name);
  }

  has(name: string): boolean {
    return this.functions.has(name);
  }
}

