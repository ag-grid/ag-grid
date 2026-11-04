import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, SetFilterHandler } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

/**
 * Issue: a Set Filter that takes its values from the grid does not refresh its values when the data it is derived from
 * is edited through a different column.
 *
 * Setup: client-side row model, `SetFilterModule`, a column `total` with `agSetColumnFilter` and a `valueGetter`
 * returning `data.x + data.y`, plus columns `x` and `y`. The Set Filter has been created (it has read the
 * grid's values). Then `x` is changed with `rowNode.setDataValue('x', ...)`, which is what a cell edit on `x` does.
 *
 * Expected: the Set Filter docs page (filter-set-filter-list) says that when the grid is the source of values, "the
 * values are automatically refreshed for you whenever any data changes in the grid". The filter's values should then
 * contain the new derived totals.
 *
 * Actual: the Set Filter only re-reads its values on `cellValueChanged` for its own column (and on row data updates),
 * so the filter for `total` keeps listing the old derived values.
 *
 * Reported on: AG Grid React 34.3.0 to 35.3.0, Angular 32.3.7 to 34.2.0, Vue 35.3.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Eight searches from React, Angular and Vue clients between
 * March and October 2026, about refreshing Set Filter values after a cell edit, transaction or data change, for
 * example "set filter values valueGetter refresh after transaction" and "set filter refresh after edit date".
 */
describe('Set Filter values for a derived column after editing a source column', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, SetFilterModule] });

    afterEach(() => gridsManager.reset());

    test('values reflect new derived totals after setDataValue on another column', async () => {
        const api: GridApi = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'x' },
                { field: 'y' },
                {
                    colId: 'total',
                    filter: 'agSetColumnFilter',
                    valueGetter: (p) => (p.data ? p.data.x + p.data.y : undefined),
                },
            ],
            rowData: [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
            ],
        });

        const handler = (await api.getColumnFilterHandler('total')) as SetFilterHandler;
        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['2', '4']));

        api.getDisplayedRowAtIndex(0)!.setDataValue('x', 10);

        await waitFor(() => expect(handler.getFilterKeys().sort()).toEqual(['11', '4']));
    });
});
