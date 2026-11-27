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

/** `caseInsensitiveSort` without `accentedSort`: code point order of the lowercased strings. */
const caseInsensitiveStringComparator: StringComparator = (valueA, valueB) => {
    const a = valueA.toLowerCase();
    const b = valueB.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0;
};

/** The collator `sensitivity` that keeps the given one's accent handling and ignores case. */
const toCaseInsensitive = (sensitivity: Intl.CollatorOptions['sensitivity']): Intl.CollatorOptions['sensitivity'] =>
    sensitivity === 'base' || sensitivity === 'case' ? 'base' : 'accent';

/** Builds the comparator for the `accentedSort` and `caseInsensitiveSort` values, or `undefined` when both are off. */
const createStringComparator = (
    accentedSort: boolean | AccentedSortOptions | undefined,
    caseInsensitiveSort: boolean | undefined
): StringComparator | undefined => {
    if (!accentedSort) {
        return caseInsensitiveSort ? caseInsensitiveStringComparator : undefined;
    }
    if (!caseInsensitiveSort) {
        return accentedSort === true
            ? localeStringComparator
            : createCollatorComparator(accentedSort.locales, accentedSort.options);
    }
    if (accentedSort === true) {
        return createCollatorComparator(undefined, { sensitivity: 'accent' });
    }
    const { locales, options } = accentedSort;
    return createCollatorComparator(locales, { ...options, sensitivity: toCaseInsensitive(options?.sensitivity) });
};

/** The comparator for the `accentedSort` grid option, held by the column model so the columns using it share one. */
const getGridStringComparator = (colModel: ColumnModel, gos: GridOptionsService): StringComparator | undefined => {
    const version = colModel.accentedSortVersion;
    if (colModel.gridStringComparatorVersion !== version) {
        colModel.gridStringComparatorVersion = version;
        colModel.gridStringComparator = createStringComparator(gos.get('accentedSort'), false);
    }
    return colModel.gridStringComparator;
};

/** `stringComparatorVersion` of a column with its own `accentedSort`, which the grid option does not affect. */
const OWN_ACCENTED_SORT = -2;

/**
 * The comparator used for a column's strings, from its effective `accentedSort` (the column's own, else the grid's)
 * and its `caseInsensitiveSort`. Built on first use and kept on the column until its definition changes or, when it
 * uses the grid's `accentedSort`, the grid option changes. Both are checked where they are set, so reading is a
 * version compare.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getColumnStringComparator(
    column: AgColumn,
    colModel: ColumnModel,
    gos: GridOptionsService
): StringComparator | undefined {
    const { accentedSort, caseInsensitiveSort } = column.colDef;
    const version = accentedSort === undefined ? colModel.accentedSortVersion : OWN_ACCENTED_SORT;
    if (column.stringComparatorVersion !== version) {
        column.stringComparatorVersion = version;
        column.stringComparator =
            accentedSort === undefined && !caseInsensitiveSort
                ? getGridStringComparator(colModel, gos)
                : createStringComparator(accentedSort ?? gos.get('accentedSort'), caseInsensitiveSort);
    }
    return column.stringComparator;
}
