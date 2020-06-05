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
    onSortChanged(): void;
    private dispatchSortChangedEvents;
    private clearSortBarThisColumn;
    private getNextSortDirection;
    getSortModel: () => {
        colId: string;
        sort: string;
    }[];
    setSortModel(sortModel: any, source?: ColumnEventType): void;
    private compareColIds;
    getColumnsWithSortingOrdered(): Column[];
    getSortForRowController(): any[];
}
