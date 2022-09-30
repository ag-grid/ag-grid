import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { ColumnEventType } from "./events";
import { SortOption } from "./rowNodes/rowNodeSorter";
export interface SortModelItem {
    /** Column Id to apply the sort to. */
    colId: string;
    /** Sort direction */
    sort: 'asc' | 'desc';
}
export declare class SortController extends BeanStub {
    private static DEFAULT_SORTING_ORDER;
    private columnModel;
    progressSort(column: Column, multiSort: boolean, source: ColumnEventType): void;
    setSortForColumn(column: Column, sort: 'asc' | 'desc' | null, multiSort: boolean, source: ColumnEventType): void;
    private updateSortIndex;
    onSortChanged(source: string): void;
    isSortActive(): boolean;
    dispatchSortChangedEvents(source: string): void;
    private clearSortBarTheseColumns;
    private getNextSortDirection;
    private getColumnsOrderedForSort;
    private getIndexableColumnsOrdered;
    getColumnsWithSortingOrdered(): Column[];
    getSortModel(): SortModelItem[];
    getSortOptions(): SortOption[];
    canColumnDisplayMixedSort(column: Column): boolean;
    getDisplaySortForColumn(column: Column): 'asc' | 'desc' | 'mixed' | null | undefined;
    getDisplaySortIndexForColumn(column: Column): number | null | undefined;
}
