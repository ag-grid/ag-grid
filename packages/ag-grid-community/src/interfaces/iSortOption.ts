import type { SortDirection, SortType } from '../entities/colDef';
import type { Column } from './iColumn';

export interface SortOption {
    sort: NonNullable<SortDirection>;
    type: SortType;
    column: Column;
}
