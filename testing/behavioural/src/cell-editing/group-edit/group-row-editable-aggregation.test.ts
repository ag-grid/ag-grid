import { userEvent } from '@testing-library/user-event';

import type { NumberFilterModel, SetFilterModel } from 'ag-grid-community';

import { GridColumns, GridRows, TestGridsManager } from '../../test-utils';
import {
    EDIT_MODES,
    asyncSetTimeout,
    cascadeGroupRowValueSetter,
    createGroupRowData as createRowData,
    editCell,
    gridsManager,
} from './group-edit-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe.each(EDIT_MODES)('groupRowEditable cascading edits (%s)', (editMode) => {
    const baselineSnapshot = `
        ROOT id:ROOT_NODE_ID
        ├─┬ filler id:row-group-region-Europe amount:180
        │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
        │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
        │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
        │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
        │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
        │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
        │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
        │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
        │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
        └─┬ filler id:row-group-region-Americas amount:160
        · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
        · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
        · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
        · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
        · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
        · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
    `;

    test('group edits cascade through descendants and refresh aggregations', async () => {
        const rowData = createRowData();

        const api = await gridsManager.createGridAndWait('group-row-editable-changed-path', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: cascadeGroupRowValueSetter,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'before edit').check(baselineSnapshot);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode).toBeDefined();
        expect(europeNode!.data).toBeUndefined();

        const amountColId = 'amount';
        const targetValue = 600;

        if (editMode === 'ui') {
            // Start editing and capture mid-edit state before committing
            api.startEditingCell({
                rowIndex: europeNode!.rowIndex!,
                colKey: amountColId,
            });
            await asyncSetTimeout(0);

            await new GridRows(api, 'during edit').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler 🖍️ id:row-group-region-Europe amount:180
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
                │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
                │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
                │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
                │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
                │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
                │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
                │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
                └─┬ filler id:row-group-region-Americas amount:160
                · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
                · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
                · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
                · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
                · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
            `);

            api.stopEditing(true);
            await asyncSetTimeout(0);

            await editCell(api, europeNode!, amountColId, `${targetValue}`);
        } else {
            europeNode!.setDataValue(amountColId, targetValue, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);

        expect(europeNode!.data).toBeUndefined();

        const afterEditSnapshot = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:600
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:200
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:100
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:100
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:200
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:100
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:100
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:200
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:100
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:100
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;
        await new GridRows(api, 'after edit').check(afterEditSnapshot);

        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            await new GridRows(api, 'after undo').check(baselineSnapshot);
            expect(europeNode!.aggData?.amount ?? 0).toBe(180);
        }
    });

    test('editing a single leaf updates its parent aggregations', async () => {
        const rowData = createRowData();

        const api = await gridsManager.createGridAndWait('group-row-editable-leaf-edit', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: cascadeGroupRowValueSetter,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'before leaf edit').check(baselineSnapshot);

        const parisNode = api.getRowNode('fr-paris');
        expect(parisNode).toBeDefined();

        const amountColId = 'amount';
        if (editMode === 'ui') {
            // Start editing and capture mid-edit state before committing
            api.startEditingCell({
                rowIndex: parisNode!.rowIndex!,
                colKey: amountColId,
            });
            await asyncSetTimeout(0);

            await new GridRows(api, 'during leaf edit').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe amount:180
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
                │ │ ├── LEAF 🖍️ id:fr-paris region:"Europe" country:"France" amount:30
                │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
                │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
                │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
                │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
                │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
                │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
                └─┬ filler id:row-group-region-Americas amount:160
                · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
                · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
                · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
                · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
                · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
            `);

            api.stopEditing(true);
            await asyncSetTimeout(0);

            await editCell(api, parisNode!, amountColId, '45');
        } else {
            parisNode!.setDataValue(amountColId, 45, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);

        const snapshotAfterLeafEdit = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:195
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:75
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:45
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;
        await new GridRows(api, 'after leaf edit').check(snapshotAfterLeafEdit);

        await asyncSetTimeout(0);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode?.data).toBeUndefined();
        expect(europeNode?.aggData?.amount ?? 0).toBe(195);

        const franceGroupNode = api.getRowNode('row-group-region-Europe-country-France');
        expect(franceGroupNode?.aggData?.amount ?? 0).toBe(75);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(45);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);
    });

    test('group edits over filtered groups only adjust filtered descendants', async () => {
        const rowData = createRowData();

        const api = await gridsManager.createGridAndWait('group-row-editable-filtered', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            groupAggFiltering: true,
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    filter: 'agNumberColumnFilter',
                    groupRowValueSetter: cascadeGroupRowValueSetter,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const filterModel: Record<string, SetFilterModel | NumberFilterModel> = {
            country: {
                filterType: 'set',
                values: ['France', 'Germany'],
            } as SetFilterModel,
            amount: {
                filterType: 'number',
                type: 'greaterThan',
                filter: 100,
            } as NumberFilterModel,
        };
        api.setFilterModel(filterModel);
        await asyncSetTimeout(0);

        const filteredSnapshotBeforeEdit = `
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-Europe amount:180
            · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:60
            · │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            · │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            · · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            · · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
        `;
        await new GridRows(api, 'after applying filters').check(filteredSnapshotBeforeEdit);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode).toBeDefined();
        expect(europeNode!.data).toBeUndefined();

        const amountColId = 'amount';
        if (editMode === 'ui') {
            await editCell(api, europeNode!, amountColId, '240');
        } else {
            europeNode!.setDataValue(amountColId, 240, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);

        // With groupAggFiltering: true, aggregation uses ALL children (childrenAfterGroup),
        // so the cascade goes to all 3 groups (France, Germany, Italy): 240/3 = 80 each.
        // Each group has 2 leaves: 80/2 = 40 each.
        const filteredSnapshotAfterEdit = `
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-Europe amount:240
            · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:80
            · │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:40
            · │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:40
            · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:80
            · · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:40
            · · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:40
        `;
        // Cascades to all children used for aggregation, including hidden Italy.
        await new GridRows(api, 'after filtered edit').check(filteredSnapshotAfterEdit);
        // Italy was also updated (hidden but still part of aggregation)
        expect(api.getRowNode('it-rome')?.data?.amount).toBe(40);
        expect(api.getRowNode('it-milan')?.data?.amount).toBe(40);

        api.setFilterModel(null);
        await asyncSetTimeout(0);

        const fullSnapshotAfterClearing = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:240
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:80
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:40
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:40
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:80
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:40
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:40
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:80
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:40
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:40
            └─┬ filler id:row-group-region-Americas amount:160
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:100
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `;
        await new GridRows(api, 'after clearing filters').check(fullSnapshotAfterClearing);

        api.setFilterModel(filterModel);
        await asyncSetTimeout(0);
        await new GridRows(api, 'after reapplying filters').check(filteredSnapshotAfterEdit);
    });

    test('groupRowValueSetter returning false cancels the edit', async () => {
        const rowData = createRowData();

        const api = await gridsManager.createGridAndWait('group-row-editable-cancelled', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
            },
            undoRedoCellEditing: true,
            groupDisplayType: 'custom',
            columnDefs: [
                {
                    colId: 'group',
                    headerName: 'Group',
                    cellRenderer: 'agGroupCellRenderer',
                },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: () => false,
                },
            ],
            rowData,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        await new GridRows(api, 'before cancelled edit').check(baselineSnapshot);

        const europeNode = api.getRowNode('row-group-region-Europe');
        expect(europeNode).toBeDefined();

        const amountColId = 'amount';
        if (editMode === 'ui') {
            await editCell(api, europeNode!, amountColId, '999');
        } else {
            europeNode!.setDataValue(amountColId, 999, 'ui');
            await asyncSetTimeout(0);
        }
        await asyncSetTimeout(0);

        await new GridRows(api, 'after cancelled edit').check(baselineSnapshot);
    });
});

describe('AG-16448: valueGetter using getValue() during editing', () => {
    test('Total column using getValue() should not update while typing to start editing', async () => {
        const api = await gridsManager.createGridAndWait('valueGetter-getValue-during-edit', {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum', editable: true },
                { field: 'b', aggFunc: 'sum', editable: true },
                { field: 'c', aggFunc: 'sum', editable: true },
                { field: 'd', aggFunc: 'sum', editable: true },
                {
                    headerName: 'Total',
                    colId: 'total',
                    aggFunc: 'sum',
                    // Use getValue() to read other columns - this is where the bug manifests
                    // getValue() was returning the editing value during editing, causing immediate updates
                    valueGetter: (params) => {
                        if (!params.data) {
                            return null;
                        }
                        const a = params.getValue('a') ?? 0;
                        const b = params.getValue('b') ?? 0;
                        const c = params.getValue('c') ?? 0;
                        const d = params.getValue('d') ?? 0;
                        return a + b + c + d;
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
            },
            autoGroupColumnDef: {
                minWidth: 100,
            },
            rowData: [
                { group: 'A', a: 10, b: 20, c: 30, d: 40 },
                { group: 'A', a: 5, b: 10, c: 15, d: 20 },
            ],
            groupDefaultExpanded: 1,
            suppressAggFuncInHeader: true,
        });
        await new GridColumns(
            api,
            `Total column using getValue() should not update while typing to start editing setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:143 flex:1
            ├── group "Group" width:143 flex:1 rowGroup editable
            ├── a "A" width:143 flex:1 aggFunc:sum editable
            ├── b "B" width:142 flex:1 aggFunc:sum editable
            ├── c "C" width:143 flex:1 aggFunc:sum editable
            ├── d "D" width:143 flex:1 aggFunc:sum editable
            └── total "Total" width:143 flex:1 aggFunc:sum
        `);
        await new GridRows(api, `Total column using getValue() should not update while typing to start editing setup`)
            .check(`
                ROOT id:ROOT_NODE_ID total:null
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:15 b:30 c:45 d:60 total:150
                · ├── LEAF id:0 group:"A" a:10 b:20 c:30 d:40 total:100
                · └── LEAF id:1 group:"A" a:5 b:10 c:15 d:20 total:50
            `);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        // Get the first data row's cells (row-index="1" because row 0 is the group row)
        const rowElement = gridDiv.querySelector<HTMLElement>('[row-index="1"]')!;
        const cellA = rowElement.querySelector<HTMLElement>('[col-id="a"]')!;
        const totalCell = rowElement.querySelector<HTMLElement>('[col-id="total"]')!;

        // Verify initial values: a=10, total=10+20+30+40=100
        expect(cellA).toHaveTextContent('10');
        expect(totalCell).toHaveTextContent('100');

        // Click on cell A to select it
        await userEvent.click(cellA);
        await asyncSetTimeout(1);
        expect(api.getEditingCells()).toHaveLength(0);

        // Type a number to start editing (this replaces cell value with typed character)
        await userEvent.keyboard('5');
        await asyncSetTimeout(1);

        // Editing should have started
        expect(api.getEditingCells()).toHaveLength(1);

        // BUG: While editing, the total should NOT have updated yet
        // Actual (buggy): Total shows 95 (5+20+30+40) - getValue() returns editing value
        // Expected: Total should still show 100 until editing is finished
        expect(totalCell).toHaveTextContent('100');

        // Press Enter to finish editing
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        // Now editing has finished, the value should be updated
        expect(api.getEditingCells()).toHaveLength(0);
        expect(cellA).toHaveTextContent('5');
        // Total should now be updated: 5+20+30+40=95
        expect(totalCell).toHaveTextContent('95');
        await new GridRows(
            api,
            `Total column using getValue() should not update while typing to start editing final state`
        ).check(`
            ROOT id:ROOT_NODE_ID total:null
            └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:30 c:45 d:60 total:145
            · ├── LEAF id:0 group:"A" a:5 b:20 c:30 d:40 total:95
            · └── LEAF id:1 group:"A" a:5 b:10 c:15 d:20 total:50
        `);
    });

    test('Total column should not update while double-click editing, only after commit', async () => {
        const api = await gridsManager.createGridAndWait('valueGetter-dblClick-edit', {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum', editable: true },
                { field: 'b', aggFunc: 'sum', editable: true },
                {
                    headerName: 'Total',
                    colId: 'total',
                    aggFunc: 'sum',
                    valueGetter: (params) => {
                        if (!params.data) {
                            return null;
                        }
                        return (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0);
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
            },
            rowData: [{ group: 'A', a: 10, b: 20 }],
            groupDefaultExpanded: 1,
        });
        await new GridColumns(api, `Total column should not update while double-click editing, only after commit setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200 flex:1
                ├── group "Group" width:200 flex:1 rowGroup editable
                ├── a "A" width:200 flex:1 aggFunc:sum editable
                ├── b "B" width:200 flex:1 aggFunc:sum editable
                └── total "Total" width:200 flex:1 aggFunc:sum
            `);
        await new GridRows(api, `Total column should not update while double-click editing, only after commit setup`)
            .check(`
                ROOT id:ROOT_NODE_ID total:null
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
                · └── LEAF id:0 group:"A" a:10 b:20 total:30
            `);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const rowElement = gridDiv.querySelector<HTMLElement>('[row-index="1"]')!;
        const cellA = rowElement.querySelector<HTMLElement>('[col-id="a"]')!;
        const totalCell = rowElement.querySelector<HTMLElement>('[col-id="total"]')!;

        expect(cellA).toHaveTextContent('10');
        expect(totalCell).toHaveTextContent('30');

        // Double-click to start editing
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        expect(api.getEditingCells()).toHaveLength(1);

        // Type new value
        const input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '25');
        await asyncSetTimeout(1);

        // Force refresh to see if total updates during edit
        api.refreshCells({ columns: ['total'], force: true });
        await asyncSetTimeout(1);

        // Total should still show original value
        expect(totalCell).toHaveTextContent('30');

        // Commit the edit
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        // Now total should be updated: 25+20=45
        expect(cellA).toHaveTextContent('25');
        expect(totalCell).toHaveTextContent('45');
        await new GridRows(
            api,
            `Total column should not update while double-click editing, only after commit final state`
        ).check(`
            ROOT id:ROOT_NODE_ID total:null
            └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:25 b:20 total:45
            · └── LEAF id:0 group:"A" a:25 b:20 total:45
        `);
    });

    test('Total column should not update during edit and should revert when cancelled', async () => {
        const api = await gridsManager.createGridAndWait('valueGetter-cancel-edit', {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum', editable: true },
                { field: 'b', aggFunc: 'sum', editable: true },
                {
                    headerName: 'Total',
                    colId: 'total',
                    aggFunc: 'sum',
                    valueGetter: (params) => {
                        if (!params.data) {
                            return null;
                        }
                        return (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0);
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
            },
            rowData: [{ group: 'A', a: 10, b: 20 }],
            groupDefaultExpanded: 1,
        });
        await new GridColumns(api, `Total column should not update during edit and should revert when cancelled setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200 flex:1
                ├── group "Group" width:200 flex:1 rowGroup editable
                ├── a "A" width:200 flex:1 aggFunc:sum editable
                ├── b "B" width:200 flex:1 aggFunc:sum editable
                └── total "Total" width:200 flex:1 aggFunc:sum
            `);
        await new GridRows(api, `Total column should not update during edit and should revert when cancelled setup`)
            .check(`
                ROOT id:ROOT_NODE_ID total:null
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
                · └── LEAF id:0 group:"A" a:10 b:20 total:30
            `);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const rowElement = gridDiv.querySelector<HTMLElement>('[row-index="1"]')!;
        const cellA = rowElement.querySelector<HTMLElement>('[col-id="a"]')!;
        const totalCell = rowElement.querySelector<HTMLElement>('[col-id="total"]')!;

        expect(cellA).toHaveTextContent('10');
        expect(totalCell).toHaveTextContent('30');

        // Double-click to start editing
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        expect(api.getEditingCells()).toHaveLength(1);

        // Type new value
        const input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '999');
        await asyncSetTimeout(1);

        // Total should still show original value during edit
        expect(totalCell).toHaveTextContent('30');

        // Cancel the edit with Escape
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        // Total should remain unchanged
        expect(cellA).toHaveTextContent('10');
        expect(totalCell).toHaveTextContent('30');
        await new GridRows(
            api,
            `Total column should not update during edit and should revert when cancelled final state`
        ).check(`
            ROOT id:ROOT_NODE_ID total:null
            └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            · └── LEAF id:0 group:"A" a:10 b:20 total:30
        `);
    });

    test('Re-editing and committing different values updates Total correctly', async () => {
        const api = await gridsManager.createGridAndWait('valueGetter-re-edit', {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum', editable: true },
                { field: 'b', aggFunc: 'sum', editable: true },
                {
                    headerName: 'Total',
                    colId: 'total',
                    aggFunc: 'sum',
                    valueGetter: (params) => {
                        if (!params.data) {
                            return null;
                        }
                        return (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0);
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
            },
            rowData: [{ group: 'A', a: 10, b: 20 }],
            groupDefaultExpanded: 1,
        });
        await new GridColumns(api, `Re-editing and committing different values updates Total correctly setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200 flex:1
                ├── group "Group" width:200 flex:1 rowGroup editable
                ├── a "A" width:200 flex:1 aggFunc:sum editable
                ├── b "B" width:200 flex:1 aggFunc:sum editable
                └── total "Total" width:200 flex:1 aggFunc:sum
            `);
        await new GridRows(api, `Re-editing and committing different values updates Total correctly setup`).check(`
            ROOT id:ROOT_NODE_ID total:null
            └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            · └── LEAF id:0 group:"A" a:10 b:20 total:30
        `);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const rowElement = gridDiv.querySelector<HTMLElement>('[row-index="1"]')!;
        const cellA = rowElement.querySelector<HTMLElement>('[col-id="a"]')!;
        const totalCell = rowElement.querySelector<HTMLElement>('[col-id="total"]')!;

        expect(totalCell).toHaveTextContent('30'); // Initial: 10+20

        // First edit: 10 -> 50
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        let input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '50{Enter}');
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('50');
        expect(totalCell).toHaveTextContent('70'); // 50+20

        // Second edit: 50 -> 100
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '100{Enter}');
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('100');
        expect(totalCell).toHaveTextContent('120'); // 100+20

        // Third edit and cancel: 100 -> 200 (cancelled)
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '200');
        await asyncSetTimeout(1);

        // Total should still show 120 during edit
        expect(totalCell).toHaveTextContent('120');

        // Cancel edit
        await userEvent.keyboard('{Escape}');
        await asyncSetTimeout(1);

        // Values should remain at last committed state
        expect(cellA).toHaveTextContent('100');
        expect(totalCell).toHaveTextContent('120');

        // Fourth edit and commit: 100 -> 5
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '5{Enter}');
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('5');
        expect(totalCell).toHaveTextContent('25');
        await new GridRows(api, `Re-editing and committing different values updates Total correctly final state`).check(
            `
                ROOT id:ROOT_NODE_ID total:null
                └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:5 b:20 total:25
                · └── LEAF id:0 group:"A" a:5 b:20 total:25
            `
        ); // 5+20
    });

    test('Editing multiple cells in sequence updates Total correctly', async () => {
        const api = await gridsManager.createGridAndWait('valueGetter-multi-cell-edit', {
            columnDefs: [
                { field: 'group', rowGroup: true, editable: true },
                { field: 'a', aggFunc: 'sum', editable: true },
                { field: 'b', aggFunc: 'sum', editable: true },
                {
                    headerName: 'Total',
                    colId: 'total',
                    aggFunc: 'sum',
                    valueGetter: (params) => {
                        if (!params.data) {
                            return null;
                        }
                        return (params.getValue('a') ?? 0) + (params.getValue('b') ?? 0);
                    },
                },
            ],
            defaultColDef: {
                flex: 1,
            },
            rowData: [{ group: 'A', a: 10, b: 20 }],
            groupDefaultExpanded: 1,
        });
        await new GridColumns(api, `Editing multiple cells in sequence updates Total correctly setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200 flex:1
            ├── group "Group" width:200 flex:1 rowGroup editable
            ├── a "A" width:200 flex:1 aggFunc:sum editable
            ├── b "B" width:200 flex:1 aggFunc:sum editable
            └── total "Total" width:200 flex:1 aggFunc:sum
        `);
        await new GridRows(api, `Editing multiple cells in sequence updates Total correctly setup`).check(`
            ROOT id:ROOT_NODE_ID total:null
            └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:10 b:20 total:30
            · └── LEAF id:0 group:"A" a:10 b:20 total:30
        `);

        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        await asyncSetTimeout(1);

        const rowElement = gridDiv.querySelector<HTMLElement>('[row-index="1"]')!;
        const cellA = rowElement.querySelector<HTMLElement>('[col-id="a"]')!;
        const cellB = rowElement.querySelector<HTMLElement>('[col-id="b"]')!;
        const totalCell = rowElement.querySelector<HTMLElement>('[col-id="total"]')!;

        expect(totalCell).toHaveTextContent('30'); // Initial: 10+20

        // Edit cell A: 10 -> 15
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        let input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '15{Enter}');
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('15');
        expect(totalCell).toHaveTextContent('35'); // 15+20

        // Edit cell B: 20 -> 25
        await userEvent.dblClick(cellB);
        await asyncSetTimeout(1);
        input = cellB.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '25{Enter}');
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('25');
        expect(totalCell).toHaveTextContent('40'); // 15+25

        // Edit both cells (A first, then B) without finishing A
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        input = cellA.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '999');
        await asyncSetTimeout(1);

        // During edit of A, total should still show last committed
        expect(totalCell).toHaveTextContent('40');

        // Click on B to move there (should auto-commit A's edit)
        await userEvent.dblClick(cellB);
        await asyncSetTimeout(1);

        // A's edit should be committed now
        expect(cellA).toHaveTextContent('999');
        expect(totalCell).toHaveTextContent('1024'); // 999+25

        // Type in B
        input = cellB.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(input);
        await userEvent.type(input, '1{Enter}');
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('1');
        expect(totalCell).toHaveTextContent('1000');
        await new GridRows(api, `Editing multiple cells in sequence updates Total correctly final state`).check(`
            ROOT id:ROOT_NODE_ID total:null
            └─┬ LEAF_GROUP id:row-group-group-A ag-Grid-AutoColumn:"A" a:999 b:1 total:1000
            · └── LEAF id:0 group:"A" a:999 b:1 total:1000
        `); // 999+1
    });
});
