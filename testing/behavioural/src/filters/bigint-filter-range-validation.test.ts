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

    // A one-value option filters on the first input, so a refresh nobody drove must report that input rather
    // than the unused second one. A rebuild is such a refresh, and it hands the text to a fresh element.
    test('a one-value condition reports its own input again after a rebuild', async () => {
        const columnDefs = (allowedCharPattern?: string) => [
            {
                field: 'val',
                cellDataType: 'bigint' as const,
                filter: 'agBigIntColumnFilter',
                filterParams: {
                    debounceMs: 0,
                    filterOptions: ['equals'],
                    allowedCharPattern,
                    bigintParser: (text: string | null) => (text && /^\d+$/.test(text) ? BigInt(text) : null),
                },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs(),
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.setText('zz');
        expect(filter.input('text', 0).validity.valid).toBe(false);

        // Validity is recomputed on the replacement, not inherited.
        const before = filter.input('text', 0);
        api.setGridOption('columnDefs', columnDefs('\\d'));
        await asyncSetTimeout(0);

        const rebuilt = filter.input('text', 0);
        // Identity first: the value and the validity would both read the same had the element survived.
        expect(rebuilt).not.toBe(before);
        expect(rebuilt.value).toBe('zz');
        expect(rebuilt.validity.valid).toBe(false);
    });

    // A zero-input option reads neither input, so text left in one is not something it can be invalid for.
    test('a zero-input option is not held to the text an input still holds', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { debounceMs: 0, filterOptions: ['equals', 'blank'] },
                },
            ],
            rowData: [{ val: 1n }, { val: 16n }, { val: null }] as { val: bigint | null }[],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.setText('zz');
        expect(filter.input('text', 0).validity.valid).toBe(false);

        await filter.selectOperator('Blank');
        await asyncSetTimeout(0);

        // The condition shows no input at all, so applying is what proves its contents stopped counting.
        expect(filter.inputs('text', 0)).toHaveLength(0);
        expect(filter.getModel()).toEqual({ filterType: 'bigint', type: 'blank' });
        await new GridRows(api, 'blank applies over text the option never reads').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 val:null
        `);
    });

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

    test('a one-input option is not held to the range rule of the value left behind', async () => {
        const { api, filter } = await openRangeFilter('grid1');
        await filter.setText('16', 0);
        await filter.setText('100', 1);

        // `Equals` takes one value, so the 100 the range left in the hidden second input is not a bound on it.
        await filter.selectOperator('Equals');
        await filter.setText('255', 0);
        await asyncSetTimeout(0);

        expect(filter.input('text', 0).validity.valid).toBe(true);
        expect(filter.getModel()).toEqual({ filterType: 'bigint', type: 'equals', filter: '255' });
        await new GridRows(api, 'equals applies over a stale range bound').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:3 val:"255n"
        `);
    });

    test('a model applied through the API clears a stale range message', async () => {
        const { api, filter } = await openRangeFilter('grid1');
        await filter.setText('255', 0);
        await filter.setText('16', 1);
        expect(filter.input('text', 1).validity.valid).toBe(false);

        await api.setColumnFilterModel('val', {
            filterType: 'bigint',
            type: 'inRange',
            filter: '16',
            filterTo: '255',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The inputs hold an ordered range, so the message the old one left is gone. Their values are what
        // distinguishes that from a model that was dropped rather than displayed, which would be valid too.
        expect(filter.input('text', 0).validity.valid).toBe(true);
        expect(filter.input('text', 1).validity.valid).toBe(true);
        expect(filter.input('text', 0).value).toBe('16');
        expect(filter.input('text', 1).value).toBe('255');
        await new GridRows(api, 'the applied range filters, with no message left over').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 val:"100n"
        `);
    });

    // Closing discards uncommitted UI state, and a debounced apply has committed everything valid, so what
    // survives is the edit the user has not finished. A one-value condition is no less unfinished than a range.
    test('a one-value condition keeps the value it cannot apply across a close', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: { debounceMs: 0, filterOptions: ['equals'] },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.setText('zz');
        expect(filter.input('text', 0).validity.valid).toBe(false);

        api.hidePopupMenu();
        await asyncSetTimeout(0);

        const reopened = await ColumnFilterHarness.open(api, 'val');
        expect(reopened.input('text', 0).value).toBe('zz');
        expect(reopened.input('text', 0).validity.valid).toBe(false);
    });

    // A value the filter wrote stands for the input while the text still matches, so it is read back as the
    // value rather than re-parsed. A parser that cannot read the canonical decimal therefore reports nothing.
    test('a range the filter wrote is not called invalid by a parser that cannot re-read it', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        filterOptions: ['inRange', 'equals'],
                        // Reads hex alone, so the canonical decimals the model stores are text it refuses.
                        bigintParser: (text: string | null) =>
                            text && /^0x[0-9a-fA-F]+$/.test(text.trim()) ? BigInt(text.trim()) : null,
                    },
                },
            ],
            rowData: ROW_DATA,
        });

        await api.setColumnFilterModel('val', {
            filterType: 'bigint',
            type: 'inRange',
            filter: '16',
            filterTo: '255',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'val');
        await asyncSetTimeout(0);

        expect(filter.input('text', 0).value).toBe('16');
        expect(filter.input('text', 1).value).toBe('255');
        expect(filter.input('text', 0).validity.valid).toBe(true);
        expect(filter.input('text', 1).validity.valid).toBe(true);
        await new GridRows(api, 'the range the model set still filters').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 val:"100n"
        `);
    });
});
