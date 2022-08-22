/**
 * If value is undefined, null or blank, returns null, otherwise returns the value
 * @param {T} value
 * @returns {T | null}
 */
export declare function makeNull<T extends unknown>(value?: T): T | null;
export declare function exists(value: string | null | undefined, allowEmptyString?: boolean): value is string;
export declare function exists<T>(value: T): value is NonNullable<T>;
export declare function missing<T>(value: T | null | undefined): value is Exclude<undefined | null, T>;
export declare function missingOrEmpty<T>(value?: T[] | string | null): boolean;
export declare function toStringOrNull(value: any): string | null;
export declare function attrToNumber(value?: number | string | null): number | null | undefined;
export declare function attrToBoolean(value?: boolean | string | null): boolean | undefined;
export declare function attrToString(value?: string): string | undefined;
/** @deprecated */
export declare function referenceCompare<T>(left: T, right: T): boolean;
export declare function jsonEquals<T1, T2>(val1: T1, val2: T2): boolean;
export declare function defaultComparator(valueA: any, valueB: any, accentedCompare?: boolean): number;
export declare function values<T>(object: {
    [key: string]: T;
} | Set<T> | Map<any, T>): T[];
