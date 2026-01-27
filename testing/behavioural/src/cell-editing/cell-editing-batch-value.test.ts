import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
import { expect } from '../test-utils/matchers';

/** Tests for AG-16448: valueGetter using params.getValue() sees committed data only during batch editing */
describe('Cell Editing Batch Value (AG-16448)', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [BatchEditModule],
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

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');
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
        await userEvent.type(editor, 'pending{Enter}');
        await asyncSetTimeout(1);

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

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // While actively typing (editor still open):
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('typing'); // 'edit' includes live typing
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('initial'); // no pending yet
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

        // Press Enter to close editor and create pending value
        await userEvent.keyboard('{Enter}');
        await asyncSetTimeout(1);

        expect(rowNode.data.a).toBe('initial');

        // After closing editor, value becomes pending:
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('typing');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'edit' })).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'batch' })).toBe('initial');
        expect(api.getCellValue({ rowNode, colKey: 'a', from: 'data' })).toBe('initial');
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
    });

    test('valueGetter sees committed data during batch edit, updates after commit', async () => {
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

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('initial');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');

        api.startBatchEdit();

        await userEvent.dblClick(cellA);
        const editor2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor2);
        await userEvent.type(editor2, 'yy{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('xx');
    });
});
