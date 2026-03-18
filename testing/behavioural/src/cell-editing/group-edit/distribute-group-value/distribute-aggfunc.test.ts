import {
    EDIT_MODES,
    GridRows,
    createGrid,
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
    });

    test('min: writes to the child holding the minimum value', async () => {
        const api = await createGrid('distribute-min', { aggFunc: 'min', groupRowValueSetter: distributeGroupValue });

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        // USA children: us-nyc=70, us-la=30. Min holder is us-la (30).
        await performEdit(editMode, api, usaNode, 'amount', 10);

        // Only the min holder (us-la) is updated; us-nyc stays at 70
        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(70);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(10);
        expect(usaNode.aggData?.amount).toBe(10);

        await new GridRows(api, 'after min edit').check(`
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
            └─┬ filler id:row-group-region-Americas amount:10
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:10
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:10
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:25
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('max: writes to the child holding the maximum value', async () => {
        const api = await createGrid('distribute-max', { aggFunc: 'max', groupRowValueSetter: distributeGroupValue });

        const usaNode = api.getRowNode('row-group-region-Americas-country-USA')!;
        // USA children: us-nyc=70, us-la=30. Max holder is us-nyc (70).
        await performEdit(editMode, api, usaNode, 'amount', 99);

        // Only the max holder (us-nyc) is updated; us-la stays at 30
        expect(api.getRowNode('us-nyc')?.data?.amount).toBe(99);
        expect(api.getRowNode('us-la')?.data?.amount).toBe(30);
        expect(usaNode.aggData?.amount).toBe(99);

        await new GridRows(api, 'after max edit').check(`
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
            └─┬ filler id:row-group-region-Americas amount:99
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:99
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:99
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:35
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('first: only sets the first child', async () => {
        const api = await createGrid('distribute-first', {
            aggFunc: 'first',
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 999);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(999);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(30);

        await new GridRows(api, 'after first edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:999
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:999
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:999
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

    test('last: only sets the last child', async () => {
        const api = await createGrid('distribute-last', {
            aggFunc: 'last',
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 999);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(30);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(999);

        await new GridRows(api, 'after last edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:30
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:999
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:30
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:999
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:30
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:30
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:25
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:30
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:25
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('count: overwrites all children (uses overwrite mode)', async () => {
        const api = await createGrid('distribute-count', {
            aggFunc: 'count',
            groupRowValueSetter: distributeGroupValue,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        await performEdit(editMode, api, franceNode, 'amount', 77);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(77);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(77);

        await new GridRows(api, 'after count edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:{"value":6}
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:{"value":2}
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:77
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:77
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany amount:{"value":2}
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy amount:{"value":2}
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas amount:{"value":4}
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA amount:{"value":2}
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada amount:{"value":2}
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });

    test('custom aggFunc: defaults to overwrite', async () => {
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

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(50);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(50);

        await new GridRows(api, 'after custom agg edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe amount:880
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France amount:200
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:50
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:50
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
