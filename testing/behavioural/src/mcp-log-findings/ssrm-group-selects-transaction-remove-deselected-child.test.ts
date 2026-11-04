/**
 * Issue: with `groupSelects: 'descendants'` in the Server-Side Row Model, removing a deselected child row with
 * `applyServerSideTransaction` leaves its parent group in the indeterminate state, although every remaining child is
 * selected. The selection state still holds an entry for the removed row.
 *
 * Setup: a server-side grid grouped by country with `rowSelection: { mode: 'multiRow', groupSelects: 'descendants' }`
 * and a `getRowId` whose ids differ from the group keys (group id 'g-United States', child ids 'r-1' and 'r-2'). The
 * 'United States' group is expanded and selected, so both children are selected. Child 'r-1' is then deselected,
 * which makes the group indeterminate. Then `applyServerSideTransaction({ route: ['United States'], remove: [r-1] })`
 * removes that child.
 *
 * Expected: the Group Row Selection docs say that with 'descendants' "Selecting a group row will select all of its
 * descendants", and the SSRM Row Selection docs explain that a group is shown as indeterminate because its
 * `toggledNodes` hold exceptions. Once the only exception, r-1, is removed, the remaining child r-2 is
 * selected, so the group reads as selected (`isSelected() === true`) and `getServerSideSelectionState()` no longer
 * refers to the removed row. No docs page states this for removal explicitly; it follows from the group state
 * reflecting its current children.
 *
 * Actual: the group's `isSelected()` is undefined (indeterminate) and the selection state still contains
 * `{ nodeId: 'r-1', selectAllChildren: false }` under the group.
 *
 * Reported on: not reported; found by an area review of SSRM selection with getRowId for AG-18665.
 *
 * Source: found by an area review of SSRM selection with getRowId for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { IServerSideGetRowsParams } from 'ag-grid-community';
import { RowSelectionModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('SSRM groupSelects descendants and transaction removal', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, RowGroupingModule, RowSelectionModule],
    });

    afterEach(() => gridsManager.reset());

    test('removing a deselected child by transaction leaves the selected group fully selected', async () => {
        const rows = [
            { id: 1, country: 'United States' },
            { id: 2, country: 'United States' },
        ];
        const api = gridsManager.createGrid('ssrmGroupSelectsTransaction', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }],
            rowModelType: 'serverSide',
            rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
            getRowId: (p) => (p.level === 0 ? 'g-' + p.data.country : 'r-' + p.data.id),
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    const keys = params.request.groupKeys;
                    if (keys.length === 0) {
                        params.success({ rowData: [{ country: 'United States' }], rowCount: 1 });
                    } else {
                        params.success({ rowData: rows, rowCount: rows.length });
                    }
                },
            },
        });
        await waitForNoLoadingRows(api);

        const group = api.getRowNode('g-United States')!;
        group.setExpanded(true);
        await waitFor(() => expect(api.getRowNode('r-1')).toBeTruthy());
        await waitForNoLoadingRows(api);

        group.setSelected(true);
        await waitFor(() => expect(api.getRowNode('r-2')!.isSelected()).toBe(true));
        api.getRowNode('r-1')!.setSelected(false);

        api.applyServerSideTransaction({ route: ['United States'], remove: [rows[0]] });
        await waitFor(() => expect(api.getRowNode('r-1')).toBeUndefined());

        expect(group.isSelected()).toBe(true);
        expect(api.getServerSideSelectionState()).toEqual({
            selectAllChildren: false,
            toggledNodes: [{ nodeId: 'g-United States', selectAllChildren: true }],
        });
    });
});
