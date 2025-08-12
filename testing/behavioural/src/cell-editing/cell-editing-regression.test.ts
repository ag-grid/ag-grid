import { fireEvent, getByTestId, waitFor, within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { RichSelectModule } from 'ag-grid-enterprise';

import {
    TestGridsManager,
    asyncSetTimeout,
    fakeElementAttribute,
    getAllRows,
    waitForInput,
    waitForPopup,
} from '../test-utils';
import { expect } from '../test-utils/matchers';

describe('Cell Editing Regression', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [RichSelectModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridMgr.reset());

    // AG-15694
    describe('when data is null', () => {
        test.each([
            { field: 'string1', expected: '', popup: false },
            { field: 'string2', expected: '', popup: true },
        ])('valueFormatter', async ({ field, expected, popup }) => {
            const valueFormatter = vi.fn((params) => `Formatted: ${params.value}`);

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'string1', cellEditor: 'agTextCellEditor', valueFormatter },
                    { field: 'string2', cellEditor: 'agLargeTextCellEditor', valueFormatter },
                ],
                rowData: [
                    {
                        string1: undefined,
                        string2: undefined,
                    },
                ],
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', field!));
            await userEvent.dblClick(cell);

            await asyncSetTimeout(1);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expect(inputElement).toHaveValue(expected as any);
            expect(valueFormatter).toHaveBeenCalled();
        });
    });

    // AG-15698 - row doesn't rerender after value is selected in rich select editor
    test('cell not refreshed after richSelectEditor select', async () => {
        // virtualList doesn't add option elements if the offsetHeight is 0, so we need to fake it
        fakeElementAttribute('offsetHeight', 100, '.ag-virtual-list-viewport');

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'code',
                    cellEditor: 'agRichSelectCellEditor',
                    cellEditorParams: {
                        values: [0, 1],
                    },
                    valueGetter: ({ data: { code } }) =>
                        ({
                            0: '0 - zero',
                            1: '1 - one',
                        })[code],
                    valueSetter: ({ newValue, data }) => {
                        const valueChanged = data.code !== newValue;
                        if (valueChanged) {
                            data.code = newValue;
                        }

                        return valueChanged;
                    },
                    editable: true,
                },
            ],
            rowData: [{ code: 0 }],
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'code'));
        await userEvent.dblClick(cell);

        await asyncSetTimeout(1);

        const popup = await waitForPopup(gridDiv);
        const option = await waitFor(() => within(popup).getByRole('option', { name: '1' }));

        // agRichSelectCellEditor derives the item clicked from the click event, so we need to simulate a click with clientY
        // to ensure the correct item is selected
        fireEvent(
            option,
            new MouseEvent('click', {
                bubbles: true,
                clientY: 24,
            })
        );

        await userEvent.click(option, {});

        await asyncSetTimeout(1);

        expect(getAllRows(api)[0].data.code).toBe(1);

        // api.refreshCells();

        expect(cell).toHaveTextContent('1 - one');
    });

    // Regression test for first cell edit event newValue is Symbol(unedited)
    test('newValue=Symbol', async () => {
        const onCellEditingStopped = vi.fn();
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'field',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            editType: 'fullRow',
            rowData: [{ field: 0 }, { field: 1 }],
            onCellEditingStopped: ({ newValue }) => onCellEditingStopped(newValue),
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
        await userEvent.click(cell);

        await userEvent.keyboard('1');
        const inputElement = await waitForInput(gridDiv, cell, { popup: false });
        await userEvent.type(inputElement, '2');
        await userEvent.keyboard('{Enter}');

        expect(cell).toHaveTextContent('12');

        expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
        expect(onCellEditingStopped).toHaveBeenCalledWith(12);
    });

    // onCellEditingStopped.newValue for v33 returns the editor value, even if no edit occurred
    describe('onCellEditingStopped', () => {
        test.each([
            { action: undefined, expected: 'A Value' },
            { action: 'Test', expected: 'Test' },
        ])('newValue is $expected', async ({ action, expected }) => {
            const onCellEditingStopped = vi.fn();
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'field',
                        cellEditor: 'agTextCellEditor',
                        editable: true,
                    },
                ],
                readOnlyEdit: true,
                rowData: [{ field: 'A Value' }],
                onCellEditingStopped: ({ newValue }) => onCellEditingStopped(newValue),
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            await asyncSetTimeout(1);

            const cell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));
            await userEvent.dblClick(cell);

            const inputElement = await waitForInput(gridDiv, cell, { popup: false });
            if (action) {
                await userEvent.clear(inputElement);
                await userEvent.type(inputElement, action);
            }
            expect(inputElement).toHaveValue(expected);

            await userEvent.type(inputElement, '{Enter}');

            expect(cell).toHaveTextContent('A Value');

            expect(onCellEditingStopped).toHaveBeenCalledTimes(1);
            expect(onCellEditingStopped).toHaveBeenCalledWith(expected);
        });
    });
});
