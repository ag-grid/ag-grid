import type { GridApi } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, enableDevValidations, setupAgTestIds } from 'ag-grid-community';

import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

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
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('a hex value entered via a custom bigintParser is applied to the filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'val',
                    cellDataType: 'bigint',
                    filter: 'agBigIntColumnFilter',
                    filterParams: {
                        debounceMs: 0,
                        allowedCharPattern: '[\\dxXa-fA-F]',
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
                        allowedCharPattern: '[\\dxXa-fA-F]',
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
            columnDefs: columnDefs('[\\d]'),
            rowData: [{ val: 255n }, { val: 16n }],
        });

        // Built before the swap: an input reads `allowedCharPattern` once, when it is created.
        const filter = await ColumnFilterHarness.open(api, 'val');

        api.setGridOption('columnDefs', columnDefs('[\\dxXa-fA-F]'));
        await asyncSetTimeout(0);

        await filter.selectOperator('Equals');
        await filter.setText('0xFF', 0);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'bigint', type: 'equals', filter: '255' });
        await new GridRows(api, 'hex accepted after the pattern was replaced').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 val:"255n"
        `);
    });

    test('a bigintFormatter reaches the filter inputs, and its floating filter shows the same', async () => {
        const filterParams = {
            debounceMs: 0,
            allowedCharPattern: '[\\dxXa-fA-F]',
            bigintParser: (text: string | null) => (text == null || text.trim() === '' ? null : BigInt(text)),
            bigintFormatter: (value: bigint | null) => (value == null ? null : `0x${value.toString(16)}`),
        };
        const columnDef = { field: 'val', cellDataType: 'bigint' as const, filter: 'agBigIntColumnFilter' as const };
        const rowData = [{ val: 255n }, { val: 16n }];

        const floatingApi: GridApi = await gridsManager.createGridAndWait('grid5', {
            columnDefs: [{ ...columnDef, floatingFilter: true, filterParams }],
            rowData,
        });
        await floatingApi.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter: '255' });
        await floatingApi.onFilterChanged();

        const api: GridApi = await gridsManager.createGridAndWait('grid6', {
            columnDefs: [{ ...columnDef, filterParams }],
            rowData,
        });
        await api.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter: '255' });

        // `0xff` reads back as 255 through `bigintParser`, so both surfaces show what the formatter wrote.
        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text', 0)[0].value).toBe('0xff');
        expect(FloatingFilterHarness.get(floatingApi, 'val').input().value).toBe('0xff');
    });

    test('a bigintFormatter nothing reads back still shows on both surfaces', async () => {
        const columnDef = { field: 'val', cellDataType: 'bigint' as const, filter: 'agBigIntColumnFilter' as const };
        // Grouped, so nothing reads its own output back as the value it came from.
        const filterParams = {
            debounceMs: 0,
            bigintFormatter: (value: bigint | null) => (value == null ? null : value.toLocaleString('en-US')),
        };
        const rowData = [{ val: 1234n }, { val: 16n }];

        const floatingApi: GridApi = await gridsManager.createGridAndWait('grid7', {
            columnDefs: [{ ...columnDef, floatingFilter: true, filterParams }],
            rowData,
        });
        await floatingApi.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter: '1234' });
        await floatingApi.onFilterChanged();

        const api: GridApi = await gridsManager.createGridAndWait('grid8', {
            columnDefs: [{ ...columnDef, filterParams }],
            rowData,
        });
        await api.setColumnFilterModel('val', { filterType: 'bigint', type: 'equals', filter: '1234' });

        const filter = await ColumnFilterHarness.open(api, 'val');
        expect(filter.inputs('text', 0)[0].value).toBe('1,234');
        expect(FloatingFilterHarness.get(floatingApi, 'val').input().value).toBe('1,234');
        // Shown but never read back: the model still holds the value the formatter rendered.
        expect(api.getColumnFilterModel('val')).toEqual({ filterType: 'bigint', type: 'equals', filter: '1234' });
    });

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
            columnDefs: columnDefs('[\\d]'),
            rowData: [{ val: 255n }, { val: 16n }],
        });

        await FloatingFilterHarness.get(api, 'val').setValue('16');
        api.setGridOption('columnDefs', columnDefs('[\\dxXa-fA-F]'));
        await asyncSetTimeout(0);

        expect(FloatingFilterHarness.get(api, 'val').input().value).toBe('16');
    });
});
