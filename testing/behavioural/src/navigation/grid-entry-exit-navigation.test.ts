import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, KeyCode } from 'ag-grid-community';

import { dispatchKeyDown, getFocusedColId, getFocusedRowIndex } from './navigation-test-utils';

interface RowData {
    a: string;
    b: string;
}

const rowData: RowData[] = [
    { a: 'a0', b: 'b0' },
    { a: 'a1', b: 'b1' },
];

const columnDefs: ColDef<RowData>[] = [
    { field: 'a', colId: 'a' },
    { field: 'b', colId: 'b' },
];

/** Dispatches a real Tab keydown on the focused element and reports whether the grid consumed it. */
function dispatchTab(opts?: KeyboardEventInit): boolean {
    const activeElement = document.activeElement as HTMLElement | null;
    if (!activeElement) {
        throw new Error('Expected an active element before dispatching Tab');
    }
    const event = new KeyboardEvent('keydown', {
        key: KeyCode.TAB,
        bubbles: true,
        cancelable: true,
        ...opts,
    });
    activeElement.dispatchEvent(event);
    return event.defaultPrevented;
}

function getFocusedHeaderColId(): string | null {
    return (document.activeElement as HTMLElement | null)?.closest('.ag-header-cell')?.getAttribute('col-id') ?? null;
}

describe('Grid entry and exit navigation', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule] });

    let host: HTMLElement;
    let before: HTMLInputElement;
    let gridDiv: HTMLElement;
    let after: HTMLInputElement;

    beforeEach(() => {
        host = document.createElement('div');
        before = document.createElement('input');
        gridDiv = document.createElement('div');
        after = document.createElement('input');
        host.append(before, gridDiv, after);
        document.body.appendChild(host);
    });

    afterEach(() => {
        gridsManager.reset();
        host.remove();
    });

    const createGrid = (gridOptions: Partial<GridOptions<RowData>> = {}) =>
        gridsManager.createGridAndWait<RowData>(gridDiv, {
            columnDefs,
            rowData,
            ...gridOptions,
        } as GridOptions<RowData>);

    describe('header to cell', () => {
        test('Tab from the last header cell focuses the first cell of the first row', async () => {
            const api = await createGrid();
            api.setFocusedHeader('b');
            await asyncSetTimeout(0);

            dispatchKeyDown(KeyCode.TAB);

            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('a');
        });

        test('Shift+Tab from the first cell focuses the last header cell', async () => {
            const api = await createGrid();
            api.setFocusedCell(0, 'a');

            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });

            expect(getFocusedHeaderColId()).toBe('b');
        });

        test('Shift+Tab from the first cell does not enter a suppressed header', async () => {
            const api = await createGrid({ suppressHeaderFocus: true });
            api.setFocusedCell(0, 'a');

            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });

            expect(getFocusedHeaderColId()).toBeNull();
        });

        test('Tab from the last header cell focuses no cell when cell focus is suppressed', async () => {
            const api = await createGrid({ suppressCellFocus: true });
            api.setFocusedHeader('b');
            await asyncSetTimeout(0);

            dispatchKeyDown(KeyCode.TAB);

            expect(api.getFocusedCell()).toBeFalsy();
        });

        test('Tab from the last header cell focuses no cell when every cell is non-navigable', async () => {
            const api = await createGrid({
                columnDefs: columnDefs.map((colDef) => ({ ...colDef, suppressNavigable: true })),
            });
            api.setFocusedHeader('b');
            await asyncSetTimeout(0);

            // the tab must not be swallowed either - with nowhere to land, focus leaves the grid
            expect(dispatchTab()).toBe(false);
            expect(api.getFocusedCell()).toBeFalsy();
        });

        test('Tab from the last header cell skips a non-navigable first column', async () => {
            const api = await createGrid({
                columnDefs: [
                    { field: 'a', colId: 'a', suppressNavigable: true },
                    { field: 'b', colId: 'b' },
                ],
            });
            api.setFocusedHeader('b');
            await asyncSetTimeout(0);

            dispatchKeyDown(KeyCode.TAB);

            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('b');
        });

        test('Tab from the last header cell enters the first pinned column', async () => {
            const api = await createGrid({
                columnDefs: [
                    { field: 'a', colId: 'a', pinned: 'left' },
                    { field: 'b', colId: 'b', pinned: 'right' },
                ],
            });
            api.setFocusedHeader('b');
            await asyncSetTimeout(0);

            dispatchKeyDown(KeyCode.TAB);

            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('a');
        });

        test('down arrow from a header cell focuses the cell below it', async () => {
            const api = await createGrid();
            api.setFocusedHeader('a');
            await asyncSetTimeout(0);

            dispatchKeyDown(KeyCode.DOWN);

            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('a');
            expect(getFocusedHeaderColId()).toBeNull();
        });

        test('up arrow from the first row focuses the header cell above it', async () => {
            const api = await createGrid();
            api.setFocusedCell(0, 'a');

            dispatchKeyDown(KeyCode.UP);

            expect(getFocusedHeaderColId()).toBe('a');
        });

        test('Shift+Tab from the first cell leaves the cells when there is no header row', async () => {
            const api = await createGrid({ headerHeight: 0 });
            api.setFocusedCell(0, 'a');

            dispatchKeyDown(KeyCode.TAB, { shiftKey: true });

            expect(getFocusedHeaderColId()).toBeNull();
            expect(document.activeElement).toHaveClass('ag-tab-guard-top');
        });
    });

    describe('entering the grid from outside', () => {
        test('Tab from the element before the grid focuses the first header cell', async () => {
            await createGrid();
            const user = userEvent.setup();
            before.focus();

            await user.tab();

            expect(getFocusedHeaderColId()).toBe('a');
        });

        test('Tab from the element before the grid focuses the first cell when the header is suppressed', async () => {
            const api = await createGrid({ suppressHeaderFocus: true });
            const user = userEvent.setup();
            before.focus();

            await user.tab();

            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('a');
        });

        test('Shift+Tab from the element after the grid focuses the last cell', async () => {
            const api = await createGrid();
            const user = userEvent.setup();
            after.focus();

            await user.tab({ shift: true });

            expect(getFocusedRowIndex(api)).toBe(1);
            expect(getFocusedColId(api)).toBe('b');
        });

        test('Shift+Tab from the element after the grid skips a non-navigable last row', async () => {
            // the mirror of the forwards entry: a backwards walk that cannot leave the entry row
            // used to drop focus entirely, leaving it stranded on the bottom tab guard
            const api = await createGrid({
                columnDefs: columnDefs.map((colDef) => ({
                    ...colDef,
                    suppressNavigable: (params) => params.data?.a === 'a1',
                })),
            });
            const user = userEvent.setup();
            after.focus();

            await user.tab({ shift: true });

            expect(getFocusedRowIndex(api)).toBe(0);
            expect(getFocusedColId(api)).toBe('b');
        });

        test('Shift+Tab from the element after the grid focuses the header when cell focus is suppressed', async () => {
            const api = await createGrid({ suppressCellFocus: true });
            const user = userEvent.setup();
            after.focus();

            await user.tab({ shift: true });

            expect(api.getFocusedCell()).toBeFalsy();
            expect(getFocusedHeaderColId()).toBe('b');
        });
    });

    describe('leaving the grid', () => {
        test('Tab from the last cell is not consumed, so the browser moves focus out of the grid', async () => {
            const api = await createGrid();
            api.setFocusedCell(1, 'b');

            expect(dispatchTab()).toBe(false);
        });

        test('Tab from a cell that has somewhere to go is consumed by the grid', async () => {
            const api = await createGrid();
            api.setFocusedCell(0, 'a');

            expect(dispatchTab()).toBe(true);
            expect(getFocusedColId(api)).toBe('b');
        });
    });
});
