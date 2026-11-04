import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { RowSelectionModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * Issue: with the Server-Side Row Model, once "select all" is active, rows that are loaded afterwards (for
 * example after a purge refresh, a sort, or scrolling a new block into view) are marked as selected even when
 * `isRowSelectable` returns false for them. While loading a row, the grid first applies the select-all state to
 * the node, when the node is still selectable by default, and only afterwards evaluates `isRowSelectable`. The
 * later attempt to deselect the now non-selectable node is filtered out, so it stays selected.
 *
 * Setup: SSRM, `getRowId`, rowSelection { mode: 'multiRow', isRowSelectable } where the callback returns false
 * for the row with sport 'football'. `api.selectAll()` is called, then `api.refreshServerSide({ purge: true })`
 * and the rows are reloaded.
 *
 * Expected: the Row Selection docs say "Rows for which `isRowSelectable` returns `false` cannot be selected at
 * all, whether using the UI or the API." and "when `rowSelection.isRowSelectable` is defined, the header
 * checkbox will only select selectable rows." So the football row is not selected, before and after the reload.
 *
 * Actual: before the reload the football row is correctly unselected. After the reload `isSelected()` is true
 * for the football row.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of SSRM selection with getRowId for AG-18665.
 */
// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('SSRM selection: select all then reload rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ServerSideRowModelApiModule, RowSelectionModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('rows loaded after select all do not select non-selectable rows', async () => {
        const rowData = [
            { id: 0, sport: 'football' },
            { id: 1, sport: 'tennis' },
        ];
        let requests = 0;

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'sport' }],
            rowModelType: 'serverSide',
            getRowId: (params) => String(params.data.id),
            rowSelection: {
                mode: 'multiRow',
                isRowSelectable: (node) => node.data?.sport !== 'football',
            },
            serverSideDatasource: {
                getRows: (params) => {
                    requests++;
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
        });

        await waitFor(() => expect(api.getRowNode('1')).toBeDefined());

        api.selectAll();
        expect(api.getRowNode('0')!.isSelected()).toBe(false);

        const requestsBeforeReload = requests;
        api.refreshServerSide({ purge: true });
        await waitFor(() => expect(requests).toBeGreaterThan(requestsBeforeReload));
        await waitFor(() => expect(api.getRowNode('1')).toBeDefined());

        expect(api.getRowNode('0')!.isSelected()).toBe(false);
    });
});
