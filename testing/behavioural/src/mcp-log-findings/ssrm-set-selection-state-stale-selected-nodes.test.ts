/**
 * Issue: after `setServerSideSelectionState` the Server-Side Row Model reports the wrong rows from
 * `api.getSelectedNodes()` and in the `selectionChanged` event. The rows themselves read as selected correctly
 * (`isSelected()` and `getServerSideSelectionState()` are right), but the default selection strategy never
 * rebuilds its list of selected nodes from the new state, so the list still holds the nodes selected earlier.
 *
 * Setup: a flat server-side grid with `rowSelection: { mode: 'multiRow' }` and three loaded rows A, B, C. Rows A and
 * B are selected with `setNodesSelected`. A `selectionChanged` listener is added, then
 * `setServerSideSelectionState({ selectAll: false, toggledNodes: ['C'] })` is called.
 *
 * Expected: the Server-Side Row Model Selection docs (API Reference) say the API functions can be used "to get the
 * currently selected rows and nodes if all of the selected rows have been loaded by the grid", and the
 * `getSelectedNodes` API documentation says it "Returns an unsorted list of selected nodes". All three rows are
 * loaded, so `getSelectedNodes()` returns [C], and the `selectionChanged` event's `selectedNodes` (documented as
 * "The row nodes that are selected at the time the event is generated") is [C].
 *
 * Actual: `getSelectedNodes()` and the event's `selectedNodes` both still return [A, B]. A and B report
 * `isSelected()` false, and C reports true.
 *
 * Reported on: not reported on a specific version. A search (below) suggests the same area is hit by users.
 *
 * Source: found by an area review of SSRM selection API for AG-18665. Related search: "clear selection setSelected
 * server side row model not deselecting rows".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { IServerSideGetRowsParams } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('SSRM setServerSideSelectionState and getSelectedNodes', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowSelectionModule],
    });

    afterEach(() => gridsManager.reset());

    test('getSelectedNodes and selectionChanged reflect the state passed to setServerSideSelectionState', async () => {
        const rows = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
        const api = gridsManager.createGrid('ssrmSetSelectionStateStale', {
            columnDefs: [{ field: 'id' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow' },
            getRowId: (p) => p.data.id,
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    params.success({ rowData: rows, rowCount: rows.length });
                },
            },
        });
        await waitFor(() => expect(api.getRowNode('C')).toBeDefined());

        api.setNodesSelected({ nodes: [api.getRowNode('A')!, api.getRowNode('B')!], newValue: true });

        let eventSelectedIds: string[] | null | undefined;
        api.addEventListener('selectionChanged', (e) => {
            eventSelectedIds = e.selectedNodes?.map((n) => n.id!).sort();
        });

        api.setServerSideSelectionState({ selectAll: false, toggledNodes: ['C'] });

        expect(
            api
                .getSelectedNodes()
                .map((n) => n.id)
                .sort()
        ).toEqual(['C']);
        expect(eventSelectedIds).toEqual(['C']);
    });
});
