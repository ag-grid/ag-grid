import type { ColDef } from 'ag-grid-community';
import { ClientSideRowModelModule, getGridElement } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

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
});
