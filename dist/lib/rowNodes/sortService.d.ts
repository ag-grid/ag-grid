// Type definitions for ag-grid-community v19.1.4
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export interface SortOption {
    inverter: number;
    column: Column;
}
export interface SortedRowNode {
    currentPos: number;
    rowNode: RowNode;
}
export declare class SortService {
    private sortController;
    private columnController;
    private valueService;
    private gridOptionsWrapper;
    private postSortFunc;
    init(): void;
    sortAccordingToColumnsState(rowNode: RowNode): void;
    sort(rowNode: RowNode, sortOptions: SortOption[]): void;
    private compareRowNodes;
    private getValue;
    private updateChildIndexes;
    private pullDownDataForHideOpenParents;
}
//# sourceMappingURL=sortService.d.ts.map