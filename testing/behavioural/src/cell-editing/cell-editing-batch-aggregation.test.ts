import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    ClientSideRowModelModule,
    PinnedRowModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

describe('Cell Editing: change detection', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, RowGroupingModule, TextEditorModule, ClientSideRowModelModule, PinnedRowModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.clearAllMocks();
    });

    // ─── Non-batch (single cell edit) ────────────────────────────────────────

    describe('non-batch single cell edit', () => {
        test('updates row data and group aggregation', async () => {
            const api = await gridMgr.createGridAndWait('nonBatch', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
            });

            api.getRowNode('1')!.setDataValue('value', 50);

            await new GridRows(api, 'after single edit').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:70
                · ├── LEAF id:1 group:"A" value:50
                · └── LEAF id:2 group:"A" value:20
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200 aggFunc:sum editable
            `);
        });

        test('updates group footer sibling aggregation', async () => {
            const api = await gridMgr.createGridAndWait('nonBatchFooter', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
                groupTotalRow: 'bottom',
            });

            const groupNode = api.getRowNode('row-group-group-A')!;
            api.getRowNode('1')!.setDataValue('value', 50);

            expect(groupNode.aggData?.value).toBe(70);
            expect(groupNode.sibling?.aggData?.value).toBe(70);

            await new GridRows(api, 'after single edit with footer').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
                · ├── LEAF id:1 group:"A" value:50
                · ├── LEAF id:2 group:"A" value:20
                · └─ footer id:rowGroupFooter_row-group-group-A ag-Grid-AutoColumn:"Total A" value:70
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value "Value" width:200 aggFunc:sum editable
            `);
        });

        test('refreshes pinnedTopRowData row directly (no aggregation)', async () => {
            const api = await gridMgr.createGridAndWait('nonBatchPinnedTop', {
                columnDefs: [{ field: 'value', editable: true, cellDataType: false }],
                rowData: [{ value: 10 }],
                pinnedTopRowData: [{ value: 99 }],
            });

            const pinnedRow = api.getPinnedTopRow(0)!;
            pinnedRow.setDataValue('value', 42);

            expect(pinnedRow.data.value).toBe(42);

            await new GridRows(api, 'after editing pinned top row').check(`
                PINNED_TOP id:t-0 value:42
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:10
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                └── value "Value" width:200 editable
            `);
        });
    });

    // ─── Batch commit ─────────────────────────────────────────────────────────

    describe('batch commit', () => {
        // Regression / optimisation: commitBatchEdit() must run doAggregate exactly once,
        // not once per changed cell.
        test('applies all staged values and updates aggregation in a single pass', async () => {
            const api = await gridMgr.createGridAndWait('batchAgg', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                    { id: '3', group: 'A', value: 30 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
            });

            const groupNode = api.getRowNode('row-group-group-A')!;
            expect(groupNode.aggData?.value).toBe(60);

            api.startBatchEdit();

            api.getRowNode('1')!.setDataValue('value', 100, 'batch');
            api.getRowNode('2')!.setDataValue('value', 200, 'batch');
            api.getRowNode('3')!.setDataValue('value', 300, 'batch');

            // Staged — data and aggregation unchanged.
            expect(api.getRowNode('1')!.data.value).toBe(10);
            expect(groupNode.aggData?.value).toBe(60);

            api.commitBatchEdit();

            await new GridRows(api, 'after batch commit').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:600
                · ├── LEAF id:1 group:"A" value:100
                · ├── LEAF id:2 group:"A" value:200
                · └── LEAF id:3 group:"A" value:300
            `);
        });

        test('cancel reverts staged values; aggregation unchanged', async () => {
            const api = await gridMgr.createGridAndWait('batchCancel', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
            });

            const groupNode = api.getRowNode('row-group-group-A')!;

            api.startBatchEdit();
            api.getRowNode('1')!.setDataValue('value', 999, 'batch');
            api.getRowNode('2')!.setDataValue('value', 999, 'batch');
            expect(groupNode.aggData?.value).toBe(30);

            api.cancelBatchEdit();

            expect(groupNode.aggData?.value).toBe(30);
            await new GridRows(api, 'after cancel').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:30
                · ├── LEAF id:1 group:"A" value:10
                · └── LEAF id:2 group:"A" value:20
            `);
        });

        test('updates group footer sibling aggregation', async () => {
            const api = await gridMgr.createGridAndWait('batchFooter', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
                groupTotalRow: 'bottom',
            });

            const groupNode = api.getRowNode('row-group-group-A')!;

            api.startBatchEdit();
            api.getRowNode('1')!.setDataValue('value', 100, 'batch');
            api.getRowNode('2')!.setDataValue('value', 200, 'batch');
            api.commitBatchEdit();

            expect(groupNode.aggData?.value).toBe(300);
            expect(groupNode.sibling?.aggData?.value).toBe(300);

            await new GridRows(api, 'after batch commit with footer').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A"
                · ├── LEAF id:1 group:"A" value:100
                · ├── LEAF id:2 group:"A" value:200
                · └─ footer id:rowGroupFooter_row-group-group-A ag-Grid-AutoColumn:"Total A" value:300
            `);
        });

        test('updates pinned sibling aggregation when group row is manually pinned', async () => {
            const api = await gridMgr.createGridAndWait('batchPinnedSibling', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                    { id: '3', group: 'B', value: 30 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
                enableRowPinning: true,
                isRowPinned: (node) => (node.group && node.key === 'A' ? 'top' : null),
            });

            const groupA = api.getRowNode('row-group-group-A')!;
            const pinnedA = api.getPinnedTopRow(0)!;
            expect(groupA.aggData?.value).toBe(30);
            expect(pinnedA.aggData?.value).toBe(30);

            api.startBatchEdit();
            api.getRowNode('1')!.setDataValue('value', 100, 'batch');
            api.getRowNode('2')!.setDataValue('value', 200, 'batch');
            api.commitBatchEdit();

            expect(groupA.aggData?.value).toBe(300);
            expect(pinnedA.aggData?.value).toBe(300);

            await new GridRows(api, 'after batch commit with pinned sibling').check(`
                PINNED_TOP id:t-top-row-group-group-A ag-Grid-AutoColumn:"A" value:300
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:300
                │ ├── LEAF id:1 group:"A" value:100
                │ └── LEAF id:2 group:"A" value:200
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:30
                · └── LEAF id:3 group:"B" value:30
            `);
        });

        test('updates pinnedTopRowData row directly (no aggregation)', async () => {
            const api = await gridMgr.createGridAndWait('batchPinnedTop', {
                columnDefs: [{ field: 'value', editable: true, cellDataType: false }],
                rowData: [{ value: 10 }],
                pinnedTopRowData: [{ value: 99 }],
            });

            const pinnedRow = api.getPinnedTopRow(0)!;

            api.startBatchEdit();
            pinnedRow.setDataValue('value', 42, 'batch');
            api.commitBatchEdit();

            expect(pinnedRow.data.value).toBe(42);

            await new GridRows(api, 'after batch commit pinned top row').check(`
                PINNED_TOP id:t-0 value:42
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 value:10
            `);
        });

        test('updates multiple groups independently', async () => {
            const api = await gridMgr.createGridAndWait('batchMultiGroup', {
                rowData: [
                    { id: '1', group: 'A', value: 10 },
                    { id: '2', group: 'A', value: 20 },
                    { id: '3', group: 'B', value: 30 },
                    { id: '4', group: 'B', value: 40 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
            });

            api.startBatchEdit();
            api.getRowNode('1')!.setDataValue('value', 100, 'batch');
            api.getRowNode('3')!.setDataValue('value', 300, 'batch');
            api.commitBatchEdit();

            await new GridRows(api, 'after batch commit multiple groups').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" value:120
                │ ├── LEAF id:1 group:"A" value:100
                │ └── LEAF id:2 group:"A" value:20
                └─┬ LEAF_GROUP id:row-group-group-B ag-Grid-AutoColumn:"B" value:340
                · ├── LEAF id:3 group:"B" value:300
                · └── LEAF id:4 group:"B" value:40
            `);
        });
    });

    // ─── Multi-column batch ─────────────────────────────────────────────────

    describe('multi-column batch commit', () => {
        test('updates aggregation for multiple columns in a single batch', async () => {
            const api = await gridMgr.createGridAndWait('batchMultiCol', {
                rowData: [
                    { id: '1', group: 'A', sales: 100, cost: 50 },
                    { id: '2', group: 'A', sales: 200, cost: 80 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'group', rowGroup: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', editable: true, cellDataType: false },
                    { field: 'cost', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
            });

            const groupNode = api.getRowNode('row-group-group-A')!;
            expect(groupNode.aggData?.sales).toBe(300);
            expect(groupNode.aggData?.cost).toBe(130);

            api.startBatchEdit();
            api.getRowNode('1')!.setDataValue('sales', 500, 'batch');
            api.getRowNode('1')!.setDataValue('cost', 200, 'batch');
            api.getRowNode('2')!.setDataValue('sales', 600, 'batch');
            api.getRowNode('2')!.setDataValue('cost', 300, 'batch');

            // Staged — aggregation still at original values.
            expect(groupNode.aggData?.sales).toBe(300);
            expect(groupNode.aggData?.cost).toBe(130);

            api.commitBatchEdit();

            expect(groupNode.aggData?.sales).toBe(1100);
            expect(groupNode.aggData?.cost).toBe(500);

            await new GridRows(api, 'after multi-column batch commit').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" sales:1100 cost:500
                · ├── LEAF id:1 group:"A" sales:500 cost:200
                · └── LEAF id:2 group:"A" sales:600 cost:300
            `);
        });
    });

    // ─── Pivot + batch ───────────────────────────────────────────────────────

    describe('pivot batch commit', () => {
        const pivotGridMgr = new TestGridsManager({
            modules: [BatchEditModule, PivotModule, RowGroupingModule, TextEditorModule, ClientSideRowModelModule],
        });

        afterEach(() => pivotGridMgr.reset());

        test('updates pivot aggregation after batch commit on leaf rows', async () => {
            const api = await pivotGridMgr.createGridAndWait('batchPivot', {
                pivotMode: true,
                rowData: [
                    { id: '1', country: 'France', year: '2020', sales: 100 },
                    { id: '2', country: 'France', year: '2021', sales: 200 },
                    { id: '3', country: 'Germany', year: '2020', sales: 300 },
                    { id: '4', country: 'Germany', year: '2021', sales: 400 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                groupDefaultExpanded: -1,
            });
            await new GridColumns(api, `updates pivot aggregation after batch commit on leaf rows setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
                `
            );
            await new GridRows(api, `updates pivot aggregation after batch commit on leaf rows setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:400 pivot_year_2021_sales:600
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:100 pivot_year_2021_sales:200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:100 pivot_year_2021_sales:100
                │ └── LEAF hidden id:2 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:300 pivot_year_2021_sales:400
                · ├── LEAF hidden id:3 pivot_year_2020_sales:300 pivot_year_2021_sales:300
                · └── LEAF hidden id:4 pivot_year_2020_sales:400 pivot_year_2021_sales:400
            `);

            const pivotColumns = api.getPivotResultColumns()!;
            const col2020 = pivotColumns.find((col) => col.getColId().includes('2020'))!;
            const col2021 = pivotColumns.find((col) => col.getColId().includes('2021'))!;
            expect(col2020).toBeDefined();
            expect(col2021).toBeDefined();

            const france = api.getRowNode('row-group-country-France')!;
            const germany = api.getRowNode('row-group-country-Germany')!;

            // Check initial aggregation
            expect(france.aggData?.[col2020.getColId()]).toBe(100);
            expect(france.aggData?.[col2021.getColId()]).toBe(200);
            expect(germany.aggData?.[col2020.getColId()]).toBe(300);
            expect(germany.aggData?.[col2021.getColId()]).toBe(400);

            api.startBatchEdit();
            api.getRowNode('1')!.setDataValue('sales', 500, 'batch');
            api.getRowNode('3')!.setDataValue('sales', 700, 'batch');

            // Staged — aggregation unchanged.
            expect(france.aggData?.[col2020.getColId()]).toBe(100);
            expect(germany.aggData?.[col2020.getColId()]).toBe(300);

            api.commitBatchEdit();

            // After commit, pivot aggregation updated.
            expect(france.aggData?.[col2020.getColId()]).toBe(500);
            expect(france.aggData?.[col2021.getColId()]).toBe(200);
            expect(germany.aggData?.[col2020.getColId()]).toBe(700);
            expect(germany.aggData?.[col2021.getColId()]).toBe(400);
            await new GridRows(api, `updates pivot aggregation after batch commit on leaf rows final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1200 pivot_year_2021_sales:600
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:500 pivot_year_2021_sales:200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:500 pivot_year_2021_sales:500
                │ └── LEAF hidden id:2 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:700 pivot_year_2021_sales:400
                · ├── LEAF hidden id:3 pivot_year_2020_sales:700 pivot_year_2021_sales:700
                · └── LEAF hidden id:4 pivot_year_2020_sales:400 pivot_year_2021_sales:400
            `);
        });
    });

    // ─── Tree data ────────────────────────────────────────────────────────────

    describe('tree data batch commit', () => {
        const treeGridMgr = new TestGridsManager({
            modules: [BatchEditModule, TreeDataModule, RowGroupingModule, TextEditorModule, ClientSideRowModelModule],
        });

        afterEach(() => treeGridMgr.reset());

        test('updates parent aggregation after editing children in a batch', async () => {
            const api = await treeGridMgr.createGridAndWait('batchTree', {
                treeData: true,
                getDataPath: (d) => d.path,
                columnDefs: [
                    { field: 'path', hide: true, cellDataType: false },
                    { field: 'value', aggFunc: 'sum', editable: true, cellDataType: false },
                ],
                rowData: [
                    { id: 'root', path: ['A'], value: 0 },
                    { id: 'child1', path: ['A', 'child1'], value: 10 },
                    { id: 'child2', path: ['A', 'child2'], value: 20 },
                ],
                getRowId: (p) => p.data.id,
                groupDefaultExpanded: -1,
            });

            api.startBatchEdit();
            api.getRowNode('child1')!.setDataValue('value', 100, 'batch');
            api.getRowNode('child2')!.setDataValue('value', 200, 'batch');
            api.commitBatchEdit();

            await new GridRows(api, 'after tree batch commit').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ A GROUP id:root ag-Grid-AutoColumn:"A" path:["A"] value:300
                · ├── child1 LEAF id:child1 ag-Grid-AutoColumn:"child1" path:"A, child1" value:100
                · └── child2 LEAF id:child2 ag-Grid-AutoColumn:"child2" path:"A, child2" value:200
            `);
        });
    });

    // ─── Grand total row batch styling ────────────────────────────────────────

    describe('grand total row batch styling', () => {
        test('setDataValue during batch applies batch style to grand total row cell', async () => {
            const api = await gridMgr.createGridAndWait('batchGrandTotalStyle', {
                rowData: [
                    { id: '1', value: 10 },
                    { id: '2', value: 20 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [{ field: 'value', aggFunc: 'sum', editable: true, cellDataType: false }],
                grandTotalRow: 'bottom',
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID value:30
                ├── LEAF id:1 value:10
                ├── LEAF id:2 value:20
                └─ footer id:rowGroupFooter_ROOT_NODE_ID value:30
            `);

            api.startBatchEdit();

            // setDataValue on a leaf row — grand total row cell should get batch style
            api.getRowNode('1')!.setDataValue('value', 100, 'batch');
            await asyncSetTimeout(1);

            // Leaf cell gets batch style
            const leafCell = getByTestId(gridDiv, agTestIdFor.cell('1', 'value'));
            expect(leafCell).toHaveClass('ag-cell-batch-edit');

            // Grand total row cell should also get batch style
            const footerCell = getByTestId(gridDiv, agTestIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'value'));
            expect(footerCell).toHaveClass('ag-cell-batch-edit');

            api.cancelBatchEdit();
            await asyncSetTimeout(1);

            // After cancel, batch styles should be removed
            expect(getByTestId(gridDiv, agTestIdFor.cell('1', 'value'))).not.toHaveClass('ag-cell-batch-edit');
            expect(getByTestId(gridDiv, agTestIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'value'))).not.toHaveClass(
                'ag-cell-batch-edit'
            );
        });

        test('UI edit during batch applies batch style to grand total row cell (baseline)', async () => {
            const api = await gridMgr.createGridAndWait('batchGrandTotalStyleUI', {
                rowData: [
                    { id: '1', value: 10 },
                    { id: '2', value: 20 },
                ],
                getRowId: (p) => p.data.id,
                columnDefs: [{ field: 'value', aggFunc: 'sum', editable: true, cellDataType: false }],
                grandTotalRow: 'bottom',
            });
            await new GridColumns(
                api,
                `UI edit during batch applies batch style to grand total row cell (baseline) setup`
            ).checkColumns(`
                CENTER
                └── value "Value" width:200 aggFunc:sum editable
            `);
            await new GridRows(api, `UI edit during batch applies batch style to grand total row cell (baseline) setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID value:30
                    ├── LEAF id:1 value:10
                    ├── LEAF id:2 value:20
                    └─ footer id:rowGroupFooter_ROOT_NODE_ID value:30
                `);

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            api.startBatchEdit();

            // Edit via UI
            const leafCell = getByTestId(gridDiv, agTestIdFor.cell('1', 'value'));
            await userEvent.dblClick(leafCell);
            await asyncSetTimeout(1);

            const editor = await waitForInput(gridDiv, leafCell, { popup: false });
            await userEvent.clear(editor);
            await userEvent.keyboard('100{Enter}');
            await asyncSetTimeout(1);

            // Leaf cell gets batch style
            expect(getByTestId(gridDiv, agTestIdFor.cell('1', 'value'))).toHaveClass('ag-cell-batch-edit');

            // Grand total row cell should also get batch style
            const footerCell = getByTestId(gridDiv, agTestIdFor.cell('rowGroupFooter_ROOT_NODE_ID', 'value'));
            expect(footerCell).toHaveClass('ag-cell-batch-edit');

            api.cancelBatchEdit();
            await new GridRows(
                api,
                `UI edit during batch applies batch style to grand total row cell (baseline) final state`
            ).check(`
                ROOT id:ROOT_NODE_ID value:30
                ├── LEAF id:1 value:10
                ├── LEAF id:2 value:20
                └─ footer id:rowGroupFooter_ROOT_NODE_ID value:30
            `);
        });
    });
});
