import { ServerSideRowGroupSelectionState, RowSelectionState } from "./selectionState";

export interface IServerSideSelectionState extends RowSelectionState {}

export interface IServerSideGroupSelectionState extends ServerSideRowGroupSelectionState {
    toggledNodes?: IServerSideGroupSelectionState[];
}
