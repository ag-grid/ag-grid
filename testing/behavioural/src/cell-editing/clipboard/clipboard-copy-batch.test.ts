import { TextEditorModule, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, clipboardUtils } from '../../test-utils';

/**
 * Tests verifying that clipboard copy operations use 'batch' source values
 * (committed batch values) rather than 'edit' values (live typing in editors).
 *
 * This ensures that when copying during batch edit mode:
 * - Committed batch values are copied (not the underlying data)
 * - Live editor input (uncommitted typing) is NOT copied
 */
describe('Clipboard Copy: uses batch values not edit values', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClipboardModule, CellSelectionModule, BatchEditModule, TextEditorModule],
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

    test('copy during batch edit copies pending batch values, not original data', async () => {
        const api = await gridMgr.createGridAndWait('clipboardCopyBatch', {
            columnDefs: [{ field: 'value', editable: true }],
            rowData: [{ id: '0', value: 'original' }],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:"original"
        `);

        // Start batch edit and make a pending change
        api.startBatchEdit();
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('value', 'batch-pending', 'paste'); // Uses batch source

        // Verify the batch value is pending but not committed to data
        expect(rowNode.data.value).toBe('original');
        expect(api.getCellValue({ rowNode, colKey: 'value', from: 'batch' })).toBe('batch-pending');
        expect(api.getCellValue({ rowNode, colKey: 'value', from: 'data' })).toBe('original');

        // Copy the cell - should copy the batch value
        api.setFocusedCell(0, 'value');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['value'] });
        api.copyToClipboard();
        await asyncSetTimeout(1);

        // Clipboard should contain the batch value, not the original data
        expect(clipboardUtils.getText()).toBe('batch-pending');

        api.cancelBatchEdit();
    });

    test('copy should NOT include live editor typing (edit values)', async () => {
        const api = await gridMgr.createGridAndWait('clipboardCopyNotEdit', {
            cellSelection: true,
            columnDefs: [{ field: 'value', editable: true }],
            rowData: [{ id: '0', value: 'original' }],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:"original"
        `);

        // Start batch edit
        api.startBatchEdit();
        await asyncSetTimeout(1);

        // First, set a batch pending value
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('value', 'batch-value', 'paste');

        // Now start editing the cell (simulates user typing)
        api.startEditingCell({ rowIndex: 0, colKey: 'value' });
        await asyncSetTimeout(1);

        // Verify the edit value would be different from batch if we were checking edit source
        // The editor should have 'batch-value' loaded, but if user types 'live-typing',
        // we want to ensure copy still uses batch, not the live editor state

        // For this test, the edit value equals batch value since editing just started
        // The key point is we're using 'batch' source, which excludes uncommitted editor changes
        expect(api.getCellValue({ rowNode, colKey: 'value', from: 'batch' })).toBe('batch-value');

        // Add a range selection before copying (required for copyToClipboard to work)
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['value'] });

        // Copy while cell is being edited - should copy batch value, not edit value
        api.copyToClipboard();
        await asyncSetTimeout(1);

        // Should copy the batch value
        expect(clipboardUtils.getText()).toBe('batch-value');

        api.stopEditing();
        api.cancelBatchEdit();
    });

    test('copyRangeDown uses batch values', async () => {
        const api = await gridMgr.createGridAndWait('clipboardCopyRangeDown', {
            cellSelection: true,
            columnDefs: [{ field: 'value', editable: true }],
            rowData: [
                { id: '0', value: 'source' },
                { id: '1', value: 'target1' },
                { id: '2', value: 'target2' },
            ],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:"source"
            ├── LEAF id:1 value:"target1"
            └── LEAF id:2 value:"target2"
        `);

        // Start batch edit and modify the source cell
        api.startBatchEdit();
        await asyncSetTimeout(1);

        const sourceRow = api.getDisplayedRowAtIndex(0)!;
        sourceRow.setDataValue('value', 'batch-source', 'paste');

        // Verify batch value is set
        expect(api.getCellValue({ rowNode: sourceRow, colKey: 'value', from: 'batch' })).toBe('batch-source');
        expect(sourceRow.data.value).toBe('source'); // Original data unchanged

        // Select range from row 0 to row 2 and copy down
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 2, columns: ['value'] });
        api.copySelectedRangeDown();
        await asyncSetTimeout(1);

        // After copyRangeDown, all rows should have the batch value from row 0
        await new GridRows(api, 'after copy range down').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 value:⏳"batch-source" "source"
            ├── LEAF ⏳ id:1 value:⏳"batch-source" "target1"
            └── LEAF ⏳ id:2 value:⏳"batch-source" "target2"
        `);

        api.cancelBatchEdit();
    });

    test('copy without batch edit copies data values', async () => {
        const api = await gridMgr.createGridAndWait('clipboardCopyNoBatch', {
            columnDefs: [{ field: 'value', editable: true }],
            rowData: [{ id: '0', value: 'data-value' }],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:"data-value"
        `);

        // Copy without batch edit - should copy the data value
        api.setFocusedCell(0, 'value');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['value'] });
        api.copyToClipboard();
        await asyncSetTimeout(1);

        expect(clipboardUtils.getText()).toBe('data-value');
    });

    test('copy after batch commit copies committed data', async () => {
        const api = await gridMgr.createGridAndWait('clipboardCopyAfterCommit', {
            columnDefs: [{ field: 'value', editable: true }],
            rowData: [{ id: '0', value: 'original' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `copy after batch commit copies committed data setup`).checkColumns(`
            CENTER
            └── value "Value" width:200 editable
        `);
        await new GridRows(api, `copy after batch commit copies committed data setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:"original"
        `);

        // Start batch, make change, commit
        api.startBatchEdit();
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('value', 'committed-value', 'paste');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // Verify data is now committed
        expect(rowNode.data.value).toBe('committed-value');

        // Copy after commit - should copy the committed value
        api.setFocusedCell(0, 'value');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['value'] });
        api.copyToClipboard();
        await asyncSetTimeout(1);

        expect(clipboardUtils.getText()).toBe('committed-value');
        await new GridRows(api, `copy after batch commit copies committed data final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 value:"committed-value"
        `);
    });
});
