// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ServerSideRowGroupSelectionState, ServerSideRowSelectionState } from "./selectionState";
export interface IServerSideSelectionState extends ServerSideRowSelectionState {
}
export interface IServerSideGroupSelectionState extends ServerSideRowGroupSelectionState {
    toggledNodes?: IServerSideGroupSelectionState[];
}
