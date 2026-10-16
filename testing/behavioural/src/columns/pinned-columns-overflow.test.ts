import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
    DragEventDispatcher,
    TestGridsManager,
    asyncSetTimeout,
    dispatchGridSizeChanged,
    installMockResizeObserver,
    nextAnimationFrame,
    openMenuOption,
    polyfillOffsetParent,
    triggerResizeObservers,
} from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import type { ColumnPinnedType, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ScrollApiModule } from 'ag-grid-community';
import { ColumnMenuModule, ColumnsToolPanelModule, ContextMenuModule, SideBarModule } from 'ag-grid-enterprise';

import { openToolPanelContextMenu } from '../columnToolPanel/toolPanelContextMenuHarness';

const overflowingColumnDefs = [
    { field: 'a', pinned: 'left' as const, width: 300 },
    { field: 'b', pinned: 'left' as const, width: 300 },
    { field: 'c', pinned: 'right' as const, width: 300 },
    { field: 'd', pinned: 'right' as const, width: 300 },
    { field: 'e', pinned: 'right' as const, width: 300 },
    { field: 'f', pinned: 'left' as const, width: 300 },
    { field: 'g', flex: 1 },
];

const rowData = [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f', g: 'g' }];

const query = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector);
    expect(element, `Expected ${selector} to be rendered`).not.toBeNull();
    return element!;
};

describe('Pinned columns wider than the viewport', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ScrollApiModule] });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        mockGridLayout.gridWidth = 600;
        gridsManager.reset();
    });

    test('unpins the pinned columns that do not fit, from the right and the left in turn, until the rest do', async () => {
        const restoreOffsetParent = polyfillOffsetParent();
        const uninstallResizeObserver = installMockResizeObserver();
        try {
            const api = gridsManager.createGrid('myGrid', { columnDefs: overflowingColumnDefs, rowData });
            // the viewport reports its size, which the pinned columns are kept narrower than
            triggerResizeObservers();
            await nextAnimationFrame();

            expect(api.getColumns()!.map((col) => `${col.getColId()}:${col.getPinned() ?? ''}`)).toEqual([
                'a:',
                'b:',
                'c:',
                'd:',
                'e:',
                'f:left',
                'g:',
            ]);
        } finally {
            uninstallResizeObserver();
            restoreOffsetParent();
        }
    });

    test('clips mixed pinned sections without creating a horizontal scroll range', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(viewport.scrollLeft).toBe(0);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');
        expect(query<HTMLElement>('.ag-root').classList.contains('ag-body-horizontal-content-no-gap')).toBe(true);

        const headerRows = document.querySelectorAll<HTMLElement>('.ag-header-row');
        expect(headerRows.length).toBeGreaterThan(0);
        expect(Array.from(headerRows, (row) => row.style.width)).toEqual(Array.from(headerRows, () => '600px'));

        const firstRow = query<HTMLElement>('.ag-row');
        expect(query<HTMLElement>('.ag-row > .ag-grid-pinned-left-cells').style.width).toBe('900px');
        expect(query<HTMLElement>('.ag-row > .ag-grid-pinned-right-cells').style.width).toBe('900px');
        expect(firstRow.getBoundingClientRect().left).toBe(viewport.getBoundingClientRect().left);

        expect(api.getColumnState().filter((column) => column.pinned === 'left')).toHaveLength(3);
        expect(api.getColumnState().filter((column) => column.pinned === 'right')).toHaveLength(3);

        api.ensureColumnVisible('g');
        expect(viewport.scrollLeft).toBe(0);
    });

    test('restores normal horizontal sizing when the viewport becomes wide enough', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);

        dispatchGridSizeChanged(api, 2400);

        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(false);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('2400px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).not.toBe('1px');

        dispatchGridSizeChanged(api, 600);

        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');
    });

    test('clips overflowing pinned columns in autoHeight layout', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            domLayout: 'autoHeight',
            processUnpinnedColumns: () => [],
        });

        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('600px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1px');

        api.ensureColumnVisible('g');
        expect(viewport.scrollLeft).toBe(0);
    });

    // Print lays every column out at once, so the clipping that applies on screen must not.
    test('does not clip overflowing pinned columns in print layout', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: overflowingColumnDefs,
            rowData,
            processUnpinnedColumns: () => [],
        });
        await asyncSetTimeout(0);

        const viewport = query<HTMLElement>('.ag-grid-viewport');
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);

        api.setGridOption('domLayout', 'print');
        await asyncSetTimeout(0);
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(false);

        api.setGridOption('domLayout', 'normal');
        await asyncSetTimeout(0);
        expect(viewport.classList.contains('ag-pinned-columns-overflow')).toBe(true);
    });

    test('keeps the normal scroll range while pinned columns fit in the viewport', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', pinned: 'left', width: 300 },
                { field: 'b', width: 500 },
                { field: 'c', width: 500 },
            ],
            rowData,
        });

        await asyncSetTimeout(0);

        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(false);
        expect(query<HTMLElement>('.ag-grid-scrollable-area').style.width).toBe('1300px');
        expect(query<HTMLElement>('.ag-body-horizontal-scroll-container').style.width).toBe('1300px');
    });
});

describe('Resizing pinned columns wider than the viewport', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule],
    });
    let originalGridWidth: number;

    beforeAll(() => {
        originalGridWidth = mockGridLayout.gridWidth;
        mockGridLayout.gridWidth = 600;
        mockGridLayout.useRealOffsetDimensions = true;
    });

    afterAll(() => {
        mockGridLayout.gridWidth = originalGridWidth;
        mockGridLayout.useRealOffsetDimensions = false;
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    // Returning [] from processUnpinnedColumns keeps 5 x 200px columns pinned in a 600px grid.
    const createGrid = async (
        columnCount: number,
        pinned: ColumnPinnedType = 'left',
        gridOptions: GridOptions = {}
    ): Promise<GridApi> => {
        const fields = ['a', 'b', 'c', 'd', 'e'].slice(0, columnCount);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: fields.map((field) => ({ field, width: 200 })),
            defaultColDef: { pinned, resizable: true },
            rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
            processUnpinnedColumns: () => [],
            ...gridOptions,
        });
        await asyncSetTimeout(0);
        expect(api.getColumnState().every((column) => column.pinned === pinned)).toBe(true);
        return api;
    };

    const width = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    // happy-dom has no text layout, so fix the width autosize measures (it adds autoSizePadding, 20px, on top)
    const mockAutosizeContentWidth = (contentWidth: number, contentWidthByColId: Record<string, number> = {}): void => {
        const mocked = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')!.get!;
        // a second call wraps the real getter, not the last mock, which would call itself
        if (vi.isMockFunction(mocked)) {
            mocked.mockRestore();
        }
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')!.get!;
        vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
            if (this.tagName !== 'FORM') {
                return original.call(this);
            }
            const colId = this.querySelector('[col-id]')?.getAttribute('col-id') ?? '';
            return contentWidthByColId[colId] ?? contentWidth;
        });
    };

    const dragResizeBy = async (colId: string, dx: number): Promise<void> => {
        const bar = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-resize`);
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 100, 10);
        await dispatcher.movePointer(bar, 100 + dx, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);
    };

    const pressResizeKey = async (colId: string, key: 'ArrowLeft' | 'ArrowRight', shiftKey = false): Promise<void> => {
        const headerCell = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);
        headerCell.focus();
        const init = { key, altKey: true, shiftKey, bubbles: true, cancelable: true };
        headerCell.dispatchEvent(new KeyboardEvent('keydown', init));
        headerCell.dispatchEvent(new KeyboardEvent('keyup', init));
        await asyncSetTimeout(0);
    };

    test('pinned columns that fit the viewport can be shrunk by mouse and keyboard', async () => {
        const api = await createGrid(2);
        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(false);

        await dragResizeBy('a', -60);
        expect(width(api, 'a')).toBeLessThan(200);

        await pressResizeKey('b', 'ArrowLeft');
        expect(width(api, 'b')).toBeLessThan(200);
    });

    test('a held Alt+Arrow grows a pinned column exactly to the viewport limit', async () => {
        const api = await createGrid(2);
        const headerCell = query<HTMLElement>('.ag-header-cell[col-id="a"]');
        headerCell.focus();
        const init = { key: 'ArrowRight', altKey: true, bubbles: true, cancelable: true };

        // each held press steps one pixel further, from 2: 2 + 3 + ... + 16 = 135, so the 150px room left caps the 16th
        for (let i = 0; i < 20; ++i) {
            headerCell.dispatchEvent(new KeyboardEvent('keydown', init));
        }
        headerCell.dispatchEvent(new KeyboardEvent('keyup', init));
        await asyncSetTimeout(0);

        expect(width(api, 'a')).toBe(350);
    });

    test('a drag held where the pinned columns stop growing ends with a finished columnResized and no resizing class, left and right', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'rowNum', valueGetter: 'node.id', width: 80, pinned: 'left' },
                { field: 'athlete', width: 150, pinned: 'left' },
                { field: 'age', width: 90, pinned: 'left' },
                { field: 'country', width: 150 },
                { field: 'sport', width: 150 },
                { field: 'total', width: 100, pinned: 'right' },
            ],
            rowData: [{ athlete: 'a', age: 20, country: 'c', sport: 's', total: 1 }],
        });
        await asyncSetTimeout(0);
        const events: string[] = [];
        api.addEventListener('columnResized', (event) => {
            events.push(
                `${event.column?.getColId()}:${event.column?.getActualWidth()}:${event.finished}:${event.source}`
            );
        });
        const dragPastCap = async (colId: string, dx: number): Promise<void> => {
            const bar = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-resize`);
            const dispatcher = new DragEventDispatcher('mouse');
            await dispatcher.startDrag(bar, 1000, 10);
            await dispatcher.movePointer(bar, 1000 + dx, 10);
            await dispatcher.movePointer(bar, 1000 + 2 * dx, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
        };
        const isResizing = (colId: string): boolean =>
            query<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`).classList.contains('ag-column-resizing');

        // 320px pinned left and 100px right leave 130px before the 600px grid's 50px margin
        await dragPastCap('age', 500);
        expect(width(api, 'age')).toBe(220);
        expect(events.at(-1)).toBe('age:220:true:uiColumnResized');
        expect(isResizing('age')).toBe(false);

        // right-pinned columns grow leftwards, and no room is left: only the finished event
        events.length = 0;
        await dragPastCap('total', -500);
        expect(width(api, 'total')).toBe(100);
        expect(events).toEqual(['total:100:true:uiColumnResized']);
        expect(isResizing('total')).toBe(false);
    });

    test('a pinned column group drag ends with a finished columnResized and no resizing class', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'Group',
                    children: [
                        { field: 'a', width: 200, pinned: 'left' },
                        { field: 'b', width: 200, pinned: 'left' },
                    ],
                },
                { field: 'c', width: 200 },
            ],
            defaultColDef: { resizable: true },
            rowData: [{ a: 'a', b: 'b', c: 'c' }],
        });
        await asyncSetTimeout(0);
        const finished: string[] = [];
        api.addEventListener('columnResized', (event) => {
            if (event.finished) {
                finished.push(event.columns!.map((col) => col.getColId()).join());
            }
        });
        const groupCell = query<HTMLElement>('.ag-header-group-cell');
        const bar = groupCell.querySelector<HTMLElement>('.ag-header-cell-resize')!;
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 1000, 10);
        await dispatcher.movePointer(bar, 1500, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(finished).toEqual(['a,b']);
        expect(groupCell.classList.contains('ag-column-resizing')).toBe(false);
    });

    test('overflowing pinned columns can be shrunk but not grown, by mouse and keyboard', async () => {
        const api = await createGrid(5);
        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(true);

        await dragResizeBy('a', 60);
        expect(width(api, 'a')).toBe(200);
        await dragResizeBy('a', -60);
        expect(width(api, 'a')).toBeLessThan(200);

        await pressResizeKey('b', 'ArrowRight');
        expect(width(api, 'b')).toBe(200);
        await pressResizeKey('b', 'ArrowLeft');
        expect(width(api, 'b')).toBeLessThan(200);
    });

    test('an overflowing pinned column shrunk during a drag can grow back to its starting width in the same drag', async () => {
        const api = await createGrid(5);
        const finishedResizes: string[] = [];
        api.addEventListener('columnResized', (event) => {
            if (event.finished) {
                finishedResizes.push(event.column!.getColId());
            }
        });
        const bar = query<HTMLElement>('.ag-header-cell[col-id="a"] .ag-header-cell-resize');
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 200, 10);
        await dispatcher.movePointer(bar, 100, 10);
        expect(width(api, 'a')).toBe(100);
        await dispatcher.movePointer(bar, 160, 10);
        expect(width(api, 'a')).toBe(160);
        await dispatcher.movePointer(bar, 260, 10);
        expect(width(api, 'a')).toBe(200);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(width(api, 'a')).toBe(200);
        expect(finishedResizes).toEqual(['a']);
        expect(query<HTMLElement>('.ag-header-cell[col-id="a"]').classList.contains('ag-column-resizing')).toBe(false);
    });

    test('a pinned column drag keeps to the limit of a viewport resized mid-drag, wider or narrower', async () => {
        const api = await createGrid(2);
        const bar = query<HTMLElement>('.ag-header-cell[col-id="a"] .ag-header-cell-resize');
        const dispatcher = new DragEventDispatcher('mouse');

        try {
            // 400px pinned in the 600px grid leave 150px before the 50px margin
            await dispatcher.startDrag(bar, 200, 10);
            await dispatcher.movePointer(bar, 600, 10);
            expect(width(api, 'a')).toBe(350);

            dispatchGridSizeChanged(api, 800);
            await dispatcher.movePointer(bar, 610, 10);
            expect(width(api, 'a')).toBe(550);

            // 500 - 50 leaves 50px over the 400px pinned as the drag started
            dispatchGridSizeChanged(api, 500);
            await dispatcher.movePointer(bar, 600, 10);
            expect(width(api, 'a')).toBe(250);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            expect(width(api, 'a')).toBe(250);
        } finally {
            mockGridLayout.gridWidth = 600;
        }
    });

    test('a pinned column drag leaves no more room than another pinned column took mid-drag', async () => {
        const api = await createGrid(2);
        const bar = query<HTMLElement>('.ag-header-cell[col-id="a"] .ag-header-cell-resize');
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 200, 10);
        await dispatcher.movePointer(bar, 300, 10);
        expect(width(api, 'a')).toBe(300);

        // 300 + 250 reaches the 550px limit, so `a` grows no further
        api.setColumnWidths([{ key: 'b', newWidth: 250 }]);
        await dispatcher.movePointer(bar, 600, 10);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect([width(api, 'a'), width(api, 'b')]).toEqual([300, 250]);
    });

    test('an overflowing pinned column dragged past its min width stops on it and can grow back', async () => {
        const api = await createGrid(5, 'left', { defaultColDef: { pinned: 'left', resizable: true, minWidth: 50 } });
        const bar = query<HTMLElement>('.ag-header-cell[col-id="a"] .ag-header-cell-resize');
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 200, 10);
        await dispatcher.movePointer(bar, 20, 10);
        expect(width(api, 'a')).toBe(50);
        await dispatcher.movePointer(bar, 100, 10);
        expect(width(api, 'a')).toBe(100);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);

        expect(width(api, 'a')).toBe(100);
    });

    // Right-pinned columns resize in the opposite direction: dragging or pressing right makes them narrower.
    test('overflowing right-pinned columns can be shrunk but not grown, by mouse and keyboard', async () => {
        const api = await createGrid(5, 'right');
        expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(true);

        await dragResizeBy('a', -60);
        expect(width(api, 'a')).toBe(200);
        await dragResizeBy('a', 60);
        expect(width(api, 'a')).toBeLessThan(200);

        await pressResizeKey('b', 'ArrowLeft');
        expect(width(api, 'b')).toBe(200);
        await pressResizeKey('b', 'ArrowRight');
        expect(width(api, 'b')).toBeLessThan(200);
    });

    // Shift-resize takes the width from the next column, so the pinned section keeps its total width.
    test('overflowing pinned columns can be grown by shift-resize when the next column is in the same section', async () => {
        const api = await createGrid(5);

        await pressResizeKey('b', 'ArrowRight', true);
        expect(width(api, 'b')).toBeGreaterThan(200);
        expect(width(api, 'c')).toBeLessThan(200);
        expect(width(api, 'b') + width(api, 'c')).toBe(400);
    });

    test('colResizeDefault shift lets overflowing pinned columns grow by mouse within the section', async () => {
        const api = await createGrid(5, 'left', { colResizeDefault: 'shift' });

        await dragResizeBy('a', 60);
        expect(width(api, 'a')).toBeGreaterThan(200);
        expect(width(api, 'a') + width(api, 'b')).toBe(400);
    });

    test('shift-resize still cannot grow the last pinned column, which has no neighbour in its section', async () => {
        const api = await createGrid(5);

        await pressResizeKey('e', 'ArrowRight', true);
        expect(width(api, 'e')).toBe(200);
    });

    test('a shift-resize of the last centre column grows its right-pinned neighbour only up to the limit, by mouse and keyboard', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'a', width: 200, pinned: 'left' },
                { field: 'b', width: 200 },
                { field: 'c', width: 300, pinned: 'right' },
            ],
            defaultColDef: { resizable: true },
            rowData: [{ a: 'a', b: 'b', c: 'c' }],
            colResizeDefault: 'shift',
        });
        await asyncSetTimeout(0);

        // 500px pinned in a 600px grid leaves 50px before the limit: `b` gives `c` no more than that, over every move
        const bar = query<HTMLElement>('.ag-header-cell[col-id="b"] .ag-header-cell-resize');
        const dispatcher = new DragEventDispatcher('mouse');
        await dispatcher.startDrag(bar, 300, 10);
        await dispatcher.movePointer(bar, 270, 10);
        expect([width(api, 'b'), width(api, 'c')]).toEqual([170, 330]);
        await dispatcher.movePointer(bar, 200, 10);
        expect([width(api, 'b'), width(api, 'c')]).toEqual([150, 350]);
        await dispatcher.finishDrag();
        await asyncSetTimeout(0);
        expect([width(api, 'b'), width(api, 'c')]).toEqual([150, 350]);
        await pressResizeKey('b', 'ArrowLeft');
        expect([width(api, 'b'), width(api, 'c')]).toEqual([150, 350]);

        // taking width back from the pinned column is not limited
        await pressResizeKey('b', 'ArrowRight');
        expect(width(api, 'b')).toBeGreaterThan(150);
        expect(width(api, 'b') + width(api, 'c')).toBe(500);
    });

    test('shift-resize grows an overflowing pinned column into the next column in the other pinned section', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: ['a', 'b', 'c', 'd', 'e'].map((field, index) => ({
                field,
                width: 200,
                pinned: index < 2 ? ('left' as const) : ('right' as const),
                resizable: true,
            })),
            rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
            processUnpinnedColumns: () => [],
            colResizeDefault: 'shift',
        });
        await asyncSetTimeout(0);

        await dragResizeBy('b', 60);
        expect(width(api, 'b')).toBe(260);
        expect(width(api, 'c')).toBe(140);

        await pressResizeKey('b', 'ArrowRight');
        expect(width(api, 'b')).toBeGreaterThan(260);
        expect(width(api, 'b') + width(api, 'c')).toBe(400);
    });

    describe('pinned header groups', () => {
        const createGroupedGrid = async (
            groups: string[][],
            gridOptions: GridOptions = {},
            pinned: ColumnPinnedType = 'left'
        ): Promise<GridApi> => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: groups.map((fields, index) => ({
                    headerName: `Group ${index}`,
                    groupId: `g${index}`,
                    children: fields.map((field) => ({ field, width: 200, pinned, resizable: true })),
                })),
                rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
                processUnpinnedColumns: () => [],
                ...gridOptions,
            });
            await asyncSetTimeout(0);
            expect(api.getColumnState().every((column) => column.pinned === pinned)).toBe(true);
            return api;
        };

        const groupBar = (groupId: string): HTMLElement =>
            query<HTMLElement>(`.ag-header-group-cell[col-id^="${groupId}_"] .ag-header-cell-resize`);

        const totalWidth = (api: GridApi, colIds: string[]): number =>
            colIds.reduce((total, colId) => total + width(api, colId), 0);

        const dragGroupBy = async (groupId: string, dx: number, shiftKey = false): Promise<void> => {
            const forceShiftKey = (event: Event) => Object.defineProperty(event, 'shiftKey', { value: true });
            if (shiftKey) {
                document.addEventListener('mousedown', forceShiftKey, true);
                document.addEventListener('mousemove', forceShiftKey, true);
            }
            try {
                const dispatcher = new DragEventDispatcher('mouse');
                await dispatcher.startDrag(groupBar(groupId), 400, 10);
                await dispatcher.movePointer(groupBar(groupId), 400 + dx, 10);
                await dispatcher.finishDrag();
                await asyncSetTimeout(0);
            } finally {
                document.removeEventListener('mousedown', forceShiftKey, true);
                document.removeEventListener('mousemove', forceShiftKey, true);
            }
        };

        test('dragging a pinned group stops growing at the viewport limit and can still shrink', async () => {
            const api = await createGroupedGrid([['a', 'b']]);

            await dragGroupBy('g0', 300);
            expect(totalWidth(api, ['a', 'b'])).toBe(550);

            await dragGroupBy('g0', -100);
            expect(totalWidth(api, ['a', 'b'])).toBe(450);
        });

        // Right-pinned groups resize in the opposite direction: dragging left makes them wider.
        test('dragging a right-pinned group stops growing at the viewport limit and can still shrink', async () => {
            const api = await createGroupedGrid([['a', 'b']], {}, 'right');

            await dragGroupBy('g0', -300);
            expect(totalWidth(api, ['a', 'b'])).toBe(550);

            await dragGroupBy('g0', 100);
            expect(totalWidth(api, ['a', 'b'])).toBe(450);
        });

        test('a pinned group drag keeps to the limit of a viewport resized mid-drag, wider or narrower', async () => {
            const api = await createGroupedGrid([['a', 'b']]);
            const dispatcher = new DragEventDispatcher('mouse');

            try {
                await dispatcher.startDrag(groupBar('g0'), 400, 10);
                await dispatcher.movePointer(groupBar('g0'), 800, 10);
                expect(totalWidth(api, ['a', 'b'])).toBe(550);

                dispatchGridSizeChanged(api, 800);
                await dispatcher.movePointer(groupBar('g0'), 810, 10);
                expect(totalWidth(api, ['a', 'b'])).toBe(750);

                dispatchGridSizeChanged(api, 500);
                await dispatcher.movePointer(groupBar('g0'), 800, 10);
                expect(totalWidth(api, ['a', 'b'])).toBe(450);
                await dispatcher.finishDrag();
                await asyncSetTimeout(0);
            } finally {
                mockGridLayout.gridWidth = 600;
            }
        });

        test('an overflowing pinned group shrunk during a drag can grow back to its starting width', async () => {
            const api = await createGroupedGrid([
                ['a', 'b'],
                ['c', 'd', 'e'],
            ]);
            expect(query<HTMLElement>('.ag-grid-viewport').classList.contains('ag-pinned-columns-overflow')).toBe(true);
            const dispatcher = new DragEventDispatcher('mouse');

            await dispatcher.startDrag(groupBar('g0'), 400, 10);
            await dispatcher.movePointer(groupBar('g0'), 300, 10);
            expect(totalWidth(api, ['a', 'b'])).toBe(300);
            await dispatcher.movePointer(groupBar('g0'), 500, 10);
            expect(totalWidth(api, ['a', 'b'])).toBe(400);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);

            expect(totalWidth(api, ['a', 'b'])).toBe(400);
            expect(
                query<HTMLElement>('.ag-header-group-cell[col-id^="g0_"]').classList.contains('ag-column-resizing')
            ).toBe(false);
        });

        test('shift-dragging an overflowing pinned group grows it by taking width from the next pinned group', async () => {
            const api = await createGroupedGrid([
                ['a', 'b'],
                ['c', 'd', 'e'],
            ]);

            await dragGroupBy('g0', 60, true);

            expect(totalWidth(api, ['a', 'b'])).toBe(460);
            expect(totalWidth(api, ['c', 'd', 'e'])).toBe(540);
        });

        test('shift-dragging an overflowing left-pinned group takes width from the right-pinned group after it', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    ['a', 'b'],
                    ['c', 'd', 'e'],
                ].map((fields, index) => ({
                    headerName: `Group ${index}`,
                    groupId: `g${index}`,
                    children: fields.map((field) => ({
                        field,
                        width: 200,
                        pinned: index === 0 ? ('left' as const) : ('right' as const),
                        resizable: true,
                    })),
                })),
                rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
                processUnpinnedColumns: () => [],
            });
            await asyncSetTimeout(0);

            await dragGroupBy('g0', 60, true);

            expect(totalWidth(api, ['a', 'b'])).toBe(460);
            expect(totalWidth(api, ['c', 'd', 'e'])).toBe(540);
        });

        test('a shift-drag of a centre group grows the right-pinned group after it only up to the limit', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'a', width: 200, pinned: 'left' },
                    { headerName: 'Centre', groupId: 'g0', children: [{ field: 'b', width: 200 }] },
                    { headerName: 'Right', groupId: 'g1', children: [{ field: 'c', width: 300, pinned: 'right' }] },
                ],
                defaultColDef: { resizable: true },
                rowData: [{ a: 'a', b: 'b', c: 'c' }],
                colResizeDefault: 'shift',
            });
            await asyncSetTimeout(0);

            await dragGroupBy('g0', -100);

            expect([width(api, 'b'), width(api, 'c')]).toEqual([150, 350]);
        });

        test('Alt+Shift+Arrow grows an overflowing pinned group by taking width from the next pinned group', async () => {
            const api = await createGroupedGrid([
                ['a', 'b'],
                ['c', 'd', 'e'],
            ]);
            const headerCell = query<HTMLElement>('.ag-header-group-cell[col-id^="g0_"]');
            headerCell.focus();
            const init = { key: 'ArrowRight', altKey: true, shiftKey: true, bubbles: true, cancelable: true };
            headerCell.dispatchEvent(new KeyboardEvent('keydown', init));
            headerCell.dispatchEvent(new KeyboardEvent('keyup', init));
            await asyncSetTimeout(0);

            expect(totalWidth(api, ['a', 'b'])).toBeGreaterThan(400);
            expect(totalWidth(api, ['a', 'b', 'c', 'd', 'e'])).toBe(1000);
        });

        test('double-clicking a pinned group handle autosizes it only up to the viewport limit', async () => {
            const api = await createGroupedGrid([['a', 'b']]);

            mockAutosizeContentWidth(480);
            groupBar('g0').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);
            expect(totalWidth(api, ['a', 'b'])).toBe(550);

            // narrow columns under a wide group header: the group fit is limited too
            mockAutosizeContentWidth(900, { a: 80, b: 80 });
            groupBar('g0').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);
            expect(totalWidth(api, ['a', 'b'])).toBe(550);
        });

        test('double-clicking a pinned group handle shrinks its columns before limiting the growing ones', async () => {
            const api = await createGroupedGrid([['a', 'b']]);

            mockAutosizeContentWidth(0, { a: 380, b: 80 });
            groupBar('g0').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);

            expect(width(api, 'a')).toBe(400);
            expect(width(api, 'b')).toBe(100);
        });

        test('double-clicking an overflowing pinned group handle does not grow it', async () => {
            const api = await createGroupedGrid([
                ['a', 'b'],
                ['c', 'd', 'e'],
            ]);

            mockAutosizeContentWidth(480);
            groupBar('g0').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);

            expect(totalWidth(api, ['a', 'b'])).toBe(400);
        });
    });

    describe('autosize', () => {
        const dblClickResizeBar = async (colId: string): Promise<void> => {
            const bar = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-resize`);
            bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);
        };

        test('double-clicking a pinned column grows it only up to the viewport limit', async () => {
            const api = await createGrid(2);

            mockAutosizeContentWidth(480);
            await dblClickResizeBar('a');

            expect(width(api, 'a')).toBe(350);
        });

        test('double-clicking an overflowing pinned column can shrink it but not grow it', async () => {
            const api = await createGrid(5);

            mockAutosizeContentWidth(480);
            await dblClickResizeBar('a');
            expect(width(api, 'a')).toBe(200);

            mockAutosizeContentWidth(80);
            await dblClickResizeBar('a');
            expect(width(api, 'a')).toBe(100);
        });

        test('double-clicking an unpinned column is not limited', async () => {
            const api = await createGrid(2, null);

            mockAutosizeContentWidth(480);
            await dblClickResizeBar('a');

            expect(width(api, 'a')).toBe(500);
        });

        test('autoSizeColumns from the API is not limited', async () => {
            const api = await createGrid(2);

            mockAutosizeContentWidth(480);
            api.autoSizeColumns(['a']);
            await asyncSetTimeout(0);

            expect(width(api, 'a')).toBe(500);
        });

        test('a menu auto-size of overflowing pinned columns grows them only by what the shrinking ones free past the limit', async () => {
            const menuGridsManager = new TestGridsManager({
                modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ColumnMenuModule],
            });
            const restoreOffsetParent = polyfillOffsetParent();
            try {
                const api = menuGridsManager.createGrid('myGrid', {
                    columnDefs: [
                        { field: 'a', width: 500 },
                        { field: 'b', width: 500 },
                    ],
                    defaultColDef: { pinned: 'left', resizable: true },
                    rowData: [{ a: 'a', b: 'b' }],
                    processUnpinnedColumns: () => [],
                });
                await asyncSetTimeout(0);

                // 1000px pinned is 50px past the 950px limit, so of the 100px `a` frees `b` gets 50
                mockAutosizeContentWidth(780, { a: 380 });
                api.showColumnMenu('a');
                await userEvent.click(await openMenuOption('Autosize All Columns'));
                await asyncSetTimeout(0);

                expect([width(api, 'a'), width(api, 'b')]).toEqual([400, 550]);
            } finally {
                restoreOffsetParent();
                menuGridsManager.reset();
            }
        });

        test('a menu auto-size credits only the width a shrinking pinned column gives up within its own minWidth', async () => {
            const menuGridsManager = new TestGridsManager({
                modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ColumnMenuModule],
            });
            const restoreOffsetParent = polyfillOffsetParent();
            try {
                mockAutosizeContentWidth(530);
                const api = menuGridsManager.createGrid('myGrid', {
                    columnDefs: [{ field: 'a', minWidth: 450 }, { field: 'b' }],
                    defaultColDef: { pinned: 'left', resizable: true },
                    rowData: [{ a: 'a', b: 'b' }],
                    processUnpinnedColumns: () => [],
                    autoSizeStrategy: { type: 'fitCellContents', applyToUiActions: true, defaultMinWidth: 100 },
                });
                await waitFor(() => expect([width(api, 'a'), width(api, 'b')]).toEqual([550, 550]));

                // `a` asks for 100 but stops at its minWidth, freeing 100 of the 150px overflow: nothing left for `b`
                mockAutosizeContentWidth(780, { a: 80 });
                api.showColumnMenu('a');
                await userEvent.click(await openMenuOption('Autosize All Columns'));
                await asyncSetTimeout(0);

                expect([width(api, 'a'), width(api, 'b')]).toEqual([450, 550]);
            } finally {
                restoreOffsetParent();
                menuGridsManager.reset();
            }
        });

        test('a menu auto-size leaves the room a growing pinned column cannot take past its own maxWidth to the next', async () => {
            const menuGridsManager = new TestGridsManager({
                modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ColumnMenuModule],
            });
            const restoreOffsetParent = polyfillOffsetParent();
            try {
                mockAutosizeContentWidth(280);
                const api = menuGridsManager.createGrid('myGrid', {
                    columnDefs: [{ field: 'a', maxWidth: 450 }, { field: 'b' }],
                    defaultColDef: { pinned: 'left', resizable: true },
                    rowData: [{ a: 'a', b: 'b' }],
                    autoSizeStrategy: { type: 'fitCellContents', applyToUiActions: true, defaultMaxWidth: 1000 },
                });
                await waitFor(() => expect([width(api, 'a'), width(api, 'b')]).toEqual([300, 300]));

                // of the 350px room `a` takes 150, stopping at its maxWidth, so `b` gets the other 200
                mockAutosizeContentWidth(780);
                api.showColumnMenu('a');
                await userEvent.click(await openMenuOption('Autosize All Columns'));
                await asyncSetTimeout(0);

                expect([width(api, 'a'), width(api, 'b')]).toEqual([450, 500]);
            } finally {
                restoreOffsetParent();
                menuGridsManager.reset();
            }
        });

        test('every menu auto-size action shrinks pinned columns but grows them only into the room left', async () => {
            const menuGridsManager = new TestGridsManager({
                modules: [
                    ClientSideRowModelModule,
                    ColumnApiModule,
                    ColumnAutoSizeModule,
                    ColumnMenuModule,
                    ColumnsToolPanelModule,
                    ContextMenuModule,
                    SideBarModule,
                ],
            });
            const restoreOffsetParent = polyfillOffsetParent();
            try {
                const api = menuGridsManager.createGrid('myGrid', {
                    columnDefs: ['a', 'b', 'c', 'd', 'e'].map((field) => ({ field, width: 200 })),
                    defaultColDef: { pinned: 'left', resizable: true },
                    rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
                    processUnpinnedColumns: () => [],
                    getContextMenuItems: () => ['autoSizeAll'],
                    getColumnMenuItems: (params) =>
                        params.source === 'columnsToolPanel' ? ['autoSizeThis'] : params.defaultItems,
                    sideBar: 'columns',
                });
                await asyncSetTimeout(0);
                const runs: number[][] = [];
                const run = async (click: Promise<HTMLElement>): Promise<void> => {
                    await userEvent.click(await click);
                    await asyncSetTimeout(0);
                    runs.push(['a', 'b', 'c', 'd', 'e'].map((colId) => width(api, colId)));
                };

                // 5 x 200px against the 950px limit: what each action measures narrower shrinks first, freeing room
                mockAutosizeContentWidth(80);
                api.showColumnMenu('a');
                await run(openMenuOption('Autosize This Column'));
                mockAutosizeContentWidth(480);
                api.showColumnMenu('a');
                await run(openMenuOption('Autosize This Column'));
                mockAutosizeContentWidth(480, { b: 80 });
                api.showColumnMenu('a');
                await run(openMenuOption('Autosize All Columns'));
                mockAutosizeContentWidth(980, { a: 80, b: 80, c: 80, d: 80 });
                api.showContextMenu({
                    rowNode: api.getDisplayedRowAtIndex(0),
                    column: api.getColumn('a'),
                    value: 'a',
                    source: 'ui',
                });
                await run(openMenuOption('Autosize All Columns'));
                const toolPanel = api.getToolPanelInstance('columns');
                const gridDiv = TestGridsManager.getHTMLElement(api)!;
                mockAutosizeContentWidth(80);
                await openToolPanelContextMenu(toolPanel, gridDiv, 'E');
                await run(openMenuOption('Autosize This Column'));
                mockAutosizeContentWidth(980);
                await openToolPanelContextMenu(toolPanel, gridDiv, 'E');
                await run(openMenuOption('Autosize This Column'));

                expect(runs).toEqual([
                    [100, 200, 200, 200, 200],
                    [150, 200, 200, 200, 200],
                    [250, 100, 200, 200, 200],
                    [100, 100, 100, 100, 550],
                    [100, 100, 100, 100, 100],
                    [100, 100, 100, 100, 550],
                ]);
            } finally {
                restoreOffsetParent();
                menuGridsManager.reset();
            }
        });
    });
});
