/**
 * Issue: in batch editing, when a cell is focused the grid announces "Pending Change" to screen readers if that
 * cell has an uncommitted edit. The cell is looked up from the focus event using only the row index, ignoring
 * whether the focused row is pinned, so a pinned row's cell is confused with the body row at the same index.
 *
 * Setup: one body row and one pinned top row, both with editable columns. A batch edit is started and a pending
 * value is staged on the pinned top row's cell. Focus is then moved to the body row's cell in the same column, and
 * back to the pinned cell.
 *
 * Expected: the aria live region announces "Pending Change" (locale key `ariaPendingChange`) when the focused
 * cell has a pending change. Focus events carry `rowPinned` so that pinned row 0 is distinct from body row 0, and
 * the grid compares `rowPinned` when comparing cell positions.
 *
 * Actual: nothing is announced when the pinned cell with the pending change gains focus, because the announcement
 * is based on the body row 0 cell, which has no pending edit. (Conversely, a pending change on body row 0 is
 * announced when a pinned cell without one is focused.)
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of "Cell editing on pinned rows" for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule, TextEditorModule, getGridElement } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

describe('batch edit pending change announcement on pinned rows', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, TextEditorModule, BatchEditModule],
    });

    afterEach(() => gridMgr.reset());

    test('focusing a pinned cell with a pending change announces it', async () => {
        const api = await gridMgr.createGridAndWait('grid', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ a: 'body a' }],
            pinnedTopRowData: [{ a: 'pinned a' }],
        });
        const gridElement = getGridElement(api)! as HTMLElement;
        const announcement = () =>
            (gridElement.querySelector('.ag-aria-description-container')?.textContent ?? '').replaceAll('​', '');

        const user = userEvent.setup({ skipHover: true });
        api.startBatchEdit();

        api.startEditingCell({ rowIndex: 0, rowPinned: 'top', colKey: 'a' });
        const input = await waitForInput(gridElement);
        await user.clear(input);
        await user.type(input, 'pinned edited{Enter}');

        api.setFocusedCell(0, 'a');
        api.setFocusedCell(0, 'a', 'top');

        await waitFor(() => expect(announcement()).toContain('Pending Change'));
    });
});
