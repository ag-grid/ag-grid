import type { BeanCollection, GetNoteParams, Note, RefreshNotesParams, SetNoteParams } from 'ag-grid-community';

export function getNote(beans: BeanCollection, params: GetNoteParams): Note | undefined {
    return beans.notesSvc?.getNote(params);
}

export function setNote(beans: BeanCollection, params: SetNoteParams): void {
    beans.notesSvc?.setNote(params);
}

export function refreshNotes(beans: BeanCollection, params?: RefreshNotesParams): void {
    beans.notesSvc?.refreshNotes(params);
}
