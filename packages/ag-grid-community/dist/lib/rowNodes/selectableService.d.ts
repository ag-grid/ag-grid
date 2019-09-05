// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
export declare class SelectableService {
    private gridOptionsWrapper;
    private groupSelectsChildren;
    private isRowSelectableFunc?;
    init(): void;
    updateSelectableAfterGrouping(rowNode: RowNode): void;
    updateSelectableAfterFiltering(rowNode: RowNode): void;
    private recurseDown;
}
