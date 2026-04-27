import { GridColumns } from '../../../test-utils';
import {
    EDIT_MODES,
    GridRows,
    asyncSetTimeout,
    createGrid,
    distributeGroupValue,
    gridsManager,
    performEdit,
    startEditAndSnapshot,
} from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe.each(EDIT_MODES)('distributeGroupValue with explicit modes (%s)', (editMode) => {
    test('percentage mode distributes proportionally', async () => {
        const api = await createGrid('distribute-percentage', {
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
        });
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

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;

        if (editMode === 'ui') {
            const duringEdit = await startEditAndSnapshot(api, usaNode, 'amount', 'during percentage edit');
            await duringEdit.check(`
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
                · ├─┬ LEAF_GROUP 🖍️ id:row-group-region-Americas-country-USA amount:100
                · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
                · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
                · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
                · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
            `);
            api.stopEditing(true);
            await asyncSetTimeout(0);
        }

        // USA has [70, 30] = 100, we set to 200 → proportional: [140, 60]
        await performEdit(editMode, api, usaNode, 'amount', 200);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(140);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(60);
        expect(usaNode.aggData?.amount).toBe(200);

        await new GridRows(api, 'after percentage edit').check(`
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
            └─┬ filler id:row-group-region-Americas amount:260
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:200
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:140
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:60
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

    test('percentage mode: all children zero falls back to uniform', async () => {
        const api = await gridsManager.createGridAndWait('distribute-pct-zero', {
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
                    groupRowEditable: true,
                    groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 0 },
                { id: 'a2', region: 'R', country: 'C', amount: 0 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        await performEdit(editMode, api, groupNode, 'amount', 100);

        expect(api.getRowNode('a1')?.data?.amount).toBe(50);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50);
        expect(groupNode.aggData?.amount).toBe(100);

        await new GridRows(api, 'after pct-zero edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:100
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:100
            · · ├── LEAF id:a1 region:"R" country:"C" amount:50
            · · └── LEAF id:a2 region:"R" country:"C" amount:50
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
    });

    test('increment mode adds delta equally', async () => {
        const api = await createGrid('distribute-increment', {
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
        });
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

        // USA has [70, 30] = 100, we set to 120 → delta 20, 20/2 = 10 each → [80, 40]
        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        await performEdit(editMode, api, usaNode, 'amount', 120);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(80);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(40);
        expect(usaNode.aggData?.amount).toBe(120);

        await new GridRows(api, 'after increment edit').check(`
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
            └─┬ filler id:row-group-region-Americas amount:180
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:120
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:80
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:40
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('increment mode with avg aggFunc adds delta to each child', async () => {
        const api = await createGrid('distribute-increment-avg', {
            aggFunc: 'avg',
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
        });

        // France avg = 30, children [30, 30], set to 40 → delta +10 each → [40, 40]
        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 40);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(40);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(40);
        expect(franceNode.aggData?.amount).toMatchObject({ value: 40 });

        await new GridRows(api, 'after increment-avg edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:{"count":6,"value":33.333333333333336}
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:{"count":2,"value":40}
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:40
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:40
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:{"count":2,"value":30}
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:{"count":2,"value":30}
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:{"count":4,"value":40}
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:{"count":2,"value":50}
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:{"count":2,"value":30}
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('overwrite mode sets all children to the same value', async () => {
        const api = await createGrid('distribute-overwrite', {
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'overwrite' }),
        });
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

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        await performEdit(editMode, api, usaNode, 'amount', 50);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(50);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(50);
        expect(usaNode.aggData?.amount).toBe(100); // sum of 50+50

        await new GridRows(api, 'after overwrite edit').check(`
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
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:50
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:50
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:60
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('percentage mode with avg aggFunc', async () => {
        const api = await createGrid('distribute-pct-avg', {
            aggFunc: 'avg',
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
        });

        // USA avg = 50, children [70, 30] = 100 total, set avg to 100
        // target total = 100 * 2 = 200, scale = 200/100 = 2 → [140, 60]
        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        await performEdit(editMode, api, usaNode, 'amount', 100);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(140);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(60);
        expect(usaNode.aggData?.amount).toMatchObject({ value: 100 });

        await new GridRows(api, 'after pct-avg edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:{"count":6,"value":30}
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:{"count":2,"value":30}
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:{"count":2,"value":30}
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:{"count":2,"value":30}
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:{"count":4,"value":65}
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:{"count":2,"value":100}
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:140
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:60
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:{"count":2,"value":30}
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});
