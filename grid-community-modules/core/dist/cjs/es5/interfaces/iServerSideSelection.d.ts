// Type definitions for @ag-grid-community/core v29.2.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IServerSideSelectionState {
    selectAll: boolean;
    toggledNodes: string[];
}
export interface IServerSideGroupSelectionState {
    nodeId?: string;
    selectAllChildren?: boolean;
    toggledNodes?: IServerSideGroupSelectionState[];
}
