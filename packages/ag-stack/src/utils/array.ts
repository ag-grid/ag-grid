/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _last<T>(arr: readonly T[]): T;
export function _last<T extends Node>(arr: NodeListOf<T>): T;
export function _last(arr: any): any {
    const len = arr?.length;
    return len ? arr[len - 1] : undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _areEqual<T>(
    a: readonly T[] | null | undefined,
    b: readonly T[] | null | undefined,
    comparator?: (a: T, b: T) => boolean
): boolean {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return a == null && b == null; // equal only if both nullish
    }
    const len = a.length;
    if (len !== b.length) {
        return false;
    }
    if (comparator) {
        for (let i = 0; i < len; ++i) {
            const valueA = a[i];
            const valueB = b[i];
            if (valueA !== valueB && !comparator(valueA, valueB)) {
                return false;
            }
        }
        return true;
    }
    for (let i = 0; i < len; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * Returns `prev` when its contents equal `current`; otherwise `current.slice()` (or `[]` if nullish).
 * `prev === current` returns a fresh slice so callers never get the readonly `current` aliased back.
 *
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _reuseArrayIfEqual<T>(prev: T[] | null | undefined, current: readonly T[] | null | undefined): T[] {
    // Equality scan inlined (not `_areEqual`) — hot path, per group node per sort refresh.
    // Keep loop semantics in sync with `_areEqual`'s no-comparator branch.
    if (!current) {
        return [];
    }
    const len = current.length;
    if (prev && prev !== current && prev.length === len) {
        for (let i = 0; i < len; ++i) {
            if (prev[i] !== current[i]) {
                return current.slice();
            }
        }
        return prev;
    }
    return current.slice();
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
    const len = array.length;
    const removeLen = elementsToRemove.length;
    if (!len || !removeLen) {
        return;
    }
    let j = 0;
    const removeSet = new Set(elementsToRemove);
    for (let i = 0; i < len; ++i) {
        const value = array[i];
        if (!removeSet.has(value)) {
            if (i !== j) {
                array[j] = value;
            }
            ++j;
        }
    }
    if (j < len) {
        array.length = j;
    }
}

// should consider refactoring the callers to create a new array rather than mutating the original, which is expensive
/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _moveInArray<T>(array: T[], objectsToMove: T[], toIndex: number) {
    const objectsToMoveLen = objectsToMove.length;
    for (let i = 0; i < objectsToMoveLen; ++i) {
        _removeFromArray(array, objectsToMove[i]);
    }

    // insert from the end so each splice pushes earlier items right, preserving provided order
    for (let i = objectsToMoveLen - 1; i >= 0; i--) {
        array.splice(toIndex, 0, objectsToMove[i]);
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _flatten<T>(arrays: Array<T[]>): T[] {
    // Currently the fastest way to flatten an array according to https://jsbench.me/adlib26t2y/2
    return ([] as T[]).concat.apply([], arrays);
}

/** Elements present in exactly one of the two arrays (added or removed); nullish/empty counts as
 *  none. Fast paths: equal refs → empty; one side empty → copy of the other (no Set built).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _symmetricDiff<T>(a: readonly T[] | null | undefined, b: readonly T[] | null | undefined): T[] {
    if (a === b) {
        return [];
    }
    const leftLen = a?.length;
    const rightLen = b?.length;
    if (!leftLen) {
        return b ? b.slice() : [];
    }
    if (!rightLen) {
        return a ? a.slice() : [];
    }
    const diff = new Set(a);
    for (let i = 0; i < rightLen; ++i) {
        const item = b![i];
        if (!diff.delete(item)) {
            diff.add(item);
        }
    }
    return Array.from(diff);
}

/** Push `value` onto the array bucket at `key` in a `Map<K, V[]>`, creating the bucket on first use.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _pushToMapArray<K, V>(map: Map<K, V[]>, key: K, value: V): void {
    const bucket = map.get(key);
    if (bucket === undefined) {
        map.set(key, [value]);
        return;
    }
    bucket.push(value);
}

/** Build a `Map<item, index>` for O(1) position lookups, beating repeated `indexOf` (O(N²) over a sort/loop).
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _indexMap<K>(arr: readonly K[] | null | undefined): Map<K, number> {
    const map = new Map<K, number>();
    if (arr) {
        for (let i = 0, len = arr.length; i < len; ++i) {
            map.set(arr[i], i);
        }
    }
    return map;
}
