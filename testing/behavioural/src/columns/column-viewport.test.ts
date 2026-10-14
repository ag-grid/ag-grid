import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
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

describe('column virtualisation', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, RowAutoHeightModule, ScrollApiModule],
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
});
