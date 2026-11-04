/**
 * Issue: undoing (or redoing) a cell edit made on a pinned row logs warning #88 ("Invalid row index for
 * `ensureIndexVisible`") and scrolls the body viewport. The undo service restores focus to the edited cell and
 * first calls `ensureIndexVisible` with the pinned row's index, without checking `rowPinned`. That method treats
 * the index as a body row index, so a pinned index beyond the body row count is reported as invalid, and a valid
 * one scrolls the body to an unrelated body row.
 *
 * Setup: `undoRedoCellEditing` on, one body row and two pinned top rows (so pinned index 1 is not a valid body row
 * index). The second pinned row is edited, then `undoCellEditing()` is called. Grid warnings are thrown as errors in the test setup.
 *
 * Expected: the Undo / Redo Shortcuts section of the Undo / Redo Edits docs says Ctrl+Z "will undo the last cell
 * edit(s)", and a documented operation on a valid configuration should not log a grid warning. Everywhere else
 * the grid skips scrolling for pinned positions (navigation and `startEditingCell` both guard on `rowPinned`).
 * The pinned cell reverts, keeps focus, and no warning is logged.
 *
 * Actual: the pinned cell reverts, but console.warn is called with warning #88 "Invalid row index for
 * `ensureIndexVisible`: 1". With enough body rows to make the index valid, no warning is logged but the body
 * scrolls to that body row.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of Cell editing on pinned rows for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule, TextEditorModule, UndoRedoEditModule } from 'ag-grid-community';

describe('undo of a pinned row edit', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, TextEditorModule, UndoRedoEditModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('logs no warning', async () => {
        const api = await gridMgr.createGridAndWait('grid', {
            undoRedoCellEditing: true,
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ a: 'body' }],
            pinnedTopRowData: [{ a: 'p0' }, { a: 'p1' }],
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const user = userEvent.setup({ skipHover: true });

        api.startEditingCell({ rowIndex: 1, rowPinned: 'top', colKey: 'a' });
        const input = await waitForInput(gridDiv);
        await user.clear(input);
        await user.type(input, 'edited{Enter}');
        await waitFor(() => expect(api.getPinnedTopRow(1)!.data.a).toBe('edited'));

        // The behavioural test setup turns grid warnings into thrown errors, so a logged warning shows up here.
        expect(() => api.undoCellEditing()).not.toThrow();
    });
});
