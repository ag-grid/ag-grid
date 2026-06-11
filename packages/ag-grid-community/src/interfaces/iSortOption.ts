import type { SortComparatorFn } from '../entities/colDef';
import type { Column } from './iColumn';
import type { SortDirection, SortType } from './iSort';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface SortOption {
    sort: NonNullable<SortDirection>;
    type: SortType;
    column: Column;
    /** Column's own comparator — applies to every row. Filled by `_resolveSortOptions` (`undefined` until then). */
    colComparator: SortComparatorFn | undefined;
    /** Fallback comparator for leaf rows of a row-group display col (the primary column's comparator). */
    leafComparator: SortComparatorFn | undefined;
    /** `sort === 'desc'`, precomputed to avoid a per-comparison string compare. Filled by `_resolveSortOptions`. */
    descending: boolean;
    /** `type === 'absolute'`, precomputed to avoid a per-comparison string compare. Filled by `_resolveSortOptions`. */
    absolute: boolean;
}
