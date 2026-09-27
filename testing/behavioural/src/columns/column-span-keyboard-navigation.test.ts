import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager, mockGridLayout } from 'ag-test-utils';

import type {
    CellPosition,
    ColDef,
    GetDetailRowDataParams,
    GridApi,
    GridOptions,
    NavigateToNextCellParams,
    TabToNextGridContainerParams,
    TabToNextGridContainerTarget,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    KeyCode,
    PaginationModule,
    PinnedRowModule,
    RowAutoHeightModule,
    TextEditorModule,
    getGridElement,
} from 'ag-grid-community';
import { CellSelectionModule, MasterDetailModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

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
        modules: [ClientSideRowModelModule, PinnedRowModule],
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

    test('Page Down normalises focus onto spanning cell, keeping the covered column for Arrow Down (TC1)', async () => {
        // Row 0 has no spanning; row 1 has column 'a' spanning over 'b'.
        // Starting on col 'b' at row 0, Page Down should land on col 'a' at row 1
        // rather than the covered col 'b' that has no cell ctrl at row 1.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: makeColumnDefs(),
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
                { a: 'a2', b: 'b2', c: 'c2' },
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
            ├── LEAF id:1 a:"a1" b:"b1" c:"c1"
            └── LEAF id:2 a:"a2" b:"b2" c:"c2"
        `);

        api.setFocusedCell(0, 'b');
        expect(getFocusedColId(api)).toBe('b');

        dispatchKeyDown(KeyCode.PAGE_DOWN);

        // Page Down moves one row down without layout (viewport height ≈ 0 → diff of +1).
        // Row 1 has col 'a' spanning over 'b' — focus must be normalised to 'a'.
        expect(getFocusedRowIndex(api)).toBe(1);
        expect(getFocusedColId(api)).toBe('a');

        dispatchKeyDown(KeyCode.DOWN);

        expect({ row: getFocusedRowIndex(api), col: getFocusedColId(api) }).toEqual({ row: 2, col: 'b' });
        await new GridRows(api, `Page Down normalises focus onto spanning cell (TC1) final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"a0" b:"b0" c:"c0"
            ├── LEAF id:1 a:"a1" b:"b1" c:"c1"
            └── LEAF id:2 a:"a2" b:"b2" c:"c2"
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

        dispatchKeyDown(KeyCode.UP);

        expect({ row: getFocusedRowIndex(api), col: getFocusedColId(api) }).toEqual({ row: 2, col: 'b' });
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

    test('Page Down with an auto-height column focuses the row it scrolls to, then the row a page on once heights settle', async () => {
        const columnDefs = makeColumnDefs();
        columnDefs[2].autoHeight = true;
        mockGridLayout.useRealOffsetDimensions = true;
        onTestFinished(() => mockGridLayout.resetOptions());
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs,
                rowData: Array.from({ length: 60 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` })),
                cellSelection: true,
            },
            { modules: [CellSelectionModule, RowAutoHeightModule] }
        );
        const focused: string[] = [];
        api.addEventListener('cellFocused', ({ rowIndex, rowPinned, column }) => {
            focused.push(`${rowIndex} ${rowPinned} ${typeof column === 'string' ? column : column?.getColId()}`);
        });

        api.setFocusedCell(4, 'b');
        dispatchKeyDown(KeyCode.PAGE_DOWN);

        // the page ends at row 17, where the grid scrolls; row 21 is a page on from row 4 once heights are known
        await waitFor(() => expect(focused).toEqual(['4 null b', '17 null a', '21 null a']));
        const range = api.getCellRanges()![0];
        expect([range.startRow, range.startColumn.getColId()]).toEqual([{ rowIndex: 21, rowPinned: null }, 'a']);

        dispatchKeyDown(KeyCode.DOWN);
        expect(`${getFocusedRowIndex(api)} ${getFocusedColId(api)}`).toBe('22 b');
    });

    test('Page Up/Down and Ctrl+Up/Down from a spanning cell continue in the covered column', () => {
        const api = createNavigationGrid();
        const steps: string[] = [];

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.PAGE_DOWN);
        steps.push(`PageDown: ${getFocusedRowIndex(api)} ${getFocusedColId(api)}`);

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.DOWN, { ctrlKey: true });
        steps.push(`Ctrl+Down: ${getFocusedRowIndex(api)} ${getFocusedColId(api)}`);

        api.setFocusedCell(2, 'b');
        dispatchKeyDown(KeyCode.UP);
        dispatchKeyDown(KeyCode.PAGE_UP);
        // happy-dom has no viewport height, so Page Up's row is not meaningful here; its column is
        steps.push(`PageUp: ${getFocusedColId(api)}`);

        api.setFocusedCell(2, 'b');
        dispatchKeyDown(KeyCode.UP);
        dispatchKeyDown(KeyCode.UP, { ctrlKey: true });
        steps.push(`Ctrl+Up: ${getFocusedRowIndex(api)} ${getFocusedColId(api)}`);

        expect(steps).toEqual(['PageDown: 2 b', 'Ctrl+Down: 2 b', 'PageUp: b', 'Ctrl+Up: 0 b']);
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

    test('horizontal navigation clears the column covered by a spanning cell', () => {
        const api = createNavigationGrid();

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.RIGHT);
        dispatchKeyDown(KeyCode.DOWN);

        expect(getFocusedRowIndex(api)).toBe(2);
        expect(getFocusedColId(api)).toBe('c');
    });

    test('the column covered by a spanning cell is dropped once the cell no longer covers it', () => {
        const afterHidingCovered = (key: string, ctrlKey = false) => {
            const api = createNavigationGrid();
            api.setFocusedCell(0, 'b');
            dispatchKeyDown(KeyCode.DOWN);
            api.setGridOption(
                'columnDefs',
                makeColumnDefs().map((colDef) => (colDef.colId === 'b' ? { ...colDef, hide: true } : colDef))
            );
            dispatchKeyDown(key, { ctrlKey });
            const result = `${focusState(api)}, ${api.getFocusedCell()?.column.isVisible()}`;
            gridsManager.reset();
            return result;
        };

        expect({
            arrowDown: afterHidingCovered(KeyCode.DOWN),
            pageDown: afterHidingCovered(KeyCode.PAGE_DOWN),
            ctrlDown: afterHidingCovered(KeyCode.DOWN, true),
        }).toEqual({
            arrowDown: 'cell a, focused cell 2 a, true',
            pageDown: 'cell a, focused cell 2 a, true',
            ctrlDown: 'cell a, focused cell 2 a, true',
        });
    });

    test('a covered column that is not navigable is not kept for Page or Ctrl+Up/Down, which do not judge navigability', () => {
        const fromLeftIntoSpan = (key: string, ctrlKey = false) => {
            // on row 0 'a' spans over 'b', which is never navigable
            const columnDefs = makeColumnDefs();
            columnDefs[0].colSpan = (params) => (params.node!.rowIndex === 0 ? 2 : 1);
            columnDefs[1].suppressNavigable = true;
            const rowData = Array.from({ length: 4 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
            const api = createNavigationGrid({ columnDefs, rowData });
            api.setFocusedCell(0, 'c');
            dispatchKeyDown(KeyCode.LEFT);
            dispatchKeyDown(key, { ctrlKey });
            const result = focusState(api);
            gridsManager.reset();
            return result;
        };

        expect({
            pageDown: fromLeftIntoSpan(KeyCode.PAGE_DOWN),
            ctrlDown: fromLeftIntoSpan(KeyCode.DOWN, true),
        }).toEqual({
            pageDown: 'cell a, focused cell 1 a',
            ctrlDown: 'cell a, focused cell 3 a',
        });
    });

    test('in print layout a covered column is judged as the cell spanning it', () => {
        const columnDefs = makeColumnDefs();
        columnDefs[0].suppressNavigable = true;
        const api = createNavigationGrid({ columnDefs, domLayout: 'print' });

        api.setFocusedCell(0, 'b');
        dispatchKeyDown(KeyCode.DOWN);

        expect(focusState(api)).toBe('cell b, focused cell 2 b');
    });

    /** Where DOM focus is: a header and its column, a full-width row, a cell and the focused cell's row and column. */
    const focusState = (api: GridApi) => {
        const el = document.activeElement;
        const colId = el?.getAttribute('col-id');
        if (el?.classList.contains('ag-header-cell')) {
            return `header ${colId}`;
        }
        if (el?.classList.contains('ag-full-width-row')) {
            return `full width row ${el.getAttribute('row-index')}`;
        }
        return !el?.classList.contains('ag-cell')
            ? 'no cell'
            : `cell ${colId}, focused cell ${api.getFocusedCell()?.rowIndex} ${getFocusedColId(api)}`;
    };

    const describeTarget = (target: TabToNextGridContainerTarget | null) => {
        if (target == null || typeof target === 'string') {
            return String(target);
        }
        return 'headerRowIndex' in target
            ? `header ${target.column.getUniqueId()}`
            : `${target.rowIndex} ${target.column.getColId()}`;
    };

    /** Shift+Tab from the paging panel, reporting the default target tabToNextGridContainer was given and the focus. */
    const shiftTabFromPaging = async (gridOptions: GridOptions<RowData>) => {
        const tabToNextGridContainer = vi.fn((_params: TabToNextGridContainerParams<RowData>) => undefined);
        const api = await gridsManager.createGridAndWait<RowData>(
            'myGrid',
            {
                columnDefs: makeColumnDefs(),
                pagination: true,
                paginationPageSizeSelector: false,
                tabToNextGridContainer,
                ...gridOptions,
            },
            { modules: [PaginationModule] }
        );
        const lastRowIndex = api.getDisplayedRowCount() - 1;
        const lastRowRendered = !!getGridElement(api)!.querySelector(`[row-index="${lastRowIndex}"]`);
        getGridElement(api)!.querySelector<HTMLElement>('.ag-paging-button')!.focus();
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        const { nextContainer, defaultTarget } = tabToNextGridContainer.mock.calls[0][0];
        const result = `rendered before: ${lastRowRendered}, ${nextContainer} ${describeTarget(defaultTarget)}, ${focusState(api)}`;
        gridsManager.reset();
        return result;
    };

    /** 'a' spans all three columns on the rows `spanned` returns true for. */
    const spanningColumnDefs = (spanned: (rowIndex: number) => boolean): ColDef<RowData>[] => {
        const columnDefs = makeColumnDefs();
        columnDefs[0].colSpan = (params) => (spanned(params.node!.rowIndex!) ? 3 : 1);
        return columnDefs;
    };

    test('Arrow Down from a header focuses the cell spanning its column, keeps the column like a cell above, and skips the cell when it is not navigable', () => {
        const api = createNavigationGrid({ columnDefs: spanningColumnDefs((rowIndex) => rowIndex === 0) });

        const steps: string[] = [];
        api.setFocusedHeader('c');
        for (const key of [KeyCode.DOWN, KeyCode.DOWN, KeyCode.UP, KeyCode.UP]) {
            dispatchKeyDown(key);
            steps.push(`${key}: ${focusState(api)}`);
        }
        api.setFocusedHeader('b');
        for (const key of [KeyCode.DOWN, KeyCode.UP]) {
            dispatchKeyDown(key);
            steps.push(`${key}: ${focusState(api)}`);
        }
        gridsManager.reset();

        const notNavigable = spanningColumnDefs((rowIndex) => rowIndex === 0);
        notNavigable[0].suppressNavigable = true;
        const skipApi = createNavigationGrid({ columnDefs: notNavigable });
        skipApi.setFocusedHeader('c');
        dispatchKeyDown(KeyCode.DOWN);

        expect({ steps, spanNotNavigable: focusState(skipApi) }).toEqual({
            steps: [
                'ArrowDown: cell a, focused cell 0 a',
                'ArrowDown: cell c, focused cell 1 c',
                'ArrowUp: cell a, focused cell 0 a',
                'ArrowUp: header c',
                'ArrowDown: cell a, focused cell 0 a',
                'ArrowUp: header b',
            ],
            spanNotNavigable: 'cell c, focused cell 1 c',
        });
    });

    test('with nothing navigable below, Arrow Down from a header stays on it and is handled, and Tab walks on to the next row', async () => {
        const columnDefs = makeColumnDefs().map((colDef) => ({ ...colDef, colSpan: undefined }));
        columnDefs[1].suppressNavigable = true;
        const api = createNavigationGrid({ columnDefs });
        api.setFocusedHeader('b');
        const arrowDown = new KeyboardEvent('keydown', { key: KeyCode.DOWN, bubbles: true, cancelable: true });
        document.activeElement!.dispatchEvent(arrowDown);
        const arrowDownFromHeader = `${focusState(api)}, handled: ${arrowDown.defaultPrevented}`;
        gridsManager.reset();

        // on the first row 'a' spans all three columns and is not navigable
        const firstRowNotNavigable = spanningColumnDefs((rowIndex) => rowIndex === 0);
        firstRowNotNavigable[0].suppressNavigable = (params) => params.node.rowIndex === 0;
        const tabApi = await gridsManager.createGridAndWait<RowData>(
            'myGrid',
            {
                columnDefs: firstRowNotNavigable,
                rowData: [
                    { a: 'a0', b: 'b0', c: 'c0' },
                    { a: 'a1', b: 'b1', c: 'c1' },
                ],
                pagination: true,
                paginationPageSizeSelector: false,
            },
            { modules: [PaginationModule] }
        );
        tabApi.setFocusedHeader('c');
        dispatchKeyDown(KeyCode.TAB);
        const tabFromLastHeader = focusState(tabApi);
        gridsManager.reset();

        // row 1 is the expanded detail row of row 0, which Tab enters as it does from a cell
        const detailApi = await gridsManager.createGridAndWait<RowData>(
            'myGrid',
            {
                columnDefs: firstRowNotNavigable,
                rowData: [{ a: 'a0', b: 'b0', c: 'c0' }],
                masterDetail: true,
                isRowMaster: () => true,
                detailCellRendererParams: {
                    detailGridOptions: { columnDefs: [{ field: 'x' }] },
                    getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback([{ x: 'x0' }]),
                },
            },
            { modules: [MasterDetailModule] }
        );
        detailApi.getDisplayedRowAtIndex(0)!.setExpanded(true);
        await waitFor(() =>
            expect(getGridElement(detailApi)!.querySelector('.ag-details-row .ag-header-cell')).not.toBeNull()
        );
        detailApi.setFocusedHeader('c');
        dispatchKeyDown(KeyCode.TAB);
        const focusedInDetailGrid = document.activeElement?.closest('.ag-details-row')
            ? 'detail grid'
            : 'not in detail grid';

        expect({ arrowDownFromHeader, tabFromLastHeader, tabOntoDetailRow: focusedInDetailGrid }).toEqual({
            arrowDownFromHeader: 'header b, handled: true',
            tabFromLastHeader: 'cell a, focused cell 1 a',
            tabOntoDetailRow: 'detail grid',
        });
    });

    test('a spanning cell is judged on its own column, and a covered column that is not navigable never traps the next move', () => {
        const press = (notNavigable: 'a' | 'b', start: [number, string], keys: string[]) => {
            // on row 1 'a' spans over 'b'; one of the two is never navigable
            const columnDefs = makeColumnDefs();
            columnDefs[notNavigable === 'a' ? 0 : 1].suppressNavigable = true;
            const api = createNavigationGrid({ columnDefs });
            api.setFocusedCell(start[0], start[1]);
            const steps = keys.map((key) => {
                dispatchKeyDown(key);
                return `${key}: ${focusState(api)}`;
            });
            gridsManager.reset();
            return steps;
        };

        expect({
            spanNotNavigable: press('a', [0, 'b'], [KeyCode.DOWN]),
            downIntoSpan: press('b', [0, 'b'], [KeyCode.DOWN, KeyCode.DOWN]),
            leftIntoSpanThenDown: press('b', [1, 'c'], [KeyCode.LEFT, KeyCode.DOWN]),
            leftIntoSpanThenUp: press('b', [1, 'c'], [KeyCode.LEFT, KeyCode.UP]),
        }).toEqual({
            spanNotNavigable: ['ArrowDown: cell b, focused cell 2 b'],
            downIntoSpan: ['ArrowDown: cell a, focused cell 1 a', 'ArrowDown: cell a, focused cell 2 a'],
            leftIntoSpanThenDown: ['ArrowLeft: cell a, focused cell 1 a', 'ArrowDown: cell a, focused cell 2 a'],
            leftIntoSpanThenUp: ['ArrowLeft: cell a, focused cell 1 a', 'ArrowUp: cell a, focused cell 0 a'],
        });
    });

    test('with nothing navigable in the covered column beyond a spanning cell, Arrow Up/Down moves from the spanning cell', () => {
        const pressTwice = (key: string, start: number, notNavigableBeyond: (rowIndex: number) => boolean) => {
            // on row 1 'a' spans over 'b', which is navigable there and nowhere beyond it
            const columnDefs = makeColumnDefs();
            columnDefs[1].suppressNavigable = (params) => notNavigableBeyond(params.node.rowIndex!);
            const api = createNavigationGrid({ columnDefs });
            api.setFocusedCell(start, 'b');
            const steps = [key, key].map((k) => {
                dispatchKeyDown(k);
                return focusState(api);
            });
            gridsManager.reset();
            return steps;
        };

        expect({
            down: pressTwice(KeyCode.DOWN, 0, (rowIndex) => rowIndex >= 2),
            up: pressTwice(KeyCode.UP, 2, (rowIndex) => rowIndex === 0),
        }).toEqual({
            down: ['cell a, focused cell 1 a', 'cell a, focused cell 2 a'],
            up: ['cell a, focused cell 1 a', 'cell a, focused cell 0 a'],
        });
    });

    test('End does not move onto a last row not yet rendered whose only cell spans it all and is not navigable', () => {
        const columnDefs = spanningColumnDefs((rowIndex) => rowIndex === 29);
        columnDefs[0].suppressNavigable = (params) => params.node.rowIndex === 29;
        const rowData = Array.from({ length: 30 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
        const api = createNavigationGrid({ columnDefs, rowData, suppressRowVirtualisation: false, rowBuffer: 0 });
        const lastRowRendered = !!getGridElement(api)!.querySelector('[row-index="29"]');

        api.setFocusedCell(0, 'a');
        dispatchKeyDown(KeyCode.PAGE_END);

        expect({ lastRowRendered, focus: focusState(api) }).toEqual({
            lastRowRendered: false,
            focus: 'cell a, focused cell 0 a',
        });
    });

    test('Ctrl+Left and Ctrl+Right go to the row edge on that side, in LTR and RTL', () => {
        const ctrlFromB = (key: string, enableRtl: boolean) => {
            const api = createNavigationGrid({ enableRtl });
            api.setFocusedCell(0, 'b');
            dispatchKeyDown(key, { ctrlKey: true });
            const result = focusState(api);
            gridsManager.reset();
            return result;
        };

        expect({
            ltrLeft: ctrlFromB(KeyCode.LEFT, false),
            ltrRight: ctrlFromB(KeyCode.RIGHT, false),
            rtlLeft: ctrlFromB(KeyCode.LEFT, true),
            rtlRight: ctrlFromB(KeyCode.RIGHT, true),
        }).toEqual({
            ltrLeft: 'cell a, focused cell 0 a',
            ltrRight: 'cell c, focused cell 0 c',
            rtlLeft: 'cell c, focused cell 0 c',
            rtlRight: 'cell a, focused cell 0 a',
        });
    });

    test('Ctrl+Right in a pinned row ignores the spans of the body row with the same index', () => {
        const columnDefs = makeColumnDefs();
        columnDefs[0].colSpan = (params) => (!params.node!.rowPinned && params.node!.rowIndex === 0 ? 3 : 1);
        columnDefs[0].suppressNavigable = true;
        const api = createNavigationGrid({ columnDefs, pinnedTopRowData: [{ a: 'tp', b: 'tpb', c: 'tpc' }] });

        api.setFocusedCell(0, 'b', 'top');
        dispatchKeyDown(KeyCode.RIGHT, { ctrlKey: true });

        expect({ focus: focusState(api), pinned: getFocusedRowPinned(api) }).toEqual({
            focus: 'cell c, focused cell 0 c',
            pinned: 'top',
        });
    });

    test('Arrow Down between rendered rows, or onto a full-width row, runs no colSpan callback', () => {
        const colSpanRows: number[] = [];
        const columnDefs = makeColumnDefs();
        columnDefs[0].colSpan = (params) => {
            colSpanRows.push(params.node!.rowIndex!);
            return 1;
        };
        const rowData = Array.from({ length: 40 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));

        const renderedApi = createNavigationGrid({ columnDefs, rowData });
        renderedApi.setFocusedCell(0, 'b');
        colSpanRows.length = 0;
        dispatchKeyDown(KeyCode.DOWN);
        dispatchKeyDown(KeyCode.DOWN);
        const callsBetweenRenderedRows = colSpanRows.length;
        const focusBetweenRenderedRows = focusState(renderedApi);
        gridsManager.reset();

        const api = createNavigationGrid({
            columnDefs,
            rowData,
            suppressRowVirtualisation: false,
            rowBuffer: 0,
            isFullWidthRow: (params) => params.rowNode.rowIndex === 30,
            fullWidthCellRenderer: class {
                private readonly eGui = document.createElement('div');
                public getGui() {
                    return this.eGui;
                }
            },
        });
        api.setFocusedCell(29, 'b');
        const fullWidthRowRendered = !!getGridElement(api)!.querySelector('[row-index="30"]');
        colSpanRows.length = 0;
        dispatchKeyDown(KeyCode.DOWN);

        expect({
            callsBetweenRenderedRows,
            focusBetweenRenderedRows,
            fullWidthRowRendered,
            fullWidthRowCalls: colSpanRows.filter((r) => r === 30).length,
            fullWidthRowFocus: focusState(api),
        }).toEqual({
            callsBetweenRenderedRows: 0,
            focusBetweenRenderedRows: 'cell b, focused cell 2 b',
            fullWidthRowRendered: false,
            fullWidthRowCalls: 0,
            fullWidthRowFocus: 'full width row 30',
        });
    });

    test('Arrow Down with no navigable cell below neither moves nor renders the rows it judged', () => {
        const columnDefs = makeColumnDefs();
        columnDefs[0].colSpan = () => 1;
        columnDefs[1].suppressNavigable = (params) => params.node.rowIndex! >= 30;
        const rowData = Array.from({ length: 40 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
        const api = createNavigationGrid({ columnDefs, rowData, suppressRowVirtualisation: false, rowBuffer: 0 });

        api.setFocusedCell(29, 'b');
        dispatchKeyDown(KeyCode.DOWN);

        expect({
            focus: focusState(api),
            lastRowRendered: !!getGridElement(api)!.querySelector('[row-index="39"]'),
        }).toEqual({ focus: 'cell b, focused cell 29 b', lastRowRendered: false });
    });

    test('Arrow Down into a row not rendered yet judges the cell spanning its column, both ways, in every pinned lane', () => {
        const arrowDownFrom29 = (notNavigable: 'a' | 'b', pinned: 'left' | 'right' | null = null) => {
            // on row 30 'a' spans over 'b'; one of the two is not navigable there
            const columnDefs = makeColumnDefs();
            columnDefs[0].colSpan = (params) => (params.node!.rowIndex === 30 ? 2 : 1);
            columnDefs[notNavigable === 'a' ? 0 : 1].suppressNavigable = (params) => params.node.rowIndex === 30;
            columnDefs[0].pinned = pinned;
            columnDefs[1].pinned = pinned;
            const rowData = Array.from({ length: 40 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
            const api = createNavigationGrid({
                columnDefs,
                rowData,
                suppressRowVirtualisation: false,
                rowBuffer: 0,
            });
            api.setFocusedCell(29, 'b');
            const rowRendered = !!getGridElement(api)!.querySelector('[row-index="30"]');
            dispatchKeyDown(KeyCode.DOWN);
            const result = `row 30 rendered before: ${rowRendered}, ${focusState(api)}`;
            gridsManager.reset();
            return result;
        };

        expect({
            spanNotNavigable: arrowDownFrom29('a'),
            coveredNotNavigable: arrowDownFrom29('b'),
            leftSpanNotNavigable: arrowDownFrom29('a', 'left'),
            leftCoveredNotNavigable: arrowDownFrom29('b', 'left'),
            rightSpanNotNavigable: arrowDownFrom29('a', 'right'),
            rightCoveredNotNavigable: arrowDownFrom29('b', 'right'),
        }).toEqual({
            spanNotNavigable: 'row 30 rendered before: false, cell b, focused cell 31 b',
            coveredNotNavigable: 'row 30 rendered before: false, cell a, focused cell 30 a',
            leftSpanNotNavigable: 'row 30 rendered before: false, cell b, focused cell 31 b',
            leftCoveredNotNavigable: 'row 30 rendered before: false, cell a, focused cell 30 a',
            rightSpanNotNavigable: 'row 30 rendered before: false, cell b, focused cell 31 b',
            rightCoveredNotNavigable: 'row 30 rendered before: false, cell a, focused cell 30 a',
        });
    });

    test('Arrow Down into a row not rendered yet steps a colSpan of NaN as one column, and ignores the colSpan of a column another span covers', () => {
        const arrowDownFrom29 = (aSpan: number, notNavigable: 'b' | 'c') => {
            // on row 30 'b' would span over 'c'; the column not navigable there tells which cell covers 'c'
            const columnDefs = makeColumnDefs();
            columnDefs[0].colSpan = (params) => (params.node!.rowIndex === 30 ? aSpan : 1);
            columnDefs[1].colSpan = (params) => (params.node!.rowIndex === 30 ? 2 : 1);
            const notNavigableIndex = notNavigable === 'b' ? 1 : 2;
            columnDefs[notNavigableIndex].suppressNavigable = (params) => params.node.rowIndex === 30;
            const rowData = Array.from({ length: 40 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
            const api = createNavigationGrid({ columnDefs, rowData, suppressRowVirtualisation: false, rowBuffer: 0 });

            api.setFocusedCell(29, 'c');
            const rowRendered = !!getGridElement(api)!.querySelector('[row-index="30"]');
            dispatchKeyDown(KeyCode.DOWN);
            const result = `row 30 rendered before: ${rowRendered}, ${focusState(api)}`;
            gridsManager.reset();
            return result;
        };

        expect({
            // 'a' spans NaN, one column, so 'b' spans over 'c' and is not navigable
            nanSpan: arrowDownFrom29(Number.NaN, 'b'),
            // 'a' spans over 'b', so 'b' starts no cell and 'c' is its own cell, not navigable
            coveredSpanStart: arrowDownFrom29(2, 'c'),
        }).toEqual({
            nanSpan: 'row 30 rendered before: false, cell c, focused cell 31 c',
            coveredSpanStart: 'row 30 rendered before: false, cell c, focused cell 31 c',
        });
    });

    test('Shift+Tab into the last row moves back past a spanning cell that is not navigable, rendered or not, also in RTL', async () => {
        // on the last row 'b' spans over 'c' and is not navigable
        const columnDefs = makeColumnDefs();
        columnDefs[0].colSpan = undefined;
        columnDefs[1].colSpan = (params) => (params.node!.rowIndex === 29 ? 2 : 1);
        columnDefs[1].suppressNavigable = (params) => params.node.rowIndex === 29;
        const rowData = Array.from({ length: 30 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));

        expect({
            rendered: await shiftTabFromPaging({ columnDefs, rowData, suppressRowVirtualisation: true }),
            notRendered: await shiftTabFromPaging({
                columnDefs,
                rowData,
                suppressRowVirtualisation: false,
                rowBuffer: 0,
            }),
            rtl: await shiftTabFromPaging({ columnDefs, rowData, suppressRowVirtualisation: true, enableRtl: true }),
        }).toEqual({
            rendered: 'rendered before: true, gridBody 29 a, cell a, focused cell 29 a',
            notRendered: 'rendered before: false, gridBody 29 a, cell a, focused cell 29 a',
            rtl: 'rendered before: true, gridBody 29 a, cell a, focused cell 29 a',
        });
    });

    test('Shift+Tab onto a last row with nothing navigable walks back to the row above, or the last header, as its default target says', async () => {
        const shiftTabOntoLastRowOf = (rowCount: number, suppressHeaderFocus = false) => {
            // on the last row 'a' spans all three columns and is not navigable
            const columnDefs = spanningColumnDefs((rowIndex) => rowIndex === rowCount - 1);
            columnDefs[0].suppressNavigable = (params) => params.node.rowIndex === rowCount - 1;
            const rowData = Array.from({ length: rowCount }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
            return shiftTabFromPaging({ columnDefs, rowData, suppressHeaderFocus });
        };

        expect({
            rowAbove: await shiftTabOntoLastRowOf(3),
            noRowAbove: await shiftTabOntoLastRowOf(1),
            noRowAboveNorHeader: await shiftTabOntoLastRowOf(1, true),
        }).toEqual({
            rowAbove: 'rendered before: true, gridBody 1 c, cell c, focused cell 1 c',
            noRowAbove: 'rendered before: true, gridBody header c, header c',
            noRowAboveNorHeader: 'rendered before: true, gridBody null, no cell',
        });
    });

    test('Shift+Tab onto a full-width last row enters it, and its default target is the grid body, rendered or not', async () => {
        const fullWidthLastRow: GridOptions<RowData> = {
            rowData: Array.from({ length: 30 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` })),
            isFullWidthRow: (params) => params.rowNode.rowIndex === 29,
            fullWidthCellRenderer: class {
                private readonly eGui = document.createElement('div');
                public getGui() {
                    return this.eGui;
                }
            },
        };

        const lastColumnNotNavigable = makeColumnDefs();
        lastColumnNotNavigable[2].suppressNavigable = (params) => params.node.rowIndex === 29;

        expect({
            rendered: await shiftTabFromPaging({ ...fullWidthLastRow, suppressRowVirtualisation: true }),
            notRendered: await shiftTabFromPaging({
                ...fullWidthLastRow,
                suppressRowVirtualisation: false,
                rowBuffer: 0,
            }),
            lastColumnNotNavigable: await shiftTabFromPaging({
                ...fullWidthLastRow,
                columnDefs: lastColumnNotNavigable,
            }),
        }).toEqual({
            rendered: 'rendered before: true, gridBody gridBody, full width row 29',
            notRendered: 'rendered before: false, gridBody gridBody, full width row 29',
            lastColumnNotNavigable: 'rendered before: true, gridBody gridBody, full width row 29',
        });
    });

    test('Tab from the row group panel onto a full-width first row enters it, and its default target is the grid body', async () => {
        // row 0 is a full-width group row
        const columnDefs: ColDef<RowData>[] = [
            { field: 'a', rowGroup: true, hide: true },
            { field: 'b' },
            { field: 'c' },
        ];
        const tabToNextGridContainer = vi.fn((_params: TabToNextGridContainerParams<RowData>) => undefined);
        const api = await gridsManager.createGridAndWait<RowData>(
            'myGrid',
            {
                columnDefs,
                rowData: [{ a: 'a0', b: 'b0', c: 'c0' }],
                groupDisplayType: 'groupRows',
                groupDefaultExpanded: -1,
                rowGroupPanelShow: 'always',
                suppressHeaderFocus: true,
                tabToNextGridContainer,
            },
            { modules: [RowGroupingModule, RowGroupingPanelModule] }
        );
        getGridElement(api)!.querySelector<HTMLElement>('.ag-column-drop-cell')!.focus();
        dispatchKeyDown(KeyCode.TAB);

        expect({
            calls: tabToNextGridContainer.mock.calls.map(([params]) => describeTarget(params.defaultTarget)),
            focus: focusState(api),
        }).toEqual({ calls: ['gridBody'], focus: 'full width row 0' });
    });

    test('Shift+Tab from below, also in RTL, and End focus the cell spanning the last column of the last row', () => {
        const focusLastCell = (key: 'shiftTab' | 'end', enableRtl = false) => {
            const api = createNavigationGrid({
                columnDefs: spanningColumnDefs((rowIndex) => rowIndex === 2),
                enableRtl,
            });
            if (key === 'end') {
                api.setFocusedCell(0, 'a');
                dispatchKeyDown(KeyCode.PAGE_END);
            } else {
                getGridElement(api)!.querySelector<HTMLElement>('.ag-tab-guard-bottom')!.focus();
            }
            const result = focusState(api);
            gridsManager.reset();
            return result;
        };

        expect({
            shiftTab: focusLastCell('shiftTab'),
            end: focusLastCell('end'),
            shiftTabRtl: focusLastCell('shiftTab', true),
        }).toEqual({
            shiftTab: 'cell a, focused cell 2 a',
            end: 'cell a, focused cell 2 a',
            shiftTabRtl: 'cell a, focused cell 2 a',
        });
    });

    test('tabToNextGridContainer names the cell spanning the last column, and entering through it continues as the grid would', async () => {
        type Callback = (
            params: TabToNextGridContainerParams<RowData>,
            api: GridApi<RowData>
        ) => TabToNextGridContainerTarget | undefined;
        const shiftTabThenUp = async (callback?: Callback) => {
            const defaultTargets: string[] = [];
            const api: GridApi<RowData> = await gridsManager.createGridAndWait<RowData>(
                'myGrid',
                {
                    columnDefs: spanningColumnDefs((rowIndex) => rowIndex === 2),
                    rowData: [
                        { a: 'a0', b: 'b0', c: 'c0' },
                        { a: 'a1', b: 'b1', c: 'c1' },
                        { a: 'a2', b: 'b2', c: 'c2' },
                    ],
                    pagination: true,
                    paginationPageSizeSelector: false,
                    tabToNextGridContainer: (params) => {
                        const target = params.defaultTarget as CellPosition;
                        defaultTargets.push(`${target.rowIndex} ${target.column.getColId()}`);
                        return callback?.(params, api);
                    },
                },
                { modules: [PaginationModule] }
            );
            getGridElement(api)!.querySelector<HTMLElement>('.ag-paging-button')!.focus();
            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
            const entered = focusState(api);
            dispatchKeyDown(KeyCode.UP);
            const result = [...defaultTargets, entered, focusState(api)];
            gridsManager.reset();
            return result;
        };

        expect({
            byDefault: await shiftTabThenUp(),
            defaultTargetReturned: await shiftTabThenUp((params) => params.defaultTarget ?? undefined),
            defaultTargetCopied: await shiftTabThenUp((params) => ({ ...(params.defaultTarget as CellPosition) })),
            defaultTargetRebuilt: await shiftTabThenUp((params) => {
                const { rowIndex, column } = params.defaultTarget as CellPosition;
                return { rowIndex, column, rowPinned: undefined };
            }),
            coveredCellReturned: await shiftTabThenUp((_params, api) => ({
                rowIndex: 2,
                rowPinned: null,
                column: api.getColumn('b')!,
            })),
        }).toEqual({
            byDefault: ['2 a', 'cell a, focused cell 2 a', 'cell c, focused cell 1 c'],
            defaultTargetReturned: ['2 a', 'cell a, focused cell 2 a', 'cell c, focused cell 1 c'],
            defaultTargetCopied: ['2 a', 'cell a, focused cell 2 a', 'cell c, focused cell 1 c'],
            defaultTargetRebuilt: ['2 a', 'cell a, focused cell 2 a', 'cell c, focused cell 1 c'],
            coveredCellReturned: ['2 a', 'cell a, focused cell 2 a', 'cell b, focused cell 1 b'],
        });
    });

    test('cell selection follows the cell that takes focus: Shift+Arrow Down, a tabToNextGridContainer cell and Shift+Tab', async () => {
        const rangeOf = (api: GridApi) => {
            const range = api.getCellRanges()?.[0];
            return range && `${range.startRow?.rowIndex}-${range.endRow?.rowIndex} ${range.columns[0].getColId()}`;
        };
        const columnDefs = makeColumnDefs();
        columnDefs[0].suppressNavigable = true;
        const extendApi = gridsManager.createGrid<RowData>(
            'myGrid',
            {
                columnDefs,
                rowData: [
                    { a: 'a0', b: 'b0', c: 'c0' },
                    { a: 'a1', b: 'b1', c: 'c1' },
                    { a: 'a2', b: 'b2', c: 'c2' },
                ],
                cellSelection: true,
            },
            { modules: [CellSelectionModule] }
        );
        extendApi.setFocusedCell(0, 'b');
        extendApi.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['b'] });
        dispatchKeyDown(KeyCode.DOWN, { shiftKey: true });
        const extended = rangeOf(extendApi);
        gridsManager.reset();

        const tabApi: GridApi<RowData> = await gridsManager.createGridAndWait<RowData>(
            'myGrid',
            {
                columnDefs: makeColumnDefs(),
                rowData: [
                    { a: 'a0', b: 'b0', c: 'c0' },
                    { a: 'a1', b: 'b1', c: 'c1' },
                    { a: 'a2', b: 'b2', c: 'c2' },
                ],
                cellSelection: true,
                pagination: true,
                paginationPageSizeSelector: false,
                tabToNextGridContainer: () => ({ rowIndex: 1, rowPinned: null, column: tabApi.getColumn('b')! }),
            },
            { modules: [CellSelectionModule, PaginationModule] }
        );
        getGridElement(tabApi)!.querySelector<HTMLElement>('.ag-paging-button')!.focus();
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
        const tabbedInto = rangeOf(tabApi);
        gridsManager.reset();

        const tabBackApi = gridsManager.createGrid<RowData>(
            'myGrid',
            {
                columnDefs: makeColumnDefs(),
                rowData: [
                    { a: 'a0', b: 'b0', c: 'c0' },
                    { a: 'a1', b: 'b1', c: 'c1' },
                ],
                cellSelection: true,
            },
            { modules: [CellSelectionModule] }
        );
        tabBackApi.setFocusedCell(1, 'c');
        dispatchKeyDown(KeyCode.TAB, { shiftKey: true });

        expect({ extended, tabbedInto, tabbedBack: `${rangeOf(tabBackApi)}, ${focusState(tabBackApi)}` }).toEqual({
            extended: '0-2 b',
            tabbedInto: '1-1 a',
            tabbedBack: '1-1 a, cell a, focused cell 1 a',
        });
    });

    test('Shift+Tab walking back past rows with nothing navigable onto a covered column of a row not rendered yet focuses the cell spanning it, with its range', () => {
        // nothing is navigable below row 30, where 'a' spans all three columns
        const columnDefs = spanningColumnDefs((rowIndex) => rowIndex === 30);
        for (const colDef of columnDefs) {
            colDef.suppressNavigable = (params) => params.node.rowIndex! > 30;
        }
        const api = gridsManager.createGrid<RowData>(
            'myGrid',
            {
                columnDefs,
                rowData: Array.from({ length: 40 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` })),
                suppressRowVirtualisation: false,
                rowBuffer: 0,
                cellSelection: true,
            },
            { modules: [CellSelectionModule] }
        );
        const rendered = !!getGridElement(api)!.querySelector('[row-index="30"]');

        getGridElement(api)!.querySelector<HTMLElement>('.ag-tab-guard-bottom')!.focus();
        const range = api.getCellRanges()?.[0];

        expect({
            rendered,
            focus: focusState(api),
            range: range && `${range.startRow?.rowIndex}-${range.endRow?.rowIndex} ${range.columns[0].getColId()}`,
        }).toEqual({
            rendered: false,
            focus: 'cell a, focused cell 30 a',
            range: '30-30 a',
        });
    });

    test('a Tab walk over rows not rendered, entering the grid or while editing, runs each row’s isFullWidthRow and colSpan callbacks once per walk, not per cell', () => {
        const colSpanRows: number[] = [];
        const fullWidthRows: number[] = [];
        const rowData = Array.from({ length: 40 }, (_, i) => ({ a: `a${i}`, b: `b${i}`, c: `c${i}` }));
        const countingColumnDefs = (spanAt: number) => {
            const columnDefs = makeColumnDefs();
            columnDefs[0].colSpan = (params) => {
                colSpanRows.push(params.node!.rowIndex!);
                return params.node!.rowIndex === spanAt ? 3 : 1;
            };
            return columnDefs;
        };
        const isFullWidthRow = (params: { rowNode: { rowIndex: number | null } }) => {
            fullWidthRows.push(params.rowNode.rowIndex!);
            return false;
        };
        const perRow = (rows: number[], from: number, to: number) => {
            const counts: Record<number, number> = {};
            for (const row of rows) {
                if (row >= from && row <= to) {
                    counts[row] = (counts[row] ?? 0) + 1;
                }
            }
            return counts;
        };
        const oncePerRow = (from: number, to: number) =>
            Object.fromEntries(Array.from({ length: to - from + 1 }, (_, i) => [from + i, 1]));

        // entering from below: nothing is navigable below row 30, where 'a' spans all three columns
        const entryColumnDefs = countingColumnDefs(30);
        for (const colDef of entryColumnDefs) {
            colDef.suppressNavigable = (params) => params.node.rowIndex! > 30;
        }
        const api = createNavigationGrid({
            columnDefs: entryColumnDefs,
            rowData,
            suppressRowVirtualisation: false,
            rowBuffer: 0,
            isFullWidthRow,
        });
        colSpanRows.length = 0;
        fullWidthRows.length = 0;
        getGridElement(api)!.querySelector<HTMLElement>('.ag-tab-guard-bottom')!.focus();
        const entry = {
            focus: focusState(api),
            walkedRowsRendered: !!getGridElement(api)!.querySelector('[row-index="31"], [row-index="39"]'),
            colSpanCallsPerRow: perRow(colSpanRows, 31, 39),
            isFullWidthRowCallsPerRow: perRow(fullWidthRows, 31, 39),
        };
        gridsManager.reset();

        // while editing: only rows 0 and 39 are editable, so Tab walks past every cell between them
        const editColumnDefs = countingColumnDefs(-1);
        for (const colDef of editColumnDefs) {
            colDef.editable = (params) => params.node.rowIndex === 0 || params.node.rowIndex === 39;
        }
        const editApi = gridsManager.createGrid<RowData>(
            'myGrid',
            { columnDefs: editColumnDefs, rowData, suppressRowVirtualisation: false, rowBuffer: 0, isFullWidthRow },
            { modules: [TextEditorModule] }
        );
        editApi.startEditingCell({ rowIndex: 0, colKey: 'c' });
        const walkedRowsRendered = !!getGridElement(editApi)!.querySelector('[row-index="20"], [row-index="35"]');
        colSpanRows.length = 0;
        fullWidthRows.length = 0;
        dispatchKeyDown(KeyCode.TAB);
        const editing = {
            editing: editApi.getEditingCells().map((cell) => `${cell.rowIndex} ${cell.column?.getColId()}`),
            walkedRowsRendered,
            colSpanCallsPerRow: perRow(colSpanRows, 20, 35),
            isFullWidthRowCallsPerRow: perRow(fullWidthRows, 20, 35),
        };

        // entering, the entry row is judged by the entry, the move along it and the walk on: once each
        const entryCalls = { ...oncePerRow(31, 38), 39: 3 };
        expect({ entry, editing }).toEqual({
            entry: {
                focus: 'cell a, focused cell 30 a',
                walkedRowsRendered: false,
                colSpanCallsPerRow: entryCalls,
                isFullWidthRowCallsPerRow: entryCalls,
            },
            editing: {
                editing: ['39 a'],
                walkedRowsRendered: false,
                colSpanCallsPerRow: oncePerRow(20, 35),
                isFullWidthRowCallsPerRow: oncePerRow(20, 35),
            },
        });
    });

    test('focus arriving on a detail row enters its grid from the side it came from, by Page Down, Ctrl+Down, a tabToNextGridContainer cell, a Tab walk or Shift+Tab whatever its columns, with the grid body as default target', async () => {
        type Entry = 'pageDown' | 'ctrlDown' | 'callbackCell' | 'tabWalk' | 'shiftTabNothingNavigable';
        const focusInDetailGrid = () => {
            const el = document.activeElement;
            if (!el?.closest('.ag-details-row')) {
                return 'outside';
            }
            if (el.classList.contains('ag-header-cell')) {
                return 'detail grid header';
            }
            return el.classList.contains('ag-cell') ? 'detail grid cell' : 'detail grid, elsewhere';
        };
        const enterDetailRow = async (entry: Entry) => {
            const defaultTargets: string[] = [];
            // row 0 is the master of detail row 1; a Tab walk starts from row 2 and stops on the detail row, which
            // Tab enters whatever its columns, as it does between cells
            const columnDefs = makeColumnDefs().map((colDef) => ({
                ...colDef,
                colSpan: undefined,
                suppressNavigable: entry === 'tabWalk' || entry === 'shiftTabNothingNavigable',
            }));
            const api: GridApi<RowData> = await gridsManager.createGridAndWait<RowData>(
                'myGrid',
                {
                    columnDefs,
                    rowData:
                        entry === 'tabWalk'
                            ? [
                                  { a: 'a0', b: 'b0', c: 'c0' },
                                  { a: 'a1', b: 'b1', c: 'c1' },
                              ]
                            : [{ a: 'a0', b: 'b0', c: 'c0' }],
                    masterDetail: true,
                    isRowMaster: (data) => data.a === 'a0',
                    detailCellRendererParams: {
                        detailGridOptions: { columnDefs: [{ field: 'x' }] },
                        getDetailRowData: (params: GetDetailRowDataParams) => params.successCallback([{ x: 'x0' }]),
                    },
                    pagination: true,
                    paginationPageSizeSelector: false,
                    tabToNextGridContainer: (params) => {
                        defaultTargets.push(describeTarget(params.defaultTarget));
                        return entry === 'callbackCell'
                            ? { rowIndex: 1, rowPinned: null, column: api.getColumn('a')! }
                            : undefined;
                    },
                },
                { modules: [MasterDetailModule, PaginationModule] }
            );
            api.getDisplayedRowAtIndex(0)!.setExpanded(true);
            await waitFor(() =>
                expect(getGridElement(api)!.querySelector('.ag-details-row .ag-header-cell')).not.toBeNull()
            );
            if (entry === 'pageDown' || entry === 'ctrlDown') {
                api.setFocusedCell(0, 'a');
                dispatchKeyDown(entry === 'pageDown' ? KeyCode.PAGE_DOWN : KeyCode.DOWN, {
                    ctrlKey: entry === 'ctrlDown',
                });
            } else {
                // the detail grid has its own paging panel, before the master's
                const pagingPanels = getGridElement(api)!.querySelectorAll('.ag-paging-panel');
                pagingPanels[pagingPanels.length - 1].querySelector<HTMLElement>('.ag-paging-button')!.focus();
                dispatchKeyDown(KeyCode.TAB, { shiftKey: true });
            }
            const result = [...defaultTargets, focusInDetailGrid()];
            gridsManager.reset();
            return result;
        };

        expect({
            pageDown: await enterDetailRow('pageDown'),
            ctrlDown: await enterDetailRow('ctrlDown'),
            callbackCell: await enterDetailRow('callbackCell'),
            tabWalk: await enterDetailRow('tabWalk'),
            shiftTabNothingNavigable: await enterDetailRow('shiftTabNothingNavigable'),
        }).toEqual({
            pageDown: ['detail grid header'],
            ctrlDown: ['detail grid header'],
            callbackCell: ['gridBody', 'detail grid cell'],
            tabWalk: ['gridBody', 'detail grid cell'],
            shiftTabNothingNavigable: ['gridBody', 'detail grid cell'],
        });
    });

    test('Tab and Shift+Tab while editing skip a spanning cell that is not editable, whatever the columns it covers', () => {
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', colSpan: (params) => (params.node!.rowIndex === 0 ? 2 : 1) },
                    { field: 'c', editable: true },
                    { field: 'd', editable: true },
                ],
                rowData: [{ a: 'a0', b: 'b0', c: 'c0', d: 'd0' }],
            },
            { modules: [TextEditorModule] }
        );
        const tabWhileEditing = (from: string, shiftKey: boolean) => {
            api.startEditingCell({ rowIndex: 0, colKey: from });
            dispatchKeyDown(KeyCode.TAB, { shiftKey });
            const result = {
                editing: api.getEditingCells().map((cell) => `${cell.rowIndex} ${cell.column?.getColId()}`),
                focused: `${getFocusedRowIndex(api)} ${getFocusedColId(api)}`,
            };
            api.stopEditing(true);
            return result;
        };

        expect({ tab: tabWhileEditing('a', false), shiftTab: tabWhileEditing('d', true) }).toEqual({
            tab: { editing: ['0 d'], focused: '0 d' },
            shiftTab: { editing: ['0 a'], focused: '0 a' },
        });
    });

    test('full-row editing starts editors on the cells drawn, not on the columns a span covers', () => {
        const api = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: [
                    { field: 'a', editable: true, colSpan: (params) => (params.node!.rowIndex === 0 ? 2 : 1) },
                    { field: 'b', editable: true },
                    { field: 'c', editable: true },
                ],
                rowData: [
                    { a: 'a0', b: 'b0', c: 'c0' },
                    { a: 'a1', b: 'b1', c: 'c1' },
                ],
                editType: 'fullRow',
            },
            { modules: [TextEditorModule] }
        );
        const editRow = (rowIndex: number) => {
            api.startEditingCell({ rowIndex, colKey: 'a' });
            const editing = api.getEditingCells().map((cell) => `${cell.rowIndex} ${cell.column?.getColId()}`);
            api.stopEditing(true);
            return editing;
        };

        expect({ spanning: editRow(0), plain: editRow(1) }).toEqual({
            spanning: ['0 a', '0 c'],
            plain: ['1 a', '1 b', '1 c'],
        });
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
