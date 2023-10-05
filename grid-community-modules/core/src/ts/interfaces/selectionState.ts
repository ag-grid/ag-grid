export interface RowSelectionState {
    selectAll: boolean;
    toggledNodes: string[];
}

export interface ServerSideRowGroupSelectionState {
    nodeId?: string;
    selectAllChildren?: boolean;
    toggledNodes?: ServerSideRowGroupSelectionState[];
}
