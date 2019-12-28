/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `undefined`.
 * @param values
 */
export declare function extent<T>(values: T[]): [T, T] | undefined;
export declare function find<T>(arr: T[], predicate: (value: T, index: number, arr: T[]) => boolean): T | undefined;
/**
 * This method will only return `undefined` if there's not a single valid finite number present
 * in the given array of values. Date values will be converted to timestamps.
 * @param values
 */
export declare function numericExtent<T>(values: T[]): [number, number] | undefined;
export declare function sumPositiveValues(array: number[]): number;
