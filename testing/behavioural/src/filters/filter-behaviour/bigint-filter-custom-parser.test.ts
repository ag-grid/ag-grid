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
});
