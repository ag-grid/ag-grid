/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 */
export declare function makeNull<T>(value?: T): T | null;
export declare function exists<T>(value: T, allowEmptyString?: boolean): boolean;
export declare function missing<T>(value: T): boolean;
export declare function missingOrEmpty<T>(value?: T[] | string): boolean;
export declare function toStringOrNull(value: any): string | null;
/** @deprecated */
export declare function referenceCompare<T>(left: T, right: T): boolean;
export declare function jsonEquals<T1, T2>(val1: T1, val2: T2): boolean;
export declare function defaultComparator(valueA: any, valueB: any, accentedCompare?: boolean): number;
export declare function find<T>(collection: T[] | {
    [id: string]: T;
}, predicate: string | boolean | ((item: T) => boolean), value?: any): T | null;
export declare function values<T>(object: {
    [key: string]: T;
} | Set<T> | Map<any, T>): T[];
