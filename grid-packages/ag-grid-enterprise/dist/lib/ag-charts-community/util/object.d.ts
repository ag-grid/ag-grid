import type { Intersection } from './types';
type FalsyType = false | null | undefined;
export declare function deepMerge(target: any, source: any): any;
export declare function mergeDefaults<TSource extends Record<string, any>, TArgs extends (TSource | FalsyType)[]>(...sources: TArgs): Intersection<Exclude<TArgs[number], FalsyType>>;
export declare function partialAssign<T>(keysToCopy: (keyof T)[], target: T, source?: Partial<T>): T;
export {};
