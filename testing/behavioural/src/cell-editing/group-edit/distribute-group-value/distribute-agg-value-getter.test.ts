import type { AggValueGetterParams } from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    EDIT_MODES,
    asyncSetTimeout,
    createGrid,
    distributeGroupValue,
    gridsManager,
    performEdit,
} from './distribute-test-utils';

afterEach(() => {
    gridsManager.reset();
});

// an offset, so a distribution computed from the returned values gives different shares and deltas
const aggValueGetter = (params: AggValueGetterParams) => (params.aggValue as number) + 1000;

describe.each(EDIT_MODES)('distributeGroupValue with aggValueGetter (%s)', (editMode) => {
    test('percentage mode distributes the edited value as a new aggregate, by the stored child aggregates', async () => {
        const api = await createGrid('distribute-agg-value-getter-percentage', {
            aggValueGetter,
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'percentage' }),
        });
        const americas = api.getRowNode('row-group-region-Americas')!;
        expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1160);

        // USA 100 and Canada 60 keep their 5:3 share of 320
        await performEdit(editMode, api, americas, 'amount', 320);

        expect(americas.aggData?.amount).toBe(320);
        expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(200);
        expect(api.getRowNode('row-group-region-Americas-country-Canada')!.aggData?.amount).toBe(120);
        expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1320);
    });

    test('increment mode adds the difference from the stored aggregate', async () => {
        const api = await createGrid('distribute-agg-value-getter-increment', {
            aggValueGetter,
            groupRowValueSetter: (params) => distributeGroupValue(params, { distribution: 'increment' }),
        });
        const americas = api.getRowNode('row-group-region-Americas')!;

        await performEdit(editMode, api, americas, 'amount', 200);

        expect(americas.aggData?.amount).toBe(200);
        expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(120);
        expect(api.getRowNode('row-group-region-Americas-country-Canada')!.aggData?.amount).toBe(80);
    });
});

describe('group-row editing with aggValueGetter and no function groupRowValueSetter', () => {
    // warning #322 is expected here: groupRowEditable has no effect without a function groupRowValueSetter
    beforeEach(() => enableDevValidations({ suppress: [322] }));
    afterEach(() => enableDevValidations({ suppress: [] }));

    test.each([
        ['implicit distribution', {}],
        ['groupRowValueSetter: true', { groupRowValueSetter: true }],
        ['options object', { groupRowValueSetter: { distribution: 'percentage' as const } }],
    ])('%s: group cells are not editable and setDataValue leaves the data unchanged', async (_name, setterProps) => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await createGrid(`distribute-agg-value-getter-blocked-${_name}`, {
            aggValueGetter,
            ...setterProps,
        });
        const americas = api.getRowNode('row-group-region-Americas')!;
        const usaLeaf = api.getRowNode('row-group-region-Americas-country-USA')!.allLeafChildren![0];
        const amount = api.getColumn('amount')!;

        expect(amount.isCellEditable(americas)).toBe(false);
        expect(amount.isCellEditable(usaLeaf)).toBe(true);

        americas.setDataValue('amount', 320, 'ui');
        await asyncSetTimeout(0);

        expect(americas.aggData?.amount).toBe(160);
        expect(api.getRowNode('row-group-region-Americas-country-USA')!.aggData?.amount).toBe(100);
        expect(api.getCellValue({ rowNode: americas, colKey: 'amount' })).toBe(1160);
        warnSpy.mockRestore();
    });

    test('warns that groupRowEditable has no effect', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await createGrid('distribute-agg-value-getter-warning', { aggValueGetter });

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('`colDef.groupRowValueSetter` is a function');
        warnSpy.mockRestore();
    });

    test('does not warn with a function groupRowValueSetter', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await createGrid('distribute-agg-value-getter-no-warning', {
            aggValueGetter,
            groupRowValueSetter: (params) => distributeGroupValue(params),
        });

        expect(warnSpy.mock.calls.flat().join(' ')).not.toContain('warning #322');
        warnSpy.mockRestore();
    });
});
