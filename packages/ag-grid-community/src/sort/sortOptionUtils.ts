import type { ColumnModel } from '../columns/columnModel';
import type { AgColumn } from '../entities/agColumn';
import { _normalizeSortType } from '../entities/agColumn';
import type { SortComparatorFn } from '../entities/colDef';
import type { SortType } from '../interfaces/iSort';
import type { SortOption } from '../interfaces/iSortOption';

/** Pick the comparator for the sort type: a bare function applies to all types; a dict selects by type. */
const resolveComparator = (
    comparator: SortComparatorFn | Partial<Record<SortType, SortComparatorFn>> | undefined,
    type: SortType
): SortComparatorFn | undefined => {
    if (comparator == null) {
        return undefined;
    }
    if (typeof comparator === 'object') {
        // normalise so an unset/invalid type still selects the dict's `default` entry
        return comparator[_normalizeSortType(type)];
    }
    return comparator;
};

/**
 * Resolves each option's comparators in place so the sorter reads them directly per comparison: a comparator on
 * the col applies to every row; a row-group display col otherwise falls back to its primary column's comparator
 * (the sorter applies that fallback to leaf rows only). Call once after building an option array, before sorting.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _resolveSortOptions = (options: SortOption[], colModel: ColumnModel): void => {
    for (let i = 0, len = options.length; i < len; ++i) {
        const sortOption = options[i];
        const column = sortOption.column as AgColumn;
        const type = sortOption.type;

        // comparator on col gets preference over everything else
        const colComparator = resolveComparator(column.colDef.comparator, type);
        let leafComparator: SortComparatorFn | undefined;
        // if a 'field' is supplied on the autoGroupColumnDef we need to use the associated column comparator
        if (!colComparator && column.showRowGroup) {
            const field = column.field;
            const primaryColumn = field ? colModel.getNonPivotCol(field) : null;
            if (primaryColumn) {
                leafComparator = resolveComparator(primaryColumn.colDef.comparator, type);
            }
        }
        sortOption.colComparator = colComparator;
        sortOption.leafComparator = leafComparator;
        sortOption.descending = sortOption.sort === 'desc';
        sortOption.absolute = type === 'absolute';
    }
};
