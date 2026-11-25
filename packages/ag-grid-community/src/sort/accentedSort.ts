import type { StringComparator } from 'ag-stack';

import type { ColumnModel } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
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

/** The comparator for the `accentedSort` and `caseInsensitiveSort` grid options, held by the column model so the columns using them share one. */
const getGridStringComparator = (colModel: ColumnModel, gos: GridOptionsService): StringComparator | undefined => {
    const version = colModel.stringSortVersion;
    if (colModel.gridStringComparatorVersion !== version) {
        colModel.gridStringComparatorVersion = version;
        colModel.gridStringComparator = createStringComparator(gos.get('accentedSort'), gos.get('caseInsensitiveSort'));
    }
    return colModel.gridStringComparator;
};

/** `stringComparatorVersion` of a column with its own `accentedSort` and `caseInsensitiveSort`, which the grid options do not affect. */
const OWN_STRING_SORT = -2;

/**
 * Whether a change to the given grid options affects the column's string comparator, as the column does not set its
 * own value for one of them.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _usesGridStringSort = (colDef: ColDef, accentedSort: boolean, caseInsensitiveSort: boolean): boolean =>
    (accentedSort && colDef.accentedSort === undefined) ||
    (caseInsensitiveSort && colDef.caseInsensitiveSort === undefined);

/** The grid option version a column's string comparator depends on, from the options it does not set itself. */
const getStringSortVersion = (colDef: ColDef, colModel: ColumnModel): number => {
    const { accentedSort, caseInsensitiveSort } = colDef;
    if (accentedSort === undefined) {
        return caseInsensitiveSort === undefined ? colModel.stringSortVersion : colModel.accentedSortVersion;
    }
    return caseInsensitiveSort === undefined ? colModel.caseInsensitiveSortVersion : OWN_STRING_SORT;
};

/**
 * The comparator used for a column's strings, from its effective `accentedSort` and `caseInsensitiveSort`: the
 * column's own values, else the grid's. Built on first use and kept on the column until its definition changes or,
 * when it uses a grid value, the grid options change. Both are checked where they are set, so reading is a version compare.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getColumnStringComparator(
    column: AgColumn,
    colModel: ColumnModel,
    gos: GridOptionsService
): StringComparator | undefined {
    const { accentedSort, caseInsensitiveSort } = column.colDef;
    // a colDef change resets `stringComparatorVersion`, so the version it depends on can only change with it
    const version = getStringSortVersion(column.colDef, colModel);
    if (column.stringComparatorVersion !== version) {
        column.stringComparatorVersion = version;
        column.stringComparator =
            accentedSort === undefined && caseInsensitiveSort === undefined
                ? getGridStringComparator(colModel, gos)
                : createStringComparator(
                      accentedSort ?? gos.get('accentedSort'),
                      caseInsensitiveSort ?? gos.get('caseInsensitiveSort')
                  );
    }
    return column.stringComparator;
}
