import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, RowApiModule, ValueCacheModule } from 'ag-grid-community';

/**
 * Issue: with `valueCache` enabled, a transaction that both updates a displayed row's data and adds a row leaves the
 * updated row with a cached `valueGetter` result computed before the new row was added. A getter that depends on
 * other rows (here, the number of rows) therefore keeps a wrong value after the update has finished.
 *
 * Setup: client-side row model, `ValueCacheModule`, `valueCache: true`, `getRowId`, and a `valueGetter` that counts
 * the rows with `api.forEachNode`. Rows 'a' and 'b' are displayed. `applyTransaction` updates row 'b' with a new data
 * object and adds row 'c' in the same call; then the cell value for row 'b' is read.
 *
 * Expected: the Value Cache docs say the whole cache is invalidated on any data change because "a Value Getter is a
 * function where you can take data from anywhere in the grid". Once the transaction has been applied the value should
 * be 3, as it is with `valueCache` off.
 *
 * Actual: the value is 2, the row count part-way through the transaction, and it stays cached.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Value getters and the value cache for AG-18665.
 */
// TODO: disabled due to AG-19208 - re-enable once fixed
describe.skip('Value cache keeps a value computed part-way through a data update', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ValueCacheModule, RowApiModule] });

    afterEach(() => gridsManager.reset());

    test('transaction that updates one row and adds another', () => {
        const api = gridsManager.createGrid('myGrid', {
            valueCache: true,
            getRowId: (p) => p.data.id,
            rowData: [
                { id: 'a', name: 'Alpha' },
                { id: 'b', name: 'Bravo' },
            ],
            columnDefs: [
                { field: 'name' },
                {
                    colId: 'count',
                    valueGetter: (p) => {
                        let count = 0;
                        p.api.forEachNode(() => count++);
                        return count;
                    },
                },
            ],
        });

        api.applyTransaction({ update: [{ id: 'b', name: 'Bravo2' }], add: [{ id: 'c', name: 'Charlie' }] });

        expect(api.getCellValue({ rowNode: api.getRowNode('b')!, colKey: 'count' })).toBe(3);
    });
});
