
export type DjType = {
  base : 'ra9m' | 'nass' | 'tona2i' | 'khawi' | 'unknown' | "walo"
  d?: number | 0;
}
export interface FunctionSig {
  paramTypes: DjType[];
  returnType: DjType;
}

