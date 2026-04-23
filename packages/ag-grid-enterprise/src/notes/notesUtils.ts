import type { Note } from 'ag-grid-community';

export function cloneNote(note?: Note): Note | undefined {
    if (!note || typeof note.text !== 'string' || !note.text.trim()) {
        return undefined;
    }

    return { ...note };
}
