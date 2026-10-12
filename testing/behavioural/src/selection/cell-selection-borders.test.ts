import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import { afterEach, describe, expect, test } from 'vitest';

import type { ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnApiModule, getGridElement } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

/** The range border sides of each cell in the first row, as `colId:sides`. */
const rangeBorders = (api: GridApi, colIds: string[]): string[] =>
    colIds.map((colId) => {
        const cell = getGridElement(api)!.querySelector(`.ag-row[row-index="0"] .ag-cell[col-id="${colId}"]`);
        const sides = ['left', 'right'].filter((side) => cell?.classList.contains(`ag-cell-range-${side}`));
        return `${colId}:${sides.join(',')}`;
    });

describe('cell selection borders', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, CellSelectionModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createGrid = async (columnDefs: (ColDef | ColGroupDef)[]) => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, rowData: [{}, {}], cellSelection: true });
        await asyncSetTimeout(0);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['b', 'c'] });
        return api;
    };

    test('a range keeps its side borders on its edge cells as columns move and hide', async () => {
        const api = await createGrid([{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }]);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left', 'c:right']);

        api.moveColumns(['d'], 2);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left,right', 'c:left,right']);

        api.moveColumns(['d'], 3);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left', 'c:right']);

        api.setColumnsVisible(['c'], false);
        expect(rangeBorders(api, ['b'])).toEqual(['b:left,right']);
    });

    test('opening a group that shows a column inside a range splits its borders', async () => {
        const api = await createGrid([
            { colId: 'a' },
            {
                groupId: 'g',
                children: [{ colId: 'b' }, { colId: 'x', columnGroupShow: 'open' }, { colId: 'c' }],
            },
            { colId: 'd' },
        ]);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left', 'c:right']);

        api.setColumnGroupOpened('g', true);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left,right', 'c:left,right']);

        api.setColumnGroupOpened('g', false);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left', 'c:right']);
    });

    test('in RTL, a range keeps its side borders on its edge cells as columns move', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
            rowData: [{}, {}],
            cellSelection: true,
            enableRtl: true,
        });
        await asyncSetTimeout(0);
        api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['b', 'c'] });
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:right', 'c:left']);

        api.moveColumns(['d'], 2);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:left,right', 'c:left,right']);

        api.moveColumns(['d'], 3);
        expect(rangeBorders(api, ['b', 'c'])).toEqual(['b:right', 'c:left']);
    });
});
