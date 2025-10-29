/** An array that is always empty and that cannot be modified */
export const _EmptyArray = Object.freeze([]) as unknown as any[];

export function _last<T>(arr: readonly T[]): T;
export function _last<T extends Node>(arr: NodeListOf<T>): T;
export function _last(arr: any): any {
    if (!arr?.length) {
        return;
    }

    return arr[arr.length - 1];
}

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

/**
 * Utility that uses the fastest looping approach to apply a callback to each element of the array
 * https://jsperf.app/for-for-of-for-in-foreach-comparison
 */
export function _forAll<T>(array: T[] | undefined, callback: (value: T) => void) {
    if (!array) {
        return;
    }
    for (const value of array) {
        callback(value);
    }
}

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

// should consider refactoring the callers to create a new array rather than mutating the original, which is expensive
export function _moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number) {
    // first take out items from the array
    for (let i = 0; i < objectsToMove.length; i++) {
        _removeFromArray(array, objectsToMove[i]);
    }

    // now add the objects, in same order as provided to us, that means we start at the end
    // as the objects will be pushed to the right as they are inserted
    for (let i = objectsToMove.length - 1; i >= 0; i--) {
        array.splice(toIndex, 0, objectsToMove[i]);
    }
}

export function _flatten<T>(arrays: Array<T[]>): T[] {
    // Currently the fastest way to flatten an array according to https://jsbench.me/adlib26t2y/2
    return ([] as T[]).concat.apply([], arrays);
}
