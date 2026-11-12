/** Comparators the grid provides itself (e.g. for the `bigint` and `object` cell data types), as opposed to a user's `comparator`. */
const builtInComparators = new WeakSet<(...args: any[]) => number>();

/**
 * Marks a comparator as provided by the grid, so options such as `sortMissingValues` still apply to its column.
 */
export function _markBuiltInComparator<T extends (...args: any[]) => number>(comparator: T): T {
    builtInComparators.add(comparator);
    return comparator;
}

/**
 * True when `comparator` was provided by the user rather than by the grid.
 */
export function _isUserComparator(comparator: ((...args: any[]) => number) | undefined): boolean {
    return comparator !== undefined && !builtInComparators.has(comparator);
}
