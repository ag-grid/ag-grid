import { TextEditorModule, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Tests for setDataValue behavior during batch editing.
 *
 * Key behavior:
 * - Sources in SET_DATA_SOURCE_AS_API ('paste', 'rangeSvc', 'cellClear', 'redo', 'undo') create pending batch values
 * - Other sources (undefined, 'ui', 'api', etc.) bypass batch mode and write directly to data
 */
describe('Cell Editing: setDataValue in Batch Mode', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    // Sources that create pending batch values (SET_DATA_SOURCE_AS_API)
    const batchSources = ['paste', 'rangeSvc', 'cellClear', 'undo', 'redo'] as const;

    // Sources that bypass batch and write directly to data
    const bypassSources = [undefined, 'ui', 'api', 'edit', 'fillHandle', 'bulk'] as const;

    describe('sources that create pending batch values', () => {
        test.each(batchSources)("'%s' creates pending value during batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before batch edit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

            // GridRows shows rendered values (pending in batch mode)
            await new GridRows(api, `after ${eventSource} setDataValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"changed" "initial"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('initial'); // Data unchanged
            expect(rowNode.getDataValue('a')).toBe('initial'); // getDataValue returns committed data
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed'); // Default returns pending
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('changed'); // Pending value
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial'); // Data unchanged
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('changed'); // Edit value

            api.cancelBatchEdit();
        });

        test.each(batchSources)("'%s' pending value is committed on commitBatchEdit", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'committed', eventSource);

            await new GridRows(api, 'before commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"committed" "initial"
            `);

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"committed"
            `);

            expect(rowNode.data.a).toBe('committed');
        });

        test.each(batchSources)("'%s' pending value is reverted on cancelBatchEdit", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'pending', eventSource);

            await new GridRows(api, 'before cancel').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"pending" "initial"
            `);

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after cancel').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            expect(rowNode.data.a).toBe('initial');
        });
    });

    describe('sources that bypass batch mode', () => {
        test.each(bypassSources)("'%s' writes directly to data during batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before batch edit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

            await new GridRows(api, `after ${eventSource ?? 'undefined'} setDataValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed'); // Written directly to data
            expect(rowNode.getDataValue('a')).toBe('changed'); // getDataValue returns committed data
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed'); // Default
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('changed');

            api.cancelBatchEdit();
        });
    });

    describe('behavior outside batch mode', () => {
        test.each(bypassSources)("'%s' updates data directly when not in batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

            await new GridRows(api, `after ${eventSource ?? 'undefined'} setDataValue`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed');
            expect(rowNode.getDataValue('a')).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
        });

        test("'paste' writes directly to data when not in batch mode and not editing", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'before paste').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'pasted', 'paste');

            await new GridRows(api, 'after paste').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"pasted"
            `);

            // 'paste' bypasses editSvc when not in batch mode, so value is written directly
            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('pasted');
            expect(rowNode.getDataValue('a')).toBe('pasted');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('pasted');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('pasted');
        });
    });

    describe('multiple cells', () => {
        test('multiple setDataValue calls during batch are all applied on commit', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [{ id: '0', a: 'a-initial', b: 'b-initial' }],
                getRowId: (params) => params.data.id,
            });

            await new GridRows(api, 'initial state').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a-initial" b:"b-initial"
            `);

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'a-changed', 'paste');
            rowNode.setDataValue('b', 'b-changed', 'paste');

            await new GridRows(api, 'after setDataValue calls').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 a:⏳"a-changed" "a-initial" b:⏳"b-changed" "b-initial"
            `);

            expect(rowNode.data.a).toBe('a-initial');
            expect(rowNode.data.b).toBe('b-initial');
            expect(rowNode.getDataValue('a')).toBe('a-initial');
            expect(rowNode.getDataValue('b')).toBe('b-initial');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('a-changed');
            expect(api.getCellValue({ rowNode, colKey: 'b', from: 'batch' })).toBe('b-changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('a-initial');
            expect(api.getCellValue({ rowNode, colKey: 'b', from: 'data' })).toBe('b-initial');

            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a-changed" b:"b-changed"
            `);

            expect(rowNode.data.a).toBe('a-changed');
            expect(rowNode.data.b).toBe('b-changed');
            expect(rowNode.getDataValue('a')).toBe('a-changed');
            expect(rowNode.getDataValue('b')).toBe('b-changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('a-changed');
            expect(api.getCellValue({ rowNode, colKey: 'b' })).toBe('b-changed');
        });
    });
});
