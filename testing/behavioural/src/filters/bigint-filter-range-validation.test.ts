import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';

const ROW_DATA = [{ val: 1n }, { val: 16n }, { val: 100n }, { val: 255n }];

describe('BigInt Range Filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [BigIntFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    async function openRangeFilter(gridId: string): Promise<{ api: GridApi; filter: ColumnFilterHarness }> {
        const api: GridApi = await gridsManager.createGridAndWait(gridId, {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { debounceMs: 0, filterOptions: ['inRange', 'equals'] },
                },
            ],
            rowData: ROW_DATA,
        });
        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Between');
        return { api, filter };
    }

    test('an inverted range names the bound each input must respect', async () => {
        const { api, filter } = await openRangeFilter('grid1');

        await filter.setText('255', 0);
        await filter.setText('16', 1);

        // The `to` input was touched last, so it carries the message and must exceed `from`.
        expect(filter.input('text', 1).validity.valid).toBe(false);
        expect(filter.input('text', 1).validationMessage).toBe('Must be greater than 255');
        expect(filter.input('text', 0).validationMessage).toBe('');
        await new FilterDom(api, 'inverted range, to touched last', { mode: 'column-filter', colId: 'val' })
            .checkFilterDom(`
                COLUMN FILTER
                operator: "Between"
                input [0]: "255"
                input [1]: "16" ✗ "Must be greater than 255"
                model: null
            `);

        // Touching `from` moves the message across, mirrored to name the opposite bound.
        await filter.setText('256', 0);

        expect(filter.input('text', 0).validity.valid).toBe(false);
        expect(filter.input('text', 0).validationMessage).toBe('Must be less than 16');
        expect(filter.input('text', 1).validationMessage).toBe('');
        await new FilterDom(api, 'inverted range, from touched last', { mode: 'column-filter', colId: 'val' })
            .checkFilterDom(`
                COLUMN FILTER
                operator: "Between"
                input [0]: "256" ✗ "Must be less than 16"
                input [1]: "16"
                model: null
            `);
    });

    test('a from value equal to the to value is invalid', async () => {
        const { api, filter } = await openRangeFilter('grid1');

        await filter.setText('100', 0);
        await filter.setText('100', 1);

        // The bound is strict (`from >= to` is invalid), so an empty range is rejected.
        expect(filter.input('text', 1).validity.valid).toBe(false);
        await new GridRows(api, 'equal bigint range bounds leave rows unfiltered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 val:"1n"
            ├── LEAF id:1 val:"16n"
            ├── LEAF id:2 val:"100n"
            └── LEAF id:3 val:"255n"
        `);
    });

    test('an unparseable value is reported as invalid rather than compared', async () => {
        const { api, filter } = await openRangeFilter('grid1');

        await filter.setText('16', 0);
        await filter.setText('12.5', 1);

        // A non-integer is not a BigInt, so the type error is reported instead of a range message.
        expect(filter.input('text', 1).validity.valid).toBe(false);
        expect(filter.input('text', 1).validationMessage).toBe('Invalid BigInt');
        await new FilterDom(api, 'unparseable to value', { mode: 'column-filter', colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "16"
            input [1]: "12.5" ✗ "Invalid BigInt"
            model: null
        `);
    });

    test('a valid range clears the validation and filters the rows', async () => {
        const { api, filter } = await openRangeFilter('grid1');

        // Start invalid, then correct it: the message must clear, not linger.
        await filter.setText('255', 0);
        await filter.setText('16', 1);
        expect(filter.input('text', 1).validity.valid).toBe(false);

        await filter.setText('16', 0);
        await filter.setText('255', 1);
        await asyncSetTimeout(0);

        expect(filter.input('text', 0).validity.valid).toBe(true);
        expect(filter.input('text', 1).validity.valid).toBe(true);
        expect(filter.input('text', 1).validationMessage).toBe('');
        expect(filter.getModel()).toEqual({
            filterType: 'bigint',
            type: 'inRange',
            filter: '16',
            filterTo: '255',
        });
        await new GridRows(api, 'valid bigint range filters to the rows inside it').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 val:"100n"
        `);
    });

    test('switching to a single-input condition clears the range validation', async () => {
        const { filter } = await openRangeFilter('grid1');

        await filter.setText('255', 0);
        await filter.setText('16', 1);
        expect(filter.input('text', 1).validity.valid).toBe(false);

        // "Equals" takes one value, so the range bound no longer applies.
        await filter.selectOperator('Equals');
        await asyncSetTimeout(0);

        expect(filter.input('text', 0).validity.valid).toBe(true);
        expect(filter.input('text', 0).validationMessage).toBe('');
    });
});
