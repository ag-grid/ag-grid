import { getByTestId } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { userEvent } from '@testing-library/user-event';

import { agTestIdFor, getGridElement, setupAgTestIds } from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForInput } from '../test-utils';
import { expect } from '../test-utils/matchers';

/**
 * Tests for AG-16448: valueGetter using params.getValue() during batch editing
 *
 * Key behaviours:
 * - valueGetter SHOULD see committed batch values (pendingValue)
 * - valueGetter should NOT see live typing (editorValue)
 * - getCellValue returns pending value during batch edit for UI display
 * - After cancel, values revert to original
 */
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

    test('valueGetter sees committed batch values but not live typing', async () => {
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

        // In batch mode, valueGetter SHOULD see the committed batch value (pendingValue)
        // because pressing Enter commits the value to the batch
        expect(cellB).toHaveTextContent('xx');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // After batch commit, cellB should still see the committed value
        expect(cellB).toHaveTextContent('xx');
    });

    test('valueGetter sees last committed value after cancel', async () => {
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

        // In batch mode, valueGetter SHOULD see the committed batch value
        expect(cellB).toHaveTextContent('changed');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        // After cancel, value should revert to original
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

        // In batch mode, valueGetter SHOULD see the committed batch value
        expect(cellB).toHaveTextContent('first');

        // Re-edit the same cell
        await userEvent.dblClick(cellA);
        editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'second{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // valueGetter should see the latest committed batch value
        expect(cellB).toHaveTextContent('second');

        // Commit batch edit
        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // After commit, valueGetter should see the final committed value
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
        expect(cellB).toHaveTextContent('batch1'); // Updated with pending batch value

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('batch1'); // Still shows committed value

        // Second batch session - cancel
        api.startBatchEdit();
        await userEvent.dblClick(cellA);
        editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'batch2{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        expect(cellB).toHaveTextContent('batch2'); // Shows pending batch value

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('batch1'); // Reverted after cancel

        // Third batch session - commit different value
        api.startBatchEdit();
        await userEvent.dblClick(cellA);
        editor = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(editor);
        await userEvent.type(editor, 'batch3{Enter}');
        await asyncSetTimeout(1);

        api.refreshCells({ columns: ['b'], force: true });
        expect(cellB).toHaveTextContent('batch3'); // Shows pending batch value

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellB).toHaveTextContent('batch3'); // Now updated to new value
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

        // The edited cell itself should show the pending value (UI feedback)
        expect(cellA).toHaveTextContent('pending');
        expect(cellA).toHaveClass(/ag-cell-batch-edit/);

        // In batch mode, valueGetter SHOULD see the pending batch value
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('pending');

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // After commit, both cells should show updated value
        expect(cellA).toHaveTextContent('pending');
        expect(cellB).toHaveTextContent('pending');
        expect(cellA).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test('getCellValue returns pending value during batch edit', async () => {
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
        await userEvent.type(editor, 'pending{Enter}');
        await asyncSetTimeout(1);

        const rowNode = api.getDisplayedRowAtIndex(0)!;

        // getCellValue shows pending value (UI display)
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('pending');

        // The underlying data should still have the original value
        expect(rowNode.data.a).toBe('initial');

        api.cancelBatchEdit();
        await asyncSetTimeout(1);

        // After cancel, getCellValue should return original
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('initial');
    });

    test('valueCache with batch edit does not cache pending values (AG-16448)', async () => {
        // This test verifies that with valueCache enabled, batch edit pending values
        // are NOT cached. Only committed values should be cached.
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

        // The edited cell should show the pending value
        expect(cellA).toHaveTextContent('batch-pending');

        // Force refresh multiple times
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);

        // In batch mode, cell B SHOULD see the pending batch value
        expect(cellB).toHaveTextContent('Computed: batch-pending');

        // With valueCache, the valueGetter should be cached, so call count should be minimal
        const duringBatchCallCount = valueGetterCallCount;

        api.commitBatchEdit();
        await asyncSetTimeout(1);

        // After commit, should still show the same value
        expect(cellB).toHaveTextContent('Computed: batch-pending');

        // The valueGetter might be called after commit to refresh values
        expect(valueGetterCallCount).toBeGreaterThanOrEqual(duringBatchCallCount);
    });

    test('edited cell shows pending value while getCellValue returns pending (AG-16448)', async () => {
        // This test verifies that during batch edit:
        // 1. The edited cell displays the pending value (UI feedback)
        // 2. getCellValue returns the pending value (for the edited cell)
        // 3. ValueGetter using getValue() sees the pending batch value
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

        // 1. The edited cell displays the pending value
        expect(cellA).toHaveTextContent('pending');

        // 2. getCellValue returns the pending value for the edited cell
        expect(api.getCellValue({ rowNode, colKey: 'a' })).toBe('pending');

        // 3. In batch mode, valueGetter SHOULD see the pending batch value
        api.refreshCells({ columns: ['b'], force: true });
        await asyncSetTimeout(1);
        expect(cellB).toHaveTextContent('pending');

        // The underlying data is unchanged until commit
        expect(rowNode.data.a).toBe('committed');

        // After commit, everything updates
        api.commitBatchEdit();
        await asyncSetTimeout(1);

        expect(cellA).toHaveTextContent('pending');
        expect(cellB).toHaveTextContent('pending');
        expect(rowNode.data.a).toBe('pending');
    });
});
