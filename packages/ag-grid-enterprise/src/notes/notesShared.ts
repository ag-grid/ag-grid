import type { AgColumn, CellNote, GetNoteParams, ICellNoteAccess, IRowNode, SetNoteParams } from 'ag-grid-community';

export interface NoteTarget {
    column: AgColumn;
    rowNode: IRowNode;
    anchorElement: HTMLElement;
}

export interface InternalSetNoteParams extends Omit<SetNoteParams, 'column'> {
    column: AgColumn;
    previousNote?: CellNote;
    source?: 'ui' | 'api';
}

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
