import { BeanStub } from "./context/beanStub";
import { Column } from "./entities/column";
import { ColumnEventType } from "./events";
export declare class SortController extends BeanStub {
    private static DEFAULT_SORTING_ORDER;
    private gridOptionsWrapper;
    private columnController;
    private columnApi;
    private gridApi;
    progressSort(column: Column, multiSort: boolean, source?: ColumnEventType): void;
    setSortForColumn(column: Column, sort: string | null, multiSort: boolean, source?: ColumnEventType): void;
    private updateSortIndex;
    onSortChanged(): void;
    getSortModel: () => {
        colId: string;
        sort: string;
    }[];
    isSortActive(): boolean;
    dispatchSortChangedEvents(): void;
    private clearSortBarThisColumn;
    private getNextSortDirection;
    getColumnsWithSortingOrdered(): Column[];
    getSortForRowController(): any[];
}
