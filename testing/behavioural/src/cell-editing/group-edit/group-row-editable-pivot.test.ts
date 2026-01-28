import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, UndoRedoEditModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { EditEventTracker, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { expect } from '../../test-utils/matchers';
import type {
    GroupRowEditableCallback,
    GroupRowValueSetterCallback,
    ValueSetterCallback,
} from './group-edit-test-utils';
import { EDIT_MODES, callsForRowNode, editCell } from './group-edit-test-utils';

describe('groupRowEditable with pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule, UndoRedoEditModule],
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

    const cascadePivotGroupRowValueSetter: GroupRowValueSetterCallback = ({
        node,
        column,
        newValue,
        eventSource,
    }) => {
        const numericValue = Number(newValue);
        if (!Number.isFinite(numericValue)) {
            return;
        }

        // Use the getAggregatedChildren method which handles pivot keys filtering
        const matchingChildren = node.getAggregatedChildren({ colKey: column });

        if (matchingChildren.length === 0) {
            return;
        }

        const perChild = numericValue / matchingChildren.length;

        for (const child of matchingChildren) {
            // setDataValue auto-resolves pivot columns to the underlying value column for leaf rows
            // (when the pivot column has no custom valueSetter)
            child.setDataValue(column, perChild, eventSource);
        }
    };

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
                cascadePivotGroupRowValueSetter(params);
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
            expect(franceNode!.group).toBe(true);

            // Get the pivot column for 2020 sales
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();
            const pivotColId = pivotCol2020!.getColId();

            groupRowEditableCalls.length = 0;
            groupRowValueSetterCalls.length = 0;

            if (editMode === 'ui') {
                await editCell(api, franceNode!, pivotColId, '2000');
            } else {
                franceNode!.setDataValue(pivotColId, 2000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

            const callsForFrance = callsForRowNode(groupRowEditableCalls, franceNode!.id);
            if (editMode === 'ui') {
                expect(callsForFrance.length).toBeGreaterThan(0);
            }

            const valueSetterCallsForFrance = callsForRowNode(groupRowValueSetterCalls, franceNode!.id);
            expect(valueSetterCallsForFrance.length).toBeGreaterThan(0);

            // Verify the cascade distributed the value equally to children
            const afterEdit = new GridRows(api, 'after pivot leaf edit', gridRowsOptions);
            await afterEdit.check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:6300 pivot_year_2021_sales:6100
                ├── LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:2000 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" pivot_year_2020_sales:1500 pivot_year_2021_sales:1800
                ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
                └── LEAF_GROUP collapsed id:row-group-country-Canada ag-Grid-AutoColumn:"Canada" pivot_year_2020_sales:800 pivot_year_2021_sales:900
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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
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
            expect(usaNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            expect(pivotCol2021).toBeDefined();
            const pivotColId = pivotCol2021!.getColId();

            if (editMode === 'ui') {
                await editCell(api, usaNode!, pivotColId, '4000');
            } else {
                usaNode!.setDataValue(pivotColId, 4000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
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
            expect(europeNode).toBeDefined();
            expect(europeNode!.data).toBeUndefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();
            const pivotColId = pivotCol2020!.getColId();

            // Edit the Europe filler group to 5000 for 2020
            if (editMode === 'ui') {
                await editCell(api, europeNode!, pivotColId, '5000');
            } else {
                europeNode!.setDataValue(pivotColId, 5000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
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
            expect(franceNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2021 = pivotColumns?.find((col) => col.getColId().includes('2021_sales'));
            expect(pivotCol2021).toBeDefined();
            const pivotColId = pivotCol2021!.getColId();

            if (editMode === 'ui') {
                await editCell(api, franceNode!, pivotColId, '3000');
            } else {
                franceNode!.setDataValue(pivotColId, 3000, 'ui');
                await asyncSetTimeout(0);
            }
            await asyncSetTimeout(0);

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

            // Verify parent aggregations
            const europeNode = api.getRowNode('row-group-region-Europe');
            expect(europeNode?.aggData).toBeDefined();
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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
                    },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                rowData,
            };

            const api = await gridsManager.createGridAndWait('pivot-multiple-columns-edit', gridOptions);

            // Find the pivot column for 2020-Q1
            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020Q1 = pivotColumns?.find(
                (col) =>
                    col.getColId().includes('2020') && col.getColId().includes('Q1') && col.getColId().includes('sales')
            );
            expect(pivotCol2020Q1).toBeDefined();

            const franceNode = api.getRowNode('row-group-country-France');
            expect(franceNode).toBeDefined();

            const pivotColId = pivotCol2020Q1!.getColId();

            franceNode!.setDataValue(pivotColId, 1000, 'ui');
            await asyncSetTimeout(0);

            // Verify France 2020-Q1 was updated (should cascade to the single leaf)
            expect(api.getRowNode('1')?.data?.sales).toBe(1000);
            // Verify France 2020-Q2 was not affected
            expect(api.getRowNode('2')?.data?.sales).toBe(600);
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
                        groupRowValueSetter: cascadePivotGroupRowValueSetter,
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
            expect(germanyNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();
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
                if (params.data && params.colDef.field) {
                    (params.data as Record<string, any>)[params.colDef.field] = params.newValue;
                }
                return true;
            };

            const groupRowValueSetterCalls: Parameters<GroupRowValueSetterCallback>[] = [];
            const groupRowValueSetter: GroupRowValueSetterCallback = (params) => {
                groupRowValueSetterCalls.push([params]);
                cascadePivotGroupRowValueSetter(params);
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

            // Edit a group row - should use groupRowValueSetter
            const franceNode = api.getRowNode('row-group-country-France');
            expect(franceNode).toBeDefined();

            const pivotColumns = api.getPivotResultColumns();
            const pivotCol2020 = pivotColumns?.find((col) => col.getColId().includes('2020_sales'));
            expect(pivotCol2020).toBeDefined();
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
        });
    });
});
