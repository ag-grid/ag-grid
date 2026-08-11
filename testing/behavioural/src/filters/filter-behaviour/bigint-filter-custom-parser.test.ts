import type { GridApi } from 'ag-grid-community';
import { BigIntFilterModule, ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';

import {
    ColumnFilterHarness,
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
});
