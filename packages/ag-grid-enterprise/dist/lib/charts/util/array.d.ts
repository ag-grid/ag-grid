// ag-grid-enterprise v21.0.1
/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `[undefined, undefined]`.
 * @param values
 */
export declare function extent<T>(values: T[]): [T | undefined, T | undefined];
export declare function find<T>(arr: T[], predicate: (value: T, index: number, arr: T[]) => boolean): T | undefined;
export declare function checkExtent<T>(values: [T | undefined, T | undefined]): [T, T];
