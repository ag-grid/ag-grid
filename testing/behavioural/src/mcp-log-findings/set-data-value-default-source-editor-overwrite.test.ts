/*
 * Issue: calling rowNode.setDataValue(col, value) with no eventSource while a cell editor is open
 * (non-batch editing) writes the value but leaves the editor open. When editing later stops, the
 * editor's live value is committed and overwrites the value that was written programmatically.
 *
 * Setup: an editable column using the default text editor, no batch editing. The cell is put into
 * edit mode and a different value is typed, then rowNode.setDataValue('field', 'Programmatic') is
 * called with no eventSource, then api.stopEditing() is called.
 *
 * Expected: the cell editing (batch) documentation's "rowNode.setDataValue()" table lists the default
 * eventSource (no argument) as closing the active editor, so the written value should stand after
 * editing stops.
 *
 * Actual: the editor stays open after setDataValue, and stopping editing commits the typed editor value,
 * so the data ends up as the typed value instead of the programmatic one.
 *
 * Reported on: AG Grid react 32.3.5 (a custom editor whose getValue is read on stop; reproduced here
 * with the default text editor in vanilla JS, which uses the same editor value path).
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 32.3.5 searched, in
 * July 2026: "custom cell editor getValue setDataValue during editing value overwritten when stop editing React".
 *
 * Placement: a standalone file because the behaviour spans two subsystems with no single owning suite
 * (rowNode.setDataValue value setting and cell editing lifecycle); it lives with the other AG-18665 repros.
 */
import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

describe('setDataValue with default eventSource while editing', () => {
    const gridMgr = new TestGridsManager({ modules: [TextEditorModule] });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('written value stands after the editor is stopped', async () => {
        const api = await gridMgr.createGridAndWait('setDataValueDefaultSourceEditor', {
            columnDefs: [{ field: 'field', editable: true }],
            rowData: [{ id: 'ROW_0', field: 'Initial' }],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field')));
        await userEvent.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'field' });
        const input = await waitForInput(gridDiv, cell);
        await userEvent.clear(input);
        await userEvent.type(input, 'Typed');

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('field', 'Programmatic');
        // docs: the default eventSource closes the active editor
        expect(api.getEditingCells()).toHaveLength(0);
        api.stopEditing();

        await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
        expect(rowNode.data.field).toBe('Programmatic');
    });
});
