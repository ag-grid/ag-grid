import type { CellNote } from 'ag-grid-community';

export function cloneCellNote(note?: CellNote): CellNote | undefined {
    if (!note || typeof note.text !== 'string' || !note.text.trim()) {
        return undefined;
    }

    return { ...note };
}
