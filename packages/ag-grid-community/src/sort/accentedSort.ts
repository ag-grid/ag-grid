import type { StringComparator } from 'ag-stack';

import type { ColumnModel } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import type { GridOptionsService } from '../gridOptionsService';
import type { AccentedSortOptions } from '../interfaces/iSort';

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

/** `stringComparatorVersion` of a column with its own `accentedSort`, which the grid option does not affect. */
const OWN_ACCENTED_SORT = -2;

/**
 * The comparator used for a column's strings, from its effective `accentedSort`: the column's own, else the grid's.
 * Built on first use and kept on the column until its definition changes or, when it uses the grid's value, the grid
 * option changes. Both are checked where they are set, so reading is a version compare.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getColumnStringComparator(
    column: AgColumn,
    colModel: ColumnModel,
    gos: GridOptionsService
): StringComparator | undefined {
    const ownAccentedSort = column.colDef.accentedSort;
    const version = ownAccentedSort === undefined ? colModel.accentedSortVersion : OWN_ACCENTED_SORT;
    if (column.stringComparatorVersion !== version) {
        column.stringComparatorVersion = version;
        column.stringComparator = createStringComparator(ownAccentedSort ?? gos.get('accentedSort'));
    }
    return column.stringComparator;
}
