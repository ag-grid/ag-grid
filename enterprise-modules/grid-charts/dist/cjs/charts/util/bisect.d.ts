import { Comparator } from "./compare";
/**
 * Returns the insertion point for `x` in array to maintain sorted order.
 * The arguments `lo` and `hi` may be used to specify a subset of the array which should be considered;
 * by default the entire array is used. If `x` is already present in array, the insertion point will be before
 * (to the left of) any existing entries. The return value is suitable for use as the first argument to `splice`
 * assuming that array is already sorted. The returned insertion point `i` partitions the array into two halves
 * so that all `v < x` for `v` in `array.slice(lo, i)` for the left side and all `v >= x` for `v` in `array.slice(i, hi)`
 * for the right side.
 * @param list
 * @param x
 * @param comparator
 * @param lo
 * @param hi
 */
export declare function bisectLeft<T>(list: T[], x: T, comparator: Comparator<T>, lo?: number, hi?: number): number;
export declare function bisectRight<T>(list: T[], x: T, comparator: Comparator<T>, lo?: number, hi?: number): number;
/**
 * A specialized version of `bisectLeft` that works with the arrays whose elements cannot be compared directly.
 * The map function is used instead to produce a comparable value for a given array element, then the values
 * returned by the map are compared using the `ascendingComparator`.
 * @param list
 * @param x
 * @param map
 * @param lo
 * @param hi
 */
export declare function complexBisectLeft<T, U>(list: T[], x: U, map: (item: T) => U, lo?: number, hi?: number): number;
export declare function complexBisectRight<T, U>(list: T[], x: U, map: (item: T) => U, lo?: number, hi?: number): number;
