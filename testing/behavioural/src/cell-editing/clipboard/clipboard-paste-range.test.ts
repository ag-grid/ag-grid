import { TextEditorModule, UndoRedoEditModule, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
} from '../../test-utils';

describe('Clipboard Paste Behaviour: paste into range / multi-range', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClipboardModule, CellSelectionModule, BatchEditModule, UndoRedoEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
    });

    function makeRowData() {
        return [
            { id: 'ROW_0', a: 'a0', b: 'b0' },
            { id: 'ROW_1', a: 'a1', b: 'b1' },
            { id: 'ROW_2', a: 'a2', b: 'b2' },
            { id: 'ROW_3', a: 'a3', b: 'b3' },
        ];
    }

    const defaultColDef = { editable: true };
    const columnDefs = [{ field: 'a' }, { field: 'b' }];
    const gridOptions = { cellSelection: true as const, defaultColDef, columnDefs };

    /** Sets a single cell range (clears any previous ranges first). */
    function setRange(api: any, params: { rowStartIndex: number; rowEndIndex: number; columns: string[] }) {
        api.clearCellSelection();
        api.addCellRange(params);
    }

    test('paste multi-value clipboard into single-column range', async () => {
        const api = await gridMgr.createGridAndWait('pasteRange1', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        const eventTracker = new EditEventTracker(api);

        // Two-row clipboard → paste into a 2-row range on column "a"
        clipboardUtils.setText('X0\nX1');
        setRange(api, { rowStartIndex: 1, rowEndIndex: 2, columns: ['a'] });
        api.setFocusedCell(1, 'a');

        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after range paste').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"a0" b:"b0"
            ├── LEAF id:ROW_1 a:"X0" b:"b1"
            ├── LEAF id:ROW_2 a:"X1" b:"b2"
            └── LEAF id:ROW_3 a:"a3" b:"b3"
        `);

        expect(eventTracker.counts.cellValueChanged).toBe(2);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test('paste multi-value clipboard into multi-column range', async () => {
        const api = await gridMgr.createGridAndWait('pasteRange2', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        // 2×2 clipboard (tab-separated columns) → paste into a 2×2 range
        clipboardUtils.setText('X0\tY0\nX1\tY1');
        setRange(api, { rowStartIndex: 1, rowEndIndex: 2, columns: ['a', 'b'] });
        api.setFocusedCell(1, 'a');

        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after 2x2 paste').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"a0" b:"b0"
            ├── LEAF id:ROW_1 a:"X0" b:"Y0"
            ├── LEAF id:ROW_2 a:"X1" b:"Y1"
            └── LEAF id:ROW_3 a:"a3" b:"b3"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200 editable
        `);
    });

    test('paste single value fills entire active range', async () => {
        const api = await gridMgr.createGridAndWait('pasteRange3', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        const eventTracker = new EditEventTracker(api);

        // Single value clipboard + range with >1 cell → fills all cells in range
        clipboardUtils.setText('FILL');
        setRange(api, { rowStartIndex: 0, rowEndIndex: 2, columns: ['a', 'b'] });
        api.setFocusedCell(0, 'a');

        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after single-value range fill').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"FILL" b:"FILL"
            ├── LEAF id:ROW_1 a:"FILL" b:"FILL"
            ├── LEAF id:ROW_2 a:"FILL" b:"FILL"
            └── LEAF id:ROW_3 a:"a3" b:"b3"
        `);

        // 3 rows × 2 columns = 6 cells
        expect(eventTracker.counts.cellValueChanged).toBe(6);
    });

    test('paste single value fills all cells across multiple ranges', async () => {
        const api = await gridMgr.createGridAndWait('pasteMulti1', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        const eventTracker = new EditEventTracker(api);

        // Two disjoint ranges: rows 0-0 col a, rows 2-3 col b
        clipboardUtils.setText('Z');
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        api.addCellRange({ rowStartIndex: 2, rowEndIndex: 3, columns: ['b'] });
        api.setFocusedCell(0, 'a');

        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after multi-range single-value paste').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Z" b:"b0"
            ├── LEAF id:ROW_1 a:"a1" b:"b1"
            ├── LEAF id:ROW_2 a:"a2" b:"Z"
            └── LEAF id:ROW_3 a:"a3" b:"Z"
        `);

        // 1 cell in first range + 2 cells in second range = 3
        expect(eventTracker.counts.cellValueChanged).toBe(3);
    });

    test('paste multi-value into multiple ranges fills each range', async () => {
        const api = await gridMgr.createGridAndWait('pasteMulti2', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        // Two 2-row ranges on column "a", clipboard has 2 rows
        clipboardUtils.setText('P0\nP1');
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a'] });
        api.addCellRange({ rowStartIndex: 2, rowEndIndex: 3, columns: ['a'] });
        api.setFocusedCell(0, 'a');

        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await new GridRows(api, 'after multi-range multi-value paste').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"P0" b:"b0"
            ├── LEAF id:ROW_1 a:"P1" b:"b1"
            ├── LEAF id:ROW_2 a:"P0" b:"b2"
            └── LEAF id:ROW_3 a:"P1" b:"b3"
        `);
    });

    test('batch: paste into active range stages values until commit', async () => {
        const api = await gridMgr.createGridAndWait('pasteRangeBatch1', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        api.startBatchEdit();

        clipboardUtils.setText('B0\nB1');
        setRange(api, { rowStartIndex: 1, rowEndIndex: 2, columns: ['a'] });
        api.setFocusedCell(1, 'a');

        api.pasteFromClipboard();
        await asyncSetTimeout(5);

        // Grid shows staged (pending) values
        await new GridRows(api, 'staged').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"a0" b:"b0"
            ├── LEAF ⏳ id:ROW_1 a:⏳"B0" "a1" b:"b1"
            ├── LEAF ⏳ id:ROW_2 a:⏳"B1" "a2" b:"b2"
            └── LEAF id:ROW_3 a:"a3" b:"b3"
        `);

        // Underlying data unchanged
        expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('a1');
        expect(api.getDisplayedRowAtIndex(2)?.data?.a).toBe('a2');

        api.commitBatchEdit();
        await asyncSetTimeout(5);

        // After commit, data is written through
        await new GridRows(api, 'committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"a0" b:"b0"
            ├── LEAF id:ROW_1 a:"B0" b:"b1"
            ├── LEAF id:ROW_2 a:"B1" b:"b2"
            └── LEAF id:ROW_3 a:"a3" b:"b3"
        `);

        expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('B0');
        expect(api.getDisplayedRowAtIndex(2)?.data?.a).toBe('B1');
    });

    test('batch: paste single value into multi-range stages all cells', async () => {
        const api = await gridMgr.createGridAndWait('pasteRangeBatch2', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        api.startBatchEdit();

        clipboardUtils.setText('Q');
        api.clearCellSelection();
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['a'] });
        api.addCellRange({ rowStartIndex: 3, rowEndIndex: 3, columns: ['b'] });
        api.setFocusedCell(0, 'a');

        api.pasteFromClipboard();
        await asyncSetTimeout(5);

        // Staged values visible
        await new GridRows(api, 'staged multi-range').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:ROW_0 a:⏳"Q" "a0" b:"b0"
            ├── LEAF id:ROW_1 a:"a1" b:"b1"
            ├── LEAF id:ROW_2 a:"a2" b:"b2"
            └── LEAF ⏳ id:ROW_3 a:"a3" b:⏳"Q" "b3"
        `);

        // Underlying data unchanged before commit
        expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('a0');
        expect(api.getDisplayedRowAtIndex(3)?.data?.b).toBe('b3');

        api.commitBatchEdit();
        await asyncSetTimeout(5);

        await new GridRows(api, 'committed multi-range').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Q" b:"b0"
            ├── LEAF id:ROW_1 a:"a1" b:"b1"
            ├── LEAF id:ROW_2 a:"a2" b:"b2"
            └── LEAF id:ROW_3 a:"a3" b:"Q"
        `);

        expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('Q');
        expect(api.getDisplayedRowAtIndex(3)?.data?.b).toBe('Q');
    });

    test('batch: cancel discards paste-into-range staged edits', async () => {
        const api = await gridMgr.createGridAndWait('pasteRangeBatch3', {
            ...gridOptions,
            rowData: makeRowData(),
            getRowId: (p) => p.data.id,
        });

        api.startBatchEdit();

        clipboardUtils.setText('GONE');
        setRange(api, { rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
        api.setFocusedCell(0, 'a');

        api.pasteFromClipboard();
        await asyncSetTimeout(5);

        api.cancelBatchEdit();
        await asyncSetTimeout(5);

        // Everything reverts to original
        await new GridRows(api, 'after cancel').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"a0" b:"b0"
            ├── LEAF id:ROW_1 a:"a1" b:"b1"
            ├── LEAF id:ROW_2 a:"a2" b:"b2"
            └── LEAF id:ROW_3 a:"a3" b:"b3"
        `);
    });
});
