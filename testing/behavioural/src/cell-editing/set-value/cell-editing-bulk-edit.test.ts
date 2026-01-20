import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule } from 'ag-grid-enterprise';

import { EditEventTracker, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

describe('Cell Editing: bulk edit', () => {
    const gridMgr = new TestGridsManager({
        modules: [CellSelectionModule, BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each([false, true])('bulk edit (Ctrl+Enter) updates once per cell (batch=%s)', async (batchEnabled) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string };
            newValue: any;
            colDef: { field?: string };
        }) => {
            valueSetterCalls += 1;
            if (colDef.field) {
                valueSetterTargets.push(`${data.id}:${colDef.field}`);
                data[colDef.field as 'a' | 'b'] = newValue;
            }
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingBulk-${batchEnabled}`, {
            cellSelection: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [
                { field: 'a', editable: true, valueSetter },
                { field: 'b', editable: true, valueSetter },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, `before bulk edit (batch=${batchEnabled})`);
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Bulk Value');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        const afterRows = new GridRows(api, `after bulk edit (batch=${batchEnabled})`);
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"Bulk Value" b:"Bulk Value"
            └── LEAF id:ROW_1 a:"Bulk Value" b:"Bulk Value"
        `);

        if (batchEnabled) {
            expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('A0');
            expect(api.getDisplayedRowAtIndex(0)?.data?.b).toBe('B0');
            expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('A1');
            expect(api.getDisplayedRowAtIndex(1)?.data?.b).toBe('B1');
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 1,
            cellEditingStopped: batchEnabled ? 9 : 5,
            cellValueChanged: valueSetterCalls,
            rowValueChanged: 0,
            cellEditRequest: 0,
        });

        expect(api.getDisplayedRowAtIndex(0)?.data?.a).toBe('Bulk Value');
        expect(api.getDisplayedRowAtIndex(0)?.data?.b).toBe('Bulk Value');
        expect(api.getDisplayedRowAtIndex(1)?.data?.a).toBe('Bulk Value');
        expect(api.getDisplayedRowAtIndex(1)?.data?.b).toBe('Bulk Value');
        expect(valueSetterTargets).toEqual(['ROW_0:a', 'ROW_0:b', 'ROW_1:a', 'ROW_1:b']);
        expect(valueSetterCalls).toBe(4);
    });
});
