import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, SetFilterHandler } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

/**
 * Issue: with `suppressModelUpdateAfterUpdateTransaction` enabled, a Set Filter never picks up the values changed by an
 * update-only transaction, even after the app calls `refreshClientSideRowModel()` to bring the model up to date.
 *
 * Setup: client-side row model, `SetFilterModule`, `suppressModelUpdateAfterUpdateTransaction: true`, `getRowId`, and
 * a column `col1` with `agSetColumnFilter` over rows `A` and `B`. The Set Filter has read its values. An update
 * transaction then changes row 1 from `A` to `X`, and the app calls `api.refreshClientSideRowModel('filter')`.
 *
 * Expected: the data-update-transactions docs page ("Suppress Model Updates") says the option is used "to perform update
 * transactions and prevent the grid from automatically reprocessing grouping, filters, aggregation and sorting", and
 * that "To trigger the Client-side Row Model to refresh, use the Grid API `refreshClientSideRowModel(startingStage)`".
 * Its example says "hitting Update Model triggers the grid to sort and filter using `refreshClientSideRowModel('filter')`".
 * The API documentation says `refreshClientSideRowModel` "executes the grouping, filtering and sorting again". The Set
 * Filter data updates page says "Filter values are refreshed when data is updated" using transactions. So after the
 * explicit refresh the Set Filter values should be up to date: `['B', 'X']`.
 *
 * Actual: the values stay `['A', 'B']`. The suppressed transaction skips the Set Filter's data refresh, and
 * `refreshClientSideRowModel('filter')` does not trigger it later.
 *
 * Reported on: not reported; found by an area review of Set filter value refresh for AG-18665. Related searches were
 * "Set Filter refreshFilterValues values list not automatically updated when row data changes" and "Set Filter refresh
 * values from grid data after rowData updated refreshFilterValues automatically rowDataUpdated
 * suppressClearModelOnRefreshValues".
 *
 * Source: found by an area review of Set filter value refresh for AG-18665, prompted by the related searches above.
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('Set Filter values after a suppressed update transaction and refreshClientSideRowModel', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, SetFilterModule] });

    afterEach(() => gridsManager.reset());

    test('values are up to date after refreshClientSideRowModel("filter")', async () => {
        const api: GridApi = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'col1', filter: 'agSetColumnFilter' }],
            rowData: [
                { id: '1', col1: 'A' },
                { id: '2', col1: 'B' },
            ],
            getRowId: (p) => p.data.id,
            suppressModelUpdateAfterUpdateTransaction: true,
        });

        const handler = (await api.getColumnFilterHandler('col1')) as SetFilterHandler;
        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['A', 'B']));

        api.applyTransaction({ update: [{ id: '1', col1: 'X' }] });
        api.refreshClientSideRowModel('filter');

        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['B', 'X']));
    });
});
