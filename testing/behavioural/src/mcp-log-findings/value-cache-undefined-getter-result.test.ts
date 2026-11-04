import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, ValueCacheModule } from 'ag-grid-community';

/**
 * Issue: with `valueCache` enabled, a `valueGetter` that returns `undefined` is re-executed every time the value is
 * read (for example on each sort), instead of once per row until the cache expires.
 *
 * Setup: client-side row model, `ValueCacheModule`, `valueCache: true`, and a column `valueGetter` with a per-row call
 * counter that returns `undefined` for odd ids and a number for even ids. The column is sorted ascending, then
 * descending.
 *
 * Expected: the Value Cache docs page (https://www.ag-grid.com/javascript-data-grid/value-cache/) says that value getter results are stored in the cache and the getter is only run
 * again once the cache has expired (row data change, cell edit, or an explicit `expireValueCache()`). Sorting does
 * not expire the cache, so each row's getter should run once, whatever its result.
 *
 * Actual: results of `undefined` are indistinguishable from a cache miss, so the getter is re-run for those rows on
 * every read, while rows returning a defined value are run once.
 *
 * Reported on: AG Grid React 32.0.2.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). One search, from a React 32.0.2 client in October 2026:
 * "Value Cache value getters executed many times sorting filtering".
 */
describe('Value cache with a valueGetter returning undefined', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ValueCacheModule] });

    afterEach(() => gridsManager.reset());

    test('getter runs once per row across sorts, including rows returning undefined', async () => {
        const calls: Record<string, number> = {};

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    colId: 'v',
                    valueGetter: (params) => {
                        const id = params.data.id;
                        calls[id] = (calls[id] ?? 0) + 1;
                        return Number(id) % 2 === 0 ? Number(id) : undefined;
                    },
                },
            ],
            rowData: [{ id: '1' }, { id: '2' }],
            valueCache: true,
        });

        api.applyColumnState({ state: [{ colId: 'v', sort: 'asc' }] });
        await waitFor(() => expect(api.getColumnState()[0].sort).toBe('asc'));
        api.applyColumnState({ state: [{ colId: 'v', sort: 'desc' }] });
        await waitFor(() => expect(api.getColumnState()[0].sort).toBe('desc'));

        expect(calls).toEqual({ '1': 1, '2': 1 });
    });
});
