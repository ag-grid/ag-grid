/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _last<T>(arr: readonly T[]): T;
export function _last<T extends Node>(arr: NodeListOf<T>): T;
export function _last(arr: any): any {
    if (!arr?.length) {
        return;
    }

    return arr[arr.length - 1];
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _areEqual<T>(
    a: readonly T[] | null | undefined,
    b: readonly T[] | null | undefined,
    comparator?: (a: T, b: T) => boolean
): boolean {
    if (a === b) {
        return true; // Same instance, no need to compare
    }
    if (!a || !b) {
        return a == null && b == null; // True if both are null or undefined, false otherwise
    }
    const len = a.length;
    if (len !== b.length) {
        return false; // Different lengths, cannot be equal
    }
    for (let i = 0; i < len; i++) {
        // We don't need to invoke the comparator if the values are the same instance
        if (a[i] !== b[i] && !comparator?.(a[i], b[i])) {
            return false; // Instances are different and not equal according to the comparator
        }
    }
    return true; // Arrays are equal
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _removeFromArray<T>(array: T[], object: T): void {
    const index = array.indexOf(object);

    if (index >= 0) {
        array.splice(index, 1);
    }
}

/**
 * O(N+M) way to remove M elements from an array of size N. Better than calling _removeFromArray in a loop
 *
 * Note: this implementation removes _any_ instances of the `elementsToRemove`
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _removeAllFromArray<T>(array: T[], elementsToRemove: readonly T[]): void {
    let i = 0;
    let j = 0;

    for (; i < array.length; i++) {
        if (!elementsToRemove.includes(array[i])) {
            // elements that we want to keep are moved to the beginning of the array, maintaining original order
            array[j] = array[i];
            j++;
        }
    }

    // j marks the elements we want to keep, so pop off the remaining elements (each pop is O(1))
    while (j < array.length) {
        array.pop();
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _flatten<T>(arrays: Array<T[]>): T[] {
    // Currently the fastest way to flatten an array according to https://jsbench.me/adlib26t2y/2
    return ([] as T[]).concat.apply([], arrays);
}
