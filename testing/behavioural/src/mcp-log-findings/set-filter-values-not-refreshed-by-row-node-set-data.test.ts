import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, SetFilterHandler } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

/**
 * Issue: a Set Filter that takes its values from the grid does not refresh its values when a row's data is replaced
 * through `rowNode.setData` or `rowNode.updateData`.
 *
 * Setup: client-side row model, `SetFilterModule`, a column `col1` with `agSetColumnFilter` and two rows with values
 * 'A' and 'B'. The Set Filter has been created and has read the grid's values. Then row 1 is changed to 'X' with
 * `rowNode.setData({ col1: 'X' })`.
 *
 * Expected: the Set Filter data updates docs page (filter-set-data-updates, "Row / Cell Updates") says: "Using the grid's
 * Single Row / Cell Update API i.e. `rowNode.setData(data)` and `rowNode.setDataValue(col,value)` API methods. Filter
 * Values will be refreshed when data is updated through any of these methods." The filter's keys should become
 * ['B', 'X'].
 *
 * Actual: the filter keys stay ['A', 'B']. The Set Filter only re-reads the grid's values on `cellValueChanged` for its
 * own column and on row model refreshes caused by transactions or `rowData` changes, and `rowNode.setData` triggers
 * neither. `setDataValue` does refresh the values.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Set filter value refresh for AG-18665. Related searches: "Set Filter setDataValue
 * node data change re-evaluate filter clientSide", "Set Filter refreshFilterValues values list not automatically updated
 * when row data changes", "Set Filter refresh values from grid data after rowData updated refreshFilterValues
 * automatically rowDataUpdated".
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('Set Filter values after replacing a row node data', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, SetFilterModule] });

    afterEach(() => gridsManager.reset());

    async function createGridWithSetFilter(): Promise<{ api: GridApi; handler: SetFilterHandler }> {
        const api: GridApi = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'col1', filter: 'agSetColumnFilter' }],
            rowData: [{ col1: 'A' }, { col1: 'B' }],
        });

        const handler = (await api.getColumnFilterHandler('col1')) as SetFilterHandler;
        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['A', 'B']));
        return { api, handler };
    }

    test('values reflect the new data after rowNode.setData', async () => {
        const { api, handler } = await createGridWithSetFilter();

        api.getDisplayedRowAtIndex(0)!.setData({ col1: 'X' });

        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['B', 'X']));
    });

    test('values reflect the new data after rowNode.updateData', async () => {
        const { api, handler } = await createGridWithSetFilter();

        api.getDisplayedRowAtIndex(0)!.updateData({ col1: 'X' });

        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['B', 'X']));
    });
});
