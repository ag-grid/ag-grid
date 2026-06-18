import type { GroupRowEditableCallback } from 'ag-grid-community';

import { GridColumns } from '../../../test-utils';
import {
    EDIT_MODES,
    GridRows,
    asyncSetTimeout,
    createGrid,
    createRowData,
    gridsManager,
    performEdit,
    startEditAndSnapshot,
} from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe.each(EDIT_MODES)('default distributeGroupValue when groupRowEditable is set (%s)', (editMode) => {
    test('sum: default distributes uniformly through hierarchy', async () => {
        const api = await createGrid('distribute-default-sum');
        await new GridRows(api, 'before edit').check(`
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
        `);

        const europeNode = api.getRowNode('row-group-region-Europe')!;

        if (editMode === 'ui') {
            const duringEdit = await startEditAndSnapshot(api, europeNode, 'amount', 'during edit');
            await duringEdit.check(`
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
        }

        await performEdit(editMode, api, europeNode, 'amount', 600);

        await new GridRows(api, 'after edit').check(`
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
        `);

        if (editMode === 'ui') {
            api.undoCellEditing();
            await asyncSetTimeout(0);
            await new GridRows(api, 'after undo').check(`
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
            `);
        }

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
    });

    test('editing a leaf group directly distributes to its children', async () => {
        const api = await createGrid('distribute-default-leaf-group');
        await new GridRows(api, 'before edit').check(`
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
        `);

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;

        if (editMode === 'ui') {
            const duringEdit = await startEditAndSnapshot(api, franceNode, 'amount', 'during edit');
            await duringEdit.check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe amount:180
                │ ├─┬ LEAF_GROUP 🖍️ id:row-group-region-Europe-country-France amount:60
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
        }

        await performEdit(editMode, api, franceNode, 'amount', 100);

        await new GridRows(api, 'after edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:220
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:100
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
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

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
    });

    test('consecutive edits on the same group row', async () => {
        const api = await createGrid('distribute-consecutive');
        await new GridRows(api, 'before edit').check(`
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
        `);

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;

        await performEdit(editMode, api, franceNode, 'amount', 100);
        await new GridRows(api, 'after first edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:220
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:100
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
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

        await performEdit(editMode, api, franceNode, 'amount', 40);
        await new GridRows(api, 'after second edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:160
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:40
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:20
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:20
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
    });

    test('editing different groups in sequence', async () => {
        const api = await createGrid('distribute-diff-groups');
        await new GridRows(api, 'before edit').check(`
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
        `);

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;

        await performEdit(editMode, api, franceNode, 'amount', 100);
        await performEdit(editMode, api, usaNode, 'amount', 200);

        await new GridRows(api, 'after both edits').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:220
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:100
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:60
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:60
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:260
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:200
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:100
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:100
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});

describe('implicit distribution is NOT enabled when groupRowEditable is false or disallowed', () => {
    test('groupRowEditable: false does not trigger implicit distribution via setDataValue', async () => {
        const api = await gridsManager.createGridAndWait('no-implicit-false', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable: false,
                    // No explicit groupRowValueSetter — implicit should NOT activate
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', amount: 10 },
                { id: 'a2', region: 'R', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `groupRowEditable: false does not trigger implicit distribution via setDataValue setup`
        ).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
        await new GridRows(api, `groupRowEditable: false does not trigger implicit distribution via setDataValue setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-region-R amount:30
                · ├── LEAF id:a1 region:"R" amount:10
                · └── LEAF id:a2 region:"R" amount:20
            `);

        const groupNode = api.getRowNode('row-group-region-R')!;
        expect(groupNode.group).toBe(true);

        // setDataValue on group row — should NOT distribute since groupRowEditable is false
        groupNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // Children should be unchanged — no implicit distribution
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
        await new GridRows(
            api,
            `groupRowEditable: false does not trigger implicit distribution via setDataValue final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:30
            · ├── LEAF id:a1 region:"R" amount:10
            · └── LEAF id:a2 region:"R" amount:20
        `);
    });

    test('groupRowEditable callback returning false does not trigger implicit distribution', async () => {
        const groupRowEditable: GroupRowEditableCallback = () => false;

        const api = await gridsManager.createGridAndWait('no-implicit-callback-false', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable,
                    // No explicit groupRowValueSetter — callback returns false, implicit should NOT activate
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', amount: 10 },
                { id: 'a2', region: 'R', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(
            api,
            `groupRowEditable callback returning false does not trigger implicit distribution setup`
        ).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
        await new GridRows(
            api,
            `groupRowEditable callback returning false does not trigger implicit distribution setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:30
            · ├── LEAF id:a1 region:"R" amount:10
            · └── LEAF id:a2 region:"R" amount:20
        `);

        const groupNode = api.getRowNode('row-group-region-R')!;
        expect(groupNode.group).toBe(true);

        groupNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // Children should be unchanged — callback returned false
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
        await new GridRows(
            api,
            `groupRowEditable callback returning false does not trigger implicit distribution final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-region-R amount:30
            · ├── LEAF id:a1 region:"R" amount:10
            · └── LEAF id:a2 region:"R" amount:20
        `);
    });

    test('groupRowEditable callback returning true triggers implicit distribution', async () => {
        const groupRowEditable: GroupRowEditableCallback = () => true;

        const api = await gridsManager.createGridAndWait('implicit-callback-true', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable,
                    // No explicit groupRowValueSetter — callback returns true, implicit SHOULD activate
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', amount: 10 },
                { id: 'a2', region: 'R', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `groupRowEditable callback returning true triggers implicit distribution setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `);
        await new GridRows(api, `groupRowEditable callback returning true triggers implicit distribution setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-region-R amount:30
                · ├── LEAF id:a1 region:"R" amount:10
                · └── LEAF id:a2 region:"R" amount:20
            `
        );

        const groupNode = api.getRowNode('row-group-region-R')!;
        expect(groupNode.group).toBe(true);

        groupNode.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        // Implicit uniform distribution: 60 / 2 = 30 each
        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
        await new GridRows(api, `groupRowEditable callback returning true triggers implicit distribution final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-region-R amount:60
                · ├── LEAF id:a1 region:"R" amount:30
                · └── LEAF id:a2 region:"R" amount:30
            `);
    });

    test('groupRowEditable callback is evaluated per row for implicit distribution', async () => {
        // Only allow implicit distribution on the leaf group, not the filler/top group
        const groupRowEditable: GroupRowEditableCallback = (params) => params.node.key === 'France';

        const api = await gridsManager.createGridAndWait('implicit-callback-per-row', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'sum',
                    editable: true,
                    groupRowEditable,
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `groupRowEditable callback is evaluated per row for implicit distribution setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:sum editable
            `);
        await new GridRows(api, `groupRowEditable callback is evaluated per row for implicit distribution setup`).check(
            `
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
            `
        );

        // France group: callback returns true → implicit distribution should work
        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(50);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(50);

        // Germany group: callback returns false → no implicit distribution
        const germanyNode = api.getRowNode('row-group-region-Europe-country-Germany')!;
        germanyNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('de-berlin')?.data?.amount).toBe(30);
        expect(api.getRowNode('de-hamburg')?.data?.amount).toBe(30);
        await new GridRows(api, `groupRowEditable callback is evaluated per row for implicit distribution final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe amount:220
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:100
                │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
                │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
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
    });
});
