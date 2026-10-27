import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, GridStateModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

/*
 * Issue: initialState.rowGroupExpansion is lost when rowData arrives asynchronously after the grid
 * was created with an explicit empty array.
 *
 * Setup: client-side row model, a column with rowGroup: true, and
 * initialState.rowGroupExpansion.expandedRowGroupIds = ['row-group-country-Ireland'].
 * The grid is created with rowData: [] (typical of React useState([])) and the real rows are supplied
 * later via api.setGridOption('rowData', ...). The bug needs the explicit empty array: with rowData
 * left undefined at creation the expansion state is still pending when data arrives.
 *
 * Expected: the Ireland group is expanded once the data loads. The Grid State docs say initialState
 * is applied on creation so that saved state (including row group expansion) is restored.
 *
 * Actual: the expansion state is applied against the empty data, so no group is expanded when the
 * real data arrives.
 *
 * Reported on: react 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 36.0.0 searched,
 * in August 2026:
 *   "grid state initialState async data loading row group expansion not restored"
 */
describe('Row group expansion initialState with async rowData', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, GridStateModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('restored group expansion applies once async rowData arrives', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'name' }],
            getRowId: (params) => params.data.id,
            initialState: {
                rowGroupExpansion: { expandedRowGroupIds: ['row-group-country-Ireland'] },
            },
            rowData: [],
        });

        api.setGridOption('rowData', [
            { id: '1', country: 'Ireland', name: 'Alice' },
            { id: '2', country: 'France', name: 'Bob' },
        ]);

        await waitFor(() => expect(api.getRowNode('row-group-country-Ireland')).toBeDefined());

        expect(api.getRowNode('row-group-country-Ireland')?.expanded).toBe(true);
    });
});
