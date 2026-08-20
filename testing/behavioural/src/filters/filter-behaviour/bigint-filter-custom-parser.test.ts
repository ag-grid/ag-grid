import {
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';

/**
 * A custom `bigintParser` must be used when building the filter model, not only during input
 * validation, so hex input (`0xFF`) filters using the parsed BigInt rather than being dropped.
 */
describe('BigInt Filter — custom bigintParser', () => {
    const gridsManager = new TestGridsManager({
        modules: [BigIntFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('a hex value entered via a custom bigintParser is applied to the filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        allowedCharPattern: '\\dxXa-fA-F',
                        bigintParser: (text: string | null) =>
                            text == null || text.trim() === '' ? null : BigInt(text),
                    },
                },
            ],
            rowData: [{ val: 255n }, { val: 16n }, { val: 1n }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Equals');
        await filter.setText('0xFF', 0);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'bigint', type: 'equals', filter: '255' });
        // The input keeps the hex as typed while the model holds what the parser made of it.
        await new FilterDom(api, 'hex typed, decimal model', { mode: 'column-filter', colId: 'val' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "0xFF"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "bigint"
              type: "equals"
              filter: "255"
        `);
        await new GridRows(api, 'hex value filters to the matching bigint row').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 val:"255n"
        `);
    });

    test('hex from/to values are both parsed for a range condition', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        allowedCharPattern: '\\dxXa-fA-F',
                        bigintParser: (text: string | null) =>
                            text == null || text.trim() === '' ? null : BigInt(text),
                    },
                },
            ],
            rowData: [{ val: 1n }, { val: 16n }, { val: 100n }, { val: 255n }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.selectOperator('Between');
        await filter.setText('0x10', 0);
        await filter.setText('0xFF', 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'hex range, both bounds parsed', { mode: 'column-filter', colId: 'val' })
            .checkFilterDom(`
                COLUMN FILTER
                operator: "Between"
                input [0]: "0x10"
                input [1]: "0xFF"
                AND
                operator: "Equals"
                input: "" ⟨Filter...⟩
                model:
                  filterType: "bigint"
                  type: "inRange"
                  filter: "16"
                  filterTo: "255"
            `);
        expect(filter.getModel()).toEqual({
            filterType: 'bigint',
            type: 'inRange',
            filter: '16',
            filterTo: '255',
        });
        await new GridRows(api, 'hex range bounds filter to the row inside the range').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 val:"100n"
        `);
    });

    // A pattern is used as a character class, so one already written as a class must not be wrapped twice.
    test.each([
        ['bare characters', '\\dxXa-fA-F'],
        ['a character class', '[\\dxXa-fA-F]'],
    ])('allowedCharPattern written as %s admits the same keys', async (_name, allowedCharPattern) => {
        const api: GridApi = await gridsManager.createGridAndWait('grid10', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint' as const,
                    filter: 'agBigIntColumnFilter' as const,
                    filterParams: { debounceMs: 0, allowedCharPattern },
                },
            ],
            rowData: [{ val: 255n }],
        });
        const filter = await ColumnFilterHarness.open(api, 'val');
        const rejectsKey = (key: string): boolean => {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            filter.inputs('text', 0)[0].dispatchEvent(event);
            return event.defaultPrevented;
        };

        expect([rejectsKey('5'), rejectsKey('F'), rejectsKey('x')]).toEqual([false, false, false]);
        expect(rejectsKey('z')).toBe(true);
    });

    test('an allowedCharPattern replaced at runtime reaches inputs built before the change', async () => {
        const columnDefs = (allowedCharPattern: string) => [
            {
                field: 'val',
                cellDataType: 'bigint' as const,
                filter: 'agBigIntColumnFilter' as const,
                filterParams: {
                    debounceMs: 0,
                    allowedCharPattern,
                    bigintParser: (text: string | null) => (text == null || text.trim() === '' ? null : BigInt(text)),
                },
            },
        ];

        const api: GridApi = await gridsManager.createGridAndWait('grid3', {
            // Decimal only, so the inputs built here reject the `x` and `F` a hex value needs.
            columnDefs: columnDefs('\\d'),
            rowData: [{ val: 255n }, { val: 16n }],
        });

        // Built before the swap: an input reads `allowedCharPattern` once, when it is created.
        const filter = await ColumnFilterHarness.open(api, 'val');

        // The pattern is a keydown guard, so only a real keystroke shows which pattern an input is holding.
        const rejectsKey = (key: string): boolean => {
            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            filter.inputs('text', 0)[0].dispatchEvent(event);
            return event.defaultPrevented;
        };

        expect(rejectsKey('F')).toBe(true);

        api.setGridOption('columnDefs', columnDefs('\\dxXa-fA-F'));
        await asyncSetTimeout(0);

        // Only a replaced element carries the new pattern; the guard is installed once, at build time.
        expect(rejectsKey('F')).toBe(false);

        await filter.selectOperator('Equals');
        await filter.setText('0xFF', 0);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'bigint', type: 'equals', filter: '255' });
        await new FilterDom(api, 'hex after allowedCharPattern swap', { mode: 'column-filter', colId: 'val' })
            .checkFilterDom(`
                COLUMN FILTER
                operator: "Equals"
                input: "0xFF"
                AND
                operator: "Equals"
                input: "" ⟨Filter...⟩
                model:
                  filterType: "bigint"
                  type: "equals"
                  filter: "255"
            `);
        await new GridRows(api, 'hex accepted after the pattern was replaced').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 val:"255n"
        `);
    });

    // The first reads back through `bigintParser`; the second is grouped, so nothing reads its own output back.
    const FORMATTER_CASES = [
        [
            'read back by its parser',
            {
                debounceMs: 0,
                allowedCharPattern: '\\dxXa-fA-F',
                bigintParser: (text: string | null) => (text == null || text.trim() === '' ? null : BigInt(text)),
                bigintFormatter: (value: bigint | null) => (value == null ? null : `0x${value.toString(16)}`),
            },
            '255',
            '0xff',
        ],
        [
            'nothing reads back',
            {
                debounceMs: 0,
                bigintFormatter: (value: bigint | null) => (value == null ? null : value.toLocaleString('en-US')),
            },
            '1234',
            '1,234',
        ],
    ] as const;

    const BIGINT_COLUMN = { field: 'val', cellDataType: 'bigint' as const, filter: 'agBigIntColumnFilter' as const };
    const BIGINT_ROWS = [{ val: 255n }, { val: 1234n }, { val: 16n }];

    test.each(FORMATTER_CASES)(
        'a bigintFormatter %s shows in the filter inputs, and the model it came from stands',
        async (_name, filterParams, filter, shown) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ ...BIGINT_COLUMN, filterParams }],
                rowData: BIGINT_ROWS,
            });
            await api.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter });

            const columnFilter = await ColumnFilterHarness.open(api, 'val');
            expect(columnFilter.inputs('text', 0)[0].value).toBe(shown);
            expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'bigint', type: 'equals', filter });
        }
    );

    test.each(FORMATTER_CASES)(
        'a bigintFormatter %s shows in the floating filter too',
        async (_name, filterParams, filter, shown) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ ...BIGINT_COLUMN, floatingFilter: true, filterParams }],
                rowData: BIGINT_ROWS,
            });
            await api.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter });
            await api.onFilterChanged();

            expect(FloatingFilterHarness.get(api, 'val').input().value).toBe(shown);
            expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'bigint', type: 'equals', filter });
        }
    );

    test('a bigintFormatter replaced at runtime re-renders the inputs it already wrote', async () => {
        const columnDefs = (suffix: string) => [
            {
                field: 'val',
                cellDataType: 'bigint' as const,
                filter: 'agBigIntColumnFilter' as const,
                filterParams: {
                    debounceMs: 0,
                    bigintFormatter: (value: bigint | null) => (value == null ? null : `${value}${suffix}`),
                },
            },
        ];

        const api: GridApi = await gridsManager.createGridAndWait('grid9', {
            columnDefs: columnDefs(' old'),
            rowData: [{ val: 1234n }, { val: 16n }],
        });
        await api.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter: '1234' });

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text', 0)[0].value).toBe('1234 old');

        api.setGridOption('columnDefs', columnDefs(' new'));
        await asyncSetTimeout(0);

        expect(filter.inputs('text', 0)[0].value).toBe('1234 new');
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'bigint', type: 'equals', filter: '1234' });
    });

    test('a floating filter rebuilt for a new allowedCharPattern carries what was being typed', async () => {
        const columnDefs = (allowedCharPattern: string) => [
            {
                field: 'val',
                cellDataType: 'bigint' as const,
                filter: 'agBigIntColumnFilter' as const,
                floatingFilter: true,
                // An apply button holds the typed value in the input, which is what the rebuild has to carry.
                filterParams: { buttons: ['apply' as const], allowedCharPattern },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid4', {
            columnDefs: columnDefs('\\d'),
            rowData: [{ val: 255n }, { val: 16n }],
        });

        await FloatingFilterHarness.get(api, 'val').setValue('16');
        api.setGridOption('columnDefs', columnDefs('\\dxXa-fA-F'));
        await asyncSetTimeout(0);

        expect(FloatingFilterHarness.get(api, 'val').input().value).toBe('16');
    });
});
