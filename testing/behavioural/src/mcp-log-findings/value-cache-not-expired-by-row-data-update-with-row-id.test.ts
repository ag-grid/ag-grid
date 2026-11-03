import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, RowApiModule, ValueCacheModule } from 'ag-grid-community';

/**
 * Issue: with `valueCache` enabled, updating `rowData` when `getRowId` is provided does not expire the value cache if
 * the update only adds or removes rows. The grid turns such an update into a transaction (an immutable update), and
 * only expires cached values for rows whose data object changed. Existing rows therefore keep stale cached results
 * from a `valueGetter` that depends on other rows (for example the number of displayed rows).
 *
 * Setup: client-side row model, `ValueCacheModule`, `valueCache: true`, `getRowId`, and a `valueGetter` that returns
 * `api.getDisplayedRowCount()`. The cell value for row 'a' is read (2 rows), then `rowData` is set to the same two
 * row objects plus a third, and the cell value for row 'a' is read again.
 *
 * Expected: the Value Cache docs page says the cache expires when "New row data is set into the grid via
 * `setGridOption('rowData', newData)` API or changing the `rowData` framework bound property". So the getter should
 * run again and the value should be 3, the same as when the new row is added with `applyTransaction`.
 *
 * Actual: the getter is not re-run for row 'a' and the stale value 2 is returned.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Value getters and the value cache for AG-18665.
 */
describe('Value cache expiry when rowData is updated with getRowId', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ValueCacheModule, RowApiModule] });

    afterEach(() => gridsManager.reset());

    test('setting rowData that only adds a row expires the cache', () => {
        const rowA = { id: 'a', v: 1 };
        const rowB = { id: 'b', v: 2 };

        const api = gridsManager.createGrid('myGrid', {
            valueCache: true,
            getRowId: (p) => p.data.id,
            rowData: [rowA, rowB],
            columnDefs: [{ field: 'v' }, { colId: 'count', valueGetter: (p) => p.api.getDisplayedRowCount() }],
        });

        const readCount = () => api.getCellValue({ rowNode: api.getRowNode('a')!, colKey: 'count' });
        expect(readCount()).toBe(2);

        api.setGridOption('rowData', [rowA, rowB, { id: 'c', v: 3 }]);

        expect(readCount()).toBe(3);
    });
});
