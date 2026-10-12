import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, ColumnApiModule, getGridElement } from 'ag-grid-community';

/** Each cell of the first row as `colId left|right width`, plus its pinned edge class, in column order. */
const cellGeometry = (api: GridApi, colIds: string[]): string[] =>
    colIds.map((colId) => {
        const cell = getGridElement(api)!.querySelector<HTMLElement>(
            `.ag-row[row-index="0"] .ag-cell[col-id="${colId}"]`
        );
        if (!cell) {
            return `${colId} -`;
        }
        const { left, right, width } = cell.style;
        let edge = '';
        if (cell.classList.contains('ag-cell-last-left-pinned')) {
            edge = ' last-left';
        } else if (cell.classList.contains('ag-cell-first-right-pinned')) {
            edge = ' first-right';
        }
        return `${colId} ${left ? `left:${left}` : `right:${right}`} ${width}${edge}`;
    });

describe('cell geometry', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, CellSpanModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = async (options: GridOptions) => {
        const api = gridsManager.createGrid('myGrid', { rowData: [{}], ...options });
        await asyncSetTimeout(0);
        return api;
    };

    test('cells follow resizes, including one that moves width between two columns', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
                { colId: 'c', width: 100 },
            ],
        });
        const cols = ['a', 'b', 'c'];
        expect(cellGeometry(api, cols)).toEqual(['a left:0px 100px', 'b left:100px 100px', 'c left:200px 100px']);

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        expect(cellGeometry(api, cols)).toEqual(['a left:0px 150px', 'b left:150px 100px', 'c left:250px 100px']);

        // the total stays the same, so no grid-level width event goes out
        api.setColumnWidths([
            { key: 'a', newWidth: 100 },
            { key: 'b', newWidth: 150 },
        ]);
        expect(cellGeometry(api, cols)).toEqual(['a left:0px 100px', 'b left:100px 150px', 'c left:250px 100px']);
    });

    test('cells and their aria-colindex follow hiding, showing and moving columns', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 50 },
                { colId: 'c', width: 100 },
            ],
        });
        const cols = ['a', 'b', 'c'];
        const ariaColIndexes = () =>
            cols.map((colId) => {
                const cell = getGridElement(api)!.querySelector(`.ag-row[row-index="0"] .ag-cell[col-id="${colId}"]`);
                return `${colId} ${cell?.getAttribute('aria-colindex') ?? '-'}`;
            });
        expect(ariaColIndexes()).toEqual(['a 1', 'b 2', 'c 3']);

        api.setColumnsVisible(['a'], false);
        expect(cellGeometry(api, cols)).toEqual(['a -', 'b left:0px 50px', 'c left:50px 100px']);
        // hidden columns keep their place in the count
        expect(ariaColIndexes()).toEqual(['a -', 'b 2', 'c 3']);

        api.setColumnsVisible(['a'], true);
        api.moveColumns(['c'], 0);
        expect(cellGeometry(api, cols)).toEqual(['a left:100px 100px', 'b left:200px 50px', 'c left:0px 100px']);
        expect(ariaColIndexes()).toEqual(['a 2', 'b 3', 'c 1']);
    });

    test('a flex cell is resized when hiding or showing its neighbour leaves every left and section total unchanged', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'x', width: 100 },
                { colId: 'f', flex: 1 },
                { colId: 'a', width: 100 },
            ],
        });
        const flexCell = () => `${cellGeometry(api, ['f'])[0]} model:${api.getColumn('f')!.getActualWidth()}px`;
        expect(flexCell()).toBe('f left:100px 800px model:800px');

        api.setColumnsVisible(['a'], false);
        expect(flexCell()).toBe('f left:100px 900px model:900px');

        api.setColumnsVisible(['a'], true);
        expect(flexCell()).toBe('f left:100px 800px model:800px');
    });

    test('a cell follows a resize that a column hidden in the same change exactly offsets', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'b', width: 100 },
                { colId: 'a', width: 100 },
                { colId: 'c', width: 100 },
            ],
        });
        api.applyColumnState({
            state: [
                { colId: 'b', width: 200 },
                { colId: 'a', hide: true },
            ],
        });
        expect(cellGeometry(api, ['b', 'a', 'c'])).toEqual(['b left:0px 200px', 'a -', 'c left:200px 100px']);
    });

    test('right-pinned cells stay anchored to the right edge as the pinned section resizes', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'r1', width: 100, pinned: 'right' },
                { colId: 'r2', width: 50, pinned: 'right' },
            ],
        });
        const cols = ['r1', 'r2'];
        expect(cellGeometry(api, cols)).toEqual(['r1 right:50px 100px first-right', 'r2 right:0px 50px']);

        api.setColumnWidths([{ key: 'r2', newWidth: 100 }]);
        expect(cellGeometry(api, cols)).toEqual(['r1 right:100px 100px first-right', 'r2 right:0px 100px']);
    });

    test('the pinned edge classes follow pinning', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'l', width: 100, pinned: 'left' },
                { colId: 'c', width: 100 },
                { colId: 'r1', width: 100, pinned: 'right' },
                { colId: 'r2', width: 100, pinned: 'right' },
            ],
        });
        const cols = ['l', 'c', 'r1', 'r2'];
        expect(cellGeometry(api, cols)).toEqual([
            'l left:0px 100px last-left',
            'c left:0px 100px',
            'r1 right:100px 100px first-right',
            'r2 right:0px 100px',
        ]);

        api.setColumnsPinned(['c'], 'left');
        api.setColumnsPinned(['r1'], null);
        expect(cellGeometry(api, cols)).toEqual([
            'l left:0px 100px',
            'c left:100px 100px last-left',
            'r1 left:0px 100px',
            'r2 right:0px 100px first-right',
        ]);
    });

    test('in print layout, centre cells move with the pinned columns before them', async () => {
        const api = await createGrid({
            domLayout: 'print',
            columnDefs: [
                { colId: 'l', width: 100, pinned: 'left' },
                { colId: 'c', width: 100 },
            ],
        });
        const cols = ['l', 'c'];
        expect(cellGeometry(api, cols)).toEqual(['l left:0px 100px last-left', 'c left:100px 100px']);

        api.setColumnWidths([{ key: 'l', newWidth: 150 }]);
        expect(cellGeometry(api, cols)).toEqual(['l left:0px 150px last-left', 'c left:150px 100px']);
    });

    test('in print layout, the pinned edge classes follow pinning', async () => {
        const api = await createGrid({
            domLayout: 'print',
            columnDefs: [
                { colId: 'l', width: 100, pinned: 'left' },
                { colId: 'c', width: 100 },
                { colId: 'r', width: 100, pinned: 'right' },
            ],
        });
        const cols = ['l', 'c', 'r'];
        expect(cellGeometry(api, cols)).toEqual([
            'l left:0px 100px last-left',
            'c left:100px 100px',
            'r left:200px 100px first-right',
        ]);

        api.applyColumnState({
            state: [
                { colId: 'l', pinned: null },
                { colId: 'r', pinned: null },
            ],
        });
        expect(cellGeometry(api, cols)).toEqual(['l left:0px 100px', 'c left:100px 100px', 'r left:200px 100px']);
    });

    test('in RTL, cells are placed from the right and follow resizes', async () => {
        const api = await createGrid({
            enableRtl: true,
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100 },
                { colId: 'c', width: 100 },
            ],
        });
        const cols = ['a', 'b', 'c'];
        expect(cellGeometry(api, cols)).toEqual(['a right:0px 100px', 'b right:100px 100px', 'c right:200px 100px']);

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        expect(cellGeometry(api, cols)).toEqual(['a right:0px 150px', 'b right:150px 100px', 'c right:250px 100px']);
    });

    test('a spanning cell follows a resize of a column it covers', async () => {
        const api = await createGrid({
            columnDefs: [
                { colId: 'a', width: 100, colSpan: () => 2 },
                { colId: 'b', width: 100 },
                { colId: 'c', width: 100 },
            ],
        });
        const cols = ['a', 'b', 'c'];
        expect(cellGeometry(api, cols)).toEqual(['a left:0px 200px', 'b -', 'c left:200px 100px']);

        api.setColumnWidths([{ key: 'b', newWidth: 150 }]);
        expect(cellGeometry(api, cols)).toEqual(['a left:0px 250px', 'b -', 'c left:250px 100px']);
    });

    test('a row-spanned cell is placed by its wrapper and follows a resize before it', async () => {
        const api = await createGrid({
            enableCellSpan: true,
            columnDefs: [
                { colId: 'a', width: 100 },
                { colId: 'b', width: 100, spanRows: true, valueGetter: () => 'same' },
            ],
            rowData: [{}, {}],
        });
        const spanned = () => {
            const cell = getGridElement(api)!.querySelector<HTMLElement>('.ag-spanned-cell[col-id="b"]')!;
            const wrapper = cell.parentElement!;
            return `${wrapper.style.left} ${cell.style.left || '-'} ${cell.style.width}`;
        };
        expect(spanned()).toBe('100px - 100px');

        api.setColumnWidths([{ key: 'a', newWidth: 150 }]);
        expect(spanned()).toBe('150px - 100px');
    });
});
