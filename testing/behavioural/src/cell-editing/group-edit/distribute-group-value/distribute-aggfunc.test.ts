import { GridColumns } from '../../../test-utils';
import {
    EDIT_MODES,
    GridRows,
    asyncSetTimeout,
    createGrid,
    createSimpleGrid,
    distributeGroupValue,
    gridsManager,
    performEdit,
} from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe.each(EDIT_MODES)('distributeGroupValue aggFunc strategies (%s)', (editMode) => {
    test('avg: uniform sets all children to target average', async () => {
        const api = await createGrid('distribute-avg', { aggFunc: 'avg', groupRowValueSetter: distributeGroupValue });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 50);

        // avg: all children set to target average 50
        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(50);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(50);
        expect(franceNode.aggData?.amount).toMatchObject({ value: 50 });

        await new GridRows(api, 'after avg edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:{"count":6,"value":36.666666666666664}
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:{"count":2,"value":50}
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
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

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:avg editable
        `);
    });

    test('min: suppressed by default — no children are modified', async () => {
        const api = await createGrid('distribute-min', { aggFunc: 'min', groupRowValueSetter: distributeGroupValue });

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        // min is disabled by default — edit has no effect
        await performEdit(editMode, api, usaNode, 'amount', 10);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(70);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(30);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:min editable
        `);
    });

    test('max: suppressed by default — no children are modified', async () => {
        const api = await createGrid('distribute-max', { aggFunc: 'max', groupRowValueSetter: distributeGroupValue });

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        // max is disabled by default — edit has no effect
        await performEdit(editMode, api, usaNode, 'amount', 99);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(70);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(30);
    });

    test('first: suppressed by default — no children are modified', async () => {
        const api = await createGrid('distribute-first', {
            aggFunc: 'first',
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 999);

        // first is disabled by default — children unchanged
        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(30);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);
    });

    test('last: suppressed by default — no children are modified', async () => {
        const api = await createGrid('distribute-last', {
            aggFunc: 'last',
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 999);

        // last is disabled by default — children unchanged
        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(30);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);
    });

    test('first with explicit per-aggFunc overwrite: writes to all children', async () => {
        const api = await createGrid('distribute-first-overwrite', {
            aggFunc: 'first',
            groupRowValueSetter: { distribution: { first: 'overwrite' } },
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 999);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(999);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(999);
    });

    test('last with explicit per-aggFunc true: writes to all children', async () => {
        const api = await createGrid('distribute-last-true', {
            aggFunc: 'last',
            groupRowValueSetter: { distribution: { last: true } },
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 999);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(999);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(999);
    });

    test('count: suppressed by default — no children are modified', async () => {
        const api = await createGrid('distribute-count', {
            aggFunc: 'count',
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 77);

        // count is disabled by default — children unchanged
        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(30);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);
    });

    test('min with explicit per-aggFunc overwrite: writes to all children', async () => {
        const api = await createGrid('distribute-min-overwrite', {
            aggFunc: 'min',
            groupRowValueSetter: { distribution: { min: 'overwrite' } },
        });

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        await performEdit(editMode, api, usaNode, 'amount', 10);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(10);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(10);
    });

    test('max with explicit per-aggFunc overwrite: writes to all children', async () => {
        const api = await createGrid('distribute-max-overwrite', {
            aggFunc: 'max',
            groupRowValueSetter: { distribution: { max: 'overwrite' } },
        });

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        await performEdit(editMode, api, usaNode, 'amount', 100);

        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(100);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(100);
    });

    test('function aggFunc: disabled by default — no children are modified', async () => {
        const api = await createGrid('distribute-custom-agg', {
            aggFunc: (params) => {
                let total = 0;
                params.values.forEach((v: any) => {
                    total += typeof v === 'number' ? v : 0;
                });
                return total * 2;
            },
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 50);

        // Function aggFuncs are disabled by default — children unchanged
        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(30);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);

        await new GridRows(api, 'after custom agg edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:720
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:120
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:120
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:120
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:640
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:200
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:120
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});

describe('non-distributable aggFunc with invalid top-level strategy', () => {
    test('max with top-level uniform: cell not editable and distribution suppressed', async () => {
        const api = await createGrid('distribute-max-uniform', {
            aggFunc: 'max',
            groupRowValueSetter: { distribution: 'uniform' },
        });
        await new GridColumns(api, `max with top-level uniform: cell not editable and distribution suppressed setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:max editable
            `);
        await new GridRows(api, `max with top-level uniform: cell not editable and distribution suppressed setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe amount:30
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:30
                │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
                │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:30
                │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
                │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
                │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:30
                │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
                │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
                └─┬ filler id:row-group-region-Americas amount:70
                · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:70
                · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
                · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:35
                · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
                · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
            `);

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        // Use setDataValue directly — the cell isn't editable in UI because isGroupCellEditable returns false
        usaNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // max is non-distributable — top-level 'uniform' doesn't enable it
        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(70);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(30);
        await new GridRows(api, `max with top-level uniform: cell not editable and distribution suppressed final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe amount:30
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:30
                │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
                │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:30
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:30
                │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
                │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
                │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:30
                │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
                │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
                └─┬ filler id:row-group-region-Americas amount:70
                · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:70
                · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
                · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:35
                · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
                · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
            `);
    });
});

describe('overriding built-in aggFunc with a custom function', () => {
    // Custom aggFunc registered under 'sum' that doubles the total
    const customSum = (params: any) => {
        let total = 0;
        for (const v of params.values) {
            total += typeof v === 'number' ? v : 0;
        }
        return total * 2;
    };

    const customSumRowData = () => [
        { id: 'a1', region: 'R', country: 'C', amount: 10 },
        { id: 'a2', region: 'R', country: 'C', amount: 20 },
        { id: 'a3', region: 'R', country: 'C', amount: 30 },
    ];

    test('overriding sum with a custom function still uses uniform strategy (matched by name)', async () => {
        // The distributor resolves the strategy by string name, so it still picks 'uniform'.
        const api = await createSimpleGrid(
            'override-sum',
            customSumRowData(),
            {
                aggFunc: 'sum',
                groupRowValueSetter: { precision: 0 },
            },
            undefined,
            { aggFuncs: { sum: customSum } }
        );

        // Custom sum aggregation: leaf group = (10+20+30)*2 = 120, filler = 120*2 = 240
        await new GridRows(api, 'before edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:240
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:120
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · ├── LEAF id:a2 region:"R" country:"C" amount:20
            · · └── LEAF id:a3 region:"R" country:"C" amount:30
        `);

        // Edit the group to 90 — distributor sees aggFunc='sum', uses uniform: 90/3 = 30 each
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 90, 'ui');
        await asyncSetTimeout(0);

        // After re-aggregation with customSum: leaf group = (30+30+30)*2 = 180, filler = 180*2 = 360
        await new GridRows(api, 'after uniform edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:360
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:180
            · · ├── LEAF id:a1 region:"R" country:"C" amount:30
            · · ├── LEAF id:a2 region:"R" country:"C" amount:30
            · · └── LEAF id:a3 region:"R" country:"C" amount:30
        `);
    });

    test('overriding sum with custom function + explicit distribution strategy', async () => {
        const api = await createSimpleGrid(
            'override-sum-percentage',
            customSumRowData(),
            {
                aggFunc: 'sum',
                groupRowValueSetter: {
                    distribution: { sum: 'percentage' },
                    precision: 0,
                },
            },
            undefined,
            { aggFuncs: { sum: customSum } }
        );

        // Edit to 120 — percentage preserves 10:20:30 ratio → 20:40:60
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 120, 'ui');
        await asyncSetTimeout(0);

        // After re-aggregation with customSum: leaf group = (20+40+60)*2 = 240, filler = 240*2 = 480
        await new GridRows(api, 'after percentage edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:480
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:240
            · · ├── LEAF id:a1 region:"R" country:"C" amount:20
            · · ├── LEAF id:a2 region:"R" country:"C" amount:40
            · · └── LEAF id:a3 region:"R" country:"C" amount:60
        `);
    });

    test('custom function in distribution record is called for matching aggFunc', async () => {
        // Custom inverse: divides newValue by 2 (undoing the *2 aggFunc) then distributes uniformly.
        // This ensures the aggregate matches the edited value, unlike the default uniform strategy.
        let inverseFnCalled = false;
        const myCustomInverseSumFn = (params: any) => {
            inverseFnCalled = true;
            const target = Number(params.newValue) / 2;
            const children = params.aggregatedChildren;
            const share = Math.round(target / children.length);
            let changed = false;
            for (const child of children) {
                if (child.setDataValue(params.column, share, 'data')) {
                    changed = true;
                }
            }
            return changed;
        };

        const api = await createSimpleGrid(
            'override-sum-custom-fn',
            customSumRowData(),
            {
                aggFunc: 'sum',
                groupRowValueSetter: {
                    distribution: { sum: myCustomInverseSumFn },
                },
            },
            undefined,
            { aggFuncs: { sum: customSum } }
        );

        // Edit to 180 — custom fn divides by 2 first: 180/2/3 = 30 each
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 180, 'ui');
        await asyncSetTimeout(0);

        expect(inverseFnCalled).toBe(true);

        // After re-aggregation with customSum: leaf group = (30+30+30)*2 = 180, filler = 180*2 = 360
        await new GridRows(api, 'after custom fn edit').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:360
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:180
            · · ├── LEAF id:a1 region:"R" country:"C" amount:30
            · · ├── LEAF id:a2 region:"R" country:"C" amount:30
            · · └── LEAF id:a3 region:"R" country:"C" amount:30
        `);
    });
});

describe('avg percentage distribution on non-leaf groups', () => {
    // Norway has 2 sub-groups: 2010 (2 leaves: 23, 19) and 2002 (1 leaf: 19)
    // avg = (23+19+19)/3 = 20.333..., sum = 61
    const norwayRowData = () => [
        { id: 'n1', country: 'Norway', year: '2010', total: 23 },
        { id: 'n2', country: 'Norway', year: '2010', total: 19 },
        { id: 'n3', country: 'Norway', year: '2002', total: 19 },
    ];

    test('editing avg on non-leaf group with percentage distribution produces correct avg', async () => {
        const api = await gridsManager.createGridAndWait('avg-pct-nested', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                {
                    colId: 'total',
                    field: 'total',
                    aggFunc: 'avg',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: 'percentage', precision: 0 },
                },
            ],
            rowData: norwayRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(
            api,
            `editing avg on non-leaf group with percentage distribution produces correct avg setup`
        ).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── total "Total" width:200 aggFunc:avg editable
        `);
        await new GridRows(api, `editing avg on non-leaf group with percentage distribution produces correct avg setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-country-Norway total:{"count":3,"value":20.333333333333332}
                · ├─┬ LEAF_GROUP id:row-group-country-Norway-year-2010 total:{"count":2,"value":21}
                · │ ├── LEAF id:n1 country:"Norway" year:"2010" total:23
                · │ └── LEAF id:n2 country:"Norway" year:"2010" total:19
                · └─┬ LEAF_GROUP id:row-group-country-Norway-year-2002 total:{"count":1,"value":19}
                · · └── LEAF id:n3 country:"Norway" year:"2002" total:19
            `);

        const norwayNode = api.getRowNode('row-group-country-Norway')!;
        expect(norwayNode.aggData?.total).toMatchObject({ value: expect.closeTo(20.333, 2), count: 3 });

        // Edit Norway avg to 20
        norwayNode.setDataValue('total', 20, 'ui');
        await asyncSetTimeout(0);

        // Desired sum = 20 * 3 = 60. Old sums: 2010=42, 2002=19, total=61.
        // Percentage distributes sum proportionally: 2010 gets round(42/61*60)=41, 2002 gets round(19/61*60)=19.
        // 2010 avg = 41/2 = 20.5, cascades to leaves: [round(23/42*41)=22, round(19/42*41)=19]
        // 2002 avg = 19, leaf unchanged.
        // Final: [22, 19, 19], sum=60, avg=20
        expect(api.getRowNode('n1')?.data?.total).toBe(22);
        expect(api.getRowNode('n2')?.data?.total).toBe(19);
        expect(api.getRowNode('n3')?.data?.total).toBe(19);
        expect(norwayNode.aggData?.total).toMatchObject({ value: 20, count: 3 });
        await new GridRows(
            api,
            `editing avg on non-leaf group with percentage distribution produces correct avg final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Norway total:{"count":3,"value":20}
            · ├─┬ LEAF_GROUP id:row-group-country-Norway-year-2010 total:{"count":2,"value":20.5}
            · │ ├── LEAF id:n1 country:"Norway" year:"2010" total:22
            · │ └── LEAF id:n2 country:"Norway" year:"2010" total:19
            · └─┬ LEAF_GROUP id:row-group-country-Norway-year-2002 total:{"count":1,"value":19}
            · · └── LEAF id:n3 country:"Norway" year:"2002" total:19
        `);
    });

    test('editing avg on 3-level group hierarchy distributes correctly through all levels', async () => {
        // Region > Country > Year, 3-level hierarchy
        // Europe: France > 2010: [10, 20], France > 2011: [30], Germany > 2010: [40, 50]
        // France avg = 60/3 = 20, Germany avg = 90/2 = 45, Europe avg = 150/5 = 30
        const api = await gridsManager.createGridAndWait('avg-pct-3-level', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'avg',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: 'percentage', precision: 0 },
                },
            ],
            rowData: [
                { id: 'f1', region: 'Europe', country: 'France', year: '2010', amount: 10 },
                { id: 'f2', region: 'Europe', country: 'France', year: '2010', amount: 20 },
                { id: 'f3', region: 'Europe', country: 'France', year: '2011', amount: 30 },
                { id: 'g1', region: 'Europe', country: 'Germany', year: '2010', amount: 40 },
                { id: 'g2', region: 'Europe', country: 'Germany', year: '2010', amount: 50 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(
            api,
            `editing avg on 3-level group hierarchy distributes correctly through all levels setup`
        ).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:avg editable
        `);
        await new GridRows(api, `editing avg on 3-level group hierarchy distributes correctly through all levels setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-Europe amount:{"count":5,"value":30}
                · ├─┬ filler id:row-group-region-Europe-country-France amount:{"count":3,"value":20}
                · │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2010 amount:{"count":2,"value":15}
                · │ │ ├── LEAF id:f1 region:"Europe" country:"France" year:"2010" amount:10
                · │ │ └── LEAF id:f2 region:"Europe" country:"France" year:"2010" amount:20
                · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2011 amount:{"count":1,"value":30}
                · │ · └── LEAF id:f3 region:"Europe" country:"France" year:"2011" amount:30
                · └─┬ filler id:row-group-region-Europe-country-Germany amount:{"count":2,"value":45}
                · · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany-year-2010 amount:{"count":2,"value":45}
                · · · ├── LEAF id:g1 region:"Europe" country:"Germany" year:"2010" amount:40
                · · · └── LEAF id:g2 region:"Europe" country:"Germany" year:"2010" amount:50
            `);

        const europeNode = api.getRowNode('row-group-region-Europe')!;
        expect(europeNode.aggData?.amount).toMatchObject({ value: 30, count: 5 });

        // Edit Europe avg from 30 to 20 (desired sum = 100, old sum = 150)
        europeNode.setDataValue('amount', 20, 'ui');
        await asyncSetTimeout(0);

        // Level 1: France sum 60→40, Germany sum 90→60 (proportional by sum contributions)
        // Level 2: France>2010 sum 30→20 (avg=10), France>2011 sum 30→20 (avg=20)
        //          Germany>2010 sum 90→60 (avg=30)
        // Level 3: France>2010 leaves [10,20]→[7,13], France>2011 [30]→[20]
        //          Germany>2010 leaves [40,50]→[27,33]
        // Final: [7, 13, 20, 27, 33], sum=100, avg=20
        expect(api.getRowNode('f1')?.data?.amount).toBe(7);
        expect(api.getRowNode('f2')?.data?.amount).toBe(13);
        expect(api.getRowNode('f3')?.data?.amount).toBe(20);
        expect(api.getRowNode('g1')?.data?.amount).toBe(27);
        expect(api.getRowNode('g2')?.data?.amount).toBe(33);
        expect(europeNode.aggData?.amount).toMatchObject({ value: 20, count: 5 });
        await new GridRows(
            api,
            `editing avg on 3-level group hierarchy distributes correctly through all levels final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-Europe amount:{"count":5,"value":20}
            · ├─┬ filler id:row-group-region-Europe-country-France amount:{"count":3,"value":13.333333333333334}
            · │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2010 amount:{"count":2,"value":10}
            · │ │ ├── LEAF id:f1 region:"Europe" country:"France" year:"2010" amount:7
            · │ │ └── LEAF id:f2 region:"Europe" country:"France" year:"2010" amount:13
            · │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France-year-2011 amount:{"count":1,"value":20}
            · │ · └── LEAF id:f3 region:"Europe" country:"France" year:"2011" amount:20
            · └─┬ filler id:row-group-region-Europe-country-Germany amount:{"count":2,"value":30}
            · · └─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany-year-2010 amount:{"count":2,"value":30}
            · · · ├── LEAF id:g1 region:"Europe" country:"Germany" year:"2010" amount:27
            · · · └── LEAF id:g2 region:"Europe" country:"Germany" year:"2010" amount:33
        `);
    });
});
