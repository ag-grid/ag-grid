import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, UndoRedoEditModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
} from '../../test-utils';

describe('Clipboard Paste Behaviour: fill handle', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClipboardModule, CellSelectionModule, BatchEditModule, UndoRedoEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
    });

    test('fill handle after paste should only update each target once', async () => {
        let valueSetterCalls = 0;
        let lastSetValue: string | undefined;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            lastSetValue = newValue;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('clipboardGridFillHandle', {
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                    valueSetter,
                },
            ],
            rowData: [
                { id: 'ROW_0', field: 'Top Value' },
                { id: 'ROW_1', field: 'Bottom Value' },
                { id: 'ROW_2', field: 'Bottom Value 2' },
            ],
            getRowId: (params) => params.data.id,
        });

        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before fill handle paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            ├── LEAF id:ROW_1 field:"Bottom Value"
            └── LEAF id:ROW_2 field:"Bottom Value 2"
        `);

        clipboardUtils.setText('Top Value');
        api.setFocusedCell(1, 'field');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        const afterPasteRows = new GridRows(api, 'after paste before fill');
        await afterPasteRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            ├── LEAF id:ROW_1 field:"Top Value"
            └── LEAF id:ROW_2 field:"Bottom Value 2"
        `);

        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 0,
            cellEditingStopped: 0,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });

        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'field'));
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
        cell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;

        const afterFillRows = new GridRows(api, 'after fill handle paste');
        await afterFillRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            ├── LEAF id:ROW_1 field:"Top Value"
            └── LEAF id:ROW_2 field:"Top Value"
        `);

        expect(lastSetValue).toBe('Top Value');
        expect(valueSetterTargets).toEqual(['ROW_1', 'ROW_2']);
        expect(valueSetterCalls).toBe(2);
    });

    test('readOnlyEdit fill handle fires cellEditRequest once per target', async () => {
        const editRequests: string[] = [];

        const api = await gridMgr.createGridAndWait('clipboardGridReadOnlyFill', {
            readOnlyEdit: true,
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                },
            ],
            rowData: [
                { id: 'ROW_0', field: 'Top Value' },
                { id: 'ROW_1', field: 'Bottom Value' },
                { id: 'ROW_2', field: 'Bottom Value 2' },
            ],
            getRowId: (params) => params.data.id,
            onCellEditRequest: (event) => {
                editRequests.push(`${event.node?.id ?? 'unknown'}:${event.colDef.field}:${event.newValue}`);
            },
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before readOnly fill handle');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            ├── LEAF id:ROW_1 field:"Bottom Value"
            └── LEAF id:ROW_2 field:"Bottom Value 2"
        `);

        await asyncSetTimeout(1);
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
        cell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;

        const afterRows = new GridRows(api, 'after readOnly fill handle');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            ├── LEAF id:ROW_1 field:"Bottom Value"
            └── LEAF id:ROW_2 field:"Bottom Value 2"
        `);

        expect(editRequests).toEqual(['ROW_1:field:Top Value', 'ROW_2:field:Top Value']);
    });
});
