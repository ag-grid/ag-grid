// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface ServerSideRowSelectionState {
    /** Whether the majority of rows are selected or not */
    selectAll: boolean;
    /** All rows that have the opposite selection state to `selectAll` */
    toggledNodes: string[];
}
export interface ServerSideRowGroupSelectionState {
    nodeId?: string;
    selectAllChildren?: boolean;
    toggledNodes?: ServerSideRowGroupSelectionState[];
}
