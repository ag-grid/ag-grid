import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    RenderApiModule,
    TextEditorModule,
    ValueCacheModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';

/** Tests for AG-16448: valueGetter using params.getValue() sees committed data only during batch editing */
describe('Cell Editing Batch Value (AG-16448)', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [TextEditorModule, RenderApiModule, ValueCacheModule, BatchEditModule],
    });

    beforeAll(() => setupAgTestIds());

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    test('valueGetter sees committed data only, not pending batch values', async () => {
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
        await asyncSetTimeout(1);
        getByTestId(gridDiv, agTestIdFor.cell('0', 'a')); // cell exists
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('initial');

        api.startEditingCell({ rowIndex: 0, colKey: 'a' });
        await asyncSetTimeout(1);
        const editor = gridDiv.querySelector<HTMLInputElement>('input');
        if (!editor) {
            throw new Error('Editor input not found');
        }
        await userEvent.clear(editor);
        await userEvent.keyboard('xx{Enter}');
        await asyncSetTimeout(1);

        await new GridRows(api, 'batch pending before commit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"xx" "initial" b:"initial"
        `);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200
        `);
    });

    test('valueGetter sees original value during batch, reverts after cancel', async () => {
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
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'changed{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200
        `);
    });

    test('re-edit and commit batch edit updates valueGetter correctly', async () => {
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
        await new GridColumns(api, `re-edit and commit batch edit updates valueGetter correctly setup`).checkColumns(
            `
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200
            `
        );
        await new GridRows(api, `re-edit and commit batch edit updates valueGetter correctly setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial" b:"initial"
        `);

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));

        // First edit
        await userEvent.dblClick(cellA);
        let editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'first{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        // Re-edit the same cell
        await userEvent.dblClick(cellA);
        editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'second{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('second');
        await new GridRows(api, `re-edit and commit batch edit updates valueGetter correctly final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"second" b:"second"
        `);
    });

    test('multiple batch sessions work correctly', async () => {
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
        await new GridColumns(api, `multiple batch sessions work correctly setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200
        `);
        await new GridRows(api, `multiple batch sessions work correctly setup`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"initial" b:"initial"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));

        // First batch session - commit
        api.startBatchEdit();
        await userEvent.dblClick(cellA);
        let editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'batch1{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('batch1');

        // Second batch session - cancel
        api.startBatchEdit();
        await userEvent.dblClick(cellA);
        editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'batch2{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        expect(cellB).toHaveTextContent('batch1');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('batch1');

        // Third batch session - commit different value
        api.startBatchEdit();
        await userEvent.dblClick(cellA);
        editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'batch3{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        expect(cellB).toHaveTextContent('batch1');

        api.commitBatchEdit();
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('batch3');
        await new GridRows(api, `multiple batch sessions work correctly final state`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"batch3" b:"batch3"
        `);
    });

    test('edited cell shows pending value during batch edit', async () => {
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
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'pending');
        await asyncSetTimeout(1);

        await new GridRows(api, 'editor open with typed value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"pending" "initial" b:"initial"
        `);

        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        await new GridRows(api, 'batch pending before commit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"pending" "initial" b:"initial"
        `);

        expect(cellA).toHaveTextContent('pending');
        expect(cellA).toHaveClass(/ag-cell-batch-edit/);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('pending');
        expect(cellB).toHaveTextContent('pending');
        expect(cellA).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test('getCellValue with all from values during batch edit', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true, cellEditor: 'agTextCellEditor' }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));

        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'typing'); // Don't press Enter yet - still editing
        await asyncSetTimeout(1);

        await new GridRows(api, 'editor open while typing').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"typing" "initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // While actively typing (editor still open):
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('typing'); // 'edit' includes live typing
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('initial'); // no pending yet
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

        expect(rowNode.getDataValue('a')).toBe('initial');

        // Press Enter to close editor and create pending value
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(rowNode.data.a).toBe('initial');

        await new GridRows(api, 'batch pending before cancel').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:0 a:⏳"typing" "initial"
        `);

        // After closing editor, value becomes pending:
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

        expect(rowNode.getDataValue('a')).toBe('initial');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

        expect(rowNode.getDataValue('a')).toBe('initial');
    });

    test('valueCache works correctly with batch edit', async () => {
        let valueGetterCallCount = 0;
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                {
                    field: 'b',
                    valueGetter: (params) => {
                        valueGetterCallCount++;
                        return `Computed: ${params.getValue('a')}`;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        await new GridColumns(api, `valueCache works correctly with batch edit setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── b "B" width:200
        `);
        await new GridRows(api, `valueCache works correctly with batch edit setup`).check(`
            ROOT id:ROOT_NODE_ID b:"Computed: undefined"
            └── LEAF id:0 a:"initial" b:"Computed: initial"
        `);

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('Computed: initial');

        // Edit cell A
        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'batch-pending{Enter}');
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('batch-pending');

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('Computed: initial');

        const duringBatchCallCount = valueGetterCallCount;

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('Computed: batch-pending');
        expect(valueGetterCallCount).toBeGreaterThanOrEqual(duringBatchCallCount);
        await new GridRows(api, `valueCache works correctly with batch edit final state`).check(`
            ROOT id:ROOT_NODE_ID b:"Computed: undefined"
            └── LEAF id:0 a:"batch-pending" b:"Computed: batch-pending"
        `);
    });

    test('edited cell shows pending value while valueGetter sees committed data', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true, cellEditor: 'agTextCellEditor' },
                {
                    field: 'b',
                    valueGetter: (params) => params.getValue('a'),
                },
            ],
            rowData: [{ id: '0', a: 'committed' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `edited cell shows pending value while valueGetter sees committed data setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200
            `);
        await new GridRows(api, `edited cell shows pending value while valueGetter sees committed data setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"committed" b:"committed"
            `
        );

        api.startBatchEdit();

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(1);
        const cellA = getByTestId(gridDiv, agTestIdFor.cell('0', 'a'));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));

        // Edit cell A
        await userEvent.dblClick(cellA);
        const editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'pending{Enter}');
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        expect(cellA).toHaveTextContent('pending');
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('pending');

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('committed');
        expect(rowNode.data.a).toBe('committed');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('pending');
        expect(cellB).toHaveTextContent('pending');
        expect(rowNode.data.a).toBe('pending');
        await new GridRows(api, `edited cell shows pending value while valueGetter sees committed data final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"pending" b:"pending"
            `);
    });
});
