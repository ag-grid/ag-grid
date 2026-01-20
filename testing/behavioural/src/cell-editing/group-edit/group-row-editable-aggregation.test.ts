import type { NumberFilterModel, SetFilterModel } from 'ag-grid-community';

import { GridRows } from '../../test-utils';
import { expect } from '../../test-utils/matchers';
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

        const filteredSnapshotAfterEdit = `
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-Europe amount:300
            · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:120
            · │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:60
            · │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:60
            · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:120
            · · ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:60
            · · └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:60
        `;
        // Aggregated value still reflects hidden Italy nodes even though the filter hides them.
        await new GridRows(api, 'after filtered edit').check(filteredSnapshotAfterEdit);
        expect(api.getRowNode('it-rome')?.data?.amount).toBe(30);
        expect(api.getRowNode('it-milan')?.data?.amount).toBe(30);

        api.setFilterModel(null);
        await asyncSetTimeout(0);

        const fullSnapshotAfterClearing = `
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:300
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:120
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:60
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:60
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:120
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:60
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:60
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
