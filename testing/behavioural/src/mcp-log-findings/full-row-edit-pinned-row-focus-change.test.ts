/*
 * Issue: with editType 'fullRow', a row edit started on a pinned row is expected to end when focus moves to a
 * different row (clicking a cell in a body row). Pinned row 0 and body row 0 share rowIndex 0, so the full row
 * edit focus-change handling treats a move between them as "same row" and leaves the pinned row editors open.
 *
 * Setup: client-side row model, editType 'fullRow', editable columns, one pinned top row plus body rows.
 * Start editing the pinned row with api.startEditingCell, then click a cell in body row 0.
 *
 * Expected: per the cell editing docs, full row editing ends when focus moves to another row, so
 * api.getEditingCells() is empty and no pinned row editor remains.
 *
 * Actual: the pinned row editors stay open after focus moves to body row 0. (Escape cancelling the pinned row
 * edit and restarting it with startEditingCell both work, so they are not covered here.)
 *
 * Reported on: AG Grid angular 35.2.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on Angular 35.2.0 (August 2026)
 * searched for "suppressKeyboardEvent Escape editing onCellKeyDown cancel editing pinned row keyboard event".
 */
import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule, TextEditorModule } from 'ag-grid-community';

describe('full row editing on a pinned row', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, TextEditorModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const create = () =>
        gridMgr.createGridAndWait('fullRowPinned', {
            editType: 'fullRow',
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ a: 'body a', b: 'body b' }],
            pinnedTopRowData: [{ a: 'pinned a', b: 'pinned b' }],
        });

    const pinnedInput = () =>
        document.querySelector<HTMLInputElement>('.ag-grid-pinned-top-rows-container .ag-cell-inline-editing input');

    test('clicking a body row cell ends the pinned row edit', async () => {
        const api = await create();

        api.startEditingCell({ rowIndex: 0, rowPinned: 'top', colKey: 'a' });
        await waitFor(() => expect(pinnedInput()).not.toBeNull());

        const bodyCell = document.querySelector<HTMLElement>('.ag-grid-scrolling-container [col-id="b"]')!;
        await userEvent.click(bodyCell);

        await waitFor(() => expect(api.getEditingCells()).toEqual([]));
        expect(pinnedInput()).toBeNull();
    });
});
