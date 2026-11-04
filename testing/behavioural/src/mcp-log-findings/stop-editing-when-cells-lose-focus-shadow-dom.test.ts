/**
 * Issue: with the grid rendered inside an open shadow root and `stopEditingWhenCellsLoseFocus: true`,
 * moving focus out of the grid may not stop the cell editor (the focusout handler relies on
 * `relatedTarget`, which browsers retarget across shadow boundaries).
 *
 * Setup: grid in a custom host's open shadow root, with a focusable button inside the shadow root
 * (outside the grid) and another outside the host. Start editing a cell, then focus each button.
 *
 * Expected: editing stops. `stopEditingWhenCellsLoseFocus` is documented as "Set to true to stop the
 * grid editing a cell when focus leaves the grid" (GridOptions API documentation).
 *
 * Actual (as reported): editing does not stop.
 *
 * Reported on: AG Grid React 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). One search, from a React 35.1.0 client in
 * April 2026: "cell editor stopEditingWhenCellsLoseFocus focus outside grid shadow DOM web component".
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('stopEditingWhenCellsLoseFocus inside Shadow DOM', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, TextEditorModule] });

    afterEach(() => {
        gridMgr.reset();
        document.body.innerHTML = '';
    });

    const startEditingInShadowRoot = async () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const gridDiv = document.createElement('div');
        const shadowButton = document.createElement('button');
        const outsideButton = document.createElement('button');
        shadowRoot.append(gridDiv, shadowButton);
        document.body.appendChild(outsideButton);

        const api = gridMgr.createGrid(gridDiv, {
            columnDefs: [{ field: 'name', editable: true }],
            rowData: [{ name: 'a' }],
            stopEditingWhenCellsLoseFocus: true,
        });

        await waitFor(() => expect(gridDiv.querySelector('[col-id="name"]')).toBeTruthy());
        api.startEditingCell({ rowIndex: 0, colKey: 'name' });
        await waitFor(() => expect(api.getEditingCells().length).toBe(1));

        return { api, shadowButton, outsideButton };
    };

    test('focus moving outside the host stops editing', async () => {
        const { api, outsideButton } = await startEditingInShadowRoot();
        outsideButton.focus();
        await waitFor(() => expect(api.getEditingCells()).toEqual([]));
    });

    test('focus moving inside the shadow root, outside the grid stops editing', async () => {
        const { api, shadowButton } = await startEditingInShadowRoot();
        shadowButton.focus();
        await waitFor(() => expect(api.getEditingCells()).toEqual([]));
    });
});
