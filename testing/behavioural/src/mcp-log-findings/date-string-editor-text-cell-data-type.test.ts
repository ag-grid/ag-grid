/*
 * Issue: agDateStringCellEditor throws "TypeError: ... is not a function" (the date parser is
 * undefined) when the column has a non-dateString cellDataType such as 'text'.
 *
 * Setup: a grid with the data type feature enabled and a column with editable: true,
 * cellEditor: 'agDateStringCellEditor' and cellDataType: 'text' (the same happens when the data
 * type is inferred as text, e.g. for strings such as 'dd/mm/yyyy'). The cell is edited and the
 * editor is stopped.
 *
 * Expected: the provided cell editors documentation (agDateStringCellEditor) shows the editor being
 * used with only cellEditor set and no cellDataType requirement, so the editor should work and fall
 * back to the default dateString parser and formatter, as it does when no cellDataType is set.
 *
 * Actual: the data type service returns the 'text' definition for the column, which has no
 * dateParser, so the editor calls an undefined function and throws.
 *
 * Reported on: AG Grid react 36.0.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent on React 36.0.0
 * searched, in October 2026: "date cell editor getDateParserFunction dataType definition validation"
 * and "agDateStringCellEditor cellDataType requirement column definition cell editing start error".
 */
import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import {
    ClientSideRowModelModule,
    DateEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

describe('agDateStringCellEditor with a text cellDataType', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [ClientSideRowModelModule, DateEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('editing a text column with agDateStringCellEditor does not throw', async () => {
        const errors: unknown[] = [];
        const onError = (e: ErrorEvent) => {
            errors.push(e.error ?? e.message);
            e.preventDefault();
        };
        window.addEventListener('error', onError);

        try {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'd', editable: true, cellEditor: 'agDateStringCellEditor', cellDataType: 'text' },
                ],
                rowData: [{ d: '2025-01-01' }],
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'd')));
            let thrown: unknown;
            try {
                await userEvent.dblClick(cell);
                const input = (await waitForInput(gridDiv, cell)) as HTMLInputElement;
                await userEvent.clear(input);
                await userEvent.type(input, '2025-02-02');
                api.stopEditing();
                await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            } catch (e) {
                thrown = e;
            }

            expect(errors).toEqual([]);
            expect(thrown).toBeUndefined();
        } finally {
            window.removeEventListener('error', onError);
        }
    });
});
