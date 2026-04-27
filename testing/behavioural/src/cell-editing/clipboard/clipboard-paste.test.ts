import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import { TextEditorModule, UndoRedoEditModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
} from '../../test-utils';

describe('Clipboard Paste Behaviour: paste flows', () => {
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

    test('copy/paste should only update the destination cell once', async () => {
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

        const api = await gridMgr.createGridAndWait('clipboardGrid', {
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
            ],
        });

        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const beforeRows = new GridRows(api, 'before paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Bottom Value"
        `);

        await asyncSetTimeout(0);

        const user = userEvent.setup({ skipHover: true });
        const sourceCell = getByTestId(gridDiv, agTestIdFor.cell('0', 'field'));

        await user.click(sourceCell);
        api.setFocusedCell(0, 'field');
        await user.keyboard('{Control>}c{/Control}');

        api.setFocusedCell(1, 'field');
        await user.keyboard('{Control>}v{/Control}');
        await asyncSetTimeout(5);

        const afterRows = new GridRows(api, 'after paste');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Top Value"
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
        expect(lastSetValue).toBe('Top Value');
        expect(valueSetterTargets).toEqual(['ROW_1']);
        expect(valueSetterCalls).toBe(1);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── field "Field" width:200 editable
        `);
    });

    test('copy/paste APIs should only update the destination cell once', async () => {
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

        const api = await gridMgr.createGridAndWait('clipboardGridApi', {
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
            ],
        });

        const eventTracker = new EditEventTracker(api);

        const beforeRows = new GridRows(api, 'before api paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Bottom Value"
        `);

        clipboardUtils.setText('Top Value');
        api.setFocusedCell(1, 'field');
        const apiPasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await apiPasteEnd;

        const afterRows = new GridRows(api, 'after api paste');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Top Value"
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
        expect(lastSetValue).toBe('Top Value');
        expect(valueSetterTargets).toEqual(['ROW_1']);
        expect(valueSetterCalls).toBe(1);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── field "Field" width:200 editable
        `);
    });

    test('paste during edit session should only update the destination cell once', async () => {
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

        const api = await gridMgr.createGridAndWait('clipboardGridEditSession', {
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
            ],
        });

        const beforeRows = new GridRows(api, 'before edit session paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Bottom Value"
        `);

        api.setFocusedCell(0, 'field');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['field'] });
        api.copyToClipboard();

        api.startEditingCell({ rowIndex: 1, colKey: 'field' });
        await asyncSetTimeout(1);

        api.setFocusedCell(1, 'field');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        const afterRows = new GridRows(api, 'after edit session paste');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Top Value"
        `);

        expect(lastSetValue).toBe('Top Value');
        expect(valueSetterTargets).toEqual(['ROW_1']);
        expect(valueSetterCalls).toBe(1);
    });

    test('paste during batch edit should only update the destination cell once', async () => {
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

        const api = await gridMgr.createGridAndWait('clipboardGridBatchEdit', {
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
            ],
        });

        const beforeRows = new GridRows(api, 'before batch paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Bottom Value"
        `);

        api.startBatchEdit();

        api.setFocusedCell(0, 'field');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['field'] });
        api.copyToClipboard();

        api.setFocusedCell(1, 'field');
        api.pasteFromClipboard();
        await asyncSetTimeout(5);

        api.commitBatchEdit();
        await asyncSetTimeout(5);

        const afterRows = new GridRows(api, 'after batch paste');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Top Value"
        `);

        expect(lastSetValue).toBe('Top Value');
        expect(valueSetterTargets).toEqual(['ROW_1']);
        expect(valueSetterCalls).toBe(1);
    });

    test('batch edit paste should stage data until commit', async () => {
        let valueSetterCalls = 0;
        const valueSetterTargets: string[] = [];
        const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
            valueSetterCalls += 1;
            valueSetterTargets.push(data.id);
            data.field = newValue;
            return true;
        };

        const api = await gridMgr.createGridAndWait('clipboardGridBatchStage', {
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
            ],
        });

        const beforeRows = new GridRows(api, 'before batch staging paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Bottom Value"
        `);

        api.startBatchEdit();

        api.setFocusedCell(0, 'field');
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['field'] });
        api.copyToClipboard();

        api.setFocusedCell(1, 'field');
        api.pasteFromClipboard();
        await asyncSetTimeout(5);

        const stagedRows = new GridRows(api, 'staged batch paste');
        await stagedRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF ⏳ id:1 field:⏳"Top Value" "Bottom Value"
        `);

        const stagedRowNode = api.getDisplayedRowAtIndex(1);
        expect(stagedRowNode?.data?.field).toBe('Bottom Value');

        api.commitBatchEdit();
        await asyncSetTimeout(5);

        const afterRows = new GridRows(api, 'after batch staging commit');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF id:1 field:"Top Value"
        `);

        const committedRowNode = api.getDisplayedRowAtIndex(1);
        expect(committedRowNode?.data?.field).toBe('Top Value');
        expect(valueSetterTargets).toEqual(['ROW_1']);
        expect(valueSetterCalls).toBe(1);
    });

    test.each([false, true])(
        'full-row editing paste fires rowValueChanged once per row (batch=%s)',
        async (batchEnabled) => {
            const rowValueChangedNodes: string[] = [];
            const valueSetter = ({ data, newValue }: { data: { id: string; field: string }; newValue: string }) => {
                data.field = newValue;
                return true;
            };

            const api = await gridMgr.createGridAndWait(`clipboardGridFullRowPaste-${batchEnabled}`, {
                editType: 'fullRow',
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
                ],
                getRowId: (params) => params.data.id,
                onRowValueChanged: (event) => {
                    if (event.node?.id) {
                        rowValueChangedNodes.push(String(event.node.id));
                    }
                },
            });

            const beforeRows = new GridRows(api, `before full-row paste (batch=${batchEnabled})`);
            await beforeRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 field:"Top Value"
                └── LEAF id:ROW_1 field:"Bottom Value"
            `);

            if (batchEnabled) {
                api.startBatchEdit();
            }

            clipboardUtils.setText('Top Value');
            api.setFocusedCell(1, 'field');
            api.startEditingCell({ rowIndex: 1, colKey: 'field' });
            await asyncSetTimeout(1);

            const pasteEnd = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            await pasteEnd;

            if (batchEnabled) {
                api.commitBatchEdit();
                await asyncSetTimeout(0);
            }

            const afterRows = new GridRows(api, `after full-row paste (batch=${batchEnabled})`);
            await afterRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:ROW_0 field:"Top Value"
                └── LEAF id:ROW_1 field:"Top Value"
            `);

            await waitFor(() => expect(new Set(rowValueChangedNodes)).toEqual(new Set(['ROW_1'])));
        }
    );

    test.each([false, true])('open editor + paste keeps editor open (batch=%s)', async (batchEnabled) => {
        const api = await gridMgr.createGridAndWait(`clipboardGridOpenPaste-${batchEnabled}`, {
            cellSelection: true,
            defaultColDef: {
                editable: true,
            },
            columnDefs: [{ field: 'field', editable: true }],
            rowData: [
                { id: 'ROW_0', field: 'Top Value' },
                { id: 'ROW_1', field: 'Bottom Value' },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        if (batchEnabled) {
            api.startBatchEdit();
        }

        const user = userEvent.setup({ skipHover: true });
        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'field'));
        await user.click(cell);
        api.setFocusedCell(0, 'field');
        api.startEditingCell({ rowIndex: 0, colKey: 'field' });
        await waitFor(() => expect(api.getEditingCells().length).toBe(1));

        clipboardUtils.setText('Top Value');
        api.setFocusedCell(0, 'field');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        await waitFor(() => expect(api.getEditingCells().length).toBe(batchEnabled ? 1 : 0));

        if (batchEnabled) {
            api.commitBatchEdit();
            await asyncSetTimeout(0);
        }
    });

    test('readOnlyEdit paste fires cellEditRequest once', async () => {
        const editRequests: string[] = [];

        const api = await gridMgr.createGridAndWait('clipboardGridReadOnlyPaste', {
            readOnlyEdit: true,
            columnDefs: [
                {
                    field: 'field',
                    editable: true,
                },
            ],
            rowData: [
                { id: 'ROW_0', field: 'Top Value' },
                { id: 'ROW_1', field: 'Bottom Value' },
            ],
            getRowId: (params) => params.data.id,
            onCellEditRequest: (event) => {
                editRequests.push(`${event.node?.id ?? 'unknown'}:${event.colDef.field}:${event.newValue}`);
            },
        });

        const beforeRows = new GridRows(api, 'before readOnly paste');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            └── LEAF id:ROW_1 field:"Bottom Value"
        `);

        clipboardUtils.setText('Top Value');
        api.setFocusedCell(1, 'field');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        const afterRows = new GridRows(api, 'after readOnly paste');
        await afterRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 field:"Top Value"
            └── LEAF id:ROW_1 field:"Bottom Value"
        `);

        expect(editRequests).toEqual(['ROW_1:field:Top Value']);
    });
});
