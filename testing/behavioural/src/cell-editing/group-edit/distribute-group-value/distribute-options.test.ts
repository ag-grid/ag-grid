import { GridRows, asyncSetTimeout, createRowData, distributeGroupValue, gridsManager } from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe('distributeGroupValue integer distribution via closure', () => {
    test('sum: integer distribution spreads remainder to first N children', async () => {
        const api = await gridsManager.createGridAndWait('distribute-integer-remainder', {
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
                    groupRowValueSetter: (params) => distributeGroupValue(params, { precision: 0 }),
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 10, 'ui'); // 10 / 3 = 3 remainder 1
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4); // gets +1 from remainder
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
        expect(groupNode.aggData?.amount).toBe(10);

        await new GridRows(api, 'after integer distribution').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:10
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:10
            · · ├── LEAF id:a1 region:"R" country:"C" amount:4
            · · ├── LEAF id:a2 region:"R" country:"C" amount:3
            · · └── LEAF id:a3 region:"R" country:"C" amount:3
        `);
    });

    test('percentage mode with integer distribution rounds and spreads remainder', async () => {
        const api = await gridsManager.createGridAndWait('distribute-pct-integer', {
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
                    groupRowValueSetter: (params) =>
                        distributeGroupValue(params, { distribution: 'percentage', precision: 0 }),
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(v1 + v2 + v3).toBe(100);
        expect(Number.isInteger(v1)).toBe(true);
        expect(Number.isInteger(v2)).toBe(true);
        expect(Number.isInteger(v3)).toBe(true);

        await new GridRows(api, 'after pct integer distribution').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:100
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:100
            · · ├── LEAF id:a1 region:"R" country:"C" amount:17
            · · ├── LEAF id:a2 region:"R" country:"C" amount:33
            · · └── LEAF id:a3 region:"R" country:"C" amount:50
        `);
    });
});

describe('distributeGroupValue with no aggFunc', () => {
    test('no aggFunc defaults to overwrite', async () => {
        const api = await gridsManager.createGridAndWait('distribute-no-agg', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: createRowData(),
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });

        const franceNode = api.getRowNode('row-group-region-Europe-country-France')!;
        franceNode.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('fr-paris')?.data?.amount).toBe(42);
        expect(api.getRowNode('fr-lyon')?.data?.amount).toBe(42);

        await new GridRows(api, 'after no-agg edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-Europe
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-France
            │ │ ├── LEAF id:fr-paris region:"Europe" country:"France" amount:42
            │ │ └── LEAF id:fr-lyon region:"Europe" country:"France" amount:42
            │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Germany
            │ │ ├── LEAF id:de-berlin region:"Europe" country:"Germany" amount:30
            │ │ └── LEAF id:de-hamburg region:"Europe" country:"Germany" amount:30
            │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-Italy
            │ · ├── LEAF id:it-rome region:"Europe" country:"Italy" amount:30
            │ · └── LEAF id:it-milan region:"Europe" country:"Italy" amount:30
            └─┬ filler id:row-group-region-Americas
            · ├─┬ LEAF_GROUP id:row-group-region-Americas-country-USA
            · │ ├── LEAF id:us-nyc region:"Americas" country:"USA" amount:70
            · │ └── LEAF id:us-la region:"Americas" country:"USA" amount:30
            · └─┬ LEAF_GROUP id:row-group-region-Americas-country-Canada
            · · ├── LEAF id:ca-toronto region:"Americas" country:"Canada" amount:35
            · · └── LEAF id:ca-vancouver region:"Americas" country:"Canada" amount:25
        `);
    });
});
