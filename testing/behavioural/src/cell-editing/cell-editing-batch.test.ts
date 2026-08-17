import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridColumns, GridRows, TestGridsManager, waitForInput } from 'ag-test-utils';

import {
    NumberEditorModule,
    RenderApiModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

describe('Cell Editing Batch', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TextEditorModule, NumberEditorModule, RenderApiModule, BatchEditModule],
    });

    const rowDataFactory = () => [
        {
            number: 10,
            string1: 'test',
            string2: 'test',
            date: new Date('2025-01-01'),
            dateStr: '2025-01-01',
            boolean: true,
        },
        {
            number: undefined,
            string1: undefined,
            string2: undefined,
            date: undefined,
            dateStr: undefined,
            boolean: undefined,
        },
    ];

    let rowData: any[];

    beforeAll(() => setupAgTestIds());

    beforeEach(() => {
        rowData = rowDataFactory();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    test('batch edit: pending decoration, commit and cancel lifecycle', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            rowData,
        });

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 number:10
            └── LEAF id:1
        `);

        api.startBatchEdit();
        expect(api.isBatchEditing()).toBe(true);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'number')));
        const cell2 = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('1', 'number')));

        // Phase A: edit adds pending decoration, only on edited cell
        await userEvent.dblClick(cell);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        await userEvent.keyboard('100{Enter}');
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

        expect(cell).toHaveTextContent('100');
        expect(cell).toHaveClass(/ag-cell-batch-edit/);
        expect(cell2).not.toHaveClass(/ag-cell-batch-edit/);

        await new GridRows(api, 'after typing 100 — row 0 pending, row 1 unchanged').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 number:⏳100 10
            └── LEAF id:1
        `);

        // Phase B: commit removes decoration, value is retained
        api.commitBatchEdit();
        await waitFor(() => expect(cell).not.toHaveClass(/ag-cell-batch-edit/));

        expect(cell).toHaveTextContent('100');

        await new GridRows(api, 'after commit — row 0 committed to 100').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 number:100
            └── LEAF id:1
        `);

        // Phase C: cancel reverts value to sourceValue and removes decoration
        api.startBatchEdit();
        await userEvent.dblClick(cell);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        await userEvent.keyboard('200{Enter}');
        // GridRows.check() below already polls/retries internally on mismatch.

        await new GridRows(api, 'after typing 200 in second batch — pending 200, source 100').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 number:⏳200 100
            └── LEAF id:1
        `);

        api.cancelBatchEdit();
        await waitFor(() => expect(cell).not.toHaveClass(/ag-cell-batch-edit/));

        expect(cell).toHaveTextContent('100');

        await new GridRows(api, 'after cancel — reverted to 100').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 number:100
            └── LEAF id:1
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── number "Number" width:200 editable
        `);
    });

    test('commit keeps edited value when focus leaves grid', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    editable: true,
                },
            ],
            rowData,
            stopEditingWhenCellsLoseFocus: true,
        });

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'number')));

        const commitButton = document.createElement('button');
        document.body.appendChild(commitButton);
        commitButton.addEventListener('click', () => api.commitBatchEdit());

        await userEvent.dblClick(cell);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        await userEvent.keyboard('123');
        // GridRows.check() below already polls/retries internally on mismatch.

        // While editing: editor is open (🖍️), data still shows 10
        await new GridRows(api, 'while editor open — live typing 123').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 number:🖍️123 10
            └── LEAF id:1
        `);

        await userEvent.click(commitButton);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

        expect(cell).toHaveTextContent('123');
        expect(cell).not.toHaveClass(/ag-cell-batch-edit/);

        await new GridRows(api, 'after commit — focus left grid, value 123 committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 number:123
            └── LEAF id:1
        `);

        commitButton.remove();

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── number "Number" width:200 editable
        `);
    });

    test('valueGetter sees committed data during batch edit, updates after commit', async () => {
        // valueGetter using params.getValue() sees COMMITTED data only, not pending batch values
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                {
                    field: 'b',
                    valueGetter: (params) => params.getValue('a'),
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
        const cellB = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'b')));
        expect(cellB).toHaveTextContent('initial');

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial" b:"initial"
        `);

        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        const editor = await waitForInput(gridDiv, cellA);
        await userEvent.clear(editor);
        await userEvent.keyboard('xx{Enter}');
        // GridRows.check() below already polls/retries internally on mismatch.

        // After editing: a is pending 'xx', b still sees 'initial' (valueGetter uses committed data)
        await new GridRows(api, 'after editing a to xx — b still shows initial').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"xx" "initial" b:"initial"
        `);

        api.refreshCells({ columns: ['b'], force: true });

        // valueGetter sees committed data, not pending value
        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        // After commit, valueGetter sees the newly committed value.
        await waitFor(() => expect(cellB).toHaveTextContent('xx'));

        await new GridRows(api, 'after commit — a and b both show xx').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"xx" b:"xx"
        `);

        api.startBatchEdit();

        await userEvent.dblClick(cellA);
        const editor2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor2);
        await userEvent.type(editor2, 'yy{Enter}');
        // GridRows.check() below already polls/retries internally on mismatch.

        // Second batch: a pending 'yy', b still sees 'xx' (committed)
        await new GridRows(api, 'second batch — a pending yy, b still shows xx').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"yy" "xx" b:"xx"
        `);

        api.refreshCells({ columns: ['b'], force: true });

        // valueGetter sees committed data (xx), not pending value (yy)
        expect(cellB).toHaveTextContent('xx');

        api.cancelBatchEdit();

        // After cancel, still shows committed value (xx)
        expect(cellB).toHaveTextContent('xx');

        await new GridRows(api, 'after cancel — reverted to xx').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"xx" b:"xx"
        `);
    });

    test('setDataValue during batch edit is staged for new cells', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'number', editable: true, cellEditor: 'agNumberCellEditor' },
                { field: 'string1', editable: true, cellEditor: 'agTextCellEditor' },
            ],
            rowData: [{ number: 10, string1: 'test' }],
        });

        api.startBatchEdit();

        const beforeRows = new GridRows(api, 'before batch setDataValue');
        await beforeRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 number:10 string1:"test"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        const numberCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'number')));
        const stringCell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'string1')));

        await userEvent.dblClick(numberCell);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));
        await userEvent.keyboard('100{Enter}');
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

        expect(numberCell).toHaveTextContent('100');
        expect(numberCell).toHaveClass(/ag-cell-batch-edit/);

        const rowNode = api.getDisplayedRowAtIndex(0);
        rowNode?.setDataValue('string1', 'pending', 'ui');
        // GridRows.check() below already polls/retries internally on mismatch.

        await new GridRows(api, 'after batch setDataValue ui').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 number:⏳100 10 string1:⏳"pending" "test"
        `);

        expect(stringCell).toHaveTextContent('pending');

        api.cancelBatchEdit();
        // GridRows.check() below already polls/retries internally on mismatch.

        await new GridRows(api, 'after cancel batch setDataValue').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 number:10 string1:"test"
        `);

        expect(numberCell).toHaveTextContent('10');
        expect(stringCell).toHaveTextContent('test');
        expect(numberCell).not.toHaveClass(/ag-cell-batch-edit/);
        expect(stringCell).not.toHaveClass(/ag-cell-batch-edit/);
        expect(api.getDisplayedRowAtIndex(0)?.data?.string1).toBe('test');
    });

    // Mid-batch Escape closes the editor without ending the batch. It is still a close, so it must
    // balance its cellEditingStarted — listeners tracking open editors otherwise never see it end.
    test('batch: Escape on an untouched editor still fires cellEditingStopped', async () => {
        const api = await gridMgr.createGridAndWait('batchEscapeEvents', {
            columnDefs: [{ field: 'string1' }, { field: 'number' }],
            rowData: rowDataFactory(),
            defaultColDef: { editable: true },
        });

        const started: any[] = [];
        const stopped: any[] = [];
        api.addEventListener('cellEditingStarted', (e) => started.push(e));
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();

        api.setFocusedCell(0, 'string1');
        api.startEditingCell({ rowIndex: 0, colKey: 'string1' });
        await waitFor(() => expect(started).toHaveLength(1));

        expect(stopped).toHaveLength(0);

        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(stopped).toHaveLength(1));

        expect(api.getCellEditorInstances()).toHaveLength(0);
    });

    // Reverting mid-batch re-creates the editor before closing it, but the session that fired
    // cellEditingStarted is the same one: every editor closed here still has to report it.
    test.each(['singleCell', 'fullRow'] as const)(
        'batch (%s): api.stopEditing(true) fires cellEditingStopped for every editor it closes',
        async (editType) => {
            const api = await gridMgr.createGridAndWait(`batchApiCancel-${editType}`, {
                columnDefs: [{ field: 'string1' }, { field: 'number' }],
                rowData: rowDataFactory(),
                defaultColDef: { editable: true },
                editType,
            });

            const started: any[] = [];
            const stopped: any[] = [];
            api.addEventListener('cellEditingStarted', (e) => started.push(e));
            api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();

            const grid = getGridElement(api)! as HTMLElement;
            const cell = grid.querySelector<HTMLElement>('[row-index="0"] [col-id="string1"]')!;
            await userEvent.dblClick(cell);
            const input = await waitForInput(grid, cell);
            await userEvent.clear(input);
            await userEvent.type(input, 'typed');
            await waitFor(() => expect(started.length).toBeGreaterThan(0));

            expect(stopped).toHaveLength(0);

            api.stopEditing(true); // cancels the in-flight edits, keeping the batch open
            await waitFor(() => expect(stopped).toHaveLength(started.length));

            expect(api.getCellEditorInstances()).toHaveLength(0);
            expect(api.getDisplayedRowAtIndex(0)?.data?.string1).toBe('test'); // nothing written
        }
    );
});
