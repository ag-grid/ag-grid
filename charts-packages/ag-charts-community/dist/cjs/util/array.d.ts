export declare function find<T>(arr: T[], predicate: (value: T, index: number, arr: T[]) => boolean): T | undefined;
/**
 * Returns the minimum and maximum value in the given iterable using natural order.
 * If the iterable contains no comparable values, returns `undefined`.
 * @param values
 */
export declare function extent<T>(values: T[]): [T, T] | undefined;
export declare function finiteExtent<T>(values: T[]): [T, T] | undefined;
/**
 * This method will only return `undefined` if there's not a single valid finite number present
 * in the given array of values. Date values will be converted to timestamps.
 * @param values
 */
export declare function numericExtent<T>(values: T[]): [number, number] | undefined;
/**
 * finds the min and max using a process appropriate for stacked values. Ie,
 * summing up the positive and negative numbers, and returning the totals of each
 */
export declare function findMinMax(values: number[]): {
    min: number;
    max: number;
};
export declare function findLargestMinMax(totals: {
    min: number;
    max: number;
}[]): {
    min: number;
    max: number;
};
