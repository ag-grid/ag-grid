import type { GridApi } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../columnToolPanel/deferredPivotModeFakeServer';
import { getColumnOrder } from '../columns/column-test-utils';
import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../test-utils';

// AG-9664: interactive pivot column sorting must also work under the Server-Side Row Model.
describe('SSRM: interactive pivot column sorting (pivotSort)', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });
    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const rowData = [
        { athlete: 'a', country: 'USA', year: 2000, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
        { athlete: 'b', country: 'USA', year: 2004, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
        { athlete: 'c', country: 'USA', year: 2008, sport: 'Swimming', gold: 1, silver: 0, bronze: 0, total: 1 },
    ];

    test('pivotSort desc reverses SSRM pivot result columns', async () => {
        const fakeServer = createFakeServer(rowData as any);
        const api: GridApi = await gridsManager.createGridAndWait('ssrm', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            rowModelType: 'serverSide',
            serverSideDatasource: createServerSideDatasource(fakeServer),
        });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        const pivots = () => getColumnOrder(api, 'all').filter((id) => id.endsWith('_gold'));
        expect(pivots()).toEqual(['2000_gold', '2004_gold', '2008_gold']);

        api.applyColumnState({ state: [{ colId: 'year', pivotSort: 'desc' }] });
        await waitForNoLoadingRows(api);
        // The reorder animates once data has loaded: refreshCols brackets the column rebuild, so the
        // async reload happens before the animation window rather than inside it.
        expect(document.querySelector('.ag-column-moving')).not.toBeNull();
        await asyncSetTimeout(50);
        expect(pivots()).toEqual(['2008_gold', '2004_gold', '2000_gold']);
    });
});
