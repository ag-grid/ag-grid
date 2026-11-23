import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, nextAnimationFrame } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    RowAutoHeightModule,
    ScrollApiModule,
    getGridElement,
} from 'ag-grid-community';

/** c5 and c50 measure their cells, so are drawn wherever the viewport is, with c5's group; the group over c55
 *  measures its header. */
const buildColumnDefs = (): (ColDef | ColGroupDef)[] => {
    const defs: (ColDef | ColGroupDef)[] = [];
    for (let i = 0; i < 60; ++i) {
        const colDef: ColDef = { colId: `c${i}`, valueGetter: () => i, width: 100 };
        if (i === 5 || i === 50) {
            colDef.autoHeight = true;
        }
        if (i === 5) {
            defs.push({ groupId: 'g5', children: [colDef] });
        } else {
            defs.push(i === 55 ? { groupId: 'g55', autoHeaderHeight: true, children: [colDef] } : colDef);
        }
    }
    return defs;
};

/** The centre columns within 200px of the viewport, plus every auto-height one, in column order. */
const expectedVirtual = (api: GridApi): string[] => {
    const { left, right } = api.getHorizontalPixelRange();
    return api
        .getDisplayedCenterColumns()
        .filter((col) => {
            const colLeft = col.getLeft()!;
            return (
                col.getColDef().autoHeight || (colLeft + col.getActualWidth() >= left - 200 && colLeft <= right + 200)
            );
        })
        .map((col) => col.getColId());
};

const settle = async (): Promise<void> => {
    await nextAnimationFrame();
    await asyncSetTimeout(0);
};

describe('column virtualisation', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            ColumnAutoSizeModule,
            RowAutoHeightModule,
            ScrollApiModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('draws the columns in view, auto-height cells and measured group headers outside it, at every scroll position', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        const gridElement = getGridElement(api)!;
        const drawnCells = () =>
            Array.from(gridElement.querySelectorAll('.ag-row .ag-cell')).map((cell) => cell.getAttribute('col-id'));
        const groupHeaderDrawn = (groupId: string) =>
            gridElement.querySelector(`.ag-header-group-cell[col-id^="${groupId}_"]`) !== null;

        await waitFor(() => expect(api.getHorizontalPixelRange().right).toBeGreaterThan(0));
        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).toEqual([
            ...Array.from({ length: 13 }, (_, i) => `c${i}`),
            'c50',
        ]);
        expect(groupHeaderDrawn('g5')).toBe(true);
        expect(groupHeaderDrawn('g55')).toBe(true);

        // c30 leaves c5 left of the view and c50 right of it
        for (const colId of ['c30', 'c15', 'c46', 'c59', 'c22', 'c0']) {
            api.ensureColumnVisible(colId);
            const column = api.getColumn(colId)!;
            await waitFor(() => {
                const { left, right } = api.getHorizontalPixelRange();
                expect(column.getLeft()! + column.getActualWidth()).toBeGreaterThan(left);
                expect(column.getLeft()!).toBeLessThan(right);
            });
            const expected = expectedVirtual(api);
            expect(expected).toContain('c5');
            expect(expected).toContain('c50');
            expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).toEqual(expected);
            await waitFor(() => expect(drawnCells()).toEqual(expected));
            expect(groupHeaderDrawn('g5')).toBe(true);
            expect(groupHeaderDrawn('g55')).toBe(true);
        }
    });

    test('a column that stops measuring its cells is drawn only while in view', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: buildColumnDefs(),
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        await waitFor(() => expect(api.getHorizontalPixelRange().right).toBeGreaterThan(0));
        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).toContain('c50');

        const columnDefs = buildColumnDefs();
        delete (columnDefs[50] as ColDef).autoHeight;
        api.setGridOption('columnDefs', columnDefs);

        await waitFor(() =>
            expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).toEqual(expectedVirtual(api))
        );
        expect(api.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c50');
    });

    test('a fit that moves columns into view without changing the total width draws them, headers and cells, without a scroll', async () => {
        // every column but c0 and c9 sits at its minWidth, so the 2000px total cannot shrink to the 1000px viewport
        const columnDefs: ColDef[] = [{ colId: 'c0', width: 700, minWidth: 300 }];
        for (let i = 1; i < 9; ++i) {
            columnDefs.push({ colId: `c${i}`, width: 150, minWidth: 150 });
        }
        columnDefs.push({ colId: 'c9', width: 100, minWidth: 100 });
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{}],
            suppressColumnVirtualisation: false,
        });
        const gridElement = getGridElement(api)!;
        const drawnCells = () =>
            Array.from(gridElement.querySelectorAll('.ag-row .ag-cell')).map((cell) => cell.getAttribute('col-id'));
        const drawnHeaders = () =>
            Array.from(gridElement.querySelectorAll('.ag-header-cell[col-id]')).map((cell) =>
                cell.getAttribute('col-id')
            );
        const widths = () => api.getDisplayedCenterColumns().map((col) => col.getActualWidth());
        const total = () => widths().reduce((sum, width) => sum + width, 0);
        await waitFor(() => expect(api.getHorizontalPixelRange().right).toBeGreaterThan(0));

        const widthsBefore = widths();
        expect({ widthsBefore, total: total() }).toEqual({
            widthsBefore: [700, 150, 150, 150, 150, 150, 150, 150, 150, 100],
            total: 2000,
        });
        const expectedBefore = expectedVirtual(api);
        expect(expectedBefore).toEqual(['c0', 'c1', 'c2', 'c3', 'c4']);
        expect({ headers: drawnHeaders(), cells: drawnCells() }).toEqual({
            headers: expectedBefore,
            cells: expectedBefore,
        });

        // c0 narrows by 400px and c9 widens by 400px: the columns between move left, c5 to c7 into view
        api.sizeColumnsToFit({
            columnLimits: [
                { key: 'c0', maxWidth: 300 },
                { key: 'c9', minWidth: 500 },
            ],
        });
        await settle();

        expect({ widths: widths(), total: total(), scrollLeft: api.getHorizontalPixelRange().left }).toEqual({
            widths: [300, 150, 150, 150, 150, 150, 150, 150, 150, 500],
            total: 2000,
            scrollLeft: 0,
        });
        const expectedAfter = expectedVirtual(api);
        expect(expectedAfter).toEqual(['c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']);
        expect({
            virtual: api.getAllDisplayedVirtualColumns().map((col) => col.getColId()),
            headers: drawnHeaders(),
            cells: drawnCells(),
        }).toEqual({ virtual: expectedAfter, headers: expectedAfter, cells: expectedAfter });
    });
});
