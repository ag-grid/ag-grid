import type {
    AgColumn,
    FullWidthRowNoteParams,
    GetNoteParams,
    INoteAccess,
    IRowNode,
    Note,
    SetNoteParams,
} from 'ag-grid-community';

export interface NoteTarget {
    focusColumn: AgColumn;
    noteParams: GetNoteParams;
    rowNode: IRowNode;
    anchorElement: HTMLElement;
}

export type InternalSetNoteParams = SetNoteParams & {
    previousNote?: Note;
    source?: 'ui' | 'api';
};

export interface INotePopupOwner {
    closeNotePopup(save?: boolean): void;
}

export interface INotesFeatureSupport {
    getNoteAccess(params: GetNoteParams): INoteAccess | undefined;
    getHoverGeneration(): number;
    setNote(params: InternalSetNoteParams): void;
    replaceActivePopupOwner(owner: INotePopupOwner): INotePopupOwner | undefined;
    clearActivePopupOwner(owner: INotePopupOwner): void;
}

export function isFullWidthRowNoteParams(params: GetNoteParams): params is FullWidthRowNoteParams {
    return params.location === 'fullWidthRow';
}
