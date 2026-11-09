import type { CompareServerSideDataVersions } from 'ag-grid-community';

/**
 * Compares two data versions: negative when `a` is older than `b`, positive when it is newer, and `0` when they
 * are the same version. Without a comparator, two numbers are compared numerically and any other versions are only
 * checked for equality, so two different non-numeric versions return `NaN`: neither older nor newer.
 */
export function compareDataVersions(
    a: string | number,
    b: string | number,
    comparator?: CompareServerSideDataVersions
): number {
    if (comparator) {
        return comparator(a, b);
    }
    if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    }
    return a === b ? 0 : Number.NaN;
}
