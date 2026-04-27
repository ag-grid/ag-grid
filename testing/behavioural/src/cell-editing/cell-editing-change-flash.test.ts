import { getByTestId } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import {
    HighlightChangesModule,
    NumberEditorModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, CellSelectionModule, ClipboardModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, clipboardUtils, waitForEvent, waitForInput } from '../test-utils';

const FLASH_CSS_CLASS = 'ag-cell-data-changed';

describe('Cell change flashing after edit', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule, UndoRedoEditModule, TextEditorModule, NumberEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('cell flashes after committing an edit', async () => {
        const api = await gridMgr.createGridAndWait('flashAfterEdit', {
            undoRedoCellEditing: true,
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            rowData: [
                { id: 'ROW_0', make: 'Toyota', model: 'Celica', price: 35000 },
                { id: 'ROW_1', make: 'Ford', model: 'Mondeo', price: 32000 },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));

        api.startEditingCell({ rowIndex: 0, colKey: 'make' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Honda');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Honda');
        expect(cell).toHaveClass(FLASH_CSS_CLASS);
    });
});

describe('Cell change flashing after undo and redo', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule, UndoRedoEditModule, TextEditorModule, NumberEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('cell flashes after undo', async () => {
        const api = await gridMgr.createGridAndWait('flashAfterUndo', {
            undoRedoCellEditing: true,
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            rowData: [
                { id: 'ROW_0', make: 'Toyota', model: 'Celica', price: 35000 },
                { id: 'ROW_1', make: 'Ford', model: 'Mondeo', price: 32000 },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));

        // Edit the cell
        api.startEditingCell({ rowIndex: 0, colKey: 'make' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Honda');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Honda');

        // Wait for flash to complete before testing undo flash
        await asyncSetTimeout(600);
        expect(cell).not.toHaveClass(FLASH_CSS_CLASS);

        // Undo the edit
        api.undoCellEditing();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Toyota');
        expect(cell).toHaveClass(FLASH_CSS_CLASS);
    });

    test('cell flashes after redo', async () => {
        const api = await gridMgr.createGridAndWait('flashAfterRedo', {
            undoRedoCellEditing: true,
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            rowData: [
                { id: 'ROW_0', make: 'Toyota', model: 'Celica', price: 35000 },
                { id: 'ROW_1', make: 'Ford', model: 'Mondeo', price: 32000 },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));

        // Edit the cell
        api.startEditingCell({ rowIndex: 0, colKey: 'make' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Honda');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        // Undo
        await asyncSetTimeout(600);
        api.undoCellEditing();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Toyota');

        // Wait for undo flash to complete
        await asyncSetTimeout(600);
        expect(cell).not.toHaveClass(FLASH_CSS_CLASS);

        // Redo
        api.redoCellEditing();
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Honda');
        expect(cell).toHaveClass(FLASH_CSS_CLASS);
    });
});

describe('Cell change flashing suppressed when value not committed', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule, UndoRedoEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('cell does not flash when undo valueSetter rejects the change', async () => {
        let callCount = 0;
        const api = await gridMgr.createGridAndWait('flashRejectedUndoValueSetter', {
            undoRedoCellEditing: true,
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [
                {
                    field: 'make',
                    valueSetter: ({ data, newValue }) => {
                        callCount++;
                        if (callCount <= 1) {
                            // Accept the first edit
                            data.make = newValue;
                            return true;
                        }
                        // Reject the undo write
                        return false;
                    },
                },
            ],
            rowData: [{ id: 'ROW_0', make: 'Toyota' }],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));

        // First edit — valueSetter accepts
        api.startEditingCell({ rowIndex: 0, colKey: 'make' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'Honda');
        await user.keyboard('{Enter}');
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Honda');

        // Wait for edit flash to complete
        await asyncSetTimeout(600);
        expect(cell).not.toHaveClass(FLASH_CSS_CLASS);

        // Undo — valueSetter rejects (callCount > 1)
        api.undoCellEditing();
        await asyncSetTimeout(0);

        // Value should NOT have reverted and cell should NOT flash
        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('Honda');
        expect(cell).not.toHaveClass(FLASH_CSS_CLASS);
    });
});

describe('Cell change flashing after delete', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule, TextEditorModule, NumberEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('cell flashes after pressing Delete', async () => {
        const api = await gridMgr.createGridAndWait('flashAfterDelete', {
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            rowData: [
                { id: 'ROW_0', make: 'Toyota', model: 'Celica', price: 35000 },
                { id: 'ROW_1', make: 'Ford', model: 'Mondeo', price: 32000 },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));
        await user.click(cell);
        await user.keyboard('{Delete}');
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBeNull();
        expect(cell).toHaveClass(FLASH_CSS_CLASS);
    });
});

describe('Cell change flashing after fill handle', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule, CellSelectionModule, ClipboardModule, TextEditorModule, NumberEditorModule],
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

    test('target cell flashes after fill handle', async () => {
        const api = await gridMgr.createGridAndWait('flashAfterFillHandle', {
            cellSelection: {
                handle: {
                    mode: 'fill',
                },
            },
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
            rowData: [
                { id: 'ROW_0', make: 'Toyota', model: 'Celica', price: 35000 },
                { id: 'ROW_1', make: 'Ford', model: 'Mondeo', price: 32000 },
                { id: 'ROW_2', make: 'Porsche', model: 'Boxster', price: 72000 },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        await asyncSetTimeout(0);

        // Select ROW_0 make cell to set up the fill source
        const sourceCell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));
        const cellSelectionChanged = waitForEvent('cellSelectionChanged', api);
        sourceCell.dispatchEvent(new MouseEvent('touchstart', { bubbles: true }));
        await cellSelectionChanged;
        await asyncSetTimeout(1);

        // Double-click fill handle to fill down
        const fillHandle = getByTestId(gridDiv, agTestIdFor.fillHandle());
        const fillEnd = waitForEvent('fillEnd', api);
        await userEvent.dblClick(fillHandle);
        await fillEnd;
        await asyncSetTimeout(0);

        // Target cells should have the source value and flash
        expect(api.getDisplayedRowAtIndex(1)?.data?.make).toBe('Toyota');
        expect(api.getDisplayedRowAtIndex(2)?.data?.make).toBe('Toyota');

        const targetCell1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'make'));
        const targetCell2 = getByTestId(gridDiv, agTestIdFor.cell('ROW_2', 'make'));
        expect(targetCell1).toHaveClass(FLASH_CSS_CLASS);
        expect(targetCell2).toHaveClass(FLASH_CSS_CLASS);
    });
});

describe('Cell change flashing after bulk edit (Ctrl+Enter)', () => {
    const gridMgr = new TestGridsManager({
        modules: [HighlightChangesModule, CellSelectionModule, BatchEditModule, TextEditorModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('all changed cells flash after bulk edit', async () => {
        const api = await gridMgr.createGridAndWait('flashAfterBulkEdit', {
            cellSelection: true,
            defaultColDef: {
                editable: true,
                enableCellChangeFlash: true,
            },
            columnDefs: [{ field: 'make' }, { field: 'model' }],
            rowData: [
                { id: 'ROW_0', make: 'Toyota', model: 'Celica' },
                { id: 'ROW_1', make: 'Ford', model: 'Mondeo' },
            ],
            getRowId: (params) => params.data.id,
        });

        const gridDiv = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup({ skipHover: true });
        await asyncSetTimeout(0);

        const cell = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));
        await user.click(cell);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['make'] });
        api.startEditingCell({ rowIndex: 0, colKey: 'make' });
        const input = await waitForInput(gridDiv, cell);
        await user.clear(input);
        await user.type(input, 'BulkValue');
        await user.keyboard('{Control>}{Enter}{/Control}');
        await asyncSetTimeout(0);

        expect(api.getDisplayedRowAtIndex(0)?.data?.make).toBe('BulkValue');
        expect(api.getDisplayedRowAtIndex(1)?.data?.make).toBe('BulkValue');

        const cell0 = getByTestId(gridDiv, agTestIdFor.cell('ROW_0', 'make'));
        const cell1 = getByTestId(gridDiv, agTestIdFor.cell('ROW_1', 'make'));
        expect(cell0).toHaveClass(FLASH_CSS_CLASS);
        expect(cell1).toHaveClass(FLASH_CSS_CLASS);
    });
});
