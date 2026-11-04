/**
 * Issue: with `keepDetailRows` enabled, if an expanded master row is removed and a new row with the same id is added
 * and expanded, `api.getDetailGridInfo('detail_<id>')` returns undefined even though the detail grid is rendered
 * and working. The old detail grid is destroyed after the new one registers, and its teardown removes the registry
 * entry by id, which by then belongs to the new detail grid.
 *
 * Setup: ClientSideRowModel + MasterDetail, `getRowId`, `masterDetail: true`, `keepDetailRows: true`. Expand row 'a',
 * wait for its detail grid, collapse it, remove row 'a', add a new row with id 'a', then expand it and wait until the
 * grid has settled (the new row's detail grid exists, and the old detail grid is destroyed).
 *
 * Expected: the Master Detail docs (Accessing Detail Grids) say "The grid generates IDs for detail grids by prefixing
 * the parent row's ID with detail_{ROW-ID}. For example if the ID of the expanded Master Row is "88", then the ID of
 * the Detail Grid / row will be "detail_88"." and that `forEachDetailGridInfo` "access[es] all existing Detail
 * Grids". The `DetailGridInfo.id` JSDoc says "Id of the detail grid, the format is detail_{ROW-ID}". So the rendered
 * detail grid for row 'a' is returned by `getDetailGridInfo('detail_a')`.
 *
 * Actual: once settled, the detail grid for 'a' is displayed with the new data, but `getDetailGridInfo('detail_a')`
 * is undefined and `forEachDetailGridInfo` visits nothing. A later `redrawRows()` makes it reappear.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Master detail with row data updates for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { GetDetailRowDataParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

describe('keepDetailRows with a re-created master row', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, MasterDetailModule] });

    afterEach(() => gridMgr.reset());

    test('getDetailGridInfo returns the rendered detail grid of a re-created row with the same id', async () => {
        const api: GridApi = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'name', cellRenderer: 'agGroupCellRenderer' }],
            rowData: [{ id: 'a', name: 'A', records: [{ x: 1 }] }],
            getRowId: (p) => p.data.id,
            masterDetail: true,
            keepDetailRows: true,
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'x' }] },
                getDetailRowData: (p: GetDetailRowDataParams) => p.successCallback(p.data.records),
            },
        });
        await waitForEvent('firstDataRendered', api);

        api.getRowNode('a')!.setExpanded(true);
        await waitFor(() => expect(api.getDetailGridInfo('detail_a')?.api?.getDisplayedRowCount()).toBe(1));
        const oldApi = api.getDetailGridInfo('detail_a')!.api!;
        api.getRowNode('a')!.setExpanded(false);

        api.applyTransaction({ remove: [{ id: 'a' }] });
        api.applyTransaction({ add: [{ id: 'a', name: 'A', records: [{ x: 2 }] }] });

        api.getRowNode('a')!.setExpanded(true);
        // settled: only the new detail grid is shown and the removed row's detail grid has been torn down
        await waitFor(() => {
            const cells = document.querySelectorAll('.ag-details-grid .ag-cell[col-id="x"]');
            expect(Array.from(cells, (cell) => cell.textContent)).toEqual(['2']);
            expect(oldApi.isDestroyed()).toBe(true);
        });

        expect(api.getDetailGridInfo('detail_a')).toBeDefined();
    });
});
