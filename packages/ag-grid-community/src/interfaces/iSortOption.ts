import type { Column } from './iColumn';

export interface SortOption {
    sort: 'asc' | 'desc' | 'aasc' | 'adesc';
    column: Column;
}
