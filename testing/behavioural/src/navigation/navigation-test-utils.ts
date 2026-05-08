import type { GridApi } from 'ag-grid-community';

export function dispatchKeyDown(key: string, opts?: KeyboardEventInit): void {
    const el = document.activeElement as HTMLElement | null;
    if (!el) {
        throw new Error('Expected active element before dispatching keyboard event');
    }
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
}

export function getFocusedColId(api: GridApi): string | null {
    return api.getFocusedCell()?.column.getColId() ?? null;
}

export function getFocusedRowIndex(api: GridApi): number | null {
    return api.getFocusedCell()?.rowIndex ?? null;
}

export function getFocusedRowPinned(api: GridApi): string | null | undefined {
    return api.getFocusedCell()?.rowPinned;
}
