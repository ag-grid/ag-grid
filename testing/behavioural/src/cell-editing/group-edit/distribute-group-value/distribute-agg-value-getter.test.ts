import type { AggValueGetterParams } from 'ag-grid-community';

import { EDIT_MODES, createGrid, distributeGroupValue, gridsManager, performEdit } from './distribute-test-utils';

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
