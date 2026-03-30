import type { CellNote, GetNoteParams, SetNoteParams } from 'ag-grid-community';

export interface NoteTarget extends GetNoteParams {
    anchorElement: HTMLElement;
}

export interface InternalSetNoteParams extends SetNoteParams {
    previousNote?: CellNote;
    source?: 'ui' | 'api';
}

export interface ICellNotePopupOwner {
    closeNotePopup(save?: boolean): void;
}

export interface INotesFeatureSupport {
    getCellNote(params: GetNoteParams): CellNote | undefined;
    setCellNote(params: InternalSetNoteParams): void;
    replaceActivePopupOwner(owner: ICellNotePopupOwner): ICellNotePopupOwner | undefined;
    clearActivePopupOwner(owner: ICellNotePopupOwner): void;
}
