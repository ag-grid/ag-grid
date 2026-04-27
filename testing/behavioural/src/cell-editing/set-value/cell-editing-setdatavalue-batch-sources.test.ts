import {
    CheckboxEditorModule,
    DateEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Tests for setDataValue behaviour during batch editing — source routing.
 *
 * Key behaviour after fix:
 * - All sources (except 'data') create pending batch values when batch mode is active
 * - 'data' source always writes directly to data, bypassing batch mode entirely
 * - 'batch' source writes to batch pending value when batch is active, otherwise directly to data
 */
describe('Cell Editing: setDataValue in Batch Mode — sources', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            BatchEditModule,
            TextEditorModule,
            NumberEditorModule,
            DateEditorModule,
            SelectEditorModule,
            CheckboxEditorModule,
            LargeTextEditorModule,
            RenderApiModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    // All sources that create pending batch values during batch mode
    const allBatchSources = [
        undefined,
        'ui',
        'api',
        'edit',
        'fillHandle',
        'bulk',
        'paste',
        'rangeSvc',
        'cellClear',
        'undo',
        'redo',
        'batch',
    ] as const;

    describe('sources that create pending batch values', () => {
        test.each(allBatchSources)("'%s' creates pending value during batch mode", async (eventSource) => {
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
            await new GridRows(api, `after ${eventSource ?? 'undefined'} setDataValue`).check(`
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

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        });

        test.each(allBatchSources)("'%s' pending value is committed on commitBatchEdit", async (eventSource) => {
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

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── a "A" width:200 editable
            `);
        });

        test.each(allBatchSources)("'%s' pending value is reverted on cancelBatchEdit", async (eventSource) => {
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

    describe("'data' source bypasses batch mode", () => {
        test("'data' writes directly to data during batch mode", async () => {
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
            const result = rowNode.setDataValue('a', 'changed', 'data');

            await new GridRows(api, 'after data setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed'); // Written directly to data
            expect(rowNode.getDataValue('a')).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('changed');

            api.cancelBatchEdit();
        });

        test("'data' writes directly to data when not in batch mode", async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', editable: true }],
                rowData: [{ id: '0', a: 'initial' }],
                getRowId: (params) => params.data.id,
            });

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            const result = rowNode.setDataValue('a', 'changed', 'data');

            await new GridRows(api, 'after data setDataValue').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"changed"
            `);

            expect(result).toBe(true);
            expect(rowNode.data.a).toBe('changed');
            expect(rowNode.getDataValue('a')).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('changed');
            expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('changed');
        });
    });

    describe('behavior outside batch mode', () => {
        const outsideBatchSources = [undefined, 'ui', 'api', 'edit', 'batch'] as const;

        test.each(outsideBatchSources)("'%s' updates data directly when not in batch mode", async (eventSource) => {
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

        test('default setDataValue stages as pending when no editor is open (TC1)', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', editable: true },
                    { field: 'age', editable: true },
                ],
                rowData: [{ id: '0', athlete: 'Michael Phelps', age: 23 }],
                getRowId: (params) => params.data.id,
            });

            // Start batch and immediately call setDataValue without opening any editor
            api.startBatchEdit();
            await asyncSetTimeout(1);

            const rowNode = api.getDisplayedRowAtIndex(0)!;
            rowNode.setDataValue('age', 10);

            // Value should be staged as pending, NOT written to data
            await new GridRows(api, 'after setDataValue in batch without editor').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF ⏳ id:0 athlete:"Michael Phelps" age:⏳10 23
            `);

            expect(rowNode.data.age).toBe(23); // Data unchanged
            expect(api.getCellValue({ rowNode, colKey: 'age', from: 'batch' })).toBe(10); // Pending value
            expect(api.getCellValue({ rowNode, colKey: 'age', from: 'data' })).toBe(23); // Data unchanged

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            // After cancel, value should be reverted
            expect(rowNode.data.age).toBe(23);
            await new GridRows(api, 'after cancel').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23
            `);
        });

        test('mass update via setDataValue stages all rows as pending (TC2)', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'athlete', editable: true },
                    { field: 'age', editable: true },
                ],
                rowData: [
                    { id: '0', athlete: 'Michael Phelps', age: 23 },
                    { id: '1', athlete: 'Natalie Coughlin', age: 25 },
                    { id: '2', athlete: 'Aleksey Nemov', age: 24 },
                ],
                getRowId: (params) => params.data.id,
            });

            api.startBatchEdit();
            await asyncSetTimeout(1);

            // Mass update: call setDataValue on multiple rows without opening any editor
            const row0 = api.getDisplayedRowAtIndex(0)!;
            const row1 = api.getDisplayedRowAtIndex(1)!;
            row0.setDataValue('athlete', 'Mass Updated');
            row1.setDataValue('athlete', 'Mass Updated');

            // Both rows should have pending values, NOT written to data
            await new GridRows(api, 'after mass update').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:⏳"Mass Updated" "Michael Phelps" age:23
                ├── LEAF ⏳ id:1 athlete:⏳"Mass Updated" "Natalie Coughlin" age:25
                └── LEAF id:2 athlete:"Aleksey Nemov" age:24
            `);

            expect(row0.data.athlete).toBe('Michael Phelps'); // Data unchanged
            expect(row1.data.athlete).toBe('Natalie Coughlin'); // Data unchanged

            // Commit batch: values should now be written to data
            api.commitBatchEdit();
            await asyncSetTimeout(1);

            await new GridRows(api, 'after commit').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Mass Updated" age:23
                ├── LEAF id:1 athlete:"Mass Updated" age:25
                └── LEAF id:2 athlete:"Aleksey Nemov" age:24
            `);

            expect(row0.data.athlete).toBe('Mass Updated');
            expect(row1.data.athlete).toBe('Mass Updated');
        });
    });
});
