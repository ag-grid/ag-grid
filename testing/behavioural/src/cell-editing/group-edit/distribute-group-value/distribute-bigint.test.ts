import type { ColDef } from 'ag-grid-community';

import { asyncSetTimeout, distributeGroupValue, gridsManager } from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

const bigintSum = (params: any) => {
    let sum = 0n;
    for (const v of params.values) {
        if (typeof v === 'bigint') {
            sum += v;
        }
    }
    return sum;
};

const createBigIntGrid = (id: string, rowData: any[], extraColProps?: ColDef) =>
    gridsManager.createGridAndWait(id, {
        defaultColDef: { cellEditor: 'agTextCellEditor' },
        groupDisplayType: 'custom',
        columnDefs: [
            { colId: 'group', headerName: 'Group', cellRenderer: 'agGroupCellRenderer' },
            { field: 'region', rowGroup: true, hide: true },
            { field: 'country', rowGroup: true, hide: true },
            {
                colId: 'amount',
                field: 'amount',
                cellDataType: 'bigint',
                aggFunc: bigintSum,
                editable: true,
                groupRowEditable: true,
                ...extraColProps,
            },
        ],
        rowData,
        groupDefaultExpanded: -1,
        getRowId: (params) => params.data?.id,
    });

describe('bigint distribution', () => {
    test('bigint uniform distributes evenly with remainder', async () => {
        const api = await createBigIntGrid(
            'bigint-uniform',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10n },
                { id: 'a2', region: 'R', country: 'C', amount: 10n },
                { id: 'a3', region: 'R', country: 'C', amount: 10n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'uniform' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10n, 'ui');
        await asyncSetTimeout(0);

        // 10 / 3 = 3 remainder 1 → [4, 3, 3]
        expect(api.getRowNode('a1')?.data?.amount).toBe(4n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3n);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3n);
    });

    test('bigint percentage preserves proportions', async () => {
        const api = await createBigIntGrid(
            'bigint-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30n },
                { id: 'a2', region: 'R', country: 'C', amount: 70n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 200n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(60n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(140n);
    });

    test('bigint percentage with zero total falls back to uniform', async () => {
        const api = await createBigIntGrid(
            'bigint-pct-zero',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 0n },
                { id: 'a2', region: 'R', country: 'C', amount: 0n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(50n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50n);
    });

    test('bigint increment sum distributes delta', async () => {
        const api = await createBigIntGrid(
            'bigint-inc-sum',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10n },
                { id: 'a2', region: 'R', country: 'C', amount: 40n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
            }
        );

        // sum=50, set to 70, delta=20, each gets +10
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 70n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(20n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50n);
    });

    test('bigint increment avg adds full delta to each child', async () => {
        const api = await createBigIntGrid(
            'bigint-inc-avg',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 20n },
                { id: 'a2', region: 'R', country: 'C', amount: 40n },
            ],
            {
                aggFunc: 'avg',
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
            }
        );

        // avg=30, set to 40, delta=+10 → each child gets +10
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 40n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50n);
    });

    test('bigint overwrite writes newValue to all children', async () => {
        const api = await createBigIntGrid(
            'bigint-overwrite',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10n },
                { id: 'a2', region: 'R', country: 'C', amount: 20n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'overwrite' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 42n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(42n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(42n);
    });

    test('bigint increment sum with remainder', async () => {
        const api = await createBigIntGrid(
            'bigint-inc-sum-rem',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10n },
                { id: 'a2', region: 'R', country: 'C', amount: 10n },
                { id: 'a3', region: 'R', country: 'C', amount: 10n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
            }
        );

        // sum=30, set to 40, delta=10, 10/3 = 3 remainder 1 → [14, 13, 13]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 40n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(14n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(13n);
        expect(api.getRowNode('a3')?.data?.amount).toBe(13n);
    });

    test('bigint avg uniform writes newValue to all children', async () => {
        const api = await createBigIntGrid(
            'bigint-avg-uniform',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 20n },
                { id: 'a2', region: 'R', country: 'C', amount: 40n },
            ],
            {
                aggFunc: 'avg',
                groupRowValueSetter: distributeGroupValue,
            }
        );

        // avg uniform → writes newValue to all (so avg equals newValue)
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 50n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(50n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50n);
    });
});

describe('bigint edge cases', () => {
    test('negative bigint distributes correctly', async () => {
        const api = await createBigIntGrid(
            'bigint-negative',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30n },
                { id: 'a2', region: 'R', country: 'C', amount: 70n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'uniform' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', -100n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(-50n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(-50n);
    });

    test('bigint increment with negative delta', async () => {
        const api = await createBigIntGrid(
            'bigint-neg-inc',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 40n },
                { id: 'a2', region: 'R', country: 'C', amount: 60n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
            }
        );

        // sum=100, set to 80, delta=-20, each gets -10
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 80n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50n);
    });

    test('bigint percentage with negative target', async () => {
        const api = await createBigIntGrid(
            'bigint-neg-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 30n },
                { id: 'a2', region: 'R', country: 'C', amount: 70n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
            }
        );

        // [30, 70] total=100, target=-200, scale=-2 → [-60, -140]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', -200n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(-60n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(-140n);
    });

    test('bigint increment with zero delta returns false', async () => {
        const api = await createBigIntGrid(
            'bigint-zero-delta',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 50n },
                { id: 'a2', region: 'R', country: 'C', amount: 50n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
            }
        );

        // sum=100, set to 100 → delta=0 → no change
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 100n, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(50n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(50n);
    });

    test('bigint null passthrough writes null to all children', async () => {
        const api = await createBigIntGrid(
            'bigint-null',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10n },
                { id: 'a2', region: 'R', country: 'C', amount: 20n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'uniform' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', null, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(null);
        expect(api.getRowNode('a2')?.data?.amount).toBe(null);
    });

    test('very large bigint distributes correctly', async () => {
        const api = await createBigIntGrid(
            'bigint-very-large',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 1000000000000000000n },
                { id: 'a2', region: 'R', country: 'C', amount: 1000000000000000000n },
            ],
            {
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'uniform' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 999999999999999999n, 'ui');
        await asyncSetTimeout(0);

        // 999999999999999999 / 2 = 499999999999999999 remainder 1 → [500000000000000000, 499999999999999999]
        expect(api.getRowNode('a1')?.data?.amount).toBe(500000000000000000n);
        expect(api.getRowNode('a2')?.data?.amount).toBe(499999999999999999n);
    });
});
