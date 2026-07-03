import type { GroupRowValueSetterOptions, GroupRowValueSetterParams } from 'ag-grid-community';

import { asyncSetTimeout, createSimpleGrid, distributeGroupValue, gridsManager } from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

// --- Auto integer detection via cellEditorParams ---

describe('auto integer detection from cellEditorParams', () => {
    test('precision=0 auto-enables integer distribution', async () => {
        const api = await createSimpleGrid(
            'auto-int-precision',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: distributeGroupValue, cellEditorParams: { precision: 0 } }
        );

        // 10 / 3 = 3.33, auto integer rounds → [4, 3, 3]
        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
    });

    test('step=1 auto-enables integer distribution', async () => {
        const api = await createSimpleGrid(
            'auto-int-step',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: distributeGroupValue, cellEditorParams: { step: 1 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(4);
        expect(api.getRowNode('a2')?.data?.amount).toBe(3);
        expect(api.getRowNode('a3')?.data?.amount).toBe(3);
    });

    test('step=0.5 does NOT auto-enable integer distribution', async () => {
        const api = await createSimpleGrid(
            'auto-int-step-decimal',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 10 },
                { id: 'a3', region: 'R', country: 'C', amount: 10 },
            ],
            { groupRowValueSetter: distributeGroupValue, cellEditorParams: { step: 0.5 } }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 10, 'ui');
        await asyncSetTimeout(0);

        // 10/3 = 3.333..., no rounding applied
        const v1 = api.getRowNode('a1')?.data?.amount;
        const v2 = api.getRowNode('a2')?.data?.amount;
        const v3 = api.getRowNode('a3')?.data?.amount;
        expect(v1).toBeCloseTo(10 / 3, 10);
        expect(v2).toBeCloseTo(10 / 3, 10);
        expect(v3).toBeCloseTo(10 / 3, 10);
    });
});

// --- Non-numeric newValue ---

describe('non-numeric newValue handling', () => {
    test('null newValue overwrites all children', async () => {
        const api = await createSimpleGrid(
            'non-numeric-null',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', null, 'ui');
        await asyncSetTimeout(0);

        // Non-numeric null → overwrite all children
        expect(api.getRowNode('a1')?.data?.amount).toBe(null);
        expect(api.getRowNode('a2')?.data?.amount).toBe(null);
    });
});

// --- Direct distributeGroupValue tests for value conversion (bypasses grid's data type checks) ---

describe('numeric-like newValue handling (direct distributeGroupValue calls)', () => {
    type MockChild = Pick<
        GroupRowValueSetterParams['aggregatedChildren'][number],
        'data' | 'getDataValue' | 'setDataValue'
    >;

    /** Creates mock children that track writes via setDataValue. */
    function mockChildren(values: number[]): MockChild[] {
        return values.map((v, i) => {
            const data = { amount: v };
            return {
                id: `child-${i}`,
                data,
                getDataValue: () => data.amount,
                setDataValue: (_col: GroupRowValueSetterParams['column'], val: unknown) => {
                    const old = data.amount;
                    data.amount = val as number;
                    return old !== val;
                },
            };
        });
    }

    function callDistribute(
        newValue: unknown,
        oldValue: unknown,
        children: MockChild[],
        opts?: GroupRowValueSetterOptions
    ) {
        return distributeGroupValue(
            {
                aggregatedChildren: children as GroupRowValueSetterParams['aggregatedChildren'],
                column: {} as GroupRowValueSetterParams['column'],
                colDef: { aggFunc: 'sum' } as GroupRowValueSetterParams['colDef'],
                newValue,
                oldValue,
                data: undefined,
                eventSource: 'ui',
                valueChanged: true,
                node: {} as GroupRowValueSetterParams['node'],
                api: {} as GroupRowValueSetterParams['api'],
                context: undefined,
            },
            opts
        );
    }

    test('object with .toNumber() distributes extracted value (uniform)', () => {
        const children = mockChildren([10, 20]);
        callDistribute({ toNumber: () => 60 }, 30, children);
        expect(children[0].data.amount).toBe(30);
        expect(children[1].data.amount).toBe(30);
    });

    test('object with .toNumber() returning 0 distributes zero (not raw object)', () => {
        const children = mockChildren([10, 20]);
        callDistribute({ toNumber: () => 0 }, 30, children);
        // IS numeric (has .toNumber) → distributes 0, not raw object
        expect(children[0].data.amount).toBe(0);
        expect(children[1].data.amount).toBe(0);
    });

    test('object with .value property distributes extracted value', () => {
        const children = mockChildren([10, 20]);
        callDistribute({ value: 80 }, 30, children);
        expect(children[0].data.amount).toBe(40);
        expect(children[1].data.amount).toBe(40);
    });

    test('object with .value=0 distributes zero (not raw object)', () => {
        const children = mockChildren([10, 20]);
        callDistribute({ value: 0 }, 30, children);
        expect(children[0].data.amount).toBe(0);
        expect(children[1].data.amount).toBe(0);
    });

    test('object with nested .value distributes recursively extracted value', () => {
        const children = mockChildren([10, 20]);
        callDistribute({ value: { value: 100 } }, 30, children);
        expect(children[0].data.amount).toBe(50);
        expect(children[1].data.amount).toBe(50);
    });

    test('numeric string distributes the parsed number', () => {
        const children = mockChildren([10, 20]);
        callDistribute('60', 30, children);
        expect(children[0].data.amount).toBe(30);
        expect(children[1].data.amount).toBe(30);
    });

    test('numeric string "0" distributes zero (not raw string)', () => {
        const children = mockChildren([10, 20]);
        callDistribute('0', 30, children);
        expect(children[0].data.amount).toBe(0);
        expect(children[1].data.amount).toBe(0);
    });

    test('boolean true distributes as 1', () => {
        const children = mockChildren([10, 20]);
        callDistribute(true, 0, children);
        // toNumber(true)=1, uniform over 2 → 0.5 each
        expect(children[0].data.amount).toBe(0.5);
        expect(children[1].data.amount).toBe(0.5);
    });

    test('boolean false distributes as 0 (not raw false)', () => {
        const children = mockChildren([10, 20]);
        callDistribute(false, 30, children);
        // toNumber(false)=0, IS numeric → distributes 0
        expect(children[0].data.amount).toBe(0);
        expect(children[1].data.amount).toBe(0);
    });

    test('null overwrites all children with raw value', () => {
        const children = mockChildren([10, 20]);
        callDistribute(null, 30, children);
        // null is NOT numeric → writes raw null
        expect(children[0].data.amount).toBe(null);
        expect(children[1].data.amount).toBe(null);
    });

    test('undefined overwrites all children with raw value', () => {
        const children = mockChildren([10, 20]);
        callDistribute(undefined, 30, children);
        expect(children[0].data.amount).toBe(undefined);
        expect(children[1].data.amount).toBe(undefined);
    });

    test('non-numeric string overwrites all children with raw value', () => {
        const children = mockChildren([10, 20]);
        callDistribute('hello', 30, children);
        expect(children[0].data.amount).toBe('hello');
        expect(children[1].data.amount).toBe('hello');
    });

    test('plain object without .toNumber or .value overwrites all children', () => {
        const children = mockChildren([10, 20]);
        const obj = { foo: 'bar' };
        callDistribute(obj, 30, children);
        expect(children[0].data.amount).toBe(obj);
        expect(children[1].data.amount).toBe(obj);
    });

    test('object with .toNumber() works with percentage distribution', () => {
        const children = mockChildren([10, 30]);
        // total=40, target=80, scale=2 → a1=20, a2=60
        callDistribute({ toNumber: () => 80 }, 40, children, { distribution: 'percentage' });
        expect(children[0].data.amount).toBe(20);
        expect(children[1].data.amount).toBe(60);
    });

    test('object with .value works with increment distribution', () => {
        const children = mockChildren([10, 20]);
        // oldValue=30, newValue.value=40 → delta=10, each child gets +5
        callDistribute({ value: 40 }, 30, children, { distribution: 'increment' });
        expect(children[0].data.amount).toBe(15);
        expect(children[1].data.amount).toBe(25);
    });

    test('object with .toNumber() returning 0 with integer distribution distributes 0', () => {
        const children = mockChildren([10, 20, 30]);
        callDistribute({ toNumber: () => 0 }, 60, children, { precision: 0 });
        expect(children[0].data.amount).toBe(0);
        expect(children[1].data.amount).toBe(0);
        expect(children[2].data.amount).toBe(0);
    });
});

// --- Integration tests with cellDataType: false (objects flow through full grid pipeline) ---

describe('numeric-like newValue with cellDataType: false (grid integration)', () => {
    test('object with .toNumber() distributes via grid setDataValue', async () => {
        const api = await createSimpleGrid(
            'cdt-false-toNumber',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', { toNumber: () => 60 }, 'ui');
        await asyncSetTimeout(0);

        // toNumber() returns 60, uniform over 2 → 30 each
        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
    });

    test('object with .toNumber() returning 0 distributes zero (not raw object)', async () => {
        const api = await createSimpleGrid(
            'cdt-false-toNumber-zero',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', { toNumber: () => 0 }, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
    });

    test('object with .value property distributes via grid setDataValue', async () => {
        const api = await createSimpleGrid(
            'cdt-false-dot-value',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', { value: 80 }, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(40);
        expect(api.getRowNode('a2')?.data?.amount).toBe(40);
    });

    test('object with .value=0 distributes zero (not raw object)', async () => {
        const api = await createSimpleGrid(
            'cdt-false-dot-value-zero',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', { value: 0 }, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
    });

    test('object with .toNumber() works with percentage distribution', async () => {
        const api = await createSimpleGrid(
            'cdt-false-toNumber-pct',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 30 },
            ],
            {
                cellDataType: false,
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', { toNumber: () => 80 }, 'ui');
        await asyncSetTimeout(0);

        // total=40, target=80, scale=2 → a1=20, a2=60
        expect(api.getRowNode('a1')?.data?.amount).toBe(20);
        expect(api.getRowNode('a2')?.data?.amount).toBe(60);
    });

    test('object with .value works with increment distribution', async () => {
        const api = await createSimpleGrid(
            'cdt-false-dot-value-inc',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                cellDataType: false,
                groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
            }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        // oldValue=30, newValue.value=40 → delta=10, each child gets +5
        group.setDataValue('amount', { value: 40 }, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(15);
        expect(api.getRowNode('a2')?.data?.amount).toBe(25);
    });

    test('boolean false distributes as 0 via grid setDataValue', async () => {
        const api = await createSimpleGrid(
            'cdt-false-boolean',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', false, 'ui');
        await asyncSetTimeout(0);

        // boolean false → toNumber=0, IS numeric → distributes 0
        expect(api.getRowNode('a1')?.data?.amount).toBe(0);
        expect(api.getRowNode('a2')?.data?.amount).toBe(0);
    });

    test('numeric string distributes the parsed number', async () => {
        const api = await createSimpleGrid(
            'cdt-false-numeric-string',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', '60', 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(30);
        expect(api.getRowNode('a2')?.data?.amount).toBe(30);
    });

    test('non-numeric string overwrites all children with raw value', async () => {
        const api = await createSimpleGrid(
            'cdt-false-non-numeric-string',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        group.setDataValue('amount', 'hello', 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe('hello');
        expect(api.getRowNode('a2')?.data?.amount).toBe('hello');
    });

    test('plain object without .toNumber or .value overwrites all children', async () => {
        const api = await createSimpleGrid(
            'cdt-false-plain-obj',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            { cellDataType: false, groupRowValueSetter: distributeGroupValue }
        );

        const group = api.getRowNode('row-group-region-R-country-C')!;
        const obj = { foo: 'bar' };
        group.setDataValue('amount', obj, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.amount).toBe(obj);
        expect(api.getRowNode('a2')?.data?.amount).toBe(obj);
    });
});
