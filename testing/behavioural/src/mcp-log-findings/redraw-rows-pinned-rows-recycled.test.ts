/*
 * Issue: api.redrawRows() with no arguments does not recreate pinned rows supplied as data (pinnedTopRowData /
 * pinnedBottomRowData).
 *
 * Setup: client-side row model, pinnedTopRowData with one row, and a getRowStyle callback that reads an external
 * variable. After the grid renders, the variable is changed and api.redrawRows() is called.
 *
 * Expected: the API documentation for redrawRows says "Remove row(s) from the DOM and recreate them again from
 * scratch", and the view refresh docs list changing getRowStyle / cellRenderer behaviour as a use case. The
 * pinned top row should be recreated, so getRowStyle is re-evaluated and the new style is applied.
 *
 * Actual: pinned row controllers are recycled instead of recreated, so the pinned row keeps its old style.
 * The body row, in contrast, is recreated and picks up the new style.
 *
 * Reported on: AG Grid angular 33.3.2.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Angular 33.3.2 (August 2026) searched
 * for "redrawRows refresh pinned rows not updating repaint".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule, RowStyleModule } from 'ag-grid-community';

describe('redrawRows with pinned rows', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, PinnedRowModule, RowStyleModule] });

    afterEach(() => {
        gridMgr.reset();
    });

    test('api.redrawRows() recreates pinned top rows so getRowStyle is re-evaluated', async () => {
        let colour = 'red';
        const api = await gridMgr.createGridAndWait('redrawPinned', {
            columnDefs: [{ field: 'x' }],
            rowData: [{ x: 'body' }],
            pinnedTopRowData: [{ x: 'pinned' }],
            getRowStyle: () => ({ backgroundColor: colour }),
        });

        const pinnedRow = () => document.querySelector<HTMLElement>('.ag-grid-pinned-top-rows .ag-row');
        const bodyRow = () =>
            Array.from(document.querySelectorAll<HTMLElement>('.ag-row')).find(
                (row) => !row.closest('.ag-grid-pinned-top-rows')
            );

        colour = 'blue';
        api.redrawRows();

        await waitFor(() => expect(bodyRow()!.style.backgroundColor).toBe('blue'));
        await waitFor(() => expect(pinnedRow()!.style.backgroundColor).toBe('blue'));
    });
});
