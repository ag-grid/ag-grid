// Type definitions for ag-grid v7.1.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Column } from "./entities/column";
export declare class SortController {
    private static DEFAULT_SORTING_ORDER;
    private gridOptionsWrapper;
    private columnController;
    private eventService;
    progressSort(column: Column, multiSort: boolean): void;
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
