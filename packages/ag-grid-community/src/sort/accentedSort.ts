import type { StringComparator } from 'ag-stack';

import type { AccentedSortOptions } from '../interfaces/iSort';
import { _mergedEqual } from '../utils/mergeDeep';

/** `accentedSort: true`: `localeCompare` with the browser's default locale. */
const localeStringComparator: StringComparator = (valueA, valueB) => valueA.localeCompare(valueB);

const createCollatorComparator = (
    locales: string | string[] | undefined,
    options: Intl.CollatorOptions | undefined
): StringComparator => {
    // An invalid locale tag or option value throws a RangeError; validation warns.
    // Fall back to the browser's default locale, keeping the options when they are valid.
    try {
        return new Intl.Collator(locales, options).compare;
    } catch {
        try {
            return new Intl.Collator(undefined, options).compare;
        } catch {
            return localeStringComparator;
        }
    }
};

/**
 * An `accentedSort` value with the comparator built from it, held by the owner of the value (the grid or a column).
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface StringComparatorCache {
    readonly accentedSort: boolean | AccentedSortOptions | undefined;
    /** Used when both values are strings; `undefined` when `accentedSort` is off. */
    readonly comparator: StringComparator | undefined;
}

/**
 * Resolves an `accentedSort` value to its comparator, reusing `cache` while the value is equal to the cached one.
 * Frameworks such as React can recreate the grid options or a column definition on every render, so an equal
 * options object keeps its `Intl.Collator`, and the owner drops the comparator with the cache.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _resolveStringComparator(
    accentedSort: boolean | AccentedSortOptions | undefined,
    cache: StringComparatorCache | undefined
): StringComparatorCache {
    if (cache && _mergedEqual(cache.accentedSort, accentedSort)) {
        return cache;
    }
    let comparator: StringComparator | undefined;
    if (accentedSort === true) {
        comparator = localeStringComparator;
    } else if (accentedSort) {
        comparator = createCollatorComparator(accentedSort.locales, accentedSort.options);
    }
    return { accentedSort, comparator };
}
