import type { SortDirection } from '../entities/colDef';
import type { Column } from './iColumn';

export interface SortOption {
    sort: NonNullable<SortDirection>;
    column: Column;
}
