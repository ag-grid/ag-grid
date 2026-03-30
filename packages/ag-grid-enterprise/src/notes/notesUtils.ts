import type { CellNote } from 'ag-grid-community';

export function cloneCellNote(note?: CellNote): CellNote | undefined {
    if (!note || typeof note.text !== 'string' || !note.text.trim()) {
        return undefined;
    }

    return {
        ...note,
        metadata: note.metadata ? { ...note.metadata } : undefined,
    };
}

export function areCellNotesEqual(previous?: CellNote, next?: CellNote): boolean {
    if (!previous && !next) {
        return true;
    }
    if (!previous || !next) {
        return false;
    }
    return previous.text.trim() === next.text.trim();
}
