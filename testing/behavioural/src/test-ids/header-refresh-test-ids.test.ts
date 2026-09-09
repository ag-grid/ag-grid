import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    RenderApiModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

describe('header test IDs survive a header refresh', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RenderApiModule],
    });

    const columnDefs: ColDef[] = [
        { field: 'product' },
        { field: 'price', headerValueGetter: (params) => params.context.reportingCurrency },
    ];

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    function getHeaderTestId(api: GridApi, colId: string): string | null | undefined {
        const gridEl = getGridElement(api) as HTMLElement | null;
        return gridEl
            ?.querySelector(`.ag-header-cell:not(.ag-floating-filter)[col-id="${colId}"]`)
            ?.getAttribute('data-testid');
    }

    test('refreshHeader re-stamps the header cell test IDs it recreates', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs,
            rowData: [{ product: 'Product 1', price: 644 }],
            context: { reportingCurrency: 'EUR' },
        });

        await waitFor(() => expect(getHeaderTestId(api, 'price')).toBe(agTestIdFor.headerCell('price')));

        api.setGridOption('context', { reportingCurrency: 'USD' });

        // Let every stamping pass the context change may have scheduled run to completion, so that
        // the refresh below is the only thing the service could react to. Without this the test
        // passes on a pending debounce landing after the refresh rather than on the refresh itself.
        await new Promise((resolve) => setTimeout(resolve, 600));

        // refreshHeader() destroys and recreates the header row, so every test id stamped on the old
        // header DOM goes with it. The service must stamp the replacement.
        api.refreshHeader();

        await waitFor(() => expect(getHeaderTestId(api, 'price')).toBe(agTestIdFor.headerCell('price')));
    });
});
