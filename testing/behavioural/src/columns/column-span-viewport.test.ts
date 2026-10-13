import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    RenderApiModule,
    ScrollApiModule,
    getGridElement,
} from 'ag-grid-community';

interface SeedRow {
    id: string;
    seed: number;
}

const COL_COUNT = 60;

const colWidth = (i: number) => 80 + ((i * 37) % 5) * 20;

/** Every fourth column has no colSpan; the others span 1 to 4 columns, differently per row. */
const colSpanOf = (i: number, seed: number): number | null => (i % 4 === 3 ? null : ((seed + i * 7) % 4) + 1);

const buildColumnDefs = (): ColDef<SeedRow>[] => {
    const columnDefs: ColDef<SeedRow>[] = [];
    for (let i = 0; i < COL_COUNT; ++i) {
        const colDef: ColDef<SeedRow> = { colId: `c${i}`, valueGetter: () => i, width: colWidth(i) };
        if (colSpanOf(i, 0) !== null) {
            colDef.colSpan = (params) => colSpanOf(i, params.data!.seed)!;
        }
        if (i < 2) {
            colDef.pinned = 'left';
        } else if (i === COL_COUNT - 1) {
            colDef.pinned = 'right';
        }
        columnDefs.push(colDef);
    }
    return columnDefs;
};

const rowData: SeedRow[] = [0, 1, 2, 3, 5, 6].map((seed) => ({ id: `r${seed}`, seed }));

/** The centre cells of a row, as `colId:width`, in column order. */
const drawnCenter = (api: GridApi, rowIndex: number): string[] => {
    const row = getGridElement(api)!.querySelector(`.ag-row[row-index="${rowIndex}"]`);
    const byIndex = (cell: HTMLElement) => Number(cell.getAttribute('col-id')!.slice(1));
    const cells = Array.from(row?.querySelectorAll<HTMLElement>('.ag-cell') ?? []).filter((cell) => {
        const index = byIndex(cell);
        return index >= 2 && index < COL_COUNT - 1;
    });
    return cells
        .sort((a, b) => byIndex(a) - byIndex(b))
        .map((cell) => `${cell.getAttribute('col-id')}:${cell.style.width}`);
};

/** The centre cells a row draws: every cell with a displayed column within 200px of the viewport. */
const expectedCenter = (api: GridApi, seed: number): string[] => {
    const { left, right } = api.getHorizontalPixelRange();
    const centre = api.getDisplayedCenterColumns();
    const res: string[] = [];
    for (let k = 0, len = centre.length; k < len;) {
        const i = Number(centre[k].getColId().slice(1));
        const span = Math.min(colSpanOf(i, seed) ?? 1, len - k);
        let width = 0;
        let visible = false;
        for (let j = k; j < k + span; ++j) {
            const column = centre[j];
            const colLeft = column.getLeft()!;
            width += column.getActualWidth();
            visible ||= colLeft + column.getActualWidth() >= left - 200 && colLeft <= right + 200;
        }
        if (visible) {
            res.push(`c${i}:${width}px`);
        }
        k += span;
    }
    return res;
};

describe('colSpan with column virtualisation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, RenderApiModule, ScrollApiModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const expectRowsMatchViewport = async (api: GridApi) => {
        for (let i = 0; i < rowData.length; ++i) {
            await waitFor(() => expect(drawnCenter(api, i)).toEqual(expectedCenter(api, rowData[i].seed)));
        }
    };

    test('each row draws exactly the cells covering a column in view, at every scroll position', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        await expectRowsMatchViewport(api);
        expect(api.getHorizontalPixelRange().right).toBeLessThan(api.getColumn('c40')!.getLeft()!);

        for (const colId of ['c15', 'c31', 'c46', 'c58', 'c22', 'c2']) {
            api.ensureColumnVisible(colId);
            const column = api.getColumn(colId)!;
            await waitFor(() => {
                const { left, right } = api.getHorizontalPixelRange();
                expect(column.getLeft()! + column.getActualWidth()).toBeGreaterThan(left);
                expect(column.getLeft()!).toBeLessThan(right);
            });
            await expectRowsMatchViewport(api);
        }
    });

    test('a row laid out after the columns are fitted, before any scroll, draws the cells now in view', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        await expectRowsMatchViewport(api);
        const before = drawnCenter(api, 0);

        api.sizeColumnsToFit();
        // refreshing the spans lays every row out again
        api.refreshCells();
        await expectRowsMatchViewport(api);
        expect(drawnCenter(api, 0).length).toBeGreaterThan(before.length);
    });

    test('a row laid out by a column event inside the column refresh draws the new columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        await expectRowsMatchViewport(api);
        const errors: unknown[] = [];
        let focusedInRefresh = false;
        // focusing a column scrolled out lays its row out at once, while the refresh restamps the columns
        api.getColumn('c30')!.addEventListener('leftChanged', () => {
            if (focusedInRefresh) {
                return;
            }
            focusedInRefresh = true;
            try {
                api.setFocusedCell(0, 'c50');
            } catch (e) {
                errors.push(e);
            }
        });

        api.setColumnsVisible(['c3'], false);

        expect(focusedInRefresh).toBe(true);
        expect(errors).toEqual([]);
        api.clearFocusedCell();
        await expectRowsMatchViewport(api);
    });

    test('a row laid out by a column event inside a group collapse draws the columns left in view', async () => {
        const columnDefs: (ColDef<SeedRow> | ColGroupDef<SeedRow>)[] = buildColumnDefs();
        // c3 and c4 show only while their group is open, and a collapse refreshes without clearing the viewport
        const grouped = columnDefs.splice(2, 4, {
            groupId: 'g',
            openByDefault: true,
            children: columnDefs.slice(2, 6),
        });
        grouped[1].columnGroupShow = 'open';
        grouped[2].columnGroupShow = 'open';
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        await expectRowsMatchViewport(api);
        expect(drawnCenter(api, 0)[0]).toMatch(/^c2:/);
        const errors: unknown[] = [];
        let drawnInRefresh: string[] | null = null;
        api.getColumn('c30')!.addEventListener('leftChanged', () => {
            if (drawnInRefresh !== null) {
                return;
            }
            try {
                api.setFocusedCell(0, 'c50');
                drawnInRefresh = drawnCenter(api, 0);
            } catch (e) {
                errors.push(e);
            }
        });

        api.setColumnGroupOpened('g', false);

        expect(errors).toEqual([]);
        expect(drawnInRefresh!.some((cell) => /^c[34]:/.test(cell))).toBe(false);
        api.clearFocusedCell();
        await expectRowsMatchViewport(api);
    });

    test('in RTL, each row draws exactly the cells covering a column in view', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
            enableRtl: true,
        });
        await expectRowsMatchViewport(api);
        expect(drawnCenter(api, 0).length).toBeLessThan(api.getDisplayedCenterColumns().length);
    });

    test('a focused cell scrolled out of view keeps the colSpan its data gives it', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData,
            getRowId: (params) => params.data.id,
            suppressColumnVirtualisation: false,
        });
        const width = (colId: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`[row-index="2"] [col-id="${colId}"]`)?.style.width;
        const spanWidth = (start: number, seed: number) => {
            let total = 0;
            for (let j = start, end = start + colSpanOf(start, seed)!; j < end; ++j) {
                total += colWidth(j);
            }
            return `${total}px`;
        };
        // row r2, seed 2: c40 starts a cell of 3 columns, and of 4 at seed 3
        expect([colSpanOf(40, 2), colSpanOf(40, 3)]).toEqual([3, 4]);
        api.ensureColumnVisible('c40');
        await waitFor(() => expect(width('c40')).toBe(spanWidth(40, 2)));
        api.setFocusedCell(2, 'c40');
        api.ensureColumnVisible('c2');
        await waitFor(() => expect(width('c2')).toBeDefined());
        expect(width('c40')).toBe(spanWidth(40, 2));

        api.getRowNode('r2')!.setData({ id: 'r2', seed: 3 });
        await waitFor(() => expect(width('c40')).toBe(spanWidth(40, 3)));
    });
});
