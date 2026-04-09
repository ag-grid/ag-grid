import type {
    AgColumn,
    CellNote,
    FullWidthRowNoteParams,
    GetNoteParams,
    ICellNoteAccess,
    IRowNode,
    SetNoteParams,
} from 'ag-grid-community';

export interface NoteTarget {
    focusColumn: AgColumn;
    noteParams: GetNoteParams;
    rowNode: IRowNode;
    anchorElement: HTMLElement;
}

export type InternalSetNoteParams = SetNoteParams & {
    previousNote?: CellNote;
    source?: 'ui' | 'api';
};

export interface ICellNotePopupOwner {
    closeNotePopup(save?: boolean): void;
}

export interface INotesFeatureSupport {
    getCellNoteAccess(params: GetNoteParams): ICellNoteAccess | undefined;
    getHoverGeneration(): number;
    setCellNote(params: InternalSetNoteParams): void;
    replaceActivePopupOwner(owner: ICellNotePopupOwner): ICellNotePopupOwner | undefined;
    clearActivePopupOwner(owner: ICellNotePopupOwner): void;
}

export function isFullWidthRowNoteParams(params: GetNoteParams): params is FullWidthRowNoteParams {
    return params.location === 'fullWidthRow';
}
