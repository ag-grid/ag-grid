import type { GroupRowValueSetterParams } from 'ag-grid-community';

import {
    GridColumns,
    GridRows,
    SETTER_MODES,
    asyncSetTimeout,
    createSimpleGrid,
    distributeGroupValue,
    gridsManager,
} from './distribute-test-utils';

/** A dummy aggFunc used to test unknown/custom string aggFunc handling. */
const myCustomAgg = (params: any) => {
    let total = 0;
    for (const v of params.values) {
        total += typeof v === 'number' ? v : 0;
    }
    return total;
};

const CUSTOM_AGG_FUNCS = { myCustomAgg };

afterEach(() => {
    gridsManager.reset();
});

// --- Dual-mode tests (both function and options object on colDef) ---

describe.each(SETTER_MODES)('distribution modes via %s', (_label, makeSetter) => {
    test('uniform sum distributes equally', async () => {
        const api = await createSimpleGrid(
            'dual-uniform-sum',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            makeSetter({ distribution: 'uniform' })
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
        expect(group.aggData?.amount).toBe(60);
    });

    test('percentage sum preserves proportions', async () => {
        const api = await createSimpleGrid(
            'dual-pct-sum',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30 },
                { id: 'a2', region: 'R', country: 'C', amount: 70 },
            ],
            makeSetter({ distribution: 'percentage' })
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 200, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(60); // 30/100 * 200
        expect(api.getRowNode('a2')?.data?.amount).toBe(140); // 70/100 * 200
        expect(group.aggData?.amount).toBe(200);
    });

    test('increment sum distributes delta equally', async () => {
        const api = await createSimpleGrid(
            'dual-inc-sum',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 40 },
            ],
            makeSetter({ distribution: 'increment' })
        );

        // sum = 50, set to 70, delta = 20, each gets +10
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 70, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(20);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50);
        expect(group.aggData?.amount).toBe(70);
    });

    test('overwrite sets all children to the new value', async () => {
        const api = await createSimpleGrid(
            'dual-overwrite',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            makeSetter({ distribution: 'overwrite' })
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
        expect(group.aggData?.amount).toBe(84); // sum of 42+42
    });

    test('integer distribution rounds and spreads remainder', async () => {
        const api = await createSimpleGrid(
            'dual-int-dist',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            makeSetter({ distribution: 'uniform', precision: 0 })
        );

        // 10 / 3 = 3 remainder 1
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4); // gets +1 from remainder
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
        expect(group.aggData?.amount).toBe(10);
    });
});

// --- Distribution record ---

describe.each(SETTER_MODES)('distribution record via %s', (_label, makeSetter) => {
    test('per-aggFunc strategy from record', async () => {
        const api = await createSimpleGrid(
            'record-per-agg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30 },
                { id: 'a2', region: 'R', country: 'C', amount: 70 },
            ],
            makeSetter({ distribution: { sum: 'percentage' } })
        );

        // sum uses percentage from the record
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 200, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(60); // 30/100 * 200
        expect(api.getRowNode('a2')?.data?.amount).toBe(140); // 70/100 * 200
    });

    test('record with options object entry', async () => {
        const api = await createSimpleGrid(
            'record-opts-entry',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            makeSetter({
                distribution: { sum: { distribution: 'uniform', precision: 0 } },
            })
        );

        // 10 / 3 = 3.33, integer rounds to [4, 3, 3]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
    });

    test('record inherits top-level precision', async () => {
        const api = await createSimpleGrid(
            'record-inherit',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            makeSetter({
                distribution: { sum: 'uniform' },
                precision: 0,
            })
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
    });
});

// --- Default handler ---

describe('distribution default handler', () => {
    test('default function is called for unmatched aggFunc in record', async () => {
        const defaultCalls: GroupRowValueSetterParams[] = [];

        const api = await createSimpleGrid(
            'default-unmatched',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'myCustomAgg',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { sum: 'percentage' }, // no 'myCustomAgg' entry
                        default: (p) => {
                            defaultCalls.push(p);
                            for (const child of p.aggregatedChildren) {
                                child.setDataValue(p.column, 999, 'data');
                            }
                        },
                    }),
            },
            undefined,
            { aggFuncs: CUSTOM_AGG_FUNCS }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // myCustomAgg is not in the record, so default handler is called
        expect(defaultCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(999);
        expect(api.getRowNode('a2')?.data?.amount).toBe(999);
    });

    test('default handler is called for built-in aggFunc not in record', async () => {
        const defaultCalls: GroupRowValueSetterParams[] = [];

        const api = await createSimpleGrid(
            'default-unmatched-sum',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'sum',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { avg: 'percentage' }, // no 'sum' entry
                        default: (p) => {
                            defaultCalls.push(p);
                            for (const child of p.aggregatedChildren) {
                                child.setDataValue(p.column, 888, 'data');
                            }
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // sum is not in the record, so default handler is called (not uniform distribution)
        expect(defaultCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(888);
        expect(api.getRowNode('a2')?.data?.amount).toBe(888);
    });

    test('built-in aggFunc not in record without default handler inherits default strategy', async () => {
        const api = await createSimpleGrid(
            'unmatched-sum-no-default',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'sum',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { avg: 'percentage' }, // no 'sum' entry, no default handler
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // sum is not in the record, no default handler → inherits default (uniform for sum)
        expect(api.getRowNode('a1')?.data?.amount).toBe(21);
        expect(api.getRowNode('a2')?.data?.amount).toBe(21);
    });

    test('custom function entry in record is invoked directly', async () => {
        const customCalls: GroupRowValueSetterParams[] = [];

        const api = await createSimpleGrid(
            'record-custom-fn',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: {
                            sum: (p) => {
                                customCalls.push(p);
                                for (const child of p.aggregatedChildren) {
                                    child.setDataValue(p.column, 777, 'data');
                                }
                            },
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(customCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(777);
        expect(api.getRowNode('a2')?.data?.amount).toBe(777);
    });

    test('function aggFunc without options is disabled by default (no distribution)', async () => {
        const api = await gridsManager.createGridAndWait('fn-agg-disabled', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: (params) => params.values.reduce((a: number, b: number) => a + b, 0),
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: distributeGroupValue,
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `function aggFunc without options is disabled by default (no distribution) setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:custom editable
            `);
        await new GridRows(api, `function aggFunc without options is disabled by default (no distribution) setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-R amount:30
                · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
                · · ├── LEAF id:a1 region:"R" country:"C" amount:10
                · · └── LEAF id:a2 region:"R" country:"C" amount:20
            `);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // Function aggFuncs are disabled by default — children unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
        await new GridRows(api, `function aggFunc without options is disabled by default (no distribution) final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-R amount:30
                · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
                · · ├── LEAF id:a1 region:"R" country:"C" amount:10
                · · └── LEAF id:a2 region:"R" country:"C" amount:20
            `);
    });

    test('function aggFunc with distribution: true enables overwrite', async () => {
        const api = await gridsManager.createGridAndWait('fn-agg-enabled', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: (params) => params.values.reduce((a: number, b: number) => a + b, 0),
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: true },
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `function aggFunc with distribution: true enables overwrite setup`).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:custom editable
        `);
        await new GridRows(api, `function aggFunc with distribution: true enables overwrite setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:30
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · └── LEAF id:a2 region:"R" country:"C" amount:20
        `);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // distribution: true enables function aggFuncs with 'overwrite'
        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
        await new GridRows(api, `function aggFunc with distribution: true enables overwrite final state`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:84
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:84
            · · ├── LEAF id:a1 region:"R" country:"C" amount:42
            · · └── LEAF id:a2 region:"R" country:"C" amount:42
        `);
    });

    test('options object on colDef with record and default handler', async () => {
        const api = await gridsManager.createGridAndWait('coldef-record-default', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            aggFuncs: CUSTOM_AGG_FUNCS,
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'myCustomAgg',
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: {
                        distribution: { sum: 'percentage' },
                        default: (params) => {
                            for (const child of params.aggregatedChildren) {
                                child.setDataValue(params.column, 0, 'data');
                            }
                        },
                    },
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `options object on colDef with record and default handler setup`).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:myCustomAgg editable
        `);
        await new GridRows(api, `options object on colDef with record and default handler setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:30
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · └── LEAF id:a2 region:"R" country:"C" amount:20
        `);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // myCustomAgg is not in the record, default handler sets all to 0
        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
        await new GridRows(api, `options object on colDef with record and default handler final state`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:0
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:0
            · · ├── LEAF id:a1 region:"R" country:"C" amount:0
            · · └── LEAF id:a2 region:"R" country:"C" amount:0
        `);
    });
});

// --- Increment with avg via dual mode ---

describe.each(SETTER_MODES)('increment with avg via %s', (_label, makeSetter) => {
    test('increment avg adds full delta to each child', async () => {
        const api = await createSimpleGrid(
            'dual-inc-avg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 20 },
                { id: 'a2', region: 'R', country: 'C', amount: 40 },
            ],
            { aggFunc: 'avg', ...makeSetter({ distribution: 'increment' }) }
        );

        // avg = 30, set to 40, delta = +10 → each child gets +10
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 40, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50);
    });
});

// --- Increment with constraints ---

describe('increment with constraints', () => {
    test('increment sum with integer distribution', async () => {
        const api = await createSimpleGrid(
            'inc-sum-int',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, { distribution: 'increment', precision: 0 }),
            }
        );

        // sum=30, set to 40, delta=10, per child=10/3=3.33
        // values: [13.33, 13.33, 13.33] → rounded [14, 13, 13]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 40, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(v1 + v2 + v3).toBe(40);
        expect(Number.isInteger(v1)).toBe(true);
        expect(Number.isInteger(v2)).toBe(true);
        expect(Number.isInteger(v3)).toBe(true);
    });

    test('increment avg with integer distribution', async () => {
        const api = await createSimpleGrid(
            'inc-avg-int',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            {
                aggFunc: 'avg',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, { distribution: 'increment', precision: 0 }),
            }
        );

        // avg=20, set to 23, delta=+3 → each child gets +3
        // [13, 23, 33] → already integers, no rounding needed
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 23, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(13);
        expect(api.getRowNode('a2')?.data?.amount).toBe(23);
        expect(api.getRowNode('a3')?.data?.amount).toBe(33);
    });
});

// --- Percentage with zero total (direct path, no post-process) ---

describe('percentage zero total direct path', () => {
    test('percentage with all-zero values falls back to uniform (no post-process)', async () => {
        const api = await createSimpleGrid(
            'pct-zero-direct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 0 },
                { id: 'a2', region: 'R', country: 'C', amount: 0 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(50);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50);
    });
});

// --- String aggFunc that is not sum/avg/first/last with default handler ---

describe('string aggFunc edge cases', () => {
    test('unknown string aggFunc without default handler is disabled (no children modified)', async () => {
        const api = await createSimpleGrid(
            'unknown-string-agg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'myCustomAgg',
                groupRowValueSetter: distributeGroupValue,
            },
            undefined,
            { aggFuncs: CUSTOM_AGG_FUNCS }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // Custom aggFuncs are disabled by default — children are not modified
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('unknown string aggFunc with default handler calls default', async () => {
        const defaultCalled: boolean[] = [];
        const api = await createSimpleGrid(
            'unknown-string-default',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'myCustomAgg',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        default: (p) => {
                            defaultCalled.push(true);
                            for (const child of p.aggregatedChildren) {
                                child.setDataValue(p.column, 0, 'data');
                            }
                        },
                    }),
            },
            undefined,
            { aggFuncs: CUSTOM_AGG_FUNCS }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(defaultCalled).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
    });
});

// --- Options passed as string ---

describe('options as distribution string', () => {
    test('string option selects that distribution strategy', async () => {
        const api = await createSimpleGrid(
            'string-opts',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30 },
                { id: 'a2', region: 'R', country: 'C', amount: 70 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 200, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(60);
        expect(api.getRowNode('a2')?.data?.amount).toBe(140);
    });
});

// --- Precision > 0 (decimal rounding) ---

describe.each(SETTER_MODES)('decimal precision via %s', (_label, makeSetter) => {
    test('precision: 2 rounds uniform distribution to 2 decimal places', async () => {
        const api = await createSimpleGrid(
            'precision-2-uniform',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            makeSetter({ distribution: 'uniform', precision: 2 })
        );

        // 10 / 3 = 3.333..., precision: 2 → [3.34, 3.33, 3.33]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(v1).toBe(3.34);
        expect(v2).toBe(3.33);
        expect(v3).toBe(3.33);
        expect(+(v1 + v2 + v3).toFixed(2)).toBe(10);
    });

    test('precision: 2 rounds percentage distribution to 2 decimal places', async () => {
        const api = await createSimpleGrid(
            'precision-2-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            makeSetter({ distribution: 'percentage', precision: 2 })
        );

        // [10, 20, 30] total=60, target=100
        // 10/60*100=16.666.., 20/60*100=33.333.., 30/60*100=50
        // Rounded: [16.67, 33.33, 50.00]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(v1).toBe(16.67);
        expect(v2).toBe(33.33);
        expect(v3).toBe(50);
        expect(+(v1 + v2 + v3).toFixed(2)).toBe(100);
    });

    test('precision: 2 rounds increment distribution to 2 decimal places', async () => {
        const api = await createSimpleGrid(
            'precision-2-inc',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            makeSetter({ distribution: 'increment', precision: 2 })
        );

        // sum=60, set to 70, delta=10, per child=10/3=3.333..
        // [13.33, 23.33, 33.33] rounded to 2dp, remainder spread
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 70, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(+(v1 + v2 + v3).toFixed(2)).toBe(70);
        // Each should be rounded to 2dp
        expect(Math.round(v1 * 100)).toBe(v1 * 100);
        expect(Math.round(v2 * 100)).toBe(v2 * 100);
        expect(Math.round(v3 * 100)).toBe(v3 * 100);
    });

    test('precision: 1 rounds to 1 decimal place', async () => {
        const api = await createSimpleGrid(
            'precision-1-uniform',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            makeSetter({ distribution: 'uniform', precision: 1 })
        );

        // 10 / 3 = 3.333..., precision: 1 → [3.4, 3.3, 3.3]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(v1).toBe(3.4);
        expect(v2).toBe(3.3);
        expect(v3).toBe(3.3);
        expect(+(v1 + v2 + v3).toFixed(1)).toBe(10);
    });

    test('precision: false disables auto-detected rounding', async () => {
        const api = await createSimpleGrid(
            'precision-false',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            {
                // cellEditorParams.precision=0 would auto-detect integer rounding
                cellEditorParams: { precision: 0 },
                ...makeSetter({ precision: false }),
            }
        );

        // 10 / 3 = 3.333..., precision: false overrides auto-detect → no rounding
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        expect(v1).toBeCloseTo(10 / 3, 10);
    });
});

// --- Suppressed distribution ---

describe('suppressed distribution strategy', () => {
    test('false suppresses distribution', async () => {
        const api = await createSimpleGrid(
            'none-string',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: false }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // No distribution — values unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('false suppresses distribution', async () => {
        const api = await createSimpleGrid(
            'none-false',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: false }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('null suppresses distribution', async () => {
        const api = await createSimpleGrid(
            'none-null',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: null }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('false in per-aggFunc record suppresses for that aggFunc only', async () => {
        const api = await createSimpleGrid(
            'none-record',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: { sum: false } }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('null in per-aggFunc record suppresses for that aggFunc only', async () => {
        const api = await createSimpleGrid(
            'none-false-record',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: { sum: false } }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('false on colDef options object suppresses distribution', async () => {
        const api = await createSimpleGrid(
            'none-coldef',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: { distribution: false } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });
});

// --- undefined inherits from parent ---

describe('undefined in record/options inherits from parent defaults', () => {
    test('undefined entry in per-aggFunc record inherits default for sum (uniform)', async () => {
        const api = await createSimpleGrid(
            'inherit-undefined-record',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { sum: undefined, avg: 'percentage' },
                    }),
            }
        );

        // sum: undefined → falls through to default (uniform for sum)
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
    });

    test('undefined distribution in options object entry inherits default for sum', async () => {
        const api = await createSimpleGrid(
            'inherit-undefined-opts-entry',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { sum: { distribution: undefined, precision: 0 } },
                    }),
            }
        );

        // distribution: undefined inside options object → inherits default for sum (uniform)
        // precision: 0 still applies
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
    });

    test('undefined top-level distribution inherits default for each aggFunc', async () => {
        const api = await createSimpleGrid(
            'inherit-undefined-top',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: undefined }),
            }
        );

        // undefined top-level distribution → default for sum (uniform)
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
    });

    test('undefined in record for count/min/max inherits disabled-by-default (no distribution)', async () => {
        const api = await createSimpleGrid(
            'inherit-undefined-count',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { count: undefined },
                    }),
            }
        );

        // count: undefined → inherits disabled-by-default (suppressed)
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('explicit strategy in record overrides disabled-by-default for count', async () => {
        const api = await createSimpleGrid(
            'override-count-overwrite',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { count: 'overwrite' },
                    }),
            }
        );

        // count: 'overwrite' → explicitly enabled
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(100);
        expect(api.getRowNode('a2')?.data?.amount).toBe(100);
    });
});

// --- Non-distributable aggFuncs with custom functions ---

describe('non-distributable aggFuncs with custom functions', () => {
    test('per-aggFunc record with function for count invokes the function', async () => {
        const calls: number[] = [];
        const api = await createSimpleGrid(
            'count-custom-fn',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: {
                            count: (p) => {
                                calls.push(Number(p.newValue));
                                for (const child of p.aggregatedChildren) {
                                    child.setDataValue(p.column, 777, 'data');
                                }
                                return true;
                            },
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 50, 'ui');
        await asyncSetTimeout(0);

        expect(calls).toEqual([50]);
        expect(api.getRowNode('a1')?.data?.amount).toBe(777);
        expect(api.getRowNode('a2')?.data?.amount).toBe(777);
    });

    test('default handler is NOT invoked for non-distributable aggFuncs not in record', async () => {
        const defaultCalls: unknown[] = [];
        const api = await createSimpleGrid(
            'count-default-handler',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { sum: 'percentage' },
                        default: (p) => {
                            defaultCalls.push(p.newValue);
                            for (const child of p.aggregatedChildren) {
                                child.setDataValue(p.column, 888, 'data');
                            }
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 50, 'ui');
        await asyncSetTimeout(0);

        // count is non-distributable and not listed in the record → disabled, default handler NOT called
        expect(defaultCalls).toHaveLength(0);
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('groupRowValueSetter as custom function with count aggFunc is always invoked', async () => {
        const calls: number[] = [];
        const api = await createSimpleGrid(
            'count-setter-fn',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: (params) => {
                    calls.push(Number(params.newValue));
                    for (const child of params.aggregatedChildren) {
                        child.setDataValue(params.column, 555, 'data');
                    }
                    return true;
                },
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 50, 'ui');
        await asyncSetTimeout(0);

        // Function setter bypasses all distribution checks
        expect(calls).toEqual([50]);
        expect(api.getRowNode('a1')?.data?.amount).toBe(555);
        expect(api.getRowNode('a2')?.data?.amount).toBe(555);
    });

    test('per-aggFunc record with options object containing custom getValue/setValue for min', async () => {
        const api = await createSimpleGrid(
            'min-custom-io',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10, target: 0 },
                { id: 'a2', region: 'R', country: 'C', amount: 20, target: 0 },
            ],
            {
                aggFunc: 'min',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: {
                            min: {
                                distribution: 'overwrite',
                                setValue: ({ node, value }) => {
                                    const old = node.data?.target;
                                    node.data.target = value;
                                    return old !== value;
                                },
                            },
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // Custom setValue writes to 'target' field, not 'amount'
        expect(api.getRowNode('a1')?.data?.target).toBe(99);
        expect(api.getRowNode('a2')?.data?.target).toBe(99);
        // 'amount' field unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });
});

// --- precision: 0 guarantees exact integers ---

describe('precision: 0 always produces exact integers', () => {
    test('uniform: 100 across 7 children → all integers summing to 100', async () => {
        const api = await createSimpleGrid(
            'p0-uniform-7',
            Array.from({ length: 7 }, (_, i) => ({ id: `a${i}`, region: 'R', country: 'C', amount: 10 })),
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: 0 }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        let sum = 0;
        for (let i = 0; i < 7; i++) {
            const v = api.getRowNode(`a${i}`)?.data?.amount;
            expect(Number.isInteger(v)).toBe(true);
            sum += v;
        }
        expect(sum).toBe(100);
    });

    test('percentage: 100 across 3 children with weights [1, 2, 3] → all integers summing to 100', async () => {
        const api = await createSimpleGrid(
            'p0-pct-3',
            [
                { id: 'a0', region: 'R', country: 'C', amount: 1 },
                { id: 'a1', region: 'R', country: 'C', amount: 2 },
                { id: 'a2', region: 'R', country: 'C', amount: 3 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, { distribution: 'percentage', precision: 0 }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        let sum = 0;
        for (let i = 0; i < 3; i++) {
            const v = api.getRowNode(`a${i}`)?.data?.amount;
            expect(Number.isInteger(v)).toBe(true);
            sum += v;
        }
        expect(sum).toBe(100);
    });

    test('increment: delta of 10 across 3 children → all integers summing to old+10', async () => {
        const api = await createSimpleGrid(
            'p0-inc-3',
            [
                { id: 'a0', region: 'R', country: 'C', amount: 5 },
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 15 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, { distribution: 'increment', precision: 0 }),
            }
        );

        // sum=30, set to 40, delta=10
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 40, 'ui');
        await asyncSetTimeout(0);

        let sum = 0;
        for (let i = 0; i < 3; i++) {
            const v = api.getRowNode(`a${i}`)?.data?.amount;
            expect(Number.isInteger(v)).toBe(true);
            sum += v;
        }
        expect(sum).toBe(40);
    });

    test('uniform: 1 across 3 children → [1, 0, 0] (no floating point artefacts)', async () => {
        const api = await createSimpleGrid(
            'p0-uniform-1-of-3',
            [
                { id: 'a0', region: 'R', country: 'C', amount: 10 },
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: 0 }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 1, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a0')?.data?.amount).toBe(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
    });

    test('uniform: negative value -10 across 3 children → all integers summing to -10', async () => {
        const api = await createSimpleGrid(
            'p0-uniform-neg',
            [
                { id: 'a0', region: 'R', country: 'C', amount: 10 },
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: 0 }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', -10, 'ui');
        await asyncSetTimeout(0);

        let sum = 0;
        for (let i = 0; i < 3; i++) {
            const v = api.getRowNode(`a${i}`)?.data?.amount;
            expect(Number.isInteger(v)).toBe(true);
            sum += v;
        }
        expect(sum).toBe(-10);
    });
});

// --- Invalid precision values ---

describe('invalid precision values', () => {
    test('negative precision is treated as no rounding', async () => {
        const api = await createSimpleGrid(
            'precision-negative',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: -1 }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        // Invalid precision → no rounding → 10/3 = 3.333...
        const v1 = api.getRowNode('a1')?.data?.amount;
        expect(v1).toBeCloseTo(10 / 3, 10);
    });

    test('NaN precision is treated as no rounding', async () => {
        const api = await createSimpleGrid(
            'precision-nan',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: NaN }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        expect(v1).toBeCloseTo(10 / 3, 10);
    });

    test('non-integer precision is treated as no rounding', async () => {
        const api = await createSimpleGrid(
            'precision-non-integer',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: 1.5 }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        expect(v1).toBeCloseTo(10 / 3, 10);
    });

    test('Infinity precision is treated as no rounding', async () => {
        const api = await createSimpleGrid(
            'precision-infinity',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { precision: Infinity }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        const v1 = api.getRowNode('a1')?.data?.amount;
        expect(v1).toBeCloseTo(10 / 3, 10);
    });
});

// --- Avg with percentage (tests percentage direct path with avg target) ---

describe('avg with percentage via direct path', () => {
    test('avg percentage scales proportionally using avg target', async () => {
        const api = await createSimpleGrid(
            'avg-pct-direct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 20 },
                { id: 'a2', region: 'R', country: 'C', amount: 80 },
            ],
            {
                aggFunc: 'avg',
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
            }
        );

        // avg=50, set to 100 → target = 100*2 = 200
        // [20, 80] total=100, scale=200/100=2 → [40, 160]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(40);
        expect(api.getRowNode('a2')?.data?.amount).toBe(160);
    });
});

// --- Record edge cases ---

describe('distribution record edge cases', () => {
    test('record with missing aggFunc key for count inherits disabled-by-default', async () => {
        const api = await createSimpleGrid(
            'record-missing-key',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: { sum: 'percentage' }, // no 'count' key, no default handler
                    }),
            }
        );

        // count is not in record, no default → disabled by default (no distribution)
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('record with custom function returning false propagates false', async () => {
        const api = await createSimpleGrid(
            'record-fn-false',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: {
                            sum: () => false,
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // Custom function returns false → no changes
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('record with custom function returning void defaults to true', async () => {
        let called = false;
        const api = await createSimpleGrid(
            'record-fn-void',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: {
                            sum: () => {
                                called = true;
                            },
                        },
                    }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        const result = group.setDataValue('amount', 100, 'ui');

        expect(called).toBe(true);
        // void return → defaults to true
        expect(result).toBe(true);
    });
});

// --- Options object on colDef (not function wrapper) edge cases ---

describe('options object directly on colDef', () => {
    test('only precision (no distribution) uses uniform + integer rounding for sum', async () => {
        const api = await createSimpleGrid(
            'coldef-only-int-dist',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: { precision: 0 } }
        );

        // 10 / 3 = 3.33, integer rounds to [4, 3, 3]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
        expect(group.aggData?.amount).toBe(10);
    });

    test('empty options object defaults to uniform for sum', async () => {
        const api = await createSimpleGrid(
            'coldef-empty-opts',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: {} }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
        expect(group.aggData?.amount).toBe(60);
    });

    test('avg with no distribution defaults to overwrite', async () => {
        const api = await createSimpleGrid(
            'coldef-avg-no-dist',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 20 },
                { id: 'a2', region: 'R', country: 'C', amount: 80 },
            ],
            { aggFunc: 'avg', groupRowValueSetter: {} }
        );

        // avg default = overwrite → all children set to 100
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(100);
        expect(api.getRowNode('a2')?.data?.amount).toBe(100);
    });

    test('avg with explicit percentage scales proportionally', async () => {
        const api = await createSimpleGrid(
            'coldef-avg-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 20 },
                { id: 'a2', region: 'R', country: 'C', amount: 80 },
            ],
            { aggFunc: 'avg', groupRowValueSetter: { distribution: 'percentage' } }
        );

        // avg=50, set to 100 → target = 100*2 = 200
        // [20, 80] total=100, scale=200/100=2 → [40, 160]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(40);
        expect(api.getRowNode('a2')?.data?.amount).toBe(160);
    });

    test('first aggFunc with top-level distribution options is suppressed', async () => {
        const api = await createSimpleGrid(
            'coldef-first-with-opts',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { aggFunc: 'first', groupRowValueSetter: { distribution: 'uniform' } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // first is non-distributable — top-level distribution doesn't enable it
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('last aggFunc with top-level distribution options is suppressed', async () => {
        const api = await createSimpleGrid(
            'coldef-last-with-opts',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { aggFunc: 'last', groupRowValueSetter: { distribution: 'uniform' } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // last is non-distributable — top-level distribution doesn't enable it
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('first aggFunc with per-aggFunc record entry uses overwrite', async () => {
        const api = await createSimpleGrid(
            'coldef-first-record',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { aggFunc: 'first', groupRowValueSetter: { distribution: { first: true } } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // per-aggFunc entry with true → overwrite all children
        expect(api.getRowNode('a1')?.data?.amount).toBe(99);
        expect(api.getRowNode('a2')?.data?.amount).toBe(99);
    });

    test('record with function entry on colDef options object', async () => {
        const customCalls: GroupRowValueSetterParams[] = [];

        const api = await gridsManager.createGridAndWait('coldef-record-fn', {
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
                    groupRowValueSetter: {
                        distribution: {
                            sum: (p) => {
                                customCalls.push(p);
                                for (const child of p.aggregatedChildren) {
                                    child.setDataValue(p.column, 555, 'data');
                                }
                            },
                        },
                    },
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `record with function entry on colDef options object setup`).checkColumns(`
            CENTER
            ├── group "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum editable
        `);
        await new GridRows(api, `record with function entry on colDef options object setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:30
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · └── LEAF id:a2 region:"R" country:"C" amount:20
        `);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(customCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(555);
        expect(api.getRowNode('a2')?.data?.amount).toBe(555);
        await new GridRows(api, `record with function entry on colDef options object final state`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:1110
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:1110
            · · ├── LEAF id:a1 region:"R" country:"C" amount:555
            · · └── LEAF id:a2 region:"R" country:"C" amount:555
        `);
    });

    test('custom (non-string) aggFunc with record falls to default handler', async () => {
        const defaultCalls: GroupRowValueSetterParams[] = [];

        const api = await gridsManager.createGridAndWait('coldef-custom-agg-record', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: (params) => params.values.reduce((a: number, b: number) => a + b, 0),
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: {
                        distribution: { sum: 'percentage' },
                        default: (p) => {
                            defaultCalls.push(p);
                            for (const child of p.aggregatedChildren) {
                                child.setDataValue(p.column, 888, 'data');
                            }
                        },
                    },
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `custom (non-string) aggFunc with record falls to default handler setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:custom editable
            `);
        await new GridRows(api, `custom (non-string) aggFunc with record falls to default handler setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:30
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · └── LEAF id:a2 region:"R" country:"C" amount:20
        `);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // Function aggFunc → not a string → not in record → default handler
        expect(defaultCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(888);
        expect(api.getRowNode('a2')?.data?.amount).toBe(888);
        await new GridRows(api, `custom (non-string) aggFunc with record falls to default handler final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-R amount:1776
                · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:1776
                · · ├── LEAF id:a1 region:"R" country:"C" amount:888
                · · └── LEAF id:a2 region:"R" country:"C" amount:888
            `
        );
    });

    test('function aggFunc with record and no default is disabled (no distribution)', async () => {
        const api = await gridsManager.createGridAndWait('coldef-fn-agg-no-default', {
            defaultColDef: { cellEditor: 'agTextCellEditor' },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: (params) => params.values.reduce((a: number, b: number) => a + b, 0),
                    editable: true,
                    groupRowEditable: true,
                    groupRowValueSetter: { distribution: { sum: 'percentage' } },
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data?.id,
        });
        await new GridColumns(api, `function aggFunc with record and no default is disabled (no distribution) setup`)
            .checkColumns(`
                CENTER
                ├── group "Group" width:200
                └── amount "Amount" width:200 aggFunc:custom editable
            `);
        await new GridRows(api, `function aggFunc with record and no default is disabled (no distribution) setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-R amount:30
                · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
                · · ├── LEAF id:a1 region:"R" country:"C" amount:10
                · · └── LEAF id:a2 region:"R" country:"C" amount:20
            `);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // Function aggFunc, not in record, no default → disabled by default
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
        await new GridRows(api, `function aggFunc with record and no default is disabled (no distribution) final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-R amount:30
                · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:30
                · · ├── LEAF id:a1 region:"R" country:"C" amount:10
                · · └── LEAF id:a2 region:"R" country:"C" amount:20
            `);
    });

    test('consecutive edits with options object on colDef', async () => {
        const api = await createSimpleGrid(
            'coldef-consecutive',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30 },
                { id: 'a2', region: 'R', country: 'C', amount: 70 },
            ],
            { groupRowValueSetter: { distribution: 'percentage' } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;

        // First edit: [30, 70] total=100, set to 200 → [60, 140]
        group.setDataValue('amount', 200, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(60);
        expect(api.getRowNode('a2')?.data?.amount).toBe(140);

        // Second edit: [60, 140] total=200, set to 100 → [30, 70]
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(70);
        expect(group.aggData?.amount).toBe(100);
    });
});

describe('precision rounds child values, not the re-aggregated group value', () => {
    test('sum: precision 0 produces integer leaf values and integer group sum', async () => {
        const api = await createSimpleGrid(
            'precision-sum-int',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            { groupRowValueSetter: { distribution: 'uniform', precision: 0 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // Leaf values are rounded to integers with remainder spread: [34, 33, 33]
        const v1 = api.getRowNode('a1')!.data!.amount;
        const v2 = api.getRowNode('a2')!.data!.amount;
        const v3 = api.getRowNode('a3')!.data!.amount;
        expect(Number.isInteger(v1)).toBe(true);
        expect(Number.isInteger(v2)).toBe(true);
        expect(Number.isInteger(v3)).toBe(true);
        expect(v1 + v2 + v3).toBe(100);

        // The sum of integers is always an integer — group value honours precision
        expect(group.aggData?.amount).toBe(100);
        expect(Number.isInteger(group.aggData?.amount)).toBe(true);
    });

    test('avg: precision 0 with uniform — leaf values are integers, group avg honours precision', async () => {
        // Uniform avg sets all children to the target value → avg matches exactly.
        const api = await createSimpleGrid(
            'precision-avg-uniform',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            { aggFunc: 'avg', groupRowValueSetter: { distribution: 'uniform', precision: 0 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;

        // Edit group avg to 10 — uniform writes 10 to each child → avg(10,10,10) = 10 ✓
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')!.data!.amount).toBe(10);
        expect(api.getRowNode('a2')!.data!.amount).toBe(10);
        expect(api.getRowNode('a3')!.data!.amount).toBe(10);
        expect(group.aggData?.amount).toMatchObject({ value: 10 });
    });

    test('avg: precision 0 with percentage — leaf values are integers, sum is exact', async () => {
        const api = await createSimpleGrid(
            'precision-avg-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 30 },
            ],
            { aggFunc: 'avg', groupRowValueSetter: { distribution: 'percentage', precision: 0 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        // Old avg = 20, edit to 25
        // Target sum = 75, old sum = 60 — distributes proportionally then rounds
        group.setDataValue('amount', 25, 'ui');
        await asyncSetTimeout(0);

        const w1 = api.getRowNode('a1')!.data!.amount;
        const w2 = api.getRowNode('a2')!.data!.amount;
        const w3 = api.getRowNode('a3')!.data!.amount;

        // All leaf values are integers (precision: 0)
        expect(Number.isInteger(w1)).toBe(true);
        expect(Number.isInteger(w2)).toBe(true);
        expect(Number.isInteger(w3)).toBe(true);

        // The sum is exact in integer space (remainder distributed)
        expect(w1 + w2 + w3).toBe(75);
        expect(group.aggData?.amount).toMatchObject({ value: 25 });
    });

    test('avg: precision 0 with increment — leaf values are integers, group avg matches', async () => {
        const api = await createSimpleGrid(
            'precision-avg-inc',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
                { id: 'a4', region: 'R', country: 'C', amount: 10 },
            ],
            { aggFunc: 'avg', groupRowValueSetter: { distribution: 'increment', precision: 0 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        expect(group.aggData?.amount).toMatchObject({ value: 10 });

        // Edit avg from 10 to 11 → for avg+increment, full delta added to every child
        group.setDataValue('amount', 11, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')!.data!.amount).toBe(11);
        expect(api.getRowNode('a2')!.data!.amount).toBe(11);
        expect(api.getRowNode('a3')!.data!.amount).toBe(11);
        expect(api.getRowNode('a4')!.data!.amount).toBe(11);
        expect(group.aggData?.amount).toMatchObject({ value: 11 });
    });

    test('sum: precision 0 with uniform on 7 children — leaf values are integers, group sum is exact', async () => {
        // 100 / 7 = 14.285... → with precision 0: remainder-spread integers summing to 100
        const api = await createSimpleGrid(
            'precision-sum-7kids',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 1 },
                { id: 'a2', region: 'R', country: 'C', amount: 1 },
                { id: 'a3', region: 'R', country: 'C', amount: 1 },
                { id: 'a4', region: 'R', country: 'C', amount: 1 },
                { id: 'a5', region: 'R', country: 'C', amount: 1 },
                { id: 'a6', region: 'R', country: 'C', amount: 1 },
                { id: 'a7', region: 'R', country: 'C', amount: 1 },
            ],
            { groupRowValueSetter: { distribution: 'uniform', precision: 0 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        const values = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'].map((id) => api.getRowNode(id)!.data!.amount);

        // All leaf values are integers
        for (const v of values) {
            expect(Number.isInteger(v)).toBe(true);
        }
        // Sum is exact — for sum, the sum of integers is always an integer
        expect(values.reduce((a, b) => a + b, 0)).toBe(100);
        expect(group.aggData?.amount).toBe(100);
    });

    test('avg column shows non-integer aggData when all leaf values are integers', async () => {
        // Demonstrates the precision note: precision rounds child values, not the re-aggregated
        // group value. A sum column distributes 10 across 3 children with precision:0 → [4, 3, 3].
        // A second avg column on the same field re-aggregates those integers: avg(4, 3, 3) ≈ 3.33,
        // which is NOT an integer despite all leaf values being integers.
        const api = await createSimpleGrid(
            'precision-avg-non-int',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 1 },
                { id: 'a2', region: 'R', country: 'C', amount: 1 },
                { id: 'a3', region: 'R', country: 'C', amount: 1 },
            ],
            { groupRowValueSetter: { distribution: 'uniform', precision: 0 } },
            [{ colId: 'amount_avg', field: 'amount', aggFunc: 'avg' }]
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        // Distribute 10 across 3 children with precision:0 → [4, 3, 3]
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        // All leaf values are integers
        const v1 = api.getRowNode('a1')!.data!.amount;
        const v2 = api.getRowNode('a2')!.data!.amount;
        const v3 = api.getRowNode('a3')!.data!.amount;
        expect(Number.isInteger(v1)).toBe(true);
        expect(Number.isInteger(v2)).toBe(true);
        expect(Number.isInteger(v3)).toBe(true);
        expect(v1 + v2 + v3).toBe(10);

        // The sum column's aggData is an integer (sum of integers is always an integer)
        expect(group.aggData?.amount).toBe(10);
        expect(Number.isInteger(group.aggData?.amount)).toBe(true);

        // The avg column's aggData is NOT an integer: avg(4, 3, 3) = 10/3 ≈ 3.333...
        const avgAgg = group.aggData?.amount_avg;
        expect(avgAgg).toMatchObject({ value: expect.closeTo(10 / 3, 10) });
        expect(Number.isInteger(avgAgg.value)).toBe(false);
    });
});

// --- Regression: record-mode with default:false suppresses columns without aggFunc ---

describe('record-mode default suppression', () => {
    test('record distribution with default:false suppresses column without aggFunc', async () => {
        const api = await createSimpleGrid(
            'record-default-false-no-agg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: undefined,
                groupRowValueSetter: (params: GroupRowValueSetterParams) =>
                    distributeGroupValue(params, { distribution: { sum: 'percentage' }, default: false }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // default:false suppresses distribution — children unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('record distribution with default:null suppresses column without aggFunc', async () => {
        const api = await createSimpleGrid(
            'record-default-null-no-agg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: undefined,
                groupRowValueSetter: (params: GroupRowValueSetterParams) =>
                    distributeGroupValue(params, { distribution: { sum: 'percentage' }, default: null }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // default:null suppresses distribution — children unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('record distribution without default falls through to overwrite for no-aggFunc column', async () => {
        const api = await createSimpleGrid(
            'record-no-default-no-agg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: undefined,
                groupRowValueSetter: (params: GroupRowValueSetterParams) =>
                    distributeGroupValue(params, { distribution: { sum: 'percentage' } }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // No default, no aggFunc → falls through to 'overwrite'
        expect(api.getRowNode('a1')?.data?.amount).toBe(99);
        expect(api.getRowNode('a2')?.data?.amount).toBe(99);
    });
});

// --- Tests for `true` distribution entry ---

describe('distribution: true', () => {
    test('true enables custom aggFunc with overwrite (via options object)', async () => {
        const api = await createSimpleGrid(
            'true-custom-agg-options',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'myCustomAgg',
                groupRowValueSetter: { distribution: true },
            },
            undefined,
            { aggFuncs: CUSTOM_AGG_FUNCS }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // true enables normally-disabled custom aggFuncs with 'overwrite'
        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
    });

    test('distribution: true does NOT enable count aggFunc (same as default)', async () => {
        const api = await createSimpleGrid(
            'true-count-agg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'count',
                groupRowValueSetter: { distribution: true },
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 99, 'ui');
        await asyncSetTimeout(0);

        // true at top level does NOT enable non-distributable aggFuncs — children unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('true in per-aggFunc record enables specific aggFunc', async () => {
        const api = await createSimpleGrid(
            'true-record-entry',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'myCustomAgg',
                groupRowValueSetter: { distribution: { myCustomAgg: true } },
            },
            undefined,
            { aggFuncs: CUSTOM_AGG_FUNCS }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 50, 'ui');
        await asyncSetTimeout(0);

        // true as a record entry enables with 'overwrite'
        expect(api.getRowNode('a1')?.data?.amount).toBe(50);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50);
    });

    test('true preserves built-in default for sum (uniform)', async () => {
        const api = await createSimpleGrid(
            'true-sum-default',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'sum',
                groupRowValueSetter: { distribution: true },
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        // true for sum still uses 'uniform' (built-in default)
        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
        expect(group.aggData?.amount).toBe(60);
    });

    test('true as default fallback enables custom aggFuncs', async () => {
        const api = await createSimpleGrid(
            'true-default-fallback',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                aggFunc: 'myCustomAgg',
                groupRowValueSetter: (params: GroupRowValueSetterParams) =>
                    distributeGroupValue(params, { default: true }),
            },
            undefined,
            { aggFuncs: CUSTOM_AGG_FUNCS }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // true as default fallback enables custom aggFuncs with 'overwrite'
        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
    });

    test('true in record overrides false from deep-merged defaultColDef', async () => {
        const api = await gridsManager.createGridAndWait('true-override-false', {
            defaultColDef: {
                cellEditor: 'agTextCellEditor',
                editable: true,
                groupRowEditable: true,
                groupRowValueSetter: { distribution: { count: false } },
            },
            groupDisplayType: 'custom',
            columnDefs: [
                { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                {
                    colId: 'amount',
                    field: 'amount',
                    aggFunc: 'count',
                    // Column-level true overrides defaultColDef's false after deep merge
                    groupRowValueSetter: { distribution: { count: true } },
                },
            ],
            rowData: [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            groupDefaultExpanded: -1,
            getRowId: (params: any) => params.data?.id,
        });
        await new GridColumns(api, `true in record overrides false from deep-merged defaultColDef setup`).checkColumns(
            `
                CENTER
                ├── group "Group" width:200 editable
                └── amount "Amount" width:200 aggFunc:count editable
            `
        );
        await new GridRows(api, `true in record overrides false from deep-merged defaultColDef setup`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:{"value":2}
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:{"value":2}
            · · ├── LEAF id:a1 region:"R" country:"C" amount:10
            · · └── LEAF id:a2 region:"R" country:"C" amount:20
        `);

        await asyncSetTimeout(0);

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 77, 'ui');
        await asyncSetTimeout(0);

        // true overrides false, enabling count with 'overwrite'
        expect(api.getRowNode('a1')?.data?.amount).toBe(77);
        expect(api.getRowNode('a2')?.data?.amount).toBe(77);
        await new GridRows(api, `true in record overrides false from deep-merged defaultColDef final state`).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-region-R amount:{"value":2}
            · └─┬ LEAF_GROUP id:row-group-region-R-country-C amount:{"value":2}
            · · ├── LEAF id:a1 region:"R" country:"C" amount:77
            · · └── LEAF id:a2 region:"R" country:"C" amount:77
        `);
    });
});
