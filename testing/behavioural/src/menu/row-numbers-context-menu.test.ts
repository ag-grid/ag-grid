import { waitFor } from '@testing-library/dom';
import {
    TestGridsManager,
    clickMenuOption,
    clipboardUtils,
    fireGridPointerDown,
    menuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';

import type { GetContextMenuItemsParams } from 'ag-grid-community';
import { ROW_NUMBERS_COLUMN_ID, SELECTION_COLUMN_ID, getGridElement } from 'ag-grid-community';
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
