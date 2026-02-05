import { BatchEditModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { expect } from '../../test-utils/matchers';

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
        modules: [BatchEditModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    // Sources that create pending batch values (SET_DATA_SOURCE_AS_API)
    const batchSources = ['paste', 'rangeSvc', 'cellClear', 'undo', 'redo'] as const;

    // Sources that bypass batch and write directly to data
    const bypassSources = [undefined, 'ui', 'api', 'edit'] as const;

    describe('sources that create pending batch values', () => {
        test.each(batchSources)("'%s' creates pending value during batch mode", async (eventSource) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

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

            api.commitBatchEdit();
            await asyncSetTimeout(1);

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

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

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

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

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

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', eventSource);

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

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'pasted', 'paste');

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

            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('a', 'a-changed', 'paste');
            rowNode.setDataValue('b', 'b-changed', 'paste');

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

            expect(rowNode.data.a).toBe('a-changed');
            expect(rowNode.data.b).toBe('b-changed');
            expect(rowNode.getDataValue('a')).toBe('a-changed');
            expect(rowNode.getDataValue('b')).toBe('b-changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('a-changed');
            expect(api.getCellValue({ rowNode, colKey: 'b' })).toBe('b-changed');
        });
    });
});
