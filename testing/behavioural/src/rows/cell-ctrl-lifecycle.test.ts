import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    RenderApiModule,
    RowDragModule,
    ScrollApiModule,
} from 'ag-grid-community';

interface Row {
    id: string;
    a: string;
    b: string;
}

const ROW_DATA: Row[] = [
    { id: 'r1', a: 'a1', b: 'b1' },
    { id: 'r2', a: 'a2', b: 'b2' },
];

function cellFor(api: GridApi, rowIndex: number, colId: string): HTMLElement | null {
    return (
        TestGridsManager.getHTMLElement(api)?.querySelector<HTMLElement>(
            `.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${colId}"]`
        ) ?? null
    );
}

describe('cell ctrl lifecycle', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            RenderApiModule,
            ScrollApiModule,
            CellApiModule,
            RowDragModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // A cell whose wrapper contents change - here a row drag handle appearing - cannot be refreshed
    // in place, so the ctrl is destroyed and rebuilt.
    test('a column gaining a row drag handle rebuilds the cell rather than refreshing it', async () => {
        const columnDefs: ColDef<Row>[] = [
            { colId: 'a', field: 'a' },
            { colId: 'b', field: 'b' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: ROW_DATA,
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(0);

        const before = cellFor(api, 0, 'a');
        const untouched = cellFor(api, 0, 'b');
        expect(before).not.toBeNull();
        expect(before!.querySelector('.ag-drag-handle')).toBeNull();

        api.setGridOption('columnDefs', [
            { colId: 'a', field: 'a', rowDrag: true },
            { colId: 'b', field: 'b' },
        ]);
        api.refreshCells({ force: true });
        await asyncSetTimeout(0);

        const after = cellFor(api, 0, 'a');
        expect(after).not.toBeNull();
        expect(after!.querySelector('.ag-drag-handle')).not.toBeNull();
        // the cell was rebuilt, while the column that did not change kept its cell
        expect(after).not.toBe(before);
        expect(cellFor(api, 0, 'b')).toBe(untouched);
    });

    // The row holds its cells as one centre/left/right array, so a wrong pinned segment boundary makes
    // the next update reconcile a pinned cell against the centre columns and rebuild it.
    test('pinned cells are reused, not rebuilt, when the centre columns scroll', async () => {
        const columnDefs: ColDef[] = [
            { colId: 'pl', field: 'pl', pinned: 'left', width: 100 },
            ...Array.from({ length: 40 }, (_, i) => ({ colId: `c${i}`, field: `c${i}`, width: 200 })),
            { colId: 'pr', field: 'pr', pinned: 'right', width: 100 },
        ];
        const rowData = Array.from({ length: 20 }, (_, r) =>
            Object.fromEntries([['id', `r${r}`], ...columnDefs.map((c) => [c.colId!, `${r}-${c.colId}`])])
        );

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await asyncSetTimeout(0);

        const leftBefore = cellFor(api, 0, 'pl');
        const rightBefore = cellFor(api, 0, 'pr');
        expect(leftBefore).not.toBeNull();
        expect(rightBefore).not.toBeNull();

        api.ensureColumnVisible('c35');
        await asyncSetTimeout(0);

        // the centre genuinely moved, so this is not a no-op scroll
        expect(cellFor(api, 0, 'c35')).not.toBeNull();
        expect(cellFor(api, 0, 'c0')).toBeNull();

        expect(cellFor(api, 0, 'pl')).toBe(leftBefore);
        expect(cellFor(api, 0, 'pr')).toBe(rightBefore);
    });

    // Looking a cell up by column uses a per-row index, and the cells it indexes are replaced whenever
    // the column viewport moves. A resize before the scroll is what populates the index.
    test('a column resized after scrolling reaches the cells that scrolling created', async () => {
        const columnDefs: ColDef[] = Array.from({ length: 50 }, (_, i) => ({
            colId: `c${i}`,
            field: `c${i}`,
            width: 200,
        }));
        const rowData = Array.from({ length: 20 }, (_, r) =>
            Object.fromEntries([['id', `r${r}`], ...columnDefs.map((c) => [c.colId!, `${r}-${c.colId}`])])
        );

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await asyncSetTimeout(0);

        api.setColumnWidths([{ key: 'c0', newWidth: 250 }]);
        await asyncSetTimeout(0);
        expect(cellFor(api, 0, 'c0')?.style.width).toBe('250px');

        api.ensureColumnVisible('c40');
        await asyncSetTimeout(0);
        expect(cellFor(api, 0, 'c40')).not.toBeNull();

        api.setColumnWidths([{ key: 'c40', newWidth: 300 }]);
        await asyncSetTimeout(0);

        expect(cellFor(api, 0, 'c40')?.style.width).toBe('300px');
    });

    // A focused cell is rendered even when its column has scrolled outside the viewport, so that
    // focus is not lost. The row is rebuilt here so no existing ctrl can simply be kept.
    test('a focused cell is rendered again after its row is rebuilt while scrolled away', async () => {
        const columnDefs: ColDef[] = Array.from({ length: 50 }, (_, i) => ({
            colId: `c${i}`,
            field: `c${i}`,
            width: 200,
        }));
        const rowData = Array.from({ length: 100 }, (_, r) =>
            Object.fromEntries([['id', `r${r}`], ...columnDefs.map((c) => [c.colId!, `${r}-${c.colId}`])])
        );

        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        await asyncSetTimeout(0);

        api.setFocusedCell(0, 'c0');
        await asyncSetTimeout(0);
        expect(cellFor(api, 0, 'c0')).not.toBeNull();

        api.ensureColumnVisible('c40');
        await asyncSetTimeout(0);

        // rebuild the row's cells from scratch: without the force-render the focused cell would be gone
        api.redrawRows();
        await asyncSetTimeout(0);

        expect(api.getFocusedCell()?.column.getColId()).toBe('c0');
        expect(cellFor(api, 0, 'c0')).not.toBeNull();
    });
});
