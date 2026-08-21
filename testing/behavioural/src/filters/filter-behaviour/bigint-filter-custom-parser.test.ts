import { userEvent } from '@testing-library/user-event';
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

import type { FilterInputCallbackParams, GridApi } from 'ag-grid-community';
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

    // Here rather than in `allowed-char-pattern.test.ts` because the swap also has to reach the parser:
    // what the new pattern admits has to survive being read back into the model.
    test('an allowedCharPattern replaced at runtime is read back by the parser', async () => {
        const columnDefs = (allowedCharPattern: string) => [
            {
                field: 'val',
                cellDataType: 'bigint' as const,
                filter: 'agBigIntColumnFilter' as const,
                filterParams: {
                    debounceMs: 0,
                    allowedCharPattern,
                    // Typing reaches the parser mid-value, where `0x` is not yet a bigint.
                    bigintParser: (text: string | null) => {
                        try {
                            return text?.trim() ? BigInt(text) : null;
                        } catch {
                            return null;
                        }
                    },
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

        // The pattern refuses the edit, so only real typing shows which pattern an input is holding.
        const userSession = userEvent.setup();
        const typeHex = async (): Promise<string> => {
            const input = filter.inputs('text', 0)[0];
            await userSession.clear(input);
            await userSession.type(input, '0xF');
            return input.value;
        };

        // Decimal only, so both `x` and `F` are dropped where they were typed.
        expect(await typeHex()).toBe('0');

        api.setGridOption('columnDefs', columnDefs('\\dxXa-fA-F'));
        await asyncSetTimeout(0);

        // Only a replaced element carries the new pattern; the guard is installed once, at build time.
        expect(await typeHex()).toBe('0xF');

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

    test('the parser and the formatter are given the api and the context', async () => {
        const context = { tag: 'bigint' };
        // Kept apart: one array cannot tell "both were given it" from "only one of them ran".
        const parserSaw: FilterInputCallbackParams[] = [];
        const formatterSaw: FilterInputCallbackParams[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid5', {
            context,
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint' as const,
                    filter: 'agBigIntColumnFilter' as const,
                    filterParams: {
                        debounceMs: 0,
                        bigintParser: (text: string | null, common: FilterInputCallbackParams) => {
                            parserSaw.push(common);
                            return text == null || text.trim() === '' ? null : BigInt(text);
                        },
                        bigintFormatter: (value: bigint | null, common: FilterInputCallbackParams) => {
                            formatterSaw.push(common);
                            return value == null ? null : String(value);
                        },
                    },
                },
            ],
            rowData: [{ val: 1n }, { val: 5n }],
        });

        const filter = await ColumnFilterHarness.open(api, 'val');
        await filter.setText('5');

        expect(parserSaw.length).toBeGreaterThan(0);
        expect(formatterSaw.length).toBeGreaterThan(0);
        for (const common of [...parserSaw, ...formatterSaw]) {
            expect(common.api).toBe(api);
            expect(common.context).toBe(context);
            // The column too, so one callback on `defaultColDef` can tell which one it is working on.
            expect(common.column.getColId()).toBe('val');
            expect(common.colDef).toBe(common.column.getColDef());
        }
    });
});
