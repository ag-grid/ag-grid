export type Comparator<T> = (a: T, b: T) => number;

export function ascending<T>(a: T, b: T): number {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

export function ascendingStringNumberUndefined(
    a: number | string | undefined | null,
    b: number | string | undefined | null
): number {
    let diff = 0;
    if (typeof a === 'number' && typeof b === 'number') {
        diff = a - b;
    } else if (typeof a === 'string' && typeof b === 'string') {
        diff = a.localeCompare(b);
    } else if (a == null && b == null) {
        // Equal.
    } else if (a == null) {
        diff = -1;
    } else if (b == null) {
        diff = 1;
    } else {
        diff = String(a).localeCompare(String(b));
    }

    return diff;
}

export function compoundAscending<E, A extends Array<E>>(a: A, b: A, comparator: Comparator<E>): number {
    for (const idx in a) {
        const diff = comparator(a[idx], b[idx]);

        if (diff !== 0) {
            return diff;
        }
    }

    return 0;
}
