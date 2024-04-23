import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { ColumnEventType } from "./events";
import { SortOption } from "./rowNodes/rowNodeSorter";
import { SortDirection } from "./entities/colDef";
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
    setSortForColumn(column: Column, sort: SortDirection, multiSort: boolean, source: ColumnEventType): void;
    private updateSortIndex;
    onSortChanged(source: string, columns?: Column[]): void;
    isSortActive(): boolean;
    dispatchSortChangedEvents(source: string, columns?: Column[]): void;
    private clearSortBarTheseColumns;
    private getNextSortDirection;
    /**
     * @returns a map of sort indexes for every sorted column, if groups sort primaries then they will have equivalent indices
     */
    private getIndexedSortMap;
    getColumnsWithSortingOrdered(): Column[];
    getSortModel(): SortModelItem[];
    getSortOptions(): SortOption[];
    canColumnDisplayMixedSort(column: Column): boolean;
    getDisplaySortForColumn(column: Column): SortDirection | 'mixed' | undefined;
    getDisplaySortIndexForColumn(column: Column): number | null | undefined;
}
