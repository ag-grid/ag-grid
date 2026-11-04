/**
 * Issue: with `embedFullWidthRows: true`, a master detail grid with `refreshStrategy: 'nothing'` still calls
 * `getDetailRowData` after the master row is updated. The embedded detail row is rendered three times (left pinned,
 * centre, right pinned) and the two pinned-section renderers never set up a refresh strategy, so their `refresh`
 * falls through to reloading the row data.
 *
 * Setup: one master row, `masterDetail: true`, `embedFullWidthRows: true`, detail cell renderer params with
 * `refreshStrategy: 'nothing'` and a `getDetailRowData` that is counted. Expand the row, then update the master row
 * with `api.applyTransaction`.
 *
 * Expected: the Master / Detail Refresh docs (Refresh Strategy, 3. Do Nothing) say: "The Detail Panel will do
 * nothing. The method `getDetailRowData(params)` will not be called." and the Refresh Nothing example says "The
 * callback `getDetailRowData(params)` is **not** called." So the call count stays at 1 (the initial load).
 *
 * Actual: the call count rises to 3, one extra call from each pinned-section renderer. A user whose callback
 * fetches from a server sees the extra requests.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Master detail with row data updates for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForEvent } from 'ag-test-utils';

import type { GetDetailRowDataParams } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('embedded full width master detail with refreshStrategy nothing', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, MasterDetailModule],
    });

    afterEach(() => gridMgr.reset());

    test('getDetailRowData is not called again after the master row is updated', async () => {
        const getDetailRowData = vitest.fn((params: GetDetailRowDataParams) =>
            params.successCallback(params.data.records)
        );
        const api = gridMgr.createGrid('myGrid', {
            columnDefs: [{ field: 'name', cellRenderer: 'agGroupCellRenderer' }, { field: 'calls' }],
            rowData: [{ id: 'a', name: 'A', calls: 1, records: [{ x: 1 }] }],
            getRowId: (p) => p.data.id,
            masterDetail: true,
            embedFullWidthRows: true,
            detailCellRendererParams: {
                refreshStrategy: 'nothing',
                detailGridOptions: { columnDefs: [{ field: 'x' }] },
                getDetailRowData,
            },
        });
        await waitForEvent('firstDataRendered', api);

        api.getRowNode('a')!.setExpanded(true);
        await waitFor(() => expect(api.getDetailGridInfo('detail_a')?.api?.getDisplayedRowCount()).toBe(1));

        api.applyTransaction({ update: [{ id: 'a', name: 'A', calls: 2, records: [{ x: 1 }] }] });
        // the master row has re-rendered, so any detail refresh has already been requested
        await waitFor(() =>
            expect(document.querySelector('#myGrid [row-id="a"] [col-id="calls"]')?.textContent).toBe('2')
        );

        expect(getDetailRowData).toHaveBeenCalledTimes(1);
    });
});
