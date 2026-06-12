import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    CheckboxEditorModule,
    DateEditorModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
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

describe('Clipboard Paste Behaviour: fill handle', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClipboardModule,
            CellSelectionModule,
            BatchEditModule,
            UndoRedoEditModule,
            TextEditorModule,
            CheckboxEditorModule,
            DateEditorModule,
        ],
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

    test('fill handle is offered on a contiguous multi-column range', async () => {
        // A range spanning several columns drives the fill-handle availability check, which walks the
        // range with `isContiguousRange` + `isBottomRightCell` (the displayedIndex min/max loops) —
        // the multi-column path those methods only take when the range has more than one column.
        const api = await gridMgr.createGridAndWait('clipboardGridMultiColFill', {
            cellSelection: { handle: { mode: 'fill' } },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'c', editable: true },
            ],
            rowData: [
                { id: 'ROW_0', a: '1', b: '2', c: '3' },
                { id: 'ROW_1', a: '4', b: '5', c: '6' },
            ],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `fill handle is offered on a contiguous multi-column range setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            ├── b "B" width:200 editable
            └── c "C" width:200 editable
        `);
        await new GridRows(api, `fill handle is offered on a contiguous multi-column range setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"1" b:"2" c:"3"
            └── LEAF id:ROW_1 a:"4" b:"5" c:"6"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        // Selecting the 2×3 block makes the bottom-right cell (ROW_1/c) the handle anchor. The handle
        // only renders if the range is recognised as contiguous and that cell as the bottom-right.
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columnStart: 'a', columnEnd: 'c' });
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        expect(getByTestId(gridDiv, agTestIdFor.fillHandle())).toBeTruthy();
        await new GridRows(api, `fill handle is offered on a contiguous multi-column range final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:ROW_0 a:"1" b:"2" c:"3"
            └── LEAF id:ROW_1 a:"4" b:"5" c:"6"
        `);
    });

    test('dragging the fill handle horizontally fills across columns', async () => {
        // Exercises the interactive horizontal-fill path (markPathFrom -> extendHorizontal), which
        // walks the displayed columns by `displayedIndex`. `direction: 'x'` forces the drag axis so
        // no pixel layout is needed; the hovered target column is resolved from the event's cell.
        const api = await gridMgr.createGridAndWait('clipboardGridHorizontalFill', {
            cellSelection: { handle: { mode: 'fill', direction: 'x' } },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'c', editable: true },
            ],
            rowData: [{ id: 'ROW_0', a: 'X', b: 'Y', c: 'Z' }],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Select the source cell (column a).
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
        getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'a')).dispatchEvent(
            new MouseEvent('touchstart', { bubbles: true })
        );
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        // Drag the fill handle right, over column c. mousedown on the handle, a mousemove past the
        // drag threshold whose target is cell c, then mouseup ends the fill.
        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const cellC = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'c'));
        const fillEnd = waitForEvent('fillEnd', api);
        fillHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 0, clientY: 0 }));
        cellC.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 60, clientY: 0 }));
        cellC.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 60, clientY: 0 }));
        await fillEnd;
        await asyncSetTimeout(1);

        // Source value copied right across b and c.
        await new GridRows(api, 'after horizontal fill').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 a:"X" b:"X" c:"X"
        `);
    });

    test('dragging the fill handle inward over a multi-column range reduces it (horizontal)', async () => {
        // Exercises the reduce side of the horizontal path (markPathFrom -> reduceHorizontal): with a
        // multi-column range selected, dragging the handle (on the right edge) inward shrinks the fill.
        const api = await gridMgr.createGridAndWait('clipboardGridHorizontalReduce', {
            cellSelection: { handle: { mode: 'fill', direction: 'x' } },
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
                { field: 'c', editable: true },
            ],
            rowData: [{ id: 'ROW_0', a: 'X', b: 'Y', c: 'Z' }],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);

        // Select the full a..c range, so the fill handle sits on c (right edge).
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columnStart: 'a', columnEnd: 'c' });
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'b'));
        fillHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 60, clientY: 0 }));
        // Drag inward from the right edge (c) to b → reduceHorizontal.
        cellB.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 30, clientY: 0 }));
        cellB.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: 30, clientY: 0 }));
        await asyncSetTimeout(1);

        // The reduce path ran; the grid stays coherent (c cleared as it left the reduced fill range).
        await new GridRows(api, 'after horizontal reduce').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:ROW_0 a:"X" b:"Y" c:null
        `);
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

    test('readOnlyEdit fill handle uses source cell value for all column types', async () => {
        const editRequests: string[] = [];

        const api = await gridMgr.createGridAndWait('clipboardGridReadOnlyFillTypes', {
            readOnlyEdit: true,
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            columnDefs: [
                { field: 'text', editable: true },
                { field: 'bool', editable: true },
                { field: 'date', editable: true, cellDataType: 'dateString' },
            ],
            rowData: [
                { id: 'ROW_0', text: 'Source', bool: true, date: '2024-01-15' },
                { id: 'ROW_1', text: 'Other1', bool: false, date: '2024-06-20' },
                { id: 'ROW_2', text: 'Other2', bool: false, date: '2024-12-25' },
            ],
            getRowId: (params) => params.data.id,
            onCellEditRequest: (event) => {
                editRequests.push(`${event.node?.id ?? 'unknown'}:${event.colDef.field}:${event.newValue}`);
            },
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        for (const field of ['text', 'bool', 'date']) {
            editRequests.length = 0;

            await asyncSetTimeout(1);
            const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', field));
            const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
            cell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
            await cellSelectionChanged;
            await asyncSetTimeout(1);

            const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
            const fillEnd = waitForEvent('fillEnd', api);
            await userEvent.dblClick(fillHandle);
            await fillEnd;

            const sourceValues: Record<string, string> = { text: 'Source', bool: 'true', date: '2024-01-15' };
            const sourceValue = sourceValues[field];
            expect(editRequests).toEqual([`ROW_1:${field}:${sourceValue}`, `ROW_2:${field}:${sourceValue}`]);
        }
    });

    test('readOnlyEdit fill handle cycles multi-row selection pattern for all column types', async () => {
        const editRequests: string[] = [];

        const api = await gridMgr.createGridAndWait('clipboardGridReadOnlyFillCyclic', {
            readOnlyEdit: true,
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            columnDefs: [
                { field: 'text', editable: true },
                { field: 'bool', editable: true },
                { field: 'date', editable: true, cellDataType: 'dateString' },
            ],
            rowData: [
                { id: 'ROW_0', text: 'A', bool: true, date: '2024-01-15' },
                { id: 'ROW_1', text: 'B', bool: false, date: '2024-06-20' },
                { id: 'ROW_2', text: 'X', bool: false, date: '2024-12-25' },
                { id: 'ROW_3', text: 'Y', bool: false, date: '2024-12-31' },
                { id: 'ROW_4', text: 'Z', bool: true, date: '2024-03-01' },
            ],
            getRowId: (params) => params.data.id,
            onCellEditRequest: (event) => {
                editRequests.push(`${event.node?.id ?? 'unknown'}:${event.colDef.field}:${event.newValue}`);
            },
        });

        const gridDiv = getGridElement(api)! as HTMLElement;

        for (const field of ['text', 'bool', 'date']) {
            editRequests.length = 0;
            api.clearCellSelection();

            const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
            api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: [field] });
            await cellSelectionChanged;
            await asyncSetTimeout(1);

            const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
            const fillEnd = waitForEvent('fillEnd', api);
            await userEvent.dblClick(fillHandle);
            await fillEnd;

            const expectedRow0: Record<string, string> = { text: 'A', bool: 'true', date: '2024-01-15' };
            const expectedRow1: Record<string, string> = { text: 'B', bool: 'false', date: '2024-06-20' };
            const val0 = expectedRow0[field];
            const val1 = expectedRow1[field];
            expect(editRequests).toEqual([
                `ROW_2:${field}:${val0}`,
                `ROW_3:${field}:${val1}`,
                `ROW_4:${field}:${val0}`,
            ]);
        }
    });
});
