import type { Column } from './iColumn';
import type { SortDirection, SortType } from './iSort';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface SortOption {
    sort: NonNullable<SortDirection>;
    type: SortType;
    column: Column;
}
