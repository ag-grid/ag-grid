/*
 * Issue: with a popup cell editor and stopEditingWhenCellsLoseFocus=true, moving focus
 * programmatically to an element outside the grid does not stop editing.
 *
 * Setup: a column with editable: true and cellEditorPopup: true, and the grid option
 * stopEditingWhenCellsLoseFocus: true. A cell is edited (focus is inside the popup editor), then
 * focus is moved with .focus() to a button outside the grid (no mouse events, e.g. an external
 * dialog taking focus).
 *
 * Expected: the stopEditingWhenCellsLoseFocus documentation (cell editing start/stop page and
 * GridOptions JSDoc) says editing stops when focus leaves the grid, so api.getEditingCells()
 * should become empty.
 *
 * Actual: the focusout listener is only attached to the grid viewports, but the popup editor lives
 * in a popup element outside them, so the focus move is not handled and the cell stays in edit mode.
 *
 * Reported on: AG Grid vanilla 31.3.2.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on vanilla 31.3.2
 * searched, in March 2026: "popup editor focus outside grid stopEditing cancel workaround
 * external dialog modal focus management".
 */
import { getByTestId, waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

describe('stopEditingWhenCellsLoseFocus with a popup editor', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
        document.body.innerHTML = '';
    });

    // Control: the same programmatic focus move with an in-cell (non-popup) editor does stop editing,
    // so the gap in the test below is specific to popup editors.
    test('control: moving focus outside the grid stops editing with an in-cell editor', async () => {
        const outside = document.createElement('button');
        outside.textContent = 'outside';
        document.body.appendChild(outside);

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ a: 'x' }],
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));

        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
        const input = await waitFor(() => {
            const el = gridDiv.querySelector<HTMLInputElement>('.ag-cell-inline-editing input');
            expect(el).not.toBeNull();
            return el!;
        });
        input.focus();
        await waitFor(() => expect(document.activeElement).toBe(input));

        outside.focus();
        expect(document.activeElement).toBe(outside);

        await waitFor(() => expect(api.getEditingCells()).toHaveLength(0), { timeout: 1000 });
    });

    test('moving focus to an element outside the grid stops editing', async () => {
        const outside = document.createElement('button');
        outside.textContent = 'outside';
        document.body.appendChild(outside);

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditorPopup: true }],
            rowData: [{ a: 'x' }],
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));

        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-popup-editor input');
            expect(el).not.toBeNull();
            return el!;
        });
        input.focus();
        await waitFor(() => expect(document.activeElement).toBe(input));

        outside.focus();
        expect(document.activeElement).toBe(outside);

        await waitFor(() => expect(api.getEditingCells()).toHaveLength(0), { timeout: 1000 });
    });
});
