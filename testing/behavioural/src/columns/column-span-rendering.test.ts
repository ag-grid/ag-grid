import { GridColumns, GridRows, TestGridsManager } from 'ag-test-utils';

import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';

interface RowData {
    a: string;
    b: string;
    c: string;
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

    test('spanning cell width equals sum of spanned column widths', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        await new GridColumns(api, `spanning cell width equals sum of spanned column widths setup`).checkColumns(`
            CENTER
            ├── a "A" width:100
            ├── b "B" width:100
            └── c "C" width:100
        `);
        await new GridRows(api, `spanning cell width equals sum of spanned column widths setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
        const gridEl = getGridElement(api)!;
        const spanningCell = gridEl.querySelector('[row-index="1"] [col-id="a"]') as HTMLElement | null;
        expect(spanningCell).not.toBeNull();
        // col 'a' (100px) + col 'b' (100px) = 200px
        expect(spanningCell!.style.width).toBe('200px');
        await new GridRows(api, `spanning cell width equals sum of spanned column widths final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('covered cell is absent from DOM on spanning row', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        await new GridColumns(api, `covered cell is absent from DOM on spanning row setup`).checkColumns(`
            CENTER
            ├── a "A" width:100
            ├── b "B" width:100
            └── c "C" width:100
        `);
        await new GridRows(api, `covered cell is absent from DOM on spanning row setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
        const gridEl = getGridElement(api)!;
        const coveredCell = gridEl.querySelector('[row-index="1"] [col-id="b"]');
        expect(coveredCell).toBeNull();
        await new GridRows(api, `covered cell is absent from DOM on spanning row final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('non-spanning row renders all cells at their own width', async () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });
        await new GridColumns(api, `non-spanning row renders all cells at their own width setup`).checkColumns(`
            CENTER
            ├── a "A" width:100
            ├── b "B" width:100
            └── c "C" width:100
        `);
        await new GridRows(api, `non-spanning row renders all cells at their own width setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
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
        await new GridRows(api, `non-spanning row renders all cells at their own width final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('hiding a spanning column draws the columns it covered at their own width', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData });

        api.setColumnsVisible(['a'], false);

        const cells = getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index="1"] .ag-cell');
        expect(Array.from(cells, (cell) => `${cell.getAttribute('col-id')} ${cell.style.width}`)).toEqual([
            'b 100px',
            'c 100px',
        ]);
    });

    test('in print layout a span stops at its pinned lane, as outside print layout', () => {
        const cellsOfFirstRow = (domLayout: 'print' | 'normal') => {
            const api = gridsManager.createGrid('myGrid', {
                domLayout,
                columnDefs: [{ ...columnDefs[0], pinned: 'left', colSpan: () => 3 }, columnDefs[1], columnDefs[2]],
                rowData,
            });
            const cells = getGridElement(api)!.querySelectorAll<HTMLElement>('.ag-row[row-index="0"] .ag-cell');
            const result = Array.from(cells, (cell) => `${cell.getAttribute('col-id')} ${cell.style.width}`);
            gridsManager.reset();
            return result;
        };

        expect({ print: cellsOfFirstRow('print'), normal: cellsOfFirstRow('normal') }).toEqual({
            print: ['a 100px', 'b 100px', 'c 100px'],
            normal: ['a 100px', 'b 100px', 'c 100px'],
        });
    });

    test('a colSpan of NaN renders one column wide, and a fractional one the whole columns it covers', () => {
        const oddColumnDefs = [
            { ...columnDefs[0], colSpan: (params) => (params.node!.rowIndex === 0 ? Number.NaN : 2.5) },
            columnDefs[1],
            columnDefs[2],
        ] satisfies ColDef<RowData>[];
        const api = gridsManager.createGrid('myGrid', { columnDefs: oddColumnDefs, rowData });

        const widths = (rowIndex: number) => {
            const row = getGridElement(api)!.querySelector(`[row-index="${rowIndex}"]`)!;
            return ['a', 'b', 'c'].map(
                (colId) => (row.querySelector(`[col-id="${colId}"]`) as HTMLElement | null)?.style.width
            );
        };

        expect({ nan: widths(0), fractional: widths(1) }).toEqual({
            nan: ['100px', '100px', '100px'],
            fractional: ['200px', undefined, '100px'],
        });
    });
});
