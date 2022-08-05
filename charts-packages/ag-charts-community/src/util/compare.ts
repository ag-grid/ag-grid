export type Comparator<T> = (a: T, b: T) => number;

export function ascending<T>(a: T, b: T): number {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

export function ascendingStringNumberUndefined(
    a: number | string | undefined | null,
    b: number | string | undefined | null
): number {
    let zDiff = 0;
    if (typeof a === 'number' && typeof b === 'number') {
        zDiff = a - b;
    } else if (typeof a === 'string' && typeof b === 'string') {
        zDiff = a.localeCompare(b);
    } else if (a == null && b == null) {
        // Equal.
    } else if (a == null) {
        zDiff = -1;
    } else if (b == null) {
        zDiff = 1;
    } else {
        zDiff = String(a).localeCompare(String(b));
    }

    return zDiff;
}

export function compoundAscending<E, A extends Array<E>>(a: A, b: A, comparator: Comparator<E>): number {
    for (const idx in a) {
        const zDiff = comparator(a[idx], b[idx]);

        if (zDiff !== 0) {
            return zDiff;
        }
    }

    return 0;
}
