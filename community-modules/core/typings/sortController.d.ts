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
    private columnApi;
    private gridApi;
    progressSort(column: Column, multiSort: boolean, source?: ColumnEventType): void;
    setSortForColumn(column: Column, sort: 'asc' | 'desc' | null, multiSort: boolean, source?: ColumnEventType): void;
    private updateSortIndex;
    onSortChanged(): void;
    isSortActive(): boolean;
    dispatchSortChangedEvents(): void;
    private clearSortBarThisColumn;
    private getNextSortDirection;
    getColumnsWithSortingOrdered(): Column[];
    getSortModel(): SortModelItem[];
    getSortOptions(): SortOption[];
}
