import { asyncSetTimeout, createSimpleGrid, distributeGroupValue, gridsManager } from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

describe('distributeGroupValue with custom getValue/setValue', () => {
    test('custom getValue reads from an alternative field', async () => {
        const api = await createSimpleGrid(
            'custom-get-value',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 0, customAmount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 0, customAmount: 20 },
                { id: 'a3', region: 'R', country: 'C', amount: 0, customAmount: 30 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: 'percentage',
                        getValue: ({ node }) => node.data?.customAmount ?? 0,
                    }),
            }
        );

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 120, 'ui');
        await asyncSetTimeout(0);

        // Percentage distribution based on customAmount (10:20:30 ratio = 1:2:3)
        // 120 * 10/60 = 20, 120 * 20/60 = 40, 120 * 30/60 = 60
        expect(api.getRowNode('a1')?.data?.amount).toBe(20);
        expect(api.getRowNode('a2')?.data?.amount).toBe(40);
        expect(api.getRowNode('a3')?.data?.amount).toBe(60);
    });

    test('custom setValue writes to an alternative field', async () => {
        const api = await createSimpleGrid(
            'custom-set-value',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10, output: 0 },
                { id: 'a2', region: 'R', country: 'C', amount: 20, output: 0 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        setValue: ({ node, value }) => {
                            const old = node.data?.output;
                            node.data.output = value;
                            return old !== value;
                        },
                    }),
            }
        );

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        // Values written to 'output' field instead of 'amount'
        expect(api.getRowNode('a1')?.data?.output).toBe(30);
        expect(api.getRowNode('a2')?.data?.output).toBe(30);

        // 'amount' field should be unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
        expect(api.getRowNode('a2')?.data?.amount).toBe(20);
    });

    test('custom getValue and setValue work together for increment mode', async () => {
        const api = await createSimpleGrid(
            'custom-io-increment',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10, weight: 100 },
                { id: 'a2', region: 'R', country: 'C', amount: 20, weight: 200 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: 'increment',
                        getValue: ({ node }) => node.data?.weight ?? 0,
                        setValue: ({ node, value }) => {
                            const old = node.data?.weight;
                            node.data.weight = value;
                            return old !== value;
                        },
                    }),
            }
        );

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        // oldValue=30 (sum of amount), newValue=40, delta=10 → each child gets +5 on weight
        groupNode.setDataValue('amount', 40, 'ui');
        await asyncSetTimeout(0);

        expect(api.getRowNode('a1')?.data?.weight).toBe(105);
        expect(api.getRowNode('a2')?.data?.weight).toBe(205);
    });

    test('custom setValue with options object syntax', async () => {
        const api = await createSimpleGrid(
            'custom-set-value-options',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10, target: 0 },
                { id: 'a2', region: 'R', country: 'C', amount: 20, target: 0 },
                { id: 'a3', region: 'R', country: 'C', amount: 30, target: 0 },
            ],
            {
                groupRowValueSetter: {
                    precision: 0,
                    setValue: ({ node, value }) => {
                        const old = node.data?.target;
                        node.data.target = value;
                        return old !== value;
                    },
                },
            }
        );

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 100, 'ui');
        await asyncSetTimeout(0);

        // 100 / 3 = 33 remainder 1 → [34, 33, 33]
        expect(api.getRowNode('a1')?.data?.target).toBe(34);
        expect(api.getRowNode('a2')?.data?.target).toBe(33);
        expect(api.getRowNode('a3')?.data?.target).toBe(33);

        // amount field unchanged
        expect(api.getRowNode('a1')?.data?.amount).toBe(10);
    });

    test('custom getValue with first aggFunc is suppressed by default', async () => {
        const api = await createSimpleGrid(
            'custom-get-first',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 5, score: 100 },
                { id: 'a2', region: 'R', country: 'C', amount: 15, score: 50 },
                { id: 'a3', region: 'R', country: 'C', amount: 25, score: 200 },
            ],
            {
                aggFunc: 'first',
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        getValue: ({ node }) => node.data?.score ?? 0,
                    }),
            }
        );

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 42, 'ui');
        await asyncSetTimeout(0);

        // first is non-distributable by default — children unchanged even with custom getValue
        expect(api.getRowNode('a1')?.data?.amount).toBe(5);
        expect(api.getRowNode('a2')?.data?.amount).toBe(15);
        expect(api.getRowNode('a3')?.data?.amount).toBe(25);
    });

    test('getValue/setValue receive api, context, node, colDef', async () => {
        const receivedGetParams: any[] = [];
        const receivedSetParams: any[] = [];

        const api = await createSimpleGrid(
            'custom-io-params',
            [
                { id: 'a1', region: 'R', country: 'C', amount: 10 },
                { id: 'a2', region: 'R', country: 'C', amount: 20 },
            ],
            {
                groupRowValueSetter: (params) =>
                    distributeGroupValue(params, {
                        distribution: 'percentage',
                        getValue: (p) => {
                            receivedGetParams.push(p);
                            return p.node.getDataValue(p.column, 'value');
                        },
                        setValue: (p) => {
                            receivedSetParams.push(p);
                            return p.node.setDataValue(p.column, p.value, 'data');
                        },
                    }),
            }
        );

        const groupNode = api.getRowNode('row-group-region-R-country-C')!;
        groupNode.setDataValue('amount', 60, 'ui');
        await asyncSetTimeout(0);

        // getValue called for percentage (reads each child)
        expect(receivedGetParams.length).toBeGreaterThan(0);
        const gp = receivedGetParams[0];
        expect(gp.api).toBe(api);
        expect(gp.groupParams.node).toBe(groupNode);
        expect(gp.node).toBeDefined();
        expect(gp.data).toBe(gp.node.data);
        expect(gp.column).toBeDefined();
        expect(gp.colDef).toBeDefined();
        expect(gp.colDef.field).toBe('amount');

        // setValue called for each child
        expect(receivedSetParams.length).toBe(2);
        const sp = receivedSetParams[0];
        expect(sp.api).toBe(api);
        expect(sp.groupParams.node).toBe(groupNode);
        expect(sp.node).toBeDefined();
        expect(sp.data).toBe(sp.node.data);
        expect(sp.value).toBeDefined();
        expect(typeof sp.value).toBe('number');
    });
});
