import type { StringComparator } from 'ag-stack';

import type { AgColumn } from '../entities/agColumn';
import type { GridOptionsService } from '../gridOptionsService';
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

/** Builds the comparator for an `accentedSort` value, or `undefined` when it is off. */
const createStringComparator = (
    accentedSort: boolean | AccentedSortOptions | undefined
): StringComparator | undefined => {
    if (!accentedSort) {
        return undefined;
    }
    if (accentedSort === true) {
        return localeStringComparator;
    }
    return createCollatorComparator(accentedSort.locales, accentedSort.options);
};

/**
 * The comparator used for a column's strings, from its effective `accentedSort`: the column's own, else the grid's.
 * It is kept on the column and rebuilt only when that value changes, so a framework such as React re-creating the
 * grid options or column definition with an equal value keeps its `Intl.Collator`, which goes with the column.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getColumnStringComparator(column: AgColumn, gos: GridOptionsService): StringComparator | undefined {
    const accentedSort = column.colDef.accentedSort ?? gos.get('accentedSort');
    if (!_mergedEqual(column.accentedSort, accentedSort)) {
        column.accentedSort = accentedSort;
        column.stringComparator = createStringComparator(accentedSort);
    }
    return column.stringComparator;
}
