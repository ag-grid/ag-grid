type Comparator<T> = (a: T, b: T) => number;
export type LiteralOrFn<T> = T | (() => T);
export declare function ascendingStringNumberUndefined(a: number | string | undefined | null, b: number | string | undefined | null): number;
export declare function compoundAscending<E>(a: LiteralOrFn<E>[], b: LiteralOrFn<E>[], comparator: Comparator<E>): number;
export {};
