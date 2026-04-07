import type { BeanCollection, CellNote, GetNoteParams, RefreshCellNotesParams, SetNoteParams } from 'ag-grid-community';

export function getCellNote(beans: BeanCollection, params: GetNoteParams): CellNote | undefined {
    return beans.notesSvc?.getCellNote(params);
}

export function setCellNote(beans: BeanCollection, params: SetNoteParams): void {
    beans.notesSvc?.setCellNote(params);
}

export function refreshCellNotes(beans: BeanCollection, params?: RefreshCellNotesParams): void {
    beans.notesSvc?.refreshCellNotes(params);
}
