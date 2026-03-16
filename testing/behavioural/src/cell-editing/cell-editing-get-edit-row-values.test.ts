import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

describe('getEditRowValues returns current editor values during active editing', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('single cell edit returns typed value while editor is open', async () => {
        const api = await gridMgr.createGridAndWait('getEditRowValuesSingle', {
            defaultColDef: {
                editable: true,
            },
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData: [{ id: 'ROW_0', athlete: 'Natalie Coughlin', age: 25 }],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'athlete'));

        api.startEditingCell({ rowIndex: 0, colKey: 'athlete' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'aaaaa');

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        const editValues = api.getEditRowValues(rowNode);

        expect(editValues).toBeDefined();
        expect(editValues!.athlete).toBe('aaaaa');
        // Original data should not be mutated
        expect(rowNode.data.athlete).toBe('Natalie Coughlin');
    });

    test('full-row edit returns all typed values while editors are open', async () => {
        const api = await gridMgr.createGridAndWait('getEditRowValuesFullRow', {
            editType: 'fullRow',
            defaultColDef: {
                editable: true,
                cellDataType: false,
            },
            columnDefs: [{ field: 'athlete' }, { field: 'age' }],
            rowData: [{ id: 'ROW_0', athlete: 'Natalie Coughlin', age: 25 }],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const athleteCell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'athlete'));

        api.startEditingCell({ rowIndex: 0, colKey: 'athlete' });
        const athleteInput = await waitForInput(gridDiv, athleteCell);
        await user.clear(athleteInput);
        await user.type(athleteInput, 'aaaaa');

        // Tab to next cell
        await user.keyboard('{Tab}');

        const ageCell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'age'));
        const ageInput = await waitForInput(gridDiv, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '555');

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        const editValues = api.getEditRowValues(rowNode);

        expect(editValues).toBeDefined();
        expect(editValues!.athlete).toBe('aaaaa');
        expect(editValues!.age).toBe('555');
        // Original data should not be mutated
        expect(rowNode.data.athlete).toBe('Natalie Coughlin');
        expect(rowNode.data.age).toBe(25);
    });
});
