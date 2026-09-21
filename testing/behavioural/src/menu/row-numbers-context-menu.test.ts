import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    TestGridsManager,
    clickMenuOption,
    clipboardUtils,
    fireGridPointerDown,
    menuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';

import type { GetContextMenuItemsParams } from 'ag-grid-community';
import { ROW_NUMBERS_COLUMN_ID, SELECTION_COLUMN_ID, enableDevValidations, getGridElement } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

let restoreOffsetParent: (() => void) | undefined;

function fireContextMenu(element: HTMLElement): void {
    element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));
}

function cell(gridDiv: HTMLElement, rowIndex: number, colId: string): HTMLElement {
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

    // The selection column is as dataless as a row number: nothing would be copied from it.
    test('the default menu on a selection-column cell offers the row-level items only', async () => {
        const api = await gridMgr.createGridAndWait('selectionColCtx', {
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClick(cell(gridDiv, 0, SELECTION_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
        expect(menuOption('Paste')).toBeNull();
    });

    // With copySelectedRows the clipboard copies the selected rows whatever cell was clicked, so the
    // selection column keeps its copy items - but only once there are rows to copy.
    test('a selection-column cell offers Copy when copySelectedRows is enabled', async () => {
        const api = await gridMgr.createGridAndWait('selectionColCtxCopyRows', {
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow', copySelectedRows: true },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        rightClick(cell(gridDiv, 0, SELECTION_COLUMN_ID));
        await waitFor(() => expect(menuOption('Export')).not.toBeNull());
        expect(menuOption('Copy')).toBeNull();
        api.hidePopupMenu();
        await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(0));

        api.setNodesSelected({ nodes: [api.getDisplayedRowAtIndex(1)!], newValue: true });
        rightClick(cell(gridDiv, 0, SELECTION_COLUMN_ID));
        await clickMenuOption('Copy');
        await waitFor(() => expect(clipboardUtils.getText()).toBe('Natalie Coughlin\t25'));
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

    // Notes attach to any cell, so the special columns keep their note actions without any clipboard target.
    test('row-number and selection-column cells offer the note actions', async () => {
        const api = await gridMgr.createGridAndWait('specialColsCtxNotes', {
            columnDefs,
            rowData,
            rowNumbers: true,
            rowSelection: { mode: 'multiRow' },
            getRowId: ({ data }) => data.athlete,
            notesDataSource: { getNote: () => undefined, setNote: () => {} },
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;
        for (const colId of [ROW_NUMBERS_COLUMN_ID, SELECTION_COLUMN_ID]) {
            rightClick(cell(gridDiv, 0, colId));
            await waitFor(() => expect(menuOption('Add Note')).not.toBeNull());
            expect(menuOption('Copy')).toBeNull();
            api.hidePopupMenu();
            await waitFor(() => expect(document.querySelectorAll('.ag-menu')).toHaveLength(0));
        }
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
    // Guard: a right-click must not append to the existing ranges, even with the multi-range modifier.
    test('ctrl right-clicking a row-number cell selects only that row', async () => {
        const api = await gridMgr.createGridAndWait('rowNumbersCtxMultiRange', {
            columnDefs,
            rowData,
            rowNumbers: true,
            cellSelection: true,
        });
        restoreOffsetParent = polyfillOffsetParent();

        const gridDiv = getGridElement(api)! as HTMLElement;

        fireGridPointerDown(cell(gridDiv, 0, 'athlete'));
        rightClick(cell(gridDiv, 2, ROW_NUMBERS_COLUMN_ID), { ctrlKey: true });

        expect(api.getCellRanges()).toHaveLength(1);
        expect(api.getCellRanges()?.[0]?.startRow?.rowIndex).toBe(2);
    });
});
