import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberEditorModule, TextEditorModule, UndoRedoEditModule } from 'ag-grid-community';
import { PivotModule, RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { EditEventTracker, GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import type {
    GroupRowEditableCallback,
    GroupRowValueSetterCallback,
    ValueSetterCallback,
} from './group-edit-test-utils';
import { EDIT_MODES, callsForRowNode, cascadeGroupRowValueSetter, editCell } from './group-edit-test-utils';

describe('groupRowEditable with pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            RowGroupingEditModule,
            TextEditorModule,
            NumberEditorModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            UndoRedoEditModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createPivotRowData() {
        return [
            { id: '1', region: 'Europe', country: 'France', year: 2020, sales: 1000 },
            { id: '2', region: 'Europe', country: 'France', year: 2021, sales: 1200 },
            { id: '3', region: 'Europe', country: 'Germany', year: 2020, sales: 1500 },
            { id: '4', region: 'Europe', country: 'Germany', year: 2021, sales: 1800 },
            { id: '5', region: 'Americas', country: 'USA', year: 2020, sales: 2000 },
            { id: '6', region: 'Americas', country: 'USA', year: 2021, sales: 2200 },
            { id: '7', region: 'Americas', country: 'Canada', year: 2020, sales: 800 },
            { id: '8', region: 'Americas', country: 'Canada', year: 2021, sales: 900 },
        ];
    }

    describe.each(EDIT_MODES)('pivot leaf group editing (%s)', (editMode) => {
        test('editing pivot cell in leaf group invokes groupRowEditable and groupRowValueSetter', async () => {
            const groupRowEditableCalls: Parameters<GroupRowEditableCallback>[] = [];
            const groupRowEditable: GroupRowEditableCallback = (...args) => {
                groupRowEditableCalls.push(args);
                return true;
            };

            const groupRowValueSetterCalls: Parameters<GroupRowValueSetterCallback>[] = [];
            const groupRowValueSetter: GroupRowValueSetterCallback = (params) => {
                groupRowValueSetterCalls.push([params]);
                cascadeGroupRowValueSetter(params);
            };

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                undoRedoCellEditing: true,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable,
                        groupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-leaf-group-edit', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const beforeEdit = new GridRows(api, 'before pivot leaf edit', gridRowsOptions);
            await beforeEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);

            const franceNode = api.getRowNode('row-group-country-France');
            expect(franceNode).toBeDefined();

            // Get the pivot column for 2020 sales
            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotColId = pivotCol2020!.getColId();

            // Verify getCellValue before edit - group node returns aggregated value
            expect(api.getCellValue({ rowNode: franceNode!, colKey: pivotColId })).toBe(1000);
            // Verify RowNode.getDataValue matches api.getCellValue
            expect(franceNode!.getDataValue(pivotColId)).toBe(1000);

            groupRowEditableCalls.length = 0;
            groupRowValueSetterCalls.length = 0;

            if (editMode === 'ui') {
                await editCell(api, franceNode!, pivotColId, '2000');
            } else {
                franceNode!.setDataValue(pivotColId, 2000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            // Verify getCellValue after edit - group node returns new aggregated value
            expect(api.getCellValue({ rowNode: franceNode!, colKey: pivotColId })).toBe(2000);
            // Verify RowNode.getDataValue matches api.getCellValue after edit
            expect(franceNode!.getDataValue(pivotColId)).toBe(2000);

            // Verify the cascade distributed the value equally to children
            const afterEdit = new GridRows(api, 'after pivot leaf edit', gridRowsOptions);
            await afterEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
            `);
        });

        test('pivot cell edits in leaf group refresh aggregations correctly', async () => {
            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                undoRedoCellEditing: true,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-leaf-aggregation-refresh', gridOptions);

            const eventTracker = new EditEventTracker(api);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const usaNode = api.getRowNode('row-group-country-USA');

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            const pivotColId = pivotCol2021!.getColId();

            // Verify getCellValue before edit
            expect(api.getCellValue({ rowNode: usaNode!, colKey: pivotColId })).toBe(2200);
            // Verify RowNode.getDataValue matches api.getCellValue
            expect(usaNode!.getDataValue(pivotColId)).toBe(2200);

            if (editMode === 'ui') {
                // Start editing and capture mid-edit state before committing
                api.startEditingCell({
                    rowIndex: usaNode!.rowIndex!,
                    colKey: pivotColId,
                });
                await asyncSetTimeout(0);

                await new GridRows(api, 'during pivot edit', gridRowsOptions).check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                    ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                    ├── LEAF_GROUP collapsed 🖍️ id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                    └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                `);

                api.stopEditing(true);
                await asyncSetTimeout(0);

                await editCell(api, usaNode!, pivotColId, '4000');
            } else {
                usaNode!.setDataValue(pivotColId, 4000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            // Verify getCellValue after edit
            expect(api.getCellValue({ rowNode: usaNode!, colKey: pivotColId })).toBe(4000);
            // Verify RowNode.getDataValue matches api.getCellValue after edit
            expect(usaNode!.getDataValue(pivotColId)).toBe(4000);

            const afterEdit = new GridRows(api, 'after USA 2021 edit', gridRowsOptions);
            await afterEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:7900
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:4000
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);

            expect(eventTracker.counts.cellValueChanged).toBeGreaterThan(0);
            eventTracker.destroy();

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
            `);
        });
    });

    describe.each(EDIT_MODES)('pivot with multiple row group levels editing (%s)', (editMode) => {
        test('editing pivot cell in filler group cascades through all descendants', async () => {
            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                undoRedoCellEditing: true,
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-filler-group-edit', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const beforeEdit = new GridRows(api, 'before filler group edit', gridRowsOptions);
            await beforeEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);

            const europeNode = api.getRowNode('row-group-region-Europe');

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotColId = pivotCol2020!.getColId();

            // Verify getCellValue before edit on filler group node
            expect(api.getCellValue({ rowNode: europeNode!, colKey: pivotColId })).toBe(2500);

            // Edit the Europe filler group to 5000 for 2020
            if (editMode === 'ui') {
                await editCell(api, europeNode!, pivotColId, '5000');
            } else {
                europeNode!.setDataValue(pivotColId, 5000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            // Verify getCellValue after edit on filler group node
            expect(api.getCellValue({ rowNode: europeNode!, colKey: pivotColId })).toBe(5000);

            // The cascade should distribute 5000 equally to France and Germany (2500 each)
            // Then each country distributes to its leaves
            const afterEdit = new GridRows(api, 'after filler group edit', gridRowsOptions);
            await afterEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:7800 pivot_year_2021_sales:6100
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:5000 pivot_year_2021_sales:3000
                │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2500 pivot_year_2021_sales:1200
                │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:2500 pivot_year_2021_sales:1800
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);
        });

        test('editing pivot cell in nested leaf group updates parent filler aggregations', async () => {
            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                undoRedoCellEditing: true,
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-nested-leaf-edit', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const franceNode = api.getRowNode('row-group-region-Europe-country-France');

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            const pivotColId = pivotCol2021!.getColId();

            // Verify getCellValue before edit on nested leaf group
            expect(api.getCellValue({ rowNode: franceNode!, colKey: pivotColId })).toBe(1200);
            // Also verify parent filler group value
            const europeNode = api.getRowNode('row-group-region-Europe');
            expect(api.getCellValue({ rowNode: europeNode!, colKey: pivotColId })).toBe(3000);

            if (editMode === 'ui') {
                await editCell(api, franceNode!, pivotColId, '3000');
            } else {
                franceNode!.setDataValue(pivotColId, 3000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            // Verify getCellValue after edit - leaf group updated
            expect(api.getCellValue({ rowNode: franceNode!, colKey: pivotColId })).toBe(3000);
            // Parent filler group aggregation also updated
            expect(api.getCellValue({ rowNode: europeNode!, colKey: pivotColId })).toBe(4800);

            // France 2021 changed from 1200 to 3000, Europe total should update
            const afterEdit = new GridRows(api, 'after nested leaf edit', gridRowsOptions);
            await afterEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:7900
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:4800
                │ ├── LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:3000
                │ └── LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                · ├── LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                · └── LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);
        });
    });

    describe.each(EDIT_MODES)('pivot mode groupRowEditable callback behaviour (%s)', (editMode) => {
        test('groupRowEditable receives correct pivot column context', async () => {
            const groupRowEditableCalls: Parameters<GroupRowEditableCallback>[] = [];
            const groupRowEditable: GroupRowEditableCallback = (...args) => {
                groupRowEditableCalls.push(args);
                return true;
            };

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-groupRowEditable-context', gridOptions);

            const germanyNode = api.getRowNode('row-group-country-Germany');
            expect(germanyNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();
            const pivotColId = pivotCol2020!.getColId();

            groupRowEditableCalls.length = 0;

            if (editMode === 'ui') {
                await editCell(api, germanyNode!, pivotColId, '3000');

                const callsForGermany = callsForRowNode(groupRowEditableCalls, germanyNode!.id);
                expect(callsForGermany.length).toBeGreaterThan(0);

                // Verify the callback received the correct column
                const lastCall = callsForGermany[callsForGermany.length - 1] as
                    | Parameters<GroupRowEditableCallback>
                    | undefined;
                expect(lastCall).toBeDefined();
                expect(lastCall![0].column.getColId()).toBe(pivotColId);
                expect(lastCall![0].node.group).toBe(true);
            } else {
                germanyNode!.setDataValue(pivotColId, 3000, 'ui');
                await asyncSetTimeout(0);
            }
        });

        test('groupRowEditable returning false prevents pivot cell edit', async () => {
            const groupRowEditable: GroupRowEditableCallback = () => false;

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-groupRowEditable-false', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const beforeSnapshot = `
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `;

            await new GridRows(api, 'before attempted edit', gridRowsOptions).check(beforeSnapshot);

            const franceNode = api.getRowNode('row-group-country-France');
            expect(franceNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();

            // Verify the cell is not editable
            expect(pivotCol2020!.isCellEditable(franceNode!)).toBe(false);

            // Grid should remain unchanged since edit is blocked
            await new GridRows(api, 'after blocked edit attempt', gridRowsOptions).check(beforeSnapshot);
        });
    });

    describe.each(EDIT_MODES)('pivot groupRowValueSetter behaviour (%s)', (editMode) => {
        test('groupRowValueSetter returning false cancels pivot edit', async () => {
            const groupRowValueSetter: GroupRowValueSetterCallback = () => false;

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-groupRowValueSetter-cancel', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const beforeSnapshot = `
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `;

            await new GridRows(api, 'before cancelled edit', gridRowsOptions).check(beforeSnapshot);

            const usaNode = api.getRowNode('row-group-country-USA');
            expect(usaNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            expect(pivotCol2021).toBeDefined();
            const pivotColId = pivotCol2021!.getColId();

            if (editMode === 'ui') {
                await editCell(api, usaNode!, pivotColId, '9999');
            } else {
                usaNode!.setDataValue(pivotColId, 9999, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            // Grid should remain unchanged since valueSetter returned false
            await new GridRows(api, 'after cancelled edit', gridRowsOptions).check(beforeSnapshot);
        });

        test('groupRowValueSetter receives correct params in pivot mode', async () => {
            const groupRowValueSetterCalls: Parameters<GroupRowValueSetterCallback>[] = [];
            const groupRowValueSetter: GroupRowValueSetterCallback = (params) => {
                groupRowValueSetterCalls.push([params]);
                // Allow the edit to proceed but don't cascade
                return true;
            };

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-groupRowValueSetter-params', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            await new GridRows(api, 'before edit', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);

            const canadaNode = api.getRowNode('row-group-country-Canada');
            expect(canadaNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();
            const pivotColId = pivotCol2020!.getColId();

            groupRowValueSetterCalls.length = 0;

            if (editMode === 'ui') {
                await editCell(api, canadaNode!, pivotColId, '1500');
            } else {
                canadaNode!.setDataValue(pivotColId, 1500, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            const callsForCanada = callsForRowNode(groupRowValueSetterCalls, canadaNode!.id);
            expect(callsForCanada.length).toBeGreaterThan(0);

            const lastCall = callsForCanada[callsForCanada.length - 1] as
                | Parameters<GroupRowValueSetterCallback>
                | undefined;
            expect(lastCall).toBeDefined();
            expect(lastCall![0].node.id).toBe('row-group-country-Canada');
            expect(lastCall![0].column.getColId()).toBe(pivotColId);
            // newValue is coerced to number by the data type service
            expect(Number(lastCall![0].newValue)).toBe(1500);

            // Note: without cascading, the aggregation won't change, but the valueSetter was still called
            await new GridRows(api, 'after edit (no cascade)', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);
        });
    });

    // Multiple pivot columns only test setDataValue since UI editing with many pivot columns
    // has column virtualization complexities that make cell element location unreliable
    describe('pivot with multiple pivot columns editing', () => {
        test('editing specific pivot intersection cell updates correct aggregation', async () => {
            const rowData = [
                { id: '1', country: 'France', year: 2020, quarter: 'Q1', sales: 500 },
                { id: '2', country: 'France', year: 2020, quarter: 'Q2', sales: 600 },
                { id: '3', country: 'France', year: 2021, quarter: 'Q1', sales: 700 },
                { id: '4', country: 'Germany', year: 2020, quarter: 'Q1', sales: 800 },
                { id: '5', country: 'Germany', year: 2020, quarter: 'Q2', sales: 900 },
            ];

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'quarter', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData,
            };

            const api = await gridsManager.createGridAndWait('pivot-multiple-columns-edit', gridOptions);

            const pivotColumns = api.getPivotResultColumns();

            // Find specific pivot columns for the test
            const pivotCol2020Q1 = pivotColumns?.find(
                (col) =>
                    col.getColId().includes('2020') && col.getColId().includes('Q1') && col.getColId().includes('sales')
            );
            const pivotCol2020Q2 = pivotColumns?.find(
                (col) =>
                    col.getColId().includes('2020') && col.getColId().includes('Q2') && col.getColId().includes('sales')
            );
            const pivotCol2021Q1 = pivotColumns?.find(
                (col) =>
                    col.getColId().includes('2021') && col.getColId().includes('Q1') && col.getColId().includes('sales')
            );

            // Use specific columns to avoid pivot totals complicating the snapshot
            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: [
                    'ag-Grid-AutoColumn',
                    pivotCol2020Q1!.getColId(),
                    pivotCol2020Q2!.getColId(),
                    pivotCol2021Q1!.getColId(),
                ],
                printHiddenRows: false,
            };

            const pivotColId = pivotCol2020Q1!.getColId();

            await new GridRows(api, 'before edit', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year-quarter_2020-Q1_sales:1300 pivot_year-quarter_2020-Q2_sales:1500 pivot_year-quarter_2021-Q1_sales:700
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year-quarter_2020-Q1_sales:500 pivot_year-quarter_2020-Q2_sales:600 pivot_year-quarter_2021-Q1_sales:700
                └── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year-quarter_2020-Q1_sales:800 pivot_year-quarter_2020-Q2_sales:900 pivot_year-quarter_2021-Q1_sales:null
            `);

            const franceNode = api.getRowNode('row-group-country-France');

            franceNode!.setDataValue(pivotColId, 1000, 'ui');
            await asyncSetTimeout(0);

            // Verify France 2020-Q1 was updated (should cascade to the single leaf)
            expect(api.getRowNode('1')?.data?.sales).toBe(1000);
            // Verify France 2020-Q2 was not affected
            expect(api.getRowNode('2')?.data?.sales).toBe(600);

            await new GridRows(api, 'after edit', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year-quarter_2020-Q1_sales:1800 pivot_year-quarter_2020-Q2_sales:1500 pivot_year-quarter_2021-Q1_sales:700
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year-quarter_2020-Q1_sales:1000 pivot_year-quarter_2020-Q2_sales:600 pivot_year-quarter_2021-Q1_sales:700
                └── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year-quarter_2020-Q1_sales:800 pivot_year-quarter_2020-Q2_sales:900 pivot_year-quarter_2021-Q1_sales:null
            `);
        });
    });

    describe('pivot mode undo/redo', () => {
        test('undo restores previous pivot aggregated value', async () => {
            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                undoRedoCellEditing: true,
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-undo-redo', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            const beforeSnapshot = `
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `;

            await new GridRows(api, 'before edit', gridRowsOptions).check(beforeSnapshot);

            const germanyNode = api.getRowNode('row-group-country-Germany');

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotColId = pivotCol2020!.getColId();

            await editCell(api, germanyNode!, pivotColId, '3000');
            await asyncSetTimeout(0);

            const afterEditSnapshot = `
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6800 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:3000 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `;

            await new GridRows(api, 'after edit', gridRowsOptions).check(afterEditSnapshot);

            // Undo the edit
            api.undoCellEditing();
            await asyncSetTimeout(0);

            await new GridRows(api, 'after undo', gridRowsOptions).check(beforeSnapshot);

            // Redo the edit
            api.redoCellEditing();
            await asyncSetTimeout(0);

            await new GridRows(api, 'after redo', gridRowsOptions).check(afterEditSnapshot);
        });
    });

    describe('pivot mode with valueSetter on leaf rows', () => {
        test('leaf row valueSetter is used for leaf edits, groupRowValueSetter for group edits', async () => {
            const valueSetterCalls: Parameters<ValueSetterCallback>[] = [];
            const valueSetter: ValueSetterCallback = (params) => {
                valueSetterCalls.push([params]);
                // For pivot columns, use the underlying value column's field
                const pivotValueColumn = params.colDef.pivotValueColumn;
                const field = pivotValueColumn ? pivotValueColumn.getColDef().field : params.colDef.field;
                if (params.data && field) {
                    (params.data as Record<string, any>)[field] = params.newValue;
                }
                return true;
            };

            const groupRowValueSetterCalls: Parameters<GroupRowValueSetterCallback>[] = [];
            const groupRowValueSetter: GroupRowValueSetterCallback = (params) => {
                groupRowValueSetterCalls.push([params]);
                cascadeGroupRowValueSetter(params);
            };

            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        valueSetter,
                        groupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-dual-valueSetter', gridOptions);

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };

            await new GridRows(api, 'before edit', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);

            // Edit a group row - should use groupRowValueSetter
            const franceNode = api.getRowNode('row-group-country-France');

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotColId = pivotCol2020!.getColId();

            valueSetterCalls.length = 0;
            groupRowValueSetterCalls.length = 0;

            franceNode!.setDataValue(pivotColId, 2000, 'ui');
            await asyncSetTimeout(0);

            // groupRowValueSetter should have been called for the group node
            const groupSetterCallsForFrance = callsForRowNode(groupRowValueSetterCalls, franceNode!.id);
            expect(groupSetterCallsForFrance.length).toBeGreaterThan(0);

            // valueSetter should have been called for the leaf descendants when cascading
            const leafValueSetterCalls = valueSetterCalls.filter(([params]) => !params.node?.group);
            expect(leafValueSetterCalls.length).toBeGreaterThan(0);

            // The valueSetter properly handles pivot columns by using pivotValueColumn.getColDef().field
            await new GridRows(api, 'after edit', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            `);
        });
    });

    describe('getCellValue and getDataValue with pivot columns', () => {
        test('getCellValue and getDataValue return correct values for filler groups, leaf groups, and leaf data rows', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-getCellValue', gridOptions);
            await new GridColumns(
                api,
                `getCellValue and getDataValue return correct values for filler groups, leaf grou setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
            `);
            await new GridRows(
                api,
                `getCellValue and getDataValue return correct values for filler groups, leaf grou setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                │ ├─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                │ └─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                │ · ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
                │ · └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                · ├─┬ LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                · │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                · │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
                · └─┬ LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            expect(pivotCol2020).toBeDefined();
            expect(pivotCol2021).toBeDefined();
            const pivotColId2020 = pivotCol2020!.getColId();
            const pivotColId2021 = pivotCol2021!.getColId();

            // Test filler group node (Europe region)
            const europeNode = api.getRowNode('row-group-region-Europe');
            expect(europeNode).toBeDefined();
            expect(europeNode!.group).toBe(true);
            expect(api.getCellValue({ rowNode: europeNode!, colKey: pivotColId2020 })).toBe(2500); // France 1000 + Germany 1500
            expect(api.getCellValue({ rowNode: europeNode!, colKey: pivotColId2021 })).toBe(3000); // France 1200 + Germany 1800
            // Verify RowNode.getDataValue matches api.getCellValue
            expect(europeNode!.getDataValue(pivotColId2020)).toBe(2500);
            expect(europeNode!.getDataValue(pivotColId2021)).toBe(3000);

            // Test leaf group node (France country under Europe)
            const franceLeafGroup = api.getRowNode('row-group-region-Europe-country-France');
            expect(franceLeafGroup).toBeDefined();
            expect(franceLeafGroup!.group).toBe(true);
            expect(api.getCellValue({ rowNode: franceLeafGroup!, colKey: pivotColId2020 })).toBe(1000);
            expect(api.getCellValue({ rowNode: franceLeafGroup!, colKey: pivotColId2021 })).toBe(1200);
            // Verify RowNode.getDataValue matches api.getCellValue
            expect(franceLeafGroup!.getDataValue(pivotColId2020)).toBe(1000);
            expect(franceLeafGroup!.getDataValue(pivotColId2021)).toBe(1200);

            // Test leaf data row (France 2020 sales data row)
            const franceData2020 = api.getRowNode('1'); // id: '1', France, 2020, sales: 1000
            expect(franceData2020).toBeDefined();
            expect(franceData2020!.group).toBeFalsy();
            // For leaf rows, getCellValue with pivot column resolves to the underlying value column
            // Both pivot columns resolve to 'sales', returning the same underlying data value
            expect(api.getCellValue({ rowNode: franceData2020!, colKey: pivotColId2020 })).toBe(1000);
            expect(api.getCellValue({ rowNode: franceData2020!, colKey: pivotColId2021 })).toBe(1000);
            // Verify RowNode.getDataValue matches api.getCellValue for leaf rows
            expect(franceData2020!.getDataValue(pivotColId2020)).toBe(1000);
            expect(franceData2020!.getDataValue(pivotColId2021)).toBe(1000);

            // Test another leaf data row (France 2021)
            const franceData2021 = api.getRowNode('2'); // id: '2', France, 2021, sales: 1200
            expect(franceData2021).toBeDefined();
            // Both pivot columns resolve to underlying 'sales' value
            expect(api.getCellValue({ rowNode: franceData2021!, colKey: pivotColId2020 })).toBe(1200);
            expect(api.getCellValue({ rowNode: franceData2021!, colKey: pivotColId2021 })).toBe(1200);
            // Verify RowNode.getDataValue matches api.getCellValue
            expect(franceData2021!.getDataValue(pivotColId2020)).toBe(1200);
            expect(franceData2021!.getDataValue(pivotColId2021)).toBe(1200);

            // Verify Americas filler group
            const americasNode = api.getRowNode('row-group-region-Americas');
            expect(api.getCellValue({ rowNode: americasNode!, colKey: pivotColId2020 })).toBe(2800); // USA 2000 + Canada 800
            expect(api.getCellValue({ rowNode: americasNode!, colKey: pivotColId2021 })).toBe(3100); // USA 2200 + Canada 900
            // Verify RowNode.getDataValue matches api.getCellValue
            expect(americasNode!.getDataValue(pivotColId2020)).toBe(2800);
            expect(americasNode!.getDataValue(pivotColId2021)).toBe(3100);
            await new GridRows(
                api,
                `getCellValue and getDataValue return correct values for filler groups, leaf grou final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:2500 pivot_year_2021_sales:3000
                │ ├─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                │ └─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                │ · ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
                │ · └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" pivot_year_2020_sales:2800 pivot_year_2021_sales:3100
                · ├─┬ LEAF_GROUP collapsed id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                · │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                · │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
                · └─┬ LEAF_GROUP collapsed id:row-group-region-Americas-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);
        });

        test('getCellValue with pivot columns returns aggregated values on group rows after edit', async () => {
            const gridOptions: GridOptions = {
                defaultColDef: {
                    cellEditor: 'agTextCellEditor',
                },
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-getCellValue-after-edit', gridOptions);
            await new GridColumns(
                api,
                `getCellValue with pivot columns returns aggregated values on group rows after ed setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
            `);
            await new GridRows(
                api,
                `getCellValue with pivot columns returns aggregated values on group rows after ed setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
                │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotColId = pivotCol2020!.getColId();

            // Get nodes
            const germanyGroup = api.getRowNode('row-group-country-Germany');
            const germanyLeaf2020 = api.getRowNode('3'); // Germany 2020
            const germanyLeaf2021 = api.getRowNode('4'); // Germany 2021

            // Verify initial values - leaf rows resolve pivot column to underlying 'sales' value
            expect(api.getCellValue({ rowNode: germanyGroup!, colKey: pivotColId })).toBe(1500);
            expect(api.getCellValue({ rowNode: germanyLeaf2020!, colKey: pivotColId })).toBe(1500); // Germany 2020 sales
            expect(api.getCellValue({ rowNode: germanyLeaf2021!, colKey: pivotColId })).toBe(1800); // Germany 2021 sales (resolves to underlying column)

            // Edit the group cell
            germanyGroup!.setDataValue(pivotColId, 3000, 'ui');
            await asyncSetTimeout(0);

            // Verify values after edit
            expect(api.getCellValue({ rowNode: germanyGroup!, colKey: pivotColId })).toBe(3000);
            // Cascade distributed the value to the single 2020 leaf (only row matching pivot keys)
            expect(api.getCellValue({ rowNode: germanyLeaf2020!, colKey: pivotColId })).toBe(3000);
            // 2021 row wasn't edited (didn't match pivot keys), but getCellValue resolves to underlying sales value
            expect(api.getCellValue({ rowNode: germanyLeaf2021!, colKey: pivotColId })).toBe(1800);
            await new GridRows(
                api,
                `getCellValue with pivot columns returns aggregated values on group rows after ed final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6800 pivot_year_2021_sales:6100
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:3000 pivot_year_2021_sales:1800
                │ ├── LEAF hidden id:3 pivot_year_2020_sales:3000 pivot_year_2021_sales:3000
                │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);
        });

        test('getCellValue on leaf row with pivot column resolves to underlying value column', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
            };

            const api = await gridsManager.createGridAndWait('pivot-getCellValue-leaf', gridOptions);
            await new GridColumns(
                api,
                `getCellValue on leaf row with pivot column resolves to underlying value column setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
            `);
            await new GridRows(
                api,
                `getCellValue on leaf row with pivot column resolves to underlying value column setup`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
                │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            const pivotColId2020 = pivotCol2020!.getColId();
            const pivotColId2021 = pivotCol2021!.getColId();

            // USA has two leaf rows: id '5' (2020, 2000) and id '6' (2021, 2200)
            const usaLeaf2020 = api.getRowNode('5');
            const usaLeaf2021 = api.getRowNode('6');

            // getCellValue on leaf rows resolves pivot columns to underlying value column ('sales')
            // Both pivot columns return the same underlying sales value for each row
            expect(api.getCellValue({ rowNode: usaLeaf2020!, colKey: pivotColId2020 })).toBe(2000);
            expect(api.getCellValue({ rowNode: usaLeaf2020!, colKey: pivotColId2021 })).toBe(2000);

            // For 2021 leaf, both pivot columns resolve to its sales value
            expect(api.getCellValue({ rowNode: usaLeaf2021!, colKey: pivotColId2020 })).toBe(2200);
            expect(api.getCellValue({ rowNode: usaLeaf2021!, colKey: pivotColId2021 })).toBe(2200);

            // The group row shows aggregated values for both
            const usaGroup = api.getRowNode('row-group-country-USA');
            expect(api.getCellValue({ rowNode: usaGroup!, colKey: pivotColId2020 })).toBe(2000);
            expect(api.getCellValue({ rowNode: usaGroup!, colKey: pivotColId2021 })).toBe(2200);
            await new GridRows(
                api,
                `getCellValue on leaf row with pivot column resolves to underlying value column final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
                ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
                │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
                ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
                │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);
        });
    });

    interface EditEvent {
        type: 'cellEditingStarted' | 'cellEditingStopped';
        value?: any;
        newValue?: any;
        oldValue?: any;
        valueChanged?: boolean;
    }

    describe.each(EDIT_MODES)('pivot cell editing events (%s)', (editMode) => {
        test('editing pivot cell fires correct event properties', async () => {
            const events: EditEvent[] = [];

            const api = await gridsManager.createGridAndWait('pivot-edit-events', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    {
                        field: 'sales',
                        aggFunc: 'sum',
                        hide: true,
                        editable: true,
                        groupRowEditable: true,
                        groupRowValueSetter: cascadeGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: 0,
                getRowId: ({ data }) => data.id,
                rowData: createPivotRowData(),
                onCellEditingStarted: (event) => {
                    events.push({
                        type: 'cellEditingStarted',
                        value: event.value,
                    });
                },
                onCellEditingStopped: (event) => {
                    events.push({
                        type: 'cellEditingStopped',
                        value: event.value,
                        newValue: event.newValue,
                        oldValue: event.oldValue,
                        valueChanged: event.valueChanged,
                    });
                },
            });

            await asyncSetTimeout(1);

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            const pivotColId = pivotCol2020!.getColId();

            const franceNode = api.getRowNode('row-group-country-France');
            expect(franceNode).toBeDefined();

            if (editMode === 'ui') {
                await editCell(api, franceNode!, pivotColId, '2000');
            } else {
                franceNode!.setDataValue(pivotColId, 2000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            if (editMode === 'ui') {
                expect(events[0]).toMatchObject({
                    type: 'cellEditingStarted',
                    value: 1000,
                });

                expect(events[1]).toMatchObject({
                    type: 'cellEditingStopped',
                    newValue: 2000,
                    oldValue: 1000,
                    valueChanged: true,
                });
            }
        });
    });

    test('cancelling pivot cell edit sets valueChanged to false', async () => {
        const events: EditEvent[] = [];

        const api = await gridsManager.createGridAndWait('pivot-edit-cancel', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                {
                    field: 'sales',
                    aggFunc: 'sum',
                    hide: true,
                    editable: true,
                    groupRowEditable: true,
                },
            ],
            pivotMode: true,
            groupDefaultExpanded: 0,
            getRowId: ({ data }) => data.id,
            rowData: createPivotRowData(),
            onCellEditingStarted: (event) => {
                events.push({
                    type: 'cellEditingStarted',
                    value: event.value,
                });
            },
            onCellEditingStopped: (event) => {
                events.push({
                    type: 'cellEditingStopped',
                    value: event.value,
                    newValue: event.newValue,
                    oldValue: event.oldValue,
                    valueChanged: event.valueChanged,
                });
            },
        });
        await new GridColumns(api, `cancelling pivot cell edit sets valueChanged to false setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open editable
            └─┬ "2021" GROUP
              └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open editable
        `);
        await new GridRows(api, `cancelling pivot cell edit sets valueChanged to false setup`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
            ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
            │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
            │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
            │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
            │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
            │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
            │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
            └─┬ LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
            · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
        `);

        await asyncSetTimeout(1);

        const pivotColumns = api.getPivotResultColumns();
        const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
        const pivotColId = pivotCol2020!.getColId();

        const franceNode = api.getRowNode('row-group-country-France');
        expect(franceNode).toBeDefined();

        const rowIndex = franceNode!.rowIndex!;
        api.setFocusedCell(rowIndex, pivotColId);
        api.startEditingCell({ rowIndex, colKey: pivotColId });

        await asyncSetTimeout(0);

        // Cancel the edit
        api.stopEditing(true);
        await asyncSetTimeout(0);

        expect(events[0]).toMatchObject({
            type: 'cellEditingStarted',
            value: 1000,
        });

        expect(events[1]).toMatchObject({
            type: 'cellEditingStopped',
            value: 1000,
            valueChanged: false,
        });
        await new GridRows(api, `cancelling pivot cell edit sets valueChanged to false final state`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:5300 pivot_year_2021_sales:6100
            ├─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
            │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
            │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
            │ ├── LEAF hidden id:3 pivot_year_2020_sales:1500 pivot_year_2021_sales:1500
            │ └── LEAF hidden id:4 pivot_year_2020_sales:1800 pivot_year_2021_sales:1800
            ├─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
            │ ├── LEAF hidden id:5 pivot_year_2020_sales:2000 pivot_year_2021_sales:2000
            │ └── LEAF hidden id:6 pivot_year_2020_sales:2200 pivot_year_2021_sales:2200
            └─┬ LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
            · ├── LEAF hidden id:7 pivot_year_2020_sales:800 pivot_year_2021_sales:800
            · └── LEAF hidden id:8 pivot_year_2020_sales:900 pivot_year_2021_sales:900
        `);
    });
});
