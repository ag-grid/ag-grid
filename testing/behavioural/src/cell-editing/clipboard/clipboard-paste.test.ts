import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
} from 'ag-test-utils';

import { TextEditorModule, UndoRedoEditModule, agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

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
        await waitFor(() => expect(valueSetterCalls).toBeGreaterThanOrEqual(1));
        // one macrotask window in which a duplicate update of the destination cell would land
        await asyncSetTimeout(0);

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
        await waitFor(() => expect(api.getEditingCells().length).toBeGreaterThanOrEqual(1));

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
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        api.commitBatchEdit();
        await waitFor(() => expect(valueSetterCalls).toBeGreaterThanOrEqual(1));
        // one macrotask window in which a duplicate update of the destination cell would land
        await asyncSetTimeout(0);

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
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        const stagedRows = new GridRows(api, 'staged batch paste');
        await stagedRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 field:"Top Value"
            └── LEAF ⏳ id:1 field:⏳"Top Value" "Bottom Value"
        `);

        const stagedRowNode = api.getDisplayedRowAtIndex(1);
        expect(stagedRowNode?.data?.field).toBe('Bottom Value');

        api.commitBatchEdit();
        await waitFor(() => expect(api.getDisplayedRowAtIndex(1)?.data?.field).toBe('Top Value'));
        // one macrotask window in which a duplicate valueSetter call would land
        await asyncSetTimeout(0);

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
            await waitFor(() => expect(api.getEditingCells().length).toBeGreaterThanOrEqual(1));

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

    test('batch paste stages every cell once (coalesced), then commit applies them all', async () => {
        const api = await gridMgr.createGridAndWait('bulkCoalesce', {
            columnDefs: [
                { colId: 'a', field: 'a', editable: true },
                { colId: 'b', field: 'b', editable: true },
            ],
            rowData: [
                { id: 'r0', a: 'a0', b: 'b0' },
                { id: 'r1', a: 'a1', b: 'b1' },
            ],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'before batch paste').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r0 a:"a0" b:"b0"
            └── LEAF id:r1 a:"a1" b:"b1"
        `);

        api.startBatchEdit();

        clipboardUtils.setText('X0\tY0\nX1\tY1');
        api.setFocusedCell(0, 'a');
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasted;

        expect(api.getEditingCells()).toHaveLength(4);

        await new GridRows(api, 'staged, pre-commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:r0 a:⏳"X0" "a0" b:⏳"Y0" "b0"
            └── LEAF ⏳ id:r1 a:⏳"X1" "a1" b:⏳"Y1" "b1"
        `);

        api.commitBatchEdit();

        await new GridRows(api, 'after commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r0 a:"X0" b:"Y0"
            └── LEAF id:r1 a:"X1" b:"Y1"
        `);
        expect(api.getEditingCells()).toHaveLength(0);
    });

    test('batch paste scoped purge drops only the cell whose pasted value matches its source', async () => {
        const api = await gridMgr.createGridAndWait('bulkPurge', {
            columnDefs: [
                { colId: 'a', field: 'a', editable: true },
                { colId: 'b', field: 'b', editable: true },
            ],
            rowData: [
                { id: 'r0', a: 'a0', b: 'b0' },
                { id: 'r1', a: 'a1', b: 'b1' },
            ],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'purge: before').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r0 a:"a0" b:"b0"
            └── LEAF id:r1 a:"a1" b:"b1"
        `);

        api.startBatchEdit();

        // Pre-stage an unrelated pending edit that the scoped purge must NOT remove.
        clipboardUtils.setText('KEEP');
        api.setFocusedCell(0, 'a');
        const preStaged = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await preStaged;

        await new GridRows(api, 'purge: after pre-stage r0/a').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:r0 a:⏳"KEEP" "a0" b:"b0"
            └── LEAF id:r1 a:"a1" b:"b1"
        `);

        // Paste a 2×1 block into b: r0/b receives its own source value 'b0' (→ purged), r1/b changes (→ kept).
        clipboardUtils.setText('b0\nZ1');
        api.setFocusedCell(0, 'b');
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasted;

        // r0/b purged (no ⏳), r1/b kept, and the pre-staged r0/a survived the scoped purge.
        await new GridRows(api, 'purge: after paste into b').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:r0 a:⏳"KEEP" "a0" b:"b0"
            └── LEAF ⏳ id:r1 a:"a1" b:⏳"Z1" "b1"
        `);
        expect(
            api
                .getEditingCells()
                .map((c: { rowIndex: number | null; colId: string }) => `${c.rowIndex}:${c.colId}`)
                .sort()
        ).toEqual(['0:a', '1:b']);
    });

    test('batch full-row paste keeps pasted values for non-focused open editors, not their stale values', async () => {
        const api = await gridMgr.createGridAndWait('bulkFullRowOpenEditor', {
            editType: 'fullRow',
            cellSelection: true,
            columnDefs: [
                { colId: 'a', field: 'a', editable: true },
                { colId: 'b', field: 'b', editable: true },
            ],
            rowData: [{ id: 'r0', a: 'a0', b: 'b0' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();

        // Full-row editing opens an editor on EVERY cell of the row; only 'a' is focused, so 'b' stays
        // stale (showing 'b0') while the paste stages 'Y0' into it.
        api.setFocusedCell(0, 'a');
        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await waitFor(() => expect(api.getEditingCells().length).toBe(2));

        clipboardUtils.setText('X0\tY0');
        api.setFocusedCell(0, 'a');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;

        api.commitBatchEdit();
        await asyncSetTimeout(0);

        await new GridRows(api, 'after commit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r0 a:"X0" b:"Y0"
        `);
    });

    test.each([
        {
            name: 'Windows Excel CRLF after a filled range',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<html><head><style>tr { color: black }</style></head><body link="blue"><table><col span=2><!--StartFragment--><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><!--EndFragment--></table></body></html>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
        {
            name: 'LF after a filled range with a table body',
            plain: 'a1\tb1\na2\tb2\n',
            html: '<html><body><table><tbody><tr><td><p>a1</p></td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></tbody></table></body></html>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
        {
            name: 'Windows Excel with a selected blank third row',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td></td></tr></table>',
            lastRow: { a: null, b: null },
            callbackRows: 3,
            lastCallbackRow: ['', ''],
        },
        {
            name: 'Mac Excel with a selected blank third row and no terminal newline',
            plain: 'a1\tb1\r\na2\tb2',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td></td></tr></table>',
            lastRow: { a: null, b: null },
            callbackRows: 3,
            lastCallbackRow: ['', ''],
        },
        {
            name: 'a selected blank row represented by empty HTML paragraphs',
            plain: 'a1\tb1\na2\tb2\n',
            html: '<html><body><table><tbody><tr><td><p>a1</p></td><td><p>b1</p></td></tr><tr><td><p>a2</p></td><td><p>b2</p></td></tr><tr><td><p class="p2"><br></p></td><td><p class="p2"><br></p></td></tr></tbody></table></body></html>',
            lastRow: { a: null, b: null },
            callbackRows: 3,
            lastCallbackRow: ['', ''],
        },
        {
            name: 'a nonblank cell in an HTML-only row',
            plain: 'a1\tb1\r\na2\tb2',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td>content</td></tr></table>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
        {
            name: 'HTML markup inside a missing cell',
            plain: 'a1\tb1\r\na2\tb2',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td><br></td></tr></table>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
        {
            name: 'text inside an HTML paragraph in a missing cell',
            plain: 'a1\tb1\na2\tb2\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td><p>content</p></td></tr></table>',
            lastRow: { a: null, b: 'keep' },
            callbackRows: 3,
        },
        {
            name: 'a spanning cell in the HTML table',
            plain: 'a1\tb1\r\na2\tb2',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td colspan="2"></td></tr></table>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
        {
            name: 'content after a web table',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></table><p><br></p>',
            lastRow: { a: null, b: 'keep' },
            callbackRows: 3,
        },
        {
            name: 'another table after the first one',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></table><table><tr><td>other</td></tr></table>',
            lastRow: { a: null, b: 'keep' },
            callbackRows: 3,
        },
        {
            name: 'a nested table',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td><table><tr><td>b2</td></tr></table></td></tr></table>',
            lastRow: { a: null, b: 'keep' },
            callbackRows: 3,
        },
        {
            name: 'an unclosed table row',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></table>',
            lastRow: { a: null, b: 'keep' },
            callbackRows: 3,
        },
        {
            name: 'a table row with no cells',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr></tr></table>',
            lastRow: { a: null, b: 'keep' },
            callbackRows: 3,
        },
        {
            name: 'a row tag in an HTML comment',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table><!--<tr><td>ignored</td></tr>--><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></table>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
        {
            name: 'a row tag inside a quoted attribute',
            plain: 'a1\tb1\r\na2\tb2\r\n',
            html: '<table data-label="1 > 0"><tr><td title="<tr></tr>">a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></table>',
            lastRow: { a: 'keep', b: 'keep' },
            callbackRows: 2,
        },
    ])(
        'reconciles the trailing clipboard row for $name',
        async ({ plain, html, lastRow, callbackRows, lastCallbackRow }) => {
            let callbackData: string[][] | undefined;
            const api = await gridMgr.createGridAndWait('htmlTerminalRowPaste', {
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [
                    { a: 'old0', b: 'old0' },
                    { a: 'old1', b: 'old1' },
                    { a: 'keep', b: 'keep' },
                ],
                processDataFromClipboard: ({ data }) => {
                    callbackData = data.map((row) => [...row]);
                    return data;
                },
            });
            clipboardUtils.setTextAndHtml(plain, html);

            api.setFocusedCell(0, 'a');
            const pasted = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            await pasted;

            expect(api.getDisplayedRowAtIndex(0)?.data).toMatchObject({ a: 'a1', b: 'b1' });
            expect(api.getDisplayedRowAtIndex(1)?.data).toMatchObject({ a: 'a2', b: 'b2' });
            expect(api.getDisplayedRowAtIndex(2)?.data).toMatchObject(lastRow);
            expect(callbackData).toHaveLength(callbackRows);
            if (lastCallbackRow) {
                expect(callbackData?.at(-1)).toEqual(lastCallbackRow);
            }
        }
    );

    const blankCellHtml =
        '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td></td></tr></table>';
    test.each([
        { name: 'Windows', plain: 'a1\tb1\r\na2\tb2\r\n', html: blankCellHtml },
        { name: 'Mac', plain: 'a1\tb1\r\na2\tb2', html: blankCellHtml },
        {
            name: 'blank HTML paragraphs',
            plain: 'a1\tb1\na2\tb2\n',
            html: '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td><p><br></p></td><td><p class="p2"><br></p></td></tr></table>',
        },
    ])('restores selected blank cells through legacy paste for $name Excel', async ({ plain, html }) => {
        const api = await gridMgr.createGridAndWait('htmlLegacyBlankRowPaste', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { a: 'old0', b: 'old0' },
                { a: 'old1', b: 'old1' },
                { a: 'keep', b: 'keep' },
            ],
            suppressClipboardApi: true,
        });
        api.setFocusedCell(0, 'a');
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        const textArea = document.activeElement;
        if (!(textArea instanceof HTMLTextAreaElement)) {
            throw new Error('Expected the temporary paste textarea');
        }
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', plain);
        clipboardData.setData('text/html', html);
        textArea.value = plain;
        textArea.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData }));
        await pasted;

        expect(api.getDisplayedRowAtIndex(2)?.data).toMatchObject({ a: null, b: null });
    });

    test('leaves interior plain-text row widths unchanged', async () => {
        let callbackData: string[][] | undefined;
        const api = await gridMgr.createGridAndWait('htmlInteriorRowPaste', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'c', editable: true },
            ],
            rowData: [
                { a: 'old0', b: 'old0', c: 'keep' },
                { a: 'old1', b: 'old1', c: 'keep' },
                { a: 'old2', b: 'old2', c: 'keep' },
            ],
            processDataFromClipboard: ({ data }) => {
                callbackData = data.map((row) => [...row]);
                return data;
            },
        });
        clipboardUtils.setTextAndHtml(
            'a1\tb1\na2\tb2\na3\tb3',
            '<table><tr><td>a1</td><td>b1</td><td></td></tr><tr><td>a2</td><td>b2</td></tr><tr><td>a3</td><td>b3</td></tr></table>'
        );

        api.setFocusedCell(0, 'a');
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasted;

        expect(callbackData).toEqual([
            ['a1', 'b1'],
            ['a2', 'b2'],
            ['a3', 'b3'],
        ]);
        expect(api.getDisplayedRowAtIndex(0)?.data.c).toBe('keep');
    });

    test.each([false, true])(
        'restores blank rows and columns missing from single-cell plain text (range: %s)',
        async (activeRange) => {
            let callbackData: string[][] | undefined;
            const api = await gridMgr.createGridAndWait('htmlSingleValueWithBlankSelectionPaste', {
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [
                    { a: 'old0', b: 'old0' },
                    { a: 'old1', b: 'old1' },
                ],
                cellSelection: true,
                processDataFromClipboard: ({ data }) => {
                    callbackData = data.map((row) => [...row]);
                    return data;
                },
            });
            clipboardUtils.setTextAndHtml(
                'a1',
                '<table><tr><td>a1</td><td></td></tr><tr><td></td><td></td></tr></table>'
            );
            const getType = vi.spyOn(clipboardUtils.getItems()[0], 'getType');

            api.setFocusedCell(0, 'a');
            if (activeRange) {
                api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a', 'b'] });
            }
            const pasted = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            await pasted;

            expect(callbackData).toEqual([
                ['a1', ''],
                ['', ''],
            ]);
            expect(api.getDisplayedRowAtIndex(0)?.data).toMatchObject({ a: 'a1', b: null });
            expect(api.getDisplayedRowAtIndex(1)?.data).toMatchObject({ a: null, b: null });
            expect(getType).toHaveBeenCalledTimes(2);
            expect(getType).toHaveBeenCalledWith('text/plain');
            expect(getType).toHaveBeenCalledWith('text/html');
        }
    );

    test('preserves literal HTML text inside spreadsheet cells', async () => {
        const api = await gridMgr.createGridAndWait('htmlCellValuePaste', {
            columnDefs: [
                { field: 'cell_name', editable: true },
                { field: 'code', editable: true },
            ],
            rowData: [
                { cell_name: 'old0', code: 'old0' },
                { cell_name: 'old1', code: 'old1' },
                { cell_name: 'keep', code: 'keep' },
            ],
        });
        clipboardUtils.setTextAndHtml(
            'foo\t<b>bar</b>\r\nbaz\tqux\r\n',
            '<table><tr><td>foo</td><td>&lt;b&gt;bar&lt;/b&gt;</td></tr><tr><td>baz</td><td>qux</td></tr></table>'
        );

        api.setFocusedCell(0, 'cell_name');
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasted;

        expect(api.getDisplayedRowAtIndex(0)?.data).toMatchObject({ cell_name: 'foo', code: '<b>bar</b>' });
        expect(api.getDisplayedRowAtIndex(2)?.data).toMatchObject({ cell_name: 'keep', code: 'keep' });
    });

    test.each([
        { name: 'async clipboard, focused cell', legacy: false, activeRange: false },
        { name: 'async clipboard, active range', legacy: false, activeRange: true },
        { name: 'legacy paste event, focused cell', legacy: true, activeRange: false },
    ])('applies existing single-column suppression exactly once for $name', async ({ legacy, activeRange }) => {
        let callbackData: string[][] | undefined;
        const api = await gridMgr.createGridAndWait('htmlSingleColumnBlankRowPaste', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ a: 'old0' }, { a: 'keep' }, { a: 'keep2' }],
            cellSelection: true,
            suppressClipboardApi: legacy,
            suppressLastEmptyLineOnPaste: true,
            processDataFromClipboard: ({ data }) => {
                callbackData = data.map((row) => [...row]);
                return data;
            },
        });
        const plain = 'a\r\n\r\n';
        const html = '<table><tr><td>a</td></tr><tr><td></td></tr></table>';
        clipboardUtils.setTextAndHtml(plain, html);

        api.setFocusedCell(0, 'a');
        if (activeRange) {
            api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['a'] });
        }
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        if (legacy) {
            const textArea = document.activeElement;
            if (!(textArea instanceof HTMLTextAreaElement)) {
                throw new Error('Expected the temporary paste textarea');
            }
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/plain', plain);
            clipboardData.setData('text/html', html);
            textArea.value = plain;
            textArea.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData }));
        }
        await pasted;

        expect(callbackData).toEqual([['a'], [''], ['']]);
        expect(api.getDisplayedRowAtIndex(0)?.data.a).toBe('a');
        expect(api.getDisplayedRowAtIndex(1)?.data.a).toBeNull();
        expect(api.getDisplayedRowAtIndex(2)?.data.a).toBe('keep2');
    });

    test('suppresses a blank row returned by processDataFromClipboard', async () => {
        const api = await gridMgr.createGridAndWait('htmlCallbackPaste', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ a: 'old0' }, { a: 'keep' }],
            suppressLastEmptyLineOnPaste: true,
            processDataFromClipboard: ({ data }) => [data[0], ['']],
        });
        clipboardUtils.setTextAndHtml('a\r\nb\r\n', '<table><tr><td>a</td></tr><tr><td>b</td></tr></table>');

        api.setFocusedCell(0, 'a');
        const pasted = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasted;

        expect(api.getDisplayedRowAtIndex(0)?.data.a).toBe('a');
        expect(api.getDisplayedRowAtIndex(1)?.data.a).toBe('keep');
    });

    test('falls back to readText when reading clipboard items fails', async () => {
        const api = await gridMgr.createGridAndWait('clipboardReadFallback', {
            columnDefs: [{ field: 'value', editable: true }],
            rowData: [{ value: 'old' }],
        });
        clipboardUtils.setText('new');
        const read = vi.spyOn(navigator.clipboard, 'read').mockRejectedValueOnce(new Error('read unavailable'));

        try {
            api.setFocusedCell(0, 'value');
            const pasted = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            await pasted;

            expect(api.getDisplayedRowAtIndex(0)?.data.value).toBe('new');
        } finally {
            read.mockRestore();
        }
    });

    test('uses a sanitised read when unsanitised HTML is unavailable', async () => {
        const api = await gridMgr.createGridAndWait('clipboardSanitisedReadFallback', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { a: 'old0', b: 'old0' },
                { a: 'old1', b: 'old1' },
                { a: 'keep', b: 'keep' },
            ],
        });
        clipboardUtils.setTextAndHtml(
            'a1\tb1\r\na2\tb2\r\n',
            '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td></td></tr></table>'
        );
        const originalRead = navigator.clipboard.read.bind(navigator.clipboard);
        const read = vi
            .spyOn(navigator.clipboard, 'read')
            .mockImplementationOnce(async () => {
                throw new Error('Unsanitised HTML unavailable');
            })
            .mockImplementationOnce(originalRead);

        try {
            api.setFocusedCell(0, 'a');
            const pasted = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            await pasted;

            expect(read).toHaveBeenCalledTimes(2);
            expect(read).toHaveBeenNthCalledWith(1, { unsanitized: ['text/html'] });
            expect(read).toHaveBeenNthCalledWith(2);
            expect(api.getDisplayedRowAtIndex(2)?.data).toMatchObject({ a: null, b: null });
        } finally {
            read.mockRestore();
        }
    });

    test.each([
        { name: 'sanitised HTML is available', remainingReadsFail: false, lastRow: { a: null, b: null } },
        { name: 'remaining reads fail', remainingReadsFail: true, lastRow: { a: null, b: 'keep' } },
    ])(
        'preserves plain text when the unsanitised HTML blob fails and $name',
        async ({ remainingReadsFail, lastRow }) => {
            const api = await gridMgr.createGridAndWait('clipboardHtmlBlobFallback', {
                columnDefs: [
                    { field: 'a', editable: true },
                    { field: 'b', editable: true },
                ],
                rowData: [
                    { a: 'old0', b: 'old0' },
                    { a: 'old1', b: 'old1' },
                    { a: 'keep', b: 'keep' },
                ],
            });
            clipboardUtils.setTextAndHtml(
                'a1\tb1\r\na2\tb2\r\n',
                '<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr><tr><td></td><td></td></tr></table>'
            );
            const item = clipboardUtils.getItems()[0];
            const originalGetType = item.getType.bind(item);
            let failedHtmlRead = false;
            const getType = vi.spyOn(item, 'getType').mockImplementation(async (type) => {
                if (type === 'text/html' && !failedHtmlRead) {
                    failedHtmlRead = true;
                    throw new Error('Unsanitised HTML blob unavailable');
                }
                return originalGetType(type);
            });
            const originalRead = navigator.clipboard.read.bind(navigator.clipboard);
            const read = vi.spyOn(navigator.clipboard, 'read');
            const readText = vi.spyOn(navigator.clipboard, 'readText');
            if (remainingReadsFail) {
                read.mockImplementationOnce(originalRead).mockRejectedValueOnce(
                    new Error('Sanitised read unavailable')
                );
                readText.mockRejectedValueOnce(new Error('Plain read unavailable'));
            }

            try {
                api.setFocusedCell(0, 'a');
                const pasted = waitForEvent('pasteEnd', api);
                api.pasteFromClipboard();
                await pasted;

                expect(read).toHaveBeenCalledTimes(2);
                expect(api.getDisplayedRowAtIndex(0)?.data).toMatchObject({ a: 'a1', b: 'b1' });
                expect(api.getDisplayedRowAtIndex(1)?.data).toMatchObject({ a: 'a2', b: 'b2' });
                expect(api.getDisplayedRowAtIndex(2)?.data).toMatchObject(lastRow);
                if (remainingReadsFail) {
                    expect(readText).not.toHaveBeenCalled();
                }
            } finally {
                read.mockRestore();
                readText.mockRestore();
                getType.mockRestore();
            }
        }
    );

    test.each([
        { name: 'async clipboard', legacy: false },
        { name: 'legacy paste event', legacy: true },
    ])('pastes without DOMParser under a Trusted Types guard for $name', async ({ legacy }) => {
        const api = await gridMgr.createGridAndWait('clipboardWithoutDomParser', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [
                { a: 'old0', b: 'old0' },
                { a: 'keep', b: 'keep' },
            ],
            suppressClipboardApi: legacy,
        });
        const plain = 'a1\tb1\r\n';
        const html = '<table><tr><td>a1</td><td>b1</td></tr></table>';
        clipboardUtils.setTextAndHtml(plain, html);
        const parseFromString = vi.spyOn(DOMParser.prototype, 'parseFromString').mockImplementation(() => {
            throw new TypeError('TrustedHTML required');
        });

        try {
            api.setFocusedCell(0, 'a');
            const pasted = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            if (legacy) {
                const textArea = document.activeElement;
                if (!(textArea instanceof HTMLTextAreaElement)) {
                    throw new Error('Expected the temporary paste textarea');
                }
                const clipboardData = new DataTransfer();
                clipboardData.setData('text/plain', plain);
                clipboardData.setData('text/html', html);
                textArea.value = plain;
                textArea.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData }));
            }
            await pasted;

            expect(parseFromString).not.toHaveBeenCalled();
            expect(api.getDisplayedRowAtIndex(0)?.data).toMatchObject({ a: 'a1', b: 'b1' });
            expect(api.getDisplayedRowAtIndex(1)?.data).toMatchObject({ a: 'keep', b: 'keep' });
        } finally {
            parseFromString.mockRestore();
        }
    });
});
