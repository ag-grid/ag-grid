import type { GroupRowValueSetterParams } from 'ag-grid-community';

import {
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

    test('built-in aggFunc not in record without default handler overwrites all', async () => {
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

        // sum is not in the record, no default handler → overwrites all children
        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
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

    test('unknown aggFunc without record or default handler defaults to overwrite', async () => {
        const api = await gridsManager.createGridAndWait('default-overwrite', {
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

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // Custom aggFunc (function, not string) → overwrites all
        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
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

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // myCustomAgg is not in the record, default handler sets all to 0
        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
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
    test('unknown string aggFunc without default handler overwrites all', async () => {
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

        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
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

// --- 'none' strategy ---

describe("'none' distribution strategy", () => {
    test("'none' string suppresses distribution", async () => {
        const api = await createSimpleGrid(
            'none-string',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'none' }) }
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

    test("'none' in per-aggFunc record suppresses for that aggFunc only", async () => {
        const api = await createSimpleGrid(
            'none-record',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: { sum: 'none' } }) }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('false in per-aggFunc record suppresses for that aggFunc only', async () => {
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

    test("'none' on colDef options object suppresses distribution", async () => {
        const api = await createSimpleGrid(
            'none-coldef',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: { distribution: 'none' } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

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
    test('record with missing aggFunc key and no default uses built-in overwrite', async () => {
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

        // count is not in record, no default → falls back to built-in writeAll
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
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

    test('first aggFunc short-circuits even with distribution options present', async () => {
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

        // first always sets only the first child, distribution options are ignored
        expect(api.getRowNode('a1')?.data?.amount).toBe(99);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('last aggFunc short-circuits even with distribution options present', async () => {
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

        // last always sets only the last child, distribution options are ignored
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
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

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        expect(customCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(555);
        expect(api.getRowNode('a2')?.data?.amount).toBe(555);
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

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // Custom aggFunc (function) → aggFunc resolves to null → not in record → default handler
        expect(defaultCalls).toHaveLength(1);
        expect(api.getRowNode('a1')?.data?.amount).toBe(888);
        expect(api.getRowNode('a2')?.data?.amount).toBe(888);
    });

    test('custom (non-string) aggFunc with no default overwrites all', async () => {
        const api = await gridsManager.createGridAndWait('coldef-custom-agg-no-default', {
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

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // Custom aggFunc, not in record, no default → writeAll
        expect(api.getRowNode('a1')?.data?.amount).toBe(42);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42);
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
