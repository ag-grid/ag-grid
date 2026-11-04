import type { StringComparator } from 'ag-stack';

import type { ColDef } from '../entities/colDef';
import type { GridOptionsService } from '../gridOptionsService';
import type { AccentedSortOptions } from '../interfaces/iSort';

/** `accentedSort: true`: `localeCompare` with the browser's default locale. */
const localeStringComparator: StringComparator = (valueA, valueB) => valueA.localeCompare(valueB);

/** One comparator per distinct locale and collator options, so each `Intl.Collator` is built once. */
const collatorComparators = new Map<string, StringComparator>();

const createCollatorComparator = (
    locales: string | string[] | undefined,
    options: Intl.CollatorOptions | undefined
): StringComparator => {
    try {
        return new Intl.Collator(locales, options).compare;
    } catch {
        // An invalid locale tag throws a RangeError; validation warns, and the browser's default locale is used.
        return localeStringComparator;
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
    const { locales, options } = accentedSort;
    const key = JSON.stringify([locales, options]);
    let comparator = collatorComparators.get(key);
    if (!comparator) {
        comparator = createCollatorComparator(locales, options);
        collatorComparators.set(key, comparator);
    }
    return comparator;
}

/**
 * The string comparator for a column: its own `accentedSort` when set, otherwise the grid option.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getColumnStringComparator(gos: GridOptionsService, colDef: ColDef): StringComparator | undefined {
    return _getStringComparator(colDef.accentedSort ?? gos.get('accentedSort'));
}
