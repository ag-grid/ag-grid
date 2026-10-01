import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, waitForInput } from 'ag-test-utils';

import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberEditorModule, getGridElement } from 'ag-grid-community';

interface NumberEditorParams {
    precision?: number;
    min?: number;
    max?: number;
}

describe('agNumberCellEditor with precision, scientific-notation input', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, NumberEditorModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    const cell = (api: GridApi, rowIndex: number): HTMLElement =>
        getGridElement(api)!.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="number"]`)!;

    const editCell = async (params: NumberEditorParams, typed: string, original = 42) => {
        const rowData = [{ number: original }, { number: 1 }];
        const api = await gridsManager.createGridAndWait('numberEditorSci', {
            rowData,
            columnDefs: [
                { field: 'number', editable: true, cellEditor: 'agNumberCellEditor', cellEditorParams: params },
            ],
        });
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0));
        const input = await waitForInput(getGridElement(api)! as HTMLElement, cell(api, 0));
        await user.clear(input);
        await user.type(input, typed);

        return { api, rowData, user };
    };

    const editAndClickAway = async (params: NumberEditorParams, typed: string, original?: number) => {
        const result = await editCell(params, typed, original);
        await result.user.click(cell(result.api, 1));
        return result;
    };

    test('clicking another cell does not commit an out-of-range value truncated to 1.23', async () => {
        const { api, rowData } = await editAndClickAway(
            { precision: 2, min: 0, max: 100 },
            '1234567890123456789012',
            0
        );

        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].number).toBe(0);
        expect(cell(api, 0).textContent).toBe('0');
    });

    test('pressing Enter does not commit the same out-of-range value', async () => {
        const { api, rowData, user } = await editCell({ precision: 2, min: 0, max: 100 }, '1234567890123456789012');

        await user.keyboard('{Enter}');

        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].number).toBe(42);
        expect(cell(api, 0).textContent).toBe('42');
    });

    test('clicking away with precision only commits the full-magnitude value', async () => {
        const { api, rowData } = await editAndClickAway({ precision: 2 }, '1234567890123456789012');

        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].number).toBe(Number('1234567890123456789012'));
    });

    test('clicking away does not commit a large negative value below min', async () => {
        const { api, rowData } = await editAndClickAway({ precision: 2, min: -100 }, '-1234567890123456789012');

        expect(api.getCellEditorInstances()).toHaveLength(0);
        expect(rowData[0].number).toBe(42);
        expect(cell(api, 0).textContent).toBe('42');
    });

    test('clicking away still truncates a non-scientific value to the precision', async () => {
        const { rowData } = await editAndClickAway({ precision: 2 }, '12.3456');

        expect(rowData[0].number).toBe(12.34);
    });

    test('clicking away keeps a tiny scientific-notation value at the precision', async () => {
        const { rowData } = await editAndClickAway({ precision: 8 }, '0.00000015');

        expect(rowData[0].number).toBe(1.5e-7);
    });
});
