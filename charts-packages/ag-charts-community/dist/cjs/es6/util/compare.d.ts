export declare type Comparator<T> = (a: T, b: T) => number;
export declare function ascending<T>(a: T, b: T): number;
export declare function ascendingStringNumberUndefined(a: number | string | undefined | null, b: number | string | undefined | null): number;
export declare function compoundAscending<E, A extends Array<E>>(a: A, b: A, comparator: Comparator<E>): number;
