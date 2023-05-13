export interface IServerSideSelectionState {
    selectAll: boolean;
    toggledNodes: string[];
}
export interface IServerSideGroupSelectionState {
    nodeId?: string;
    selectAllChildren?: boolean;
    toggledNodes?: IServerSideGroupSelectionState[];
}
