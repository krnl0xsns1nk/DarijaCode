import { type DjType } from "./types";
export default class Scope {
  private vars = new Map<string, DjType>();
  constructor(private parent: Scope | null = null) {}

  declare(name: string, type: DjType) {
    this.vars.set(name, type);
  }

  resolve(name: string): DjType | undefined {
    return this.vars.get(name) ?? this.parent?.resolve(name);
  }

  child(): Scope {
    return new Scope(this);
  }
}
