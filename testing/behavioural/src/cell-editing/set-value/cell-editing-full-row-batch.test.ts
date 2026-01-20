import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { EditEventTracker, TestGridsManager, asyncSetTimeout, waitForInput } from '../../test-utils';

describe('Cell Editing: full-row batch', () => {
    const gridMgr = new TestGridsManager({
        modules: [BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test.each(['commit', 'cancel'] as const)('full-row batch %s does not duplicate updates', async (action) => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({
            data,
            newValue,
            colDef,
        }: {
            data: { id: string; a: string; b: string };
            newValue: string;
            colDef: any;
        }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(`${data.id}:${colDef.field}`);
            (data as any)[colDef.field] = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait(`cellEditingFullRowBatch-${action}`, {
            editType: 'fullRow',
            defaultColDef: {
                editable: true,
                valueSetter,
            },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ id: 'ROW_0', a: 'A0', b: 'B0' }],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        api.startBatchEdit();

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'A1');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        if (action === 'commit') {
            api.commitBatchEdit();
        } else {
            api.cancelBatchEdit();
        }
        await asyncSetTimeout(0);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 3,
            cellValueChanged: action === 'commit' ? 1 : 0,
            rowValueChanged: action === 'commit' ? 1 : 0,
            cellEditRequest: 0,
        });

        const row = api.getDisplayedRowAtIndex(0)?.data as { a: string; b: string } | undefined;
        if (action === 'commit') {
            expect(row?.a).toBe('A1');
            expect(row?.b).toBe('B0');
            expect(valueSetterTargets).toEqual(['ROW_0:a']);
            expect(valueSetterCalls).toBe(1);
        } else {
            expect(row?.a).toBe('A0');
            expect(row?.b).toBe('B0');
            expect(valueSetterTargets).toEqual([]);
            expect(valueSetterCalls).toBe(0);
        }
    });
});
