import type { StringComparator } from 'ag-stack';

import type { AccentedSortOptions } from '../interfaces/iSort';

/** `accentedSort: true`: `localeCompare` with the browser's default locale. */
const localeStringComparator: StringComparator = (valueA, valueB) => valueA.localeCompare(valueB);

/** One comparator per options object, so each `Intl.Collator` is built once and released with its options. */
const collatorComparators = new WeakMap<AccentedSortOptions, StringComparator>();

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
 * Resolves an `accentedSort` value to the comparator used when both values are strings, or `undefined` when it is off.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getStringComparator(
    accentedSort: boolean | AccentedSortOptions | undefined
): StringComparator | undefined {
    if (!accentedSort) {
        return undefined;
    }
    if (accentedSort === true) {
        return localeStringComparator;
    }
    let comparator = collatorComparators.get(accentedSort);
    if (!comparator) {
        comparator = createCollatorComparator(accentedSort.locales, accentedSort.options);
        collatorComparators.set(accentedSort, comparator);
    }
    return comparator;
}
