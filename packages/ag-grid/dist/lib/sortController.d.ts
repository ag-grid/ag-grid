// Type definitions for ag-grid v18.1.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Column } from "./entities/column";
import { ColumnEventType } from "./events";
export declare class SortController {
    private static DEFAULT_SORTING_ORDER;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    private columnApi;
    private gridApi;
    progressSort(column: Column, multiSort: boolean, source?: ColumnEventType): void;
    setSortForColumn(column: Column, sort: string, multiSort: boolean, source?: ColumnEventType): void;
    onSortChanged(): void;
    private dispatchSortChangedEvents();
    private clearSortBarThisColumn(columnToSkip, source);
    private getNextSortDirection(column);
    getSortModel(): {
        colId: string;
        sort: string;
    }[];
    setSortModel(sortModel: any, source?: ColumnEventType): void;
    private compareColIds(sortModelEntry, column);
    getColumnsWithSortingOrdered(): Column[];
    getSortForRowController(): any[];
}
