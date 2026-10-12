import userEvent from '@testing-library/user-event';
import {
    DragEventDispatcher,
    TestGridsManager,
    asyncSetTimeout,
    dispatchGridSizeChanged,
    openMenuOption,
    polyfillOffsetParent,
} from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';

import type { ColumnPinnedType, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ScrollApiModule } from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

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

    test('an overflowing pinned column can shrink after a drag past its min width is reversed', async () => {
        const api = await createGrid(5, 'left', { defaultColDef: { pinned: 'left', resizable: true, minWidth: 50 } });
        const bar = query<HTMLElement>('.ag-header-cell[col-id="a"] .ag-header-cell-resize');
        const dispatcher = new DragEventDispatcher('mouse');

        await dispatcher.startDrag(bar, 200, 10);
        await dispatcher.movePointer(bar, 20, 10);
        expect(width(api, 'a')).toBe(200);
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

        test('dragging a pinned group stops growing at the viewport limit and can still shrink', async () => {
            const api = await createGroupedGrid([['a', 'b']]);
            const dispatcher = new DragEventDispatcher('mouse');

            await dispatcher.startDrag(groupBar('g0'), 400, 10);
            await dispatcher.movePointer(groupBar('g0'), 700, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            expect(totalWidth(api, ['a', 'b'])).toBe(550);

            await dispatcher.startDrag(groupBar('g0'), 550, 10);
            await dispatcher.movePointer(groupBar('g0'), 450, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            expect(totalWidth(api, ['a', 'b'])).toBe(450);
        });

        // Right-pinned groups resize in the opposite direction: dragging left makes them wider.
        test('dragging a right-pinned group stops growing at the viewport limit and can still shrink', async () => {
            const api = await createGroupedGrid([['a', 'b']], {}, 'right');
            const dispatcher = new DragEventDispatcher('mouse');

            await dispatcher.startDrag(groupBar('g0'), 400, 10);
            await dispatcher.movePointer(groupBar('g0'), 100, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            expect(totalWidth(api, ['a', 'b'])).toBe(550);

            await dispatcher.startDrag(groupBar('g0'), 100, 10);
            await dispatcher.movePointer(groupBar('g0'), 200, 10);
            await dispatcher.finishDrag();
            await asyncSetTimeout(0);
            expect(totalWidth(api, ['a', 'b'])).toBe(450);
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
            const forceShiftKey = (event: Event) => Object.defineProperty(event, 'shiftKey', { value: true });
            document.addEventListener('mousedown', forceShiftKey, true);
            document.addEventListener('mousemove', forceShiftKey, true);
            try {
                const dispatcher = new DragEventDispatcher('mouse');
                await dispatcher.startDrag(groupBar('g0'), 400, 10);
                await dispatcher.movePointer(groupBar('g0'), 460, 10);
                await dispatcher.finishDrag();
                await asyncSetTimeout(0);
            } finally {
                document.removeEventListener('mousedown', forceShiftKey, true);
                document.removeEventListener('mousemove', forceShiftKey, true);
            }

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
            const forceShiftKey = (event: Event) => Object.defineProperty(event, 'shiftKey', { value: true });
            document.addEventListener('mousedown', forceShiftKey, true);
            document.addEventListener('mousemove', forceShiftKey, true);
            try {
                const dispatcher = new DragEventDispatcher('mouse');
                await dispatcher.startDrag(groupBar('g0'), 400, 10);
                await dispatcher.movePointer(groupBar('g0'), 460, 10);
                await dispatcher.finishDrag();
                await asyncSetTimeout(0);
            } finally {
                document.removeEventListener('mousedown', forceShiftKey, true);
                document.removeEventListener('mousemove', forceShiftKey, true);
            }

            expect(totalWidth(api, ['a', 'b'])).toBe(460);
            expect(totalWidth(api, ['c', 'd', 'e'])).toBe(540);
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

    describe('double-click autosize', () => {
        const dblClickResizeBar = async (colId: string): Promise<void> => {
            const bar = query<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-resize`);
            bar.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            await asyncSetTimeout(0);
        };

        test('a pinned column grows only up to the viewport limit', async () => {
            const api = await createGrid(2);

            mockAutosizeContentWidth(480);
            await dblClickResizeBar('a');

            expect(width(api, 'a')).toBe(350);
        });

        test('an overflowing pinned column can be shrunk but not grown', async () => {
            const api = await createGrid(5);

            mockAutosizeContentWidth(480);
            await dblClickResizeBar('a');
            expect(width(api, 'a')).toBe(200);

            mockAutosizeContentWidth(80);
            await dblClickResizeBar('a');
            expect(width(api, 'a')).toBe(100);
        });

        test('an unpinned column is not limited', async () => {
            const api = await createGrid(2, null);

            mockAutosizeContentWidth(480);
            await dblClickResizeBar('a');

            expect(width(api, 'a')).toBe(500);
        });

        test('the column menu Autosize This Column does not grow an overflowing pinned column', async () => {
            const menuGridsManager = new TestGridsManager({
                modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, ColumnMenuModule],
            });
            const restoreOffsetParent = polyfillOffsetParent();
            try {
                const api = menuGridsManager.createGrid('myGrid', {
                    columnDefs: ['a', 'b', 'c', 'd', 'e'].map((field) => ({ field, width: 200 })),
                    defaultColDef: { pinned: 'left', resizable: true },
                    rowData: [{ a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' }],
                    processUnpinnedColumns: () => [],
                });
                await asyncSetTimeout(0);

                mockAutosizeContentWidth(480);
                api.showColumnMenu('a');
                await userEvent.click(await openMenuOption('Autosize This Column'));
                await asyncSetTimeout(0);

                expect(width(api, 'a')).toBe(200);
            } finally {
                restoreOffsetParent();
                menuGridsManager.reset();
            }
        });
    });
});
