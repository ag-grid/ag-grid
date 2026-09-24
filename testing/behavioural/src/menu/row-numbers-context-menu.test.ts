import { waitFor } from '@testing-library/dom';
import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
import {
    ALL_SEVERITIES,
    TestGridsManager,
    canvasPolyfill,
    clickMenuOption,
    clipboardUtils,
    fireGridPointerDown,
    menuOption,
    objectUrls,
    polyfillOffsetParent,
} from 'ag-test-utils';

import type {
    GetContextMenuItemsParams,
    GridApi,
    GridOptions,
    NotesDataSourceGetNoteParams,
    NotesDataSourceSetNoteParams,
} from 'ag-grid-community';
import { ROW_NUMBERS_COLUMN_ID, SELECTION_COLUMN_ID, enableDevValidations, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

function fireContextMenu(element: HTMLElement): void {
    element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

function cell(gridDiv: HTMLElement, rowIndex: number | string, colId: string): HTMLElement {
    const el = gridDiv.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`);
    if (!el) {
        throw new Error(`No cell rendered at row ${rowIndex}, column ${colId}`);
    }
    return el;
}

/** Right-click on a cell: the press the row container listens for, then the contextmenu event. */
function rightClick(element: HTMLElement, options?: MouseEventInit): void {
    fireGridPointerDown(element, { button: 2, buttons: 2, ...options });
    fireContextMenu(element);
}

describe('Row Numbers context menu (AG-16355)', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [
        { athlete: 'Michael Phelps', age: 23 },
        { athlete: 'Natalie Coughlin', age: 25 },
        { athlete: 'Aleksey Nemov', age: 24 },
    ];

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    // TC1: rowNumbers without cellSelection — the user's getContextMenuItems must still be honoured.
    test('right-clicking a row-number cell opens the custom context menu without cellSelection', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxNoCellSelection', {
            columnDefs,
            rowData,
            rowNumbers: true,
            getContextMenuItems: () => [{ name: 'Foo' }],
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        // a normal cell opens the custom menu
        rightClick(cell(gridDiv, 0, 'athlete'));
        await waitFor(() => expect(menuOption('Foo')).not.toBeNull());
        api.hidePopupMenu();
        await waitFor(() => expect(menuOption('Foo')).toBeNull());

        // ...and so must the row-number cell
        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Foo')).not.toBeNull());
    });

    // TC2: right-click must apply the row-number cell's own selection before the menu acts on it,
    // so Copy copies the right-clicked row rather than the previously selected cell.
    test('Copy from a row-number cell context menu copies the right-clicked row', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxCopy', {
            columnDefs,
            rowData,
            rowNumbers: true,
            cellSelection: true,
            getContextMenuItems: (params) => params.defaultItems!,
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        // select the athlete cell of row 0
        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));

        // then right-click the row number of row 2, without left-clicking it first
        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Copy');

        await waitFor(() => expect(clipboardUtils.getText()).toBe('Aleksey Nemov\t24'));
        expect(api.getFocusedCell()?.rowIndex).toBe(2);
        expect(api.getCellRanges()).toHaveLength(1);
        expect(api.getCellRanges()?.[0]?.startRow?.rowIndex).toBe(2);
        // the whole-row range spans the data columns; the row-number column itself is excluded
        // (rangeService.getColumnsFromModel -> shouldSkipColumn), which is why the copied text has no row number
        expect(api.getCellRanges()?.[0]?.columns.map((c) => c.getColId())).toEqual(['athlete', 'age']);
    });
    // The delegating default must pass the context-menu params straight through to the user callback.
    test('the user callback receives the context-menu params for a row-number cell', async () => {
        let params: GetContextMenuItemsParams | undefined;
        const api = await gridMgr.createGridAndWait('rowNumbersCtxParams', {
            columnDefs,
            rowData,
            rowNumbers: true,
            getContextMenuItems: (p) => {
                params = p;
                return [{ name: 'Foo' }];
            },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        rightClick(cell(gridDiv, 1, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Foo')).not.toBeNull());

        expect(params?.column?.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(params?.node?.rowIndex).toBe(1);
        expect(params?.api).toBe(api);
    });

    // The row-number cell is not a data cell, so its default items must be an empty-grid right-click's,
    // not the clicked-cell ones a data column offers.
    test("a row-number cell offers the row-level default items, not a cell's", async () => {
        const seen: Record<string, string[] | undefined> = {};
        let target = '';
        const api = await gridMgr.createGridAndWait('rowNumbersCtxDefaultItems', {
            columnDefs,
            rowData,
            rowNumbers: true,
            cellSelection: false,
            getContextMenuItems: (p) => {
                seen[target] = p.defaultItems;
                return p.defaultItems ?? [];
            },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        target = 'cell';
        rightClick(cell(gridDiv, 0, 'athlete'));
        await waitFor(() => expect(seen.cell).not.toBeUndefined());
        api.hidePopupMenu();

        target = 'rowNumber';
        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect('rowNumber' in seen).toBe(true));

        // the cell's items minus the clipboard ones, which have no meaning for a row number
        expect(seen.cell).toContain('copy');
        expect(seen.rowNumber).toEqual(seen.cell!.filter((item) => !/cut|copy|paste|separator/i.test(item)));
        expect(seen.rowNumber).toContain('export');
    });

    // Guard: with no callback the row-number cell gets the grid's own row-level menu, not a cell's.
    test('the default menu on a row-number cell offers the row-level items only', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxNoCallback', {
            columnDefs,
            rowData,
            rowNumbers: true,
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
        expect(menuOption('Paste')).toBeNull();
    });

    // The Selection Column is out of this ticket's scope: its menu stays as it is on latest.
    test('a selection-column cell keeps the clipboard items', async () => {
        const api = await gridMgr.createGridAndWait('selectionColCtx', {
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClick(cell(gridDiv, 0, SELECTION_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).not.toBeNull();
        expect(menuOption('Paste')).not.toBeNull();
    });

    // copySelectedRows with nothing selected leaves the clipboard falling back to the focused cell, so offering
    // Copy/Cut on a row-number cell would copy - and, on Cut, clear - a data cell the user never right-clicked.
    test('Cut from a row-number cell acts on the selected rows, never on the focused data cell', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxCopyRowsNoneSelected', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, editable: true })),
            // Cut mutates the row data, so this grid gets its own copy rather than the shared rows
            rowData: rowData.map((row) => ({ ...row })),
            rowNumbers: true,
            rowSelection: { mode: 'multiRow', copySelectedRows: true },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        api.setFocusedCell(0, 'athlete');

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
        expect(menuOption('Cut')).toBeNull();
        api.hidePopupMenu();
        await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(0));

        // once there are rows to copy, Cut acts on them and leaves the focused cell alone
        api.setNodesSelected({ nodes: [api.getDisplayedRowAtIndex(2)!], newValue: true });
        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Cut');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Aleksey Nemov\t24'));
        expect(api.getDisplayedRowAtIndex(2)!.data.athlete).toBeFalsy();
        expect(api.getDisplayedRowAtIndex(0)!.data.athlete).toBe('Michael Phelps');
    });

    // The grid-wide callback can name the clipboard items itself; on a row-number cell with nothing to copy they
    // would fall back to the focused data cell just as the default items would.
    test('clipboard items named by getContextMenuItems are dropped on a row-number cell with nothing to copy', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxCallbackCut', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, editable: true })),
            rowData: rowData.map((row) => ({ ...row })),
            rowNumbers: true,
            getContextMenuItems: () => ['cut', 'copy', 'paste', { name: 'Foo' }],
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        api.setFocusedCell(0, 'athlete');

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Foo')).not.toBeNull());
        expect(menuOption('Cut')).toBeNull();
        expect(menuOption('Copy')).toBeNull();
        expect(menuOption('Paste')).toBeNull();
        api.hidePopupMenu();
        await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(0));

        // a normal cell still gets them
        rightClick(cell(gridDiv, 0, 'athlete'));
        await waitFor(() => expect(menuOption('Cut')).not.toBeNull());
        expect(api.getDisplayedRowAtIndex(0)!.data.athlete).toBe('Michael Phelps');
    });

    test('clipboard items nested in a getContextMenuItems submenu are dropped on a row-number cell with nothing to copy', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxCallbackSubMenu', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, editable: true })),
            rowData: rowData.map((row) => ({ ...row })),
            rowNumbers: true,
            getContextMenuItems: () => [{ name: 'Clipboard', subMenu: ['cut', 'copy', { name: 'Foo' }] }],
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        api.setFocusedCell(0, 'athlete');

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Clipboard');
        await waitFor(() => expect(menuOption('Foo')).not.toBeNull());
        expect(menuOption('Cut')).toBeNull();
        expect(menuOption('Copy')).toBeNull();
        expect(api.getDisplayedRowAtIndex(0)!.data.athlete).toBe('Michael Phelps');
    });

    test('a row-number cell offers Copy when copySelectedRows is enabled without cell selection', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxCopyRows', {
            columnDefs,
            rowData,
            rowNumbers: true,
            rowSelection: { mode: 'multiRow', copySelectedRows: true },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        api.setNodesSelected({ nodes: [api.getDisplayedRowAtIndex(2)!], newValue: true });
        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Copy');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Aleksey Nemov\t24'));
    });

    // A right-click on the checkbox leaves an existing cell range in place, and Copy copies that range.
    test('a selection-column checkbox offers Copy for an existing cell range', async () => {
        const api = await gridMgr.createGridAndWait('selectionColCtxRange', {
            columnDefs,
            rowData,
            cellSelection: true,
            rowSelection: { mode: 'multiRow' },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));
        fireGridPointerDown(cell(gridDiv, 1, 'age'), { shiftKey: true });
        expect(api.getCellRanges()).toHaveLength(1);

        const checkbox = cell(gridDiv, 2, SELECTION_COLUMN_ID).querySelector<HTMLElement>('.ag-selection-checkbox')!;
        rightClick(checkbox);
        await clickMenuOption('Copy');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Michael Phelps\t23\r\nNatalie Coughlin\t25'));
    });

    // The legacy string rowSelection copies selected rows by default, unless suppressCopyRowsToClipboard is set.
    test('a row-number cell follows the legacy rowSelection copy behaviour', async () => {
        // the string form of rowSelection is deprecated (#306) but still supported
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306] });
        const withCopy = await gridMgr.createGridAndWait('rowNumbersCtxLegacy', {
            columnDefs,
            rowData,
            rowNumbers: true,
            rowSelection: 'multiple',
        });
        restoreOffsetParent = polyfillOffsetParent();
        withCopy.setNodesSelected({ nodes: [withCopy.getDisplayedRowAtIndex(1)!], newValue: true });
        rightClick(cell(getGridElement(withCopy)! as HTMLElement, 0, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Copy');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Natalie Coughlin\t25'));
        gridMgr.reset();

        const suppressed = await gridMgr.createGridAndWait('rowNumbersCtxLegacySuppressed', {
            columnDefs,
            rowData,
            rowNumbers: true,
            rowSelection: 'multiple',
            suppressCopyRowsToClipboard: true,
        });
        rightClick(cell(getGridElement(suppressed)! as HTMLElement, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
    });

    // A range is not always a copy target: under the legacy API `suppressCopySingleCellRanges` makes the clipboard
    // skip a single-cell range and fall back to the focused cell, so the row-number guard must ask the clipboard
    // rather than assume a non-empty range means Copy is safe.
    test('a row-number cell hides Copy when suppressCopySingleCellRanges rejects the range', async () => {
        // the legacy enableRangeSelection/suppressCopySingleCellRanges options are deprecated (#306) but supported
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [306] });
        const api = await gridMgr.createGridAndWait('rowNumbersCtxSuppressedSingleCellRange', {
            columnDefs,
            rowData,
            rowNumbers: true,
            enableRangeSelection: true,
            suppressCopySingleCellRanges: true,
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        // a single-cell range on a data cell: the clipboard would skip it and copy the focused cell instead
        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));
        expect(api.getCellRanges()).toHaveLength(1);

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
        expect(menuOption('Cut')).toBeNull();
        api.hidePopupMenu();
        await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(0));

        // extend the range past one cell and the clipboard will copy it, so the items come back
        fireGridPointerDown(cell(gridDiv, 1, 'age'), { shiftKey: true });
        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Copy');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Michael Phelps\t23\r\nNatalie Coughlin\t25'));
    });

    // With the integration suppressed a row-number right-click leaves an existing range alone, and Copy copies it.
    test('a row-number cell offers Copy for an existing cell range when the integration is suppressed', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxSuppressedRange', {
            columnDefs,
            rowData,
            cellSelection: true,
            rowNumbers: { suppressCellSelectionIntegration: true },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));
        fireGridPointerDown(cell(gridDiv, 1, 'age'), { shiftKey: true });

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Copy');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Michael Phelps\t23\r\nNatalie Coughlin\t25'));
    });

    // Notes attach to any cell, so a row-number cell keeps its note actions without any clipboard target.
    test('a row-number cell offers the note actions', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxNotes', {
            columnDefs,
            rowData,
            rowNumbers: true,
            rowSelection: { mode: 'multiRow' },
            getRowId: ({ data }) => data.athlete,
            notesDataSource: { getNote: () => undefined, setNote: () => {} },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Add Note')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
    });

    // Guard: rowNumbers.contextMenuItems still wins over the grid-level callback.
    test('rowNumbers.contextMenuItems overrides the grid-level getContextMenuItems', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxOverride', {
            columnDefs,
            rowData,
            rowNumbers: { contextMenuItems: [{ name: 'Bar' }] },
            getContextMenuItems: () => [{ name: 'Foo' }],
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Bar')).not.toBeNull());
        expect(menuOption('Foo')).toBeNull();
    });

    // Guard: right-clicking inside an existing whole-row range preserves it, rather than collapsing
    // the range onto the right-clicked row.
    test('right-clicking within an existing whole-row range preserves the range', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxExistingRange', {
            columnDefs,
            rowData,
            rowNumbers: true,
            cellSelection: true,
            getContextMenuItems: (params) => params.defaultItems!,
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        // select rows 0-2 by their row numbers
        fireGridPointerDown(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        fireGridPointerDown(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID), { shiftKey: true });
        expect(api.getCellRanges()?.[0]?.startRow?.rowIndex).toBe(0);
        expect(api.getCellRanges()?.[0]?.endRow?.rowIndex).toBe(2);

        // right-clicking a row within it must not collapse it onto that row
        rightClick(cell(gridDiv, 1, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Copy');

        // rows are separated by the clipboard's CRLF line delimiter
        await waitFor(() =>
            expect(clipboardUtils.getText()).toBe('Michael Phelps\t23\r\nNatalie Coughlin\t25\r\nAleksey Nemov\t24')
        );
        expect(api.getCellRanges()).toHaveLength(1);
        expect(api.getCellRanges()?.[0]?.startRow?.rowIndex).toBe(0);
        expect(api.getCellRanges()?.[0]?.endRow?.rowIndex).toBe(2);
    });
    // A right-click with the multi-range modifier appends the row, as a ctrl-click does on a normal cell.
    test.each([
        { name: 'cmd right-click', options: { metaKey: true } },
        { name: 'ctrl-click under allowContextMenuWithControlKey', options: { button: 0, buttons: 1, ctrlKey: true } },
    ])('$name on a row-number cell appends that row to the existing ranges', async ({ options }) => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxMultiRange', {
            columnDefs,
            rowData,
            rowNumbers: true,
            cellSelection: true,
            allowContextMenuWithControlKey: true,
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));
        fireGridPointerDown(cell(gridDiv, 1, 'age'), { ctrlKey: true });
        expect(api.getCellRanges()).toHaveLength(2);

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID), options);

        const ranges = api.getCellRanges()!;
        expect(ranges).toHaveLength(3);
        expect(ranges[2].startRow?.rowIndex).toBe(2);
        expect(ranges[2].endRow?.rowIndex).toBe(2);
        expect(ranges[2].columns.map((col) => col.getColId())).toEqual(['athlete', 'age']);
    });
});

// Without cell selection integration a row-number right-click leaves the cell ranges alone, so each default
// item must act on the right-clicked row, or on whatever range or selection already exists.
describe('Row Numbers context menu items without cell selection integration (AG-16355)', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule] });

    const columnDefs = [{ field: 'athlete' }, { field: 'age' }];
    const rowData = [
        { athlete: 'Michael Phelps', age: 23 },
        { athlete: 'Natalie Coughlin', age: 25 },
        { athlete: 'Aleksey Nemov', age: 24 },
    ];

    beforeEach(() => {
        clipboardUtils.init();
        objectUrls.init();
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
        objectUrls.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    test('Add Note opens the notes editor for the right-clicked row-number cell', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersNoCsAddNote', {
            columnDefs,
            rowData,
            rowNumbers: true,
            getRowId: ({ data }) => data.athlete,
            notesDataSource: { getNote: () => undefined, setNote: () => {} },
        });

        rightClick(cell(getGridElement(api)! as HTMLElement, 1, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Add Note');

        await waitFor(() => expect(document.querySelector('.ag-notes-popup')).not.toBeNull());
    });

    test("Remove Note clears the right-clicked row-number cell's note", async () => {
        const setNote = vi.fn<(params: NotesDataSourceSetNoteParams) => void>();
        const api = await gridMgr.createGridAndWait('rowNumbersNoCsRemoveNote', {
            columnDefs,
            rowData,
            rowNumbers: true,
            getRowId: ({ data }) => data.athlete,
            notesDataSource: {
                getNote: ({ column, rowNode }: NotesDataSourceGetNoteParams) =>
                    column.getColId() === ROW_NUMBERS_COLUMN_ID && rowNode.rowIndex === 1
                        ? { text: 'Note' }
                        : undefined,
                setNote,
            },
        });

        rightClick(cell(getGridElement(api)! as HTMLElement, 1, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Edit Note')).not.toBeNull());
        await clickMenuOption('Remove Note');

        await waitFor(() => expect(setNote).toHaveBeenCalledTimes(1));
        const [{ column, rowNode, note }] = setNote.mock.calls[0];
        expect(column.getColId()).toBe(ROW_NUMBERS_COLUMN_ID);
        expect(rowNode.rowIndex).toBe(1);
        expect(note).toBeUndefined();
    });

    test('Pin Row pins and unpins the right-clicked row', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersNoCsPin', {
            columnDefs,
            rowData,
            rowNumbers: true,
            getRowId: ({ data }) => data.athlete,
            enableRowPinning: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClick(cell(gridDiv, 1, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Pin Row');
        await clickMenuOption('Pin to Top');
        await waitFor(() => expect(api.getState().rowPinning).toEqual({ top: ['Natalie Coughlin'], bottom: [] }));

        rightClick(cell(gridDiv, 't-0', ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Pin Row');
        await clickMenuOption('Unpin Row');
        await waitFor(() => expect(api.getState().rowPinning).toEqual({ top: [], bottom: [] }));
    });

    test('Pin Row is not offered when isRowPinnable declines the row', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersNoCsNotPinnable', {
            columnDefs,
            rowData,
            rowNumbers: true,
            enableRowPinning: true,
            isRowPinnable: (node) => node.rowIndex !== 1,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClick(cell(gridDiv, 1, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Pin Row')).toBeNull();
        api.hidePopupMenu();
        await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(0));

        rightClick(cell(gridDiv, 0, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Pin Row')).not.toBeNull());
    });

    test('CSV Export exports the grid data without the row numbers', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersNoCsCsv', {
            columnDefs,
            rowData,
            rowNumbers: true,
        });

        rightClick(cell(getGridElement(api)! as HTMLElement, 1, ROW_NUMBERS_COLUMN_ID));
        await clickMenuOption('Export');
        await clickMenuOption('CSV Export');

        const csv = await (await objectUrls.pullBlob()).text();
        // the export leads with a byte order mark
        expect(csv).toBe(
            '\ufeff"Athlete","Age"\r\n"Michael Phelps","23"\r\n"Natalie Coughlin","25"\r\n"Aleksey Nemov","24"'
        );
    });

    // Paste writes from the focused cell, which a row-number cell can never be, as it is not editable: the item is
    // offered alongside Copy but stays disabled, whether the copy target is a cell range or the selected rows.
    test.each([
        {
            target: 'an existing cell range',
            options: { cellSelection: true, rowNumbers: { suppressCellSelectionIntegration: true } } as GridOptions,
            select: (api: GridApi) => fireGridPointerDown(cell(getGridElement(api)! as HTMLElement, 0, 'athlete')),
        },
        {
            target: 'the selected rows',
            options: { rowNumbers: true, rowSelection: { mode: 'multiRow', copySelectedRows: true } } as GridOptions,
            select: (api: GridApi) => api.setNodesSelected({ nodes: [api.getDisplayedRowAtIndex(2)!], newValue: true }),
        },
    ])('Paste is offered but disabled when the copy target is $target', async ({ options, select }) => {
        const api = await gridMgr.createGridAndWait('rowNumbersNoCsPaste', {
            columnDefs: columnDefs.map((colDef) => ({ ...colDef, editable: true })),
            rowData,
            ...options,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        select(api);

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Copy')).not.toBeNull());
        const paste = menuOption('Paste')?.closest('.ag-menu-option');
        expect(paste?.classList.contains('ag-menu-option-disabled')).toBe(true);
    });
});

describe('Row Numbers context menu chart items (AG-16355)', () => {
    const gridMgr = new TestGridsManager({ modules: [AllEnterpriseModule.with(AgChartsEnterpriseModule)] });

    const columnDefs = [
        { field: 'athlete', chartDataType: 'category' as const },
        { field: 'age', chartDataType: 'series' as const },
    ];
    const rowData = [
        { athlete: 'Michael Phelps', age: 23 },
        { athlete: 'Natalie Coughlin', age: 25 },
        { athlete: 'Aleksey Nemov', age: 24 },
    ];

    beforeAll(async () => {
        await canvasPolyfill.init();
    });
    afterAll(() => canvasPolyfill.reset());

    beforeEach(() => {
        restoreOffsetParent = polyfillOffsetParent();
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    async function chartFromMenu(chartItem: 'Chart Range' | 'Pivot Chart'): Promise<void> {
        await clickMenuOption(chartItem);
        await clickMenuOption('Column');
        // the pivot chart items carry a left-to-right mark, so they read correctly in RTL locales
        await clickMenuOption(chartItem === 'Pivot Chart' ? 'Grouped\u200E' : 'Grouped');
    }

    test('without the integration, Chart Range charts the existing range rather than the right-clicked row', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersChartExistingRange', {
            columnDefs,
            rowData,
            enableCharts: true,
            cellSelection: true,
            rowNumbers: { suppressCellSelectionIntegration: true },
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));
        fireGridPointerDown(cell(gridDiv, 1, 'age'), { shiftKey: true });

        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID));
        await chartFromMenu('Chart Range');

        await waitFor(() => expect(api.getChartModels()).toHaveLength(1));
        const { cellRange, chartType } = api.getChartModels()![0];
        expect(chartType).toBe('groupedColumn');
        expect(cellRange.rowStartIndex).toBe(0);
        expect(cellRange.rowEndIndex).toBe(1);
    });

    test('without the integration and without a range, Chart Range is not offered', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersChartNoRange', {
            columnDefs,
            rowData,
            enableCharts: true,
            rowNumbers: true,
        });

        rightClick(cell(getGridElement(api)! as HTMLElement, 2, ROW_NUMBERS_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Chart Range')).toBeNull();
    });

    test('with the integration, Chart Range charts the right-clicked row', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersChartIntegrated', {
            columnDefs,
            rowData,
            enableCharts: true,
            cellSelection: true,
            rowNumbers: true,
        });

        rightClick(cell(getGridElement(api)! as HTMLElement, 2, ROW_NUMBERS_COLUMN_ID));
        await chartFromMenu('Chart Range');

        await waitFor(() => expect(api.getChartModels()).toHaveLength(1));
        const { cellRange } = api.getChartModels()![0];
        expect(cellRange.rowStartIndex).toBe(2);
        expect(cellRange.rowEndIndex).toBe(2);
    });

    test('Pivot Chart charts the pivot result from a row-number cell', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersPivotChart', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, chartDataType: 'category' as const },
                { field: 'age', aggFunc: 'sum', chartDataType: 'series' as const },
            ],
            rowData,
            enableCharts: true,
            pivotMode: true,
            rowNumbers: true,
        });

        rightClick(cell(getGridElement(api)! as HTMLElement, 0, ROW_NUMBERS_COLUMN_ID));
        await chartFromMenu('Pivot Chart');

        await waitFor(() => expect(api.getChartModels()).toHaveLength(1));
        const { modelType, chartType } = api.getChartModels()![0];
        expect(modelType).toBe('pivot');
        expect(chartType).toBe('groupedColumn');
    });
});
