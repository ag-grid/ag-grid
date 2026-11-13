import type { GridApi } from 'ag-grid-community';

export function dispatchKeyDown(key: string, opts?: KeyboardEventInit): KeyboardEvent {
    const el = document.activeElement as HTMLElement | null;
    if (!el) {
        throw new Error('Expected active element before dispatching keyboard event');
    }
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts });
    el.dispatchEvent(event);
    return event;
}

export function getFocusedColId(api: GridApi): string | null {
    return api.getFocusedCell()?.column.getColId() ?? null;
}

/** The column of the cell holding the browser focus, which the focus model alone does not prove. */
export function getActiveCellColId(): string | null | undefined {
    return document.activeElement?.closest('.ag-cell')?.getAttribute('col-id');
}

export function getFocusedRowIndex(api: GridApi): number | null {
    return api.getFocusedCell()?.rowIndex ?? null;
}

export function getFocusedRowPinned(api: GridApi): string | null | undefined {
    return api.getFocusedCell()?.rowPinned;
}
