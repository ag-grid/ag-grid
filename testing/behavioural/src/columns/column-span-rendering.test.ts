import type { ColDef } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, getGridElement } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

interface RowData {
    a: string;
    b: string;
    c: string;
}

interface SpanData {
    name: string;
    value: number;
}

describe('Legacy colSpan rendering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Columns a and b are each 100px. Row 1 has col 'a' spanning over 'b'.
    const columnDefs: ColDef<RowData>[] = [
        {
            field: 'a',
            colId: 'a',
            width: 100,
            colSpan: (params) => (params.node!.rowIndex === 1 ? 2 : 1),
        },
        { field: 'b', colId: 'b', width: 100 },
        { field: 'c', colId: 'c', width: 100 },
    ];

    const rowData: RowData[] = [
        { a: 'a0', b: 'b0', c: 'c0' },
        { a: 'a1', b: 'b1', c: 'c1' },
    ];

    test('spanning cell width equals sum of spanned column widths', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        const gridEl = getGridElement(api)!;
        const spanningCell = gridEl.querySelector('[row-index="1"] [col-id="a"]') as HTMLElement | null;
        expect(spanningCell).not.toBeNull();
        // col 'a' (100px) + col 'b' (100px) = 200px
        expect(spanningCell!.style.width).toBe('200px');
    });

    test('covered cell is absent from DOM on spanning row', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        const gridEl = getGridElement(api)!;
        const coveredCell = gridEl.querySelector('[row-index="1"] [col-id="b"]');
        expect(coveredCell).toBeNull();
    });

    test('non-spanning row renders all cells at their own width', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        const gridEl = getGridElement(api)!;
        const row0 = gridEl.querySelector('[row-index="0"]')!;
        const cellA = row0.querySelector('[col-id="a"]') as HTMLElement | null;
        const cellB = row0.querySelector('[col-id="b"]') as HTMLElement | null;
        const cellC = row0.querySelector('[col-id="c"]') as HTMLElement | null;
        expect(cellA).not.toBeNull();
        expect(cellB).not.toBeNull();
        expect(cellC).not.toBeNull();
        expect(cellA!.style.width).toBe('100px');
        expect(cellB!.style.width).toBe('100px');
        expect(cellC!.style.width).toBe('100px');
    });
});

describe('enableCellSpan rendering', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Rows 0 and 1 share name='A' so they are merged; row 2 has name='B'.
    const columnDefs: ColDef<SpanData>[] = [
        { field: 'name', colId: 'name', spanRows: true },
        { field: 'value', colId: 'value' },
    ];

    const rowData: SpanData[] = [
        { name: 'A', value: 1 },
        { name: 'A', value: 2 },
        { name: 'B', value: 3 },
    ];

    test('spanned cell carries ag-spanned-cell class', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, enableCellSpan: true });
        const gridEl = getGridElement(api)!;
        const spannedCell = gridEl.querySelector('.ag-spanned-row [col-id="name"]');
        expect(spannedCell).not.toBeNull();
        expect(spannedCell!.classList.contains('ag-spanned-cell')).toBe(true);
    });

    test('spanned cell carries correct aria-rowspan', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, enableCellSpan: true });
        const gridEl = getGridElement(api)!;
        const spannedCell = gridEl.querySelector('.ag-spanned-row [col-id="name"]');
        expect(spannedCell).not.toBeNull();
        expect(spannedCell!.getAttribute('aria-rowspan')).toBe('2');
    });

    test('regular rows for covered range do not render the spanning column', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, enableCellSpan: true });
        const gridEl = getGridElement(api)!;
        // The ag-center-cols-container holds regular (non-spanned) rows.
        // Neither row 0 nor row 1 should have col 'name' there — only the ag-spanned-row does.
        const row0Cell = gridEl.querySelector('.ag-center-cols-container [row-index="0"] [col-id="name"]');
        const row1Cell = gridEl.querySelector('.ag-center-cols-container [row-index="1"] [col-id="name"]');
        expect(row0Cell).toBeNull();
        expect(row1Cell).toBeNull();
    });

    test('non-spanning row renders its column normally without ag-spanned-cell', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData, enableCellSpan: true });
        const gridEl = getGridElement(api)!;
        const row2NameCell = gridEl.querySelector('[row-index="2"] [col-id="name"]');
        expect(row2NameCell).not.toBeNull();
        expect(row2NameCell!.classList.contains('ag-spanned-cell')).toBe(false);
    });
});
