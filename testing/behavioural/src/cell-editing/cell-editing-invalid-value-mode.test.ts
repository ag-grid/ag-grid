import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { NumberEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout, waitForInput, waitForPopup } from '../test-utils';

const overHundredEditorParams = {
    getValidationErrors: ({ value }: { value: number | null }) =>
        value != null && value > 100 ? ['Must be 100 or less'] : null,
};

describe('Cell Editing invalidEditValueMode', () => {
    const gridMgr = new TestGridsManager({ includeDefaultModules: true, modules: [NumberEditorModule] });

    beforeAll(() => setupAgTestIds());

    afterEach(() => {
        gridMgr.reset();
    });

    test('block mode: popup editor stays open with invalid value after click outside grid', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: overHundredEditorParams,
                },
            ],
            rowData: [{ number: 10 }],
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        // 1. open the popup editor and enter an invalid value (> 100)
        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cell, { popup: true });
        await userEvent.clear(input);
        await userEvent.type(input, '999');
        await asyncSetTimeout(1);
        expect(api.validateEdit()).not.toEqual([]);

        // 2. click OUTSIDE the grid -> modal popup close -> onPopupEditorClosed
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        await userEvent.click(outside);
        await asyncSetTimeout(1);

        // block takes priority over stopEditingWhenCellsLoseFocus: the popup stays open with the
        // invalid value preserved. Asserted immediately (before any click-back), so the check is
        // mechanism-agnostic and independent of any startEditing restart behaviour.
        const popup = await waitForPopup(gridDiv);
        const invalidInput = popup.querySelector<HTMLInputElement>('input')!;
        expect(invalidInput).toBeTruthy();
        expect(invalidInput.value).toBe('999');
        expect(api.getEditingCells().length).toBeGreaterThan(0);

        // 3. the grid is not wedged: the user can correct the value in place and commit
        await userEvent.clear(invalidInput);
        await userEvent.type(invalidInput, '50');
        await asyncSetTimeout(1);
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(api.validateEdit()).toEqual([]);
        expect(api.getEditingCells().length).toBe(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.number).toBe(50);

        outside.remove();
    });

    // Anti-gaming: the veto must be narrow. A modal popup editor with a VALID value (same block config)
    // must still close and commit on an outside click — otherwise an unconditional veto would break every
    // ordinary modal popup close while turning the done-gate green.
    test('block mode: popup editor with a valid value still closes and commits on click outside grid', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: overHundredEditorParams,
                },
            ],
            rowData: [{ number: 10 }],
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cell, { popup: true });
        await userEvent.clear(input);
        await userEvent.type(input, '50');
        await asyncSetTimeout(1);
        expect(api.validateEdit()).toEqual([]);

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        await userEvent.click(outside);

        await waitFor(() => expect(gridDiv.querySelector('.ag-popup')).toBeNull());
        expect(api.getEditingCells().length).toBe(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.number).toBe(50);

        outside.remove();
    });

    // AC3: the block-on-Enter / Escape paths do not involve focus loss and must be unaffected by the veto.
    test('block mode: Enter keeps the invalid popup editor open; Escape cancels and closes', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: overHundredEditorParams,
                },
            ],
            rowData: [{ number: 10 }],
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cell, { popup: true });
        await userEvent.clear(input);
        await userEvent.type(input, '999');
        await asyncSetTimeout(1);

        // Enter commits normally, but block mode holds the editor open on the invalid value
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);
        expect(await waitForPopup(gridDiv)).toBeTruthy();
        expect(api.getEditingCells().length).toBeGreaterThan(0);
        expect(api.validateEdit()).not.toEqual([]);

        // Escape cancels: the editor closes and the value reverts to the source
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(gridDiv.querySelector('.ag-popup')).toBeNull());
        expect(api.getEditingCells().length).toBe(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.number).toBe(10);
    });

    // The veto must not leak into revert mode: an invalid value on focus loss still reverts and closes.
    test('revert mode: popup editor reverts and closes on click outside grid', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: overHundredEditorParams,
                },
            ],
            rowData: [{ number: 10 }],
            invalidEditValueMode: 'revert',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'number'));

        await userEvent.dblClick(cell);
        await asyncSetTimeout(1);
        const input = await waitForInput(gridDiv, cell, { popup: true });
        await userEvent.clear(input);
        await userEvent.type(input, '999');
        await asyncSetTimeout(1);

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        await userEvent.click(outside);

        await waitFor(() => expect(gridDiv.querySelector('.ag-popup')).toBeNull());
        expect(api.getEditingCells().length).toBe(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.number).toBe(10);

        outside.remove();
    });

    // AC1 (global re-editability): after the blocked cell's invalid value is resolved (Escape), a
    // different cell must edit normally — the grid is not left globally wedged.
    test('block mode: after resolving the blocked cell, a different cell edits normally', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: overHundredEditorParams,
                },
                {
                    field: 'b',
                    editable: true,
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: overHundredEditorParams,
                },
            ],
            rowData: [{ a: 10, b: 20 }],
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));

        // block cell A with an invalid value, then click outside — the popup stays open (wedge scenario)
        await userEvent.dblClick(cellA);
        await asyncSetTimeout(1);
        const inputA = await waitForInput(gridDiv, cellA, { popup: true });
        await userEvent.clear(inputA);
        await userEvent.type(inputA, '999');
        await asyncSetTimeout(1);

        const outside = document.createElement('button');
        document.body.appendChild(outside);
        await userEvent.click(outside);
        await asyncSetTimeout(1);
        const popup = await waitForPopup(gridDiv);

        // while cell A is blocked on an invalid value, a different cell cannot take over the edit
        await userEvent.dblClick(cellB);
        await asyncSetTimeout(1);
        const editingWhileBlocked = api.getEditingCells();
        expect(editingWhileBlocked.length).toBe(1);
        expect(editingWhileBlocked[0].column.getColId()).toBe('a');

        // resolve the block by correcting cell A in the still-open popup and committing, then edit cell B
        const invalidInputA = popup.querySelector<HTMLInputElement>('input')!;
        await userEvent.clear(invalidInputA);
        await userEvent.type(invalidInputA, '40');
        await asyncSetTimeout(1);
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(gridDiv.querySelector('.ag-popup')).toBeNull());
        expect(api.getEditingCells().length).toBe(0);
        expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe(40);

        await userEvent.dblClick(cellB);
        await asyncSetTimeout(1);
        const inputB = await waitForInput(gridDiv, cellB, { popup: true });
        await userEvent.clear(inputB);
        await userEvent.type(inputB, '30');
        await asyncSetTimeout(1);
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(api.getDisplayedRowAtIndex(0)!.data.b).toBe(30);

        outside.remove();
    });
});
