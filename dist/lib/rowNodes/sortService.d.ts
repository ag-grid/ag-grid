// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export interface SortOption {
    inverter: number;
    column: Column;
}
export declare class SortService {
    private sortController;
    private valueService;
    sortAccordingToColumnsState(rowNode: RowNode): void;
    sort(rowNode: RowNode, sortOptions: SortOption[]): void;
    private compareRowNodes(sortOptions, nodeA, nodeB);
    private updateChildIndexes(rowNode);
}
