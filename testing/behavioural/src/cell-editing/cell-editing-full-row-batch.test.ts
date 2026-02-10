import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { EditEventTracker, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

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
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
        });

        if (action === 'commit') {
            await new GridRows(api, `after ${action}`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A1" b:"B0"
            `);
            expect(valueSetterTargets).toEqual(['ROW_0:a']);
            expect(valueSetterCalls).toBe(1);
        } else {
            await new GridRows(api, `after ${action}`).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:ROW_0 a:"A0" b:"B0"
            `);
            expect(valueSetterTargets).toEqual([]);
            expect(valueSetterCalls).toBe(0);
        }
    });

    test('rowValueChanged does not fire during batch row-to-row Tab navigation', async () => {
        const api = await gridMgr.createGridAndWait('cellEditingFullRowBatch-rowNav', {
            editType: 'fullRow',
            defaultColDef: { editable: true },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { id: 'ROW_0', a: 'A0', b: 'B0' },
                { id: 'ROW_1', a: 'A1', b: 'B1' },
            ],
            getRowId: (params) => params.data.id,
        });
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"A0" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Start batch editing
        api.startBatchEdit();

        // Click and edit row 0 col a
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a'));
        await user.click(cell);
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'X');

        // Tab from col a -> col b (same row)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Tab from col b -> next row (crosses row boundary)
        await user.keyboard('{Tab}');
        await asyncSetTimeout(0);

        // Before commit: pending edits visible in batch mode, but data not yet committed
        await new GridRows(api, 'before commit', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"X" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);

        // Before commit: no value events should have fired
        expect(eventTracker.counts.rowValueChanged).toBe(0);
        expect(eventTracker.counts.cellValueChanged).toBe(0);

        // Now commit
        eventTracker.reset();
        api.commitBatchEdit();
        await asyncSetTimeout(0);

        // After commit: rowValueChanged and cellValueChanged should each fire exactly once
        expect(eventTracker.counts.rowValueChanged).toBe(1);
        expect(eventTracker.counts.cellValueChanged).toBe(1);

        // Data committed for row 0 only
        await new GridRows(api, 'after commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"X" b:"B0"
            └── LEAF id:ROW_1 a:"A1" b:"B1"
        `);
    });
});
