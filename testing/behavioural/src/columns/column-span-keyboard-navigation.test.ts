import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, NavigateToNextCellParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    KeyCode,
    PinnedRowModule,
    RenderApiModule,
    ScrollApiModule,
    TextEditorModule,
    getGridElement,
} from 'ag-grid-community';

import {
    dispatchKeyDown,
    getFocusedColId,
    getFocusedRowIndex,
    getFocusedRowPinned,
} from '../navigation/navigation-test-utils';

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

describe('Column Spanning Keyboard Navigation', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            PinnedRowModule,
            RenderApiModule,
            ScrollApiModule,
            TextEditorModule,
        ],
    });

    const createNavigationGrid = (gridOptions: GridOptions<RowData> = {}) =>
        gridsManager.createGrid<RowData>('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
            ],
            ...gridOptions,
        });

    afterEach(() => {
        gridsManager.reset();
    });

    test('Page Down normalises focus onto spanning cell (TC1)', async () => {
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
        await new GridColumns(api, `Page Down normalises focus onto spanning cell (TC1) setup`).checkColumns(`
            CENTER
            ├── a "A" width:200
            ├── b "B" width:200
            └── c "C" width:200
        `);
        await new GridRows(api, `Page Down normalises focus onto spanning cell (TC1) setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDown(KeyCode.PAGE_DOWN);

        // Page Down moves one row down without layout (viewport height ≈ 0 → diff of +1).
        // Row 1 has col 'a' spanning over 'b' — focus must be normalised to 'a'.
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
        await new GridRows(api, `Page Down normalises focus onto spanning cell (TC1) final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('Ctrl+Down normalises focus onto spanning cell on last row (TC2)', async () => {
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
        await new GridColumns(api, `Ctrl+Down normalises focus onto spanning cell on last row (TC2) setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);
        await new GridRows(api, `Ctrl+Down normalises focus onto spanning cell on last row (TC2) setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            ├── LEAF id:1 a:"a1" b:"b1" c:"c1"
            ├── LEAF id:2 a:"a2" b:"b2" c:"c2"
            └── LEAF id:3 a:"a3" b:"b3" c:"c3"
        `);

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });

        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('a');
        await new GridRows(api, `Ctrl+Down normalises focus onto spanning cell on last row (TC2) final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
                ├── LEAF id:1 a:"a1" b:"b1" c:"c1"
                ├── LEAF id:2 a:"a2" b:"b2" c:"c2"
                └── LEAF id:3 a:"a3" b:"b3" c:"c3"
            `
        );
    });

    test('Arrow Right from spanning cell skips covered columns (TC4)', async () => {
        // Row 1 has col 'a' spanning over 'b'. Pressing Right from 'a' at row 1
        // should skip the covered 'b' (no CellCtrl there) and land on 'c'.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        } as GridOptions<RowData>);
        await new GridColumns(api, `Arrow Right from spanning cell skips covered columns (TC4) setup`).checkColumns(`
            CENTER
            ├── a "A" width:200
            ├── b "B" width:200
            └── c "C" width:200
        `);
        await new GridRows(api, `Arrow Right from spanning cell skips covered columns (TC4) setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);

        api.setFocusedCell(1, 'a');
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.RIGHT);

        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('c');
        await new GridRows(api, `Arrow Right from spanning cell skips covered columns (TC4) final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('Arrow Left into spanning cell from column after the span (TC5)', async () => {
        // Row 1 has 'a' spanning over 'b'. Pressing Left from 'c' should skip the
        // non-existent 'b' cell and land on the spanning 'a'.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        } as GridOptions<RowData>);
        await new GridColumns(api, `Arrow Left into spanning cell from column after the span (TC5) setup`).checkColumns(
            `
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `
        );
        await new GridRows(api, `Arrow Left into spanning cell from column after the span (TC5) setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);

        api.setFocusedCell(1, 'c');
        expect(getFocusedColId(api)).toBe('c');

        dispatchKeyDown(KeyCode.LEFT);

        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
        await new GridRows(api, `Arrow Left into spanning cell from column after the span (TC5) final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('Arrow Down onto spanning row stays on correct column (TC6)', async () => {
        // Starting on 'a' at row 0 (non-spanning), Down should land on row 1, col 'a'
        // which is the spanning cell itself — no normalisation needed, just verify
        // navigation is not broken by the colSpan definition on that row.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        } as GridOptions<RowData>);
        await new GridColumns(api, `Arrow Down onto spanning row stays on correct column (TC6) setup`).checkColumns(`
            CENTER
            ├── a "A" width:200
            ├── b "B" width:200
            └── c "C" width:200
        `);
        await new GridRows(api, `Arrow Down onto spanning row stays on correct column (TC6) setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);

        api.setFocusedCell(0, 'a');
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
        await new GridRows(api, `Arrow Down onto spanning row stays on correct column (TC6) final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });

    test('Arrow Down preserves the column covered by a spanning cell', () => {
        const api = createNavigationGrid();

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('b');
    });

    test('Arrow Down onto a span in a pinned lane focuses the spanning cell', () => {
        const spanOddRows: ColDef<RowData>['colSpan'] = (params) => (params.node!.rowIndex! % 2 === 1 ? 2 : 1);
        const api = createNavigationGrid({
            columnDefs: [
                { field: 'a', colId: 'a', pinned: 'left', colSpan: spanOddRows },
                { field: 'b', colId: 'b', pinned: 'left' },
                { field: 'c', colId: 'c' },
                { colId: 'd', valueGetter: () => 'd', pinned: 'right', colSpan: spanOddRows },
                { colId: 'e', valueGetter: () => 'e', pinned: 'right' },
            ],
        });

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedColId(api)).toBe('a');

        api.setFocusedCell(0, 'e');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedColId(api)).toBe('d');
    });

    test('Arrow Up preserves the column covered by a spanning cell', () => {
        const api = createNavigationGrid();

        api.setFocusedCell(2, 'b');
        dispatchKeyDown(KeyCode.UP);

        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.UP);

        expect(getFocusedRowIndex(api)).toBe(0);
        expect(getFocusedColId(api)).toBe('b');
    });

    test('Arrow Down preserves the covered column across consecutive spanning rows', () => {
        const columnDefs = makeColumnDefs();
        columnDefs[0].colSpan = (params) => (params.node!.rowIndex! === 0 || params.node!.rowIndex! === 3 ? 1 : 2);

        const api = createNavigationGrid({
            columnDefs,
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
                { a: 'a3', b: 'b3', c: 'c3' },
            ],
        });

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(3);
        expect(getFocusedColId(api)).toBe('b');
    });

    test('navigateToNextCell receives the preserved column after entering a spanning cell', () => {
        const navigateToNextCell = vi.fn((params: NavigateToNextCellParams<RowData>) => params.nextCellPosition);
        const api = createNavigationGrid({ navigateToNextCell });

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.DOWN);

        const secondCall = navigateToNextCell.mock.calls[1][0];
        expect(secondCall.previousCellPosition.column.getColId()).toBe('a');
        expect(secondCall.nextCellPosition?.column.getColId()).toBe('b');
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('b');
    });

    test('external focus changes clear the column covered by a spanning cell', () => {
        const api = createNavigationGrid();

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        api.setFocusedCell(1, 'a');
        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('a');
    });

    test('setFocusedCell on a column a span covers focuses the spanning cell and keeps the column for vertical moves', () => {
        const api = createNavigationGrid();
        const activeColId = () => document.activeElement?.closest('.ag-cell')?.getAttribute('col-id');
        const drawnColIds = () =>
            Array.from(getGridElement(api)!.querySelectorAll('.ag-row[row-index="1"] .ag-cell'), (cell) =>
                cell.getAttribute('col-id')
            );

        api.setFocusedCell(1, 'b');
        expect(getFocusedColId(api)).toBe('a');
        expect(activeColId()).toBe('a');

        api.redrawRows();
        expect(drawnColIds()).toEqual(['a', 'c']);

        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('b');
    });

    test('setState restoring focus onto a column a span covers focuses the spanning cell', async () => {
        const api = createNavigationGrid();

        api.setState({ focusedCell: { colId: 'b', rowIndex: 1, rowPinned: null } });
        await waitFor(() => expect(api.getFocusedCell()).toBeTruthy());

        expect(getFocusedColId(api)).toBe('a');
        expect(document.activeElement?.closest('.ag-cell')?.getAttribute('col-id')).toBe('a');
        dispatchKeyDown(KeyCode.DOWN);
        expect(getFocusedColId(api)).toBe('b');
    });

    test('setFocusedCell on a column covered by a span that was shown over the focused cell focuses the spanning cell', () => {
        const api = createNavigationGrid({
            columnDefs: [
                { field: 'a', colId: 'a', hide: true, colSpan: () => 3 },
                { field: 'b', colId: 'b' },
                { field: 'c', colId: 'c' },
            ],
        });

        api.setFocusedCell(0, 'b');
        api.setColumnsVisible(['a'], true);
        api.setFocusedCell(0, 'c');

        expect(getFocusedColId(api)).toBe('a');
    });

    describe('straight after a data change moves the span', () => {
        interface SpanRow {
            id: string;
            span: number;
            b: string;
            c: string;
        }

        const createSpanGrid = (span: number) => {
            const api = gridsManager.createGrid<SpanRow>('myGrid', {
                columnDefs: [
                    {
                        field: 'span',
                        editable: true,
                        valueParser: (params) => Number(params.newValue),
                        colSpan: (params) => params.data!.span,
                    },
                    { field: 'b', editable: true },
                    { field: 'c', editable: true },
                ],
                rowData: [{ id: 'r0', span, b: 'b0', c: 'c0' }],
                getRowId: (params) => params.data.id,
            });
            api.flushAllAnimationFrames();
            api.setFocusedCell(0, 'span');
            return api;
        };

        const setSpan = (api: GridApi<SpanRow>, span: number) => {
            api.setFocusedCell(0, 'span');
            api.getRowNode('r0')!.setDataValue('span', span);
        };

        const editSpanThenTab = (api: GridApi<SpanRow>, span: number) => {
            api.setFocusedCell(0, 'span');
            api.startEditingCell({ rowIndex: 0, colKey: 'span' });
            const input = getGridElement(api)!.querySelector<HTMLInputElement>('.ag-cell-inline-editing input')!;
            input.focus();
            input.value = String(span);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            dispatchKeyDown(KeyCode.TAB);
            const editing = api.getEditingCells().map((cell) => cell.colId);
            api.stopEditing(true);
            return { focused: getFocusedColId(api), editing };
        };

        test('Tab and Arrow Right go past a span that grew and onto the column one that shrank uncovered', () => {
            const api = createSpanGrid(1);

            setSpan(api, 2);
            api.tabToNextCell();
            expect(getFocusedColId(api)).toBe('c');

            setSpan(api, 1);
            api.tabToNextCell();
            expect(getFocusedColId(api)).toBe('b');

            setSpan(api, 2);
            dispatchKeyDown(KeyCode.RIGHT);
            expect(getFocusedColId(api)).toBe('c');
        });

        test('Tab out of an edit that grows or shrinks the span edits the column after it', () => {
            const api = createSpanGrid(1);

            expect(editSpanThenTab(api, 2)).toEqual({ focused: 'c', editing: ['c'] });
            expect(editSpanThenTab(api, 1)).toEqual({ focused: 'b', editing: ['b'] });
        });

        test('setFocusedCell on the column a grown span covers focuses the spanning cell', () => {
            const api = createSpanGrid(1);
            api.getRowNode('r0')!.setDataValue('span', 2);

            api.setFocusedCell(0, 'b');

            expect(getFocusedColId(api)).toBe('span');
        });
    });

    test('setFocusedCell on a column a span covers in a pinned row focuses the spanning cell', () => {
        const api = createNavigationGrid({
            columnDefs: [
                { field: 'a', colId: 'a', colSpan: (params) => (params.node!.rowPinned ? 2 : 1) },
                { field: 'b', colId: 'b' },
                { field: 'c', colId: 'c' },
            ],
            pinnedTopRowData: [{ a: 'tp', b: 'tpb', c: 'tpc' }],
        });

        api.setFocusedCell(0, 'b', 'top');

        expect({ col: getFocusedColId(api), pinned: getFocusedRowPinned(api) }).toEqual({ col: 'a', pinned: 'top' });
    });

    test('setFocusedCell on a hidden column, with a span in the row, focuses that column', () => {
        const api = createNavigationGrid({
            columnDefs: [
                { ...makeColumnDefs()[0] },
                { field: 'b', colId: 'b', hide: true },
                { field: 'c', colId: 'c' },
            ],
        });

        api.setFocusedCell(1, 'b');

        expect(getFocusedColId(api)).toBe('b');
    });

    test('setFocusedCell on a covered column whose span is scrolled out of view to the left records that column', () => {
        const api = createNavigationGrid({
            columnDefs: Array.from({ length: 40 }, (_, i) => ({
                colId: `c${i}`,
                width: 200,
                colSpan: i % 2 === 0 ? () => 2 : undefined,
            })),
            rowData: [{ a: 'a0', b: 'b0', c: 'c0' }],
            suppressColumnVirtualisation: false,
        });
        api.ensureColumnVisible('c38');
        expect(getGridElement(api)!.querySelector('.ag-row[row-index="0"] .ag-cell[col-id="c0"]')).toBeNull();

        // c0 spans c1, but the spanning cell is not drawn, so no drawn cell answers for c1
        api.setFocusedCell(0, 'c1');

        expect(getFocusedColId(api)).toBe('c1');
    });

    test('horizontal navigation clears the column covered by a spanning cell', () => {
        const api = createNavigationGrid();

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.RIGHT);
        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('c');
    });

    test('Page Down from pinned top row lands on body row and normalises spanning cell', async () => {
        // Page Down's focusIndex is computed from the body rowModel/pageBounds, so even when
        // the starting cell is a pinned top row, the target must be a body row with rowPinned:null.
        // Body row 1 has col 'a' spanning over 'b', so focus must normalise to 'a'.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            pinnedTopRowData: [{ a: 'tp0', b: 'tp0b', c: 'tp0c' }],
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        } as GridOptions<RowData>);
        await new GridColumns(api, `Page Down from pinned top row lands on body row and normalises spanning cell setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);
        await new GridRows(api, `Page Down from pinned top row lands on body row and normalises spanning cell setup`)
            .check(`
                PINNED_TOP id:t-0 a:"tp0" b:"tp0b" c:"tp0c"
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
                └── LEAF id:1 a:"a1" b:"b1" c:"c1"
            `);

        api.setFocusedCell(0, 'b', 'top');
        expect(getFocusedColId(api)).toBe('b');
        expect(getFocusedRowPinned(api)).toBe('top');

        dispatchKeyDown(KeyCode.PAGE_DOWN);

        expect(getFocusedRowPinned(api)).toBeNull();
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');
        await new GridRows(
            api,
            `Page Down from pinned top row lands on body row and normalises spanning cell final state`
        ).check(`
            PINNED_TOP id:t-0 a:"tp0" b:"tp0b" c:"tp0c"
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            └── LEAF id:1 a:"a1" b:"b1" c:"c1"
        `);
    });
});
