import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * Issue: with the Server-Side Row Model and single-row selection, calling
 * `node.setSelected(false)` on a row that is NOT selected clears the selection of a
 * different row that is selected.
 *
 * Setup: SSRM, rowSelection { mode: 'singleRow' }. Row A is selected through the API, then
 * `setSelected(false)` is called on row B, which is not selected.
 *
 * Expected: `RowNode.setSelected` deselects only that node, so deselecting an unselected row
 * is a no-op and row A remains selected (RowNode.setSelected API documentation).
 *
 * Actual: row A is deselected, and getSelectedNodes() returns an empty array.
 *
 * Scope: this test covers only the single-row, unselected-row case. It does not cover
 * multi-row selectAll or rows where isRowSelectable returns false.
 *
 * Reported on: AG Grid React 35.3.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * One search (React 35.3.0, July 2026): "clear selection setSelected server side row model not deselecting rows".
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('SSRM single row selection: setSelected(false) on an unselected row', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ServerSideRowModelApiModule, RowSelectionModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('does not clear the selection of another row', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'singleRow' },
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({ rowData: [{ id: 'A' }, { id: 'B' }, { id: 'C' }], rowCount: 3 });
                },
            },
        });

        await waitFor(() => expect(api.getRowNode('B')).toBeDefined());

        api.getRowNode('A')!.setSelected(true);

        api.getRowNode('B')!.setSelected(false);

        expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['A']);
    });
});
