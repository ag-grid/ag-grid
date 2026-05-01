import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

interface RowData {
    a: string;
    b: string;
    c: string;
}

/**
 * Column spanning setup: column 'a' spans over 'b' on odd rows.
 * Row 0: a(1), b(1), c(1)  — no spanning
 * Row 1: a(2), b hidden,   c(1)  — a spans over b
 * Row 2: a(1), b(1), c(1)  — no spanning
 * Row 3: a(2), b hidden,   c(1)  — a spans over b
 */
function makeColumnDefs(): ColDef<RowData>[] {
    return [
        {
            field: 'a',
            colId: 'a',
            colSpan: (params) => (params.node!.rowIndex! % 2 === 1 ? 2 : 1),
        },
        { field: 'b', colId: 'b' },
        { field: 'c', colId: 'c' },
    ];
}

function dispatchKeyDownOnActiveElement(key: string, opts?: KeyboardEventInit): void {
    const el = document.activeElement as HTMLElement | null;
    el?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts }));
}

function getFocusedColId(api: GridApi): string | null {
    return api.getFocusedCell()?.column.getColId() ?? null;
}

function getFocusedRowIndex(api: GridApi): number | null {
    return api.getFocusedCell()?.rowIndex ?? null;
}

describe('Column Spanning Keyboard Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Page Down normalises focus onto spanning cell (TC1)', () => {
        // Row 0 has no spanning; row 1 has column 'a' spanning over 'b'.
        // Starting on col 'b' at row 0, Page Down should land on col 'a' at row 1
        // rather than the covered col 'b' that has no cell ctrl at row 1.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        } as GridOptions<RowData>);

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDownOnActiveElement(KeyCode.PAGE_DOWN);

        // Page Down moves one row down in jsdom (viewport height ≈ 0 → diff of +1).
        // Row 1 has col 'a' spanning over 'b' — focus must be normalised to 'a'.
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('Ctrl+Down normalises focus onto spanning cell on last row (TC2)', () => {
        // 4-row grid where row 3 (last) is odd — 'a' spans over 'b' there.
        // Starting on col 'b' at row 0, Ctrl+Down should land on col 'a' at row 3.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
                { a: 'a3', b: 'b3', c: 'c3' },
            ],
        } as GridOptions<RowData>);

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDownOnActiveElement(KeyCode.DOWN, { ctrlKey: true });

        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('a');
    });
});
