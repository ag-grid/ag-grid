import { waitFor } from '@testing-library/dom';
import {
    TestGridsManager,
    clickMenuOption,
    clipboardUtils,
    fireGridPointerDown,
    menuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';

import { ROW_NUMBERS_COLUMN_ID, getGridElement } from 'ag-grid-community';
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
function rightClick(element: HTMLElement): void {
    fireGridPointerDown(element, { button: 2, buttons: 2 });
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
        expect(api.getCellRanges()?.[0]?.startRow?.rowIndex).toBe(2);
        // the whole-row range spans the data columns; the row-number column itself is excluded
        // (rangeService.getColumnsFromModel -> shouldSkipColumn), which is why the copied text has no row number
        expect(api.getCellRanges()?.[0]?.columns.map((c) => c.getColId())).toEqual(['athlete', 'age']);
    });
});
