import { waitFor } from '@testing-library/dom';
import { TestGridsManager, installFilterLayoutMock, uninstallFilterLayoutMock } from 'ag-test-utils';

import type { ColDef, GridOptions, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { GridStateModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * Issue: with the Server-Side Row Model, an advanced filter model supplied through
 * `initialState.filter.advancedFilterModel` may not reach the datasource on the first load.
 *
 * Setup: ServerSideRowModelModule + AdvancedFilterModule, `enableAdvancedFilter: true`, a datasource that
 * records every request, and `initialState: { filter: { advancedFilterModel: {...} } }`.
 *
 * Expected: the initial state is applied before the first load, so the first `getRows` request carries the
 * model as `request.filterModel` and the first request is not unfiltered. Source of the expectation: the
 * Grid State docs (initialState restores the filter state, including the advanced filter model) and the
 * Server-Side Row Model docs (the filter model is sent to the datasource in the request).
 *
 * Actual (suspected): the first request is sent with no filter model, because the model is deferred while
 * data types are pending inference, so the first load returns unfiltered data.
 *
 * Reported on: AG Grid React 34.0.2.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * One search, from a React app on 34.0.2 in February 2026: "initialState filter advancedFilterModel SSRM
 * server-side row model".
 */
describe('SSRM initialState advancedFilterModel', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            AdvancedFilterModule,
            GridStateModule,
            TextFilterModule,
            NumberFilterModule,
        ],
    });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const ADVANCED_FILTER_MODEL = { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'a' } as const;

    const expectFirstRequestFiltered = async (athleteColDef: ColDef) => {
        const requests: IServerSideGetRowsRequest[] = [];
        const options: GridOptions = {
            columnDefs: [athleteColDef],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push(params.request);
                    params.success({ rowData: [{ athlete: 'Anna' }], rowCount: 1 });
                },
            },
            enableAdvancedFilter: true,
            initialState: { filter: { advancedFilterModel: ADVANCED_FILTER_MODEL } },
        };
        const api = gridsManager.createGrid('grid1', options);

        await waitFor(() => expect(requests.length).toBeGreaterThan(0));

        expect(requests[0].filterModel).toEqual(ADVANCED_FILTER_MODEL);
        expect(api.getAdvancedFilterModel()).toEqual(ADVANCED_FILTER_MODEL);
    };

    test('first request carries the initial advanced filter model (explicit column types)', async () => {
        await expectFirstRequestFiltered({ field: 'athlete', cellDataType: 'text' });
    });

    test('first request carries the initial advanced filter model (inferred column types)', async () => {
        await expectFirstRequestFiltered({ field: 'athlete' });
    });
});
