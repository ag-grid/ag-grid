/**
 * Issue: with the Server-Side Row Model, `selectionChanged` fires when `setSelected` changes nothing. The server-side
 * selection service asks its strategy to change the selection, receives the number of nodes that changed, and then
 * dispatches `selectionChanged` regardless of that number.
 *
 * Setup: server-side row model with `rowSelection: { mode: 'multiRow' }` and a flat datasource returning rows A, B
 * and C. Row A is selected, then a `selectionChanged` listener is attached. `setSelected(false)` is called on the
 * unselected row B, then `setSelected(true)` on the already selected row A.
 *
 * Expected: the `selectionChanged` docs say "Row selection is changed." Neither call changes the selection, so the
 * event does not fire. The client-side row model behaves this way: it dispatches only when at least one node changed.
 *
 * Actual: `selectionChanged` fires once for each call (the test then selects row C, a genuine change, and counts 3
 * events instead of 1). A handler that re-applies selection with `setSelected` in
 * response to the event therefore re-triggers itself.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of SSRM selection API for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM selectionChanged when selection does not change', () => {
    const gridMgr = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowSelectionModule],
    });

    afterEach(() => gridMgr.reset());

    test('setSelected that changes nothing does not fire selectionChanged', async () => {
        const data = [
            { id: 'A', name: 'Alpha' },
            { id: 'B', name: 'Bravo' },
            { id: 'C', name: 'Charlie' },
        ];
        const api = gridMgr.createGrid('ssrmSelectionNoChange', {
            columnDefs: [{ field: 'name' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            getRowId: (p) => p.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: data, rowCount: data.length });
                },
            },
        });
        await waitFor(() => expect(api.getRowNode('C')).toBeDefined());
        await waitForNoLoadingRows(api);

        api.getRowNode('A')!.setSelected(true);

        let selectionChangedCount = 0;
        api.addEventListener('selectionChanged', () => selectionChangedCount++);

        api.getRowNode('B')!.setSelected(false);
        api.getRowNode('A')!.setSelected(true);

        // Grid events reach API listeners asynchronously and in order, so a genuine selection change after the two
        // no-op calls acts as a marker: once its event has arrived, any events from the no-op calls have too.
        api.getRowNode('C')!.setSelected(true);
        await waitFor(() => expect(selectionChangedCount).toBeGreaterThan(0));

        // only the genuine change of C should have fired the event
        expect(selectionChangedCount).toBe(1);
    });
});
