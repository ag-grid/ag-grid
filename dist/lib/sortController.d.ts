// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./entities/column";
export declare class SortController {
    private static DEFAULT_SORTING_ORDER;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    progressSort(column: Column, multiSort: boolean): void;
    setSortForColumn(column: Column, sort: string, multiSort: boolean): void;
    onSortChanged(): void;
    private dispatchSortChangedEvents();
    private clearSortBarThisColumn(columnToSkip);
    private getNextSortDirection(column);
    getSortModel(): {
        colId: string;
        sort: string;
    }[];
    setSortModel(sortModel: any): void;
    getColumnsWithSortingOrdered(): Column[];
    getSortForRowController(): any[];
}
