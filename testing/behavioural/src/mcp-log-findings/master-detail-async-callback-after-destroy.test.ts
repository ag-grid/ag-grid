/*
 * Issue: with master/detail and an asynchronous getDetailRowData, a late successCallback that fires
 * after the detail row has been removed (and its detail grid destroyed) calls setGridOption on the
 * destroyed detail grid API and logs a "grid has been destroyed" error.
 *
 * Setup: MasterDetailModule + ClientSideRowModelModule, detailCellRendererParams.getDetailRowData
 * stores successCallback and calls it later. Expand a master row, remove it with applyTransaction, then call the stored
 * successCallback.
 *
 * Expected: the DetailCellRenderer source comment says "ensure detail grid api still exists (grid may
 * be destroyed when async call tries to set data)", i.e. a callback arriving after destroy is
 * silently ignored and nothing is logged.
 *
 * Actual: DetailCellRenderer.setRowData only checks that detailApi is set (it is never cleared on
 * destroy), so setGridOption('rowData') is called on the destroyed API and the error
 * warning #26 "Grid API function `setGridOption()` cannot be called as the grid has been destroyed." is logged.
 *
 * Reported on: AG Grid Angular 32.3.4.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Angular 32.3.4 searched,
 * in August 2026: "Angular AG Grid v32 master detail getRowId row data updates editing
 * onCellValueChanged grid destroyed behaviour API refreshCells".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GetDetailRowDataParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('master detail async getDetailRowData callback after detail destroyed', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, MasterDetailModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('late successCallback after row removal does not log a destroyed grid error', async () => {
        const callbacks: ((rowData: any[]) => void)[] = [];
        const row = { a: 1 };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'a' }],
            masterDetail: true,
            rowData: [row],
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'x' }] },
                getDetailRowData: (params: GetDetailRowDataParams) => {
                    callbacks.push(params.successCallback);
                },
            },
        });

        api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        await waitFor(() => expect(callbacks.length).toBe(1));

        api.applyTransaction({ remove: [row] });
        await waitFor(() => expect(document.querySelectorAll('.ag-details-row').length).toBe(0));

        // In the test environment the destroyed-grid diagnostic is thrown; outside it is logged.
        expect(() => callbacks[0]([{ x: 'a' }])).not.toThrow();
    });
});
