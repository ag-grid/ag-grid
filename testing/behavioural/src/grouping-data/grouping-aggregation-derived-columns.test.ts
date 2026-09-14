import '@testing-library/jest-dom/vitest';
import { TestGridsManager } from 'ag-test-utils';

import type { CellValueChangedEvent, GridApi } from 'ag-grid-community';
import { ClientSideRowModelApiModule, ClientSideRowModelModule, getGridElement } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

/** A column whose valueGetter reads aggregated values rather than being aggregated itself. */
const TOTAL_COL_ID = 'total';

describe('grouping aggregation: columns derived from aggregates', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ClientSideRowModelApiModule, RowGroupingModule],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    const createGrid = (rowData: any[], extraOptions = {}) =>
        gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'group', rowGroup: true },
                { field: 'a', aggFunc: 'sum' },
                { field: 'b', aggFunc: 'sum' },
                { colId: TOTAL_COL_ID, valueGetter: 'getValue("a") + getValue("b")' },
            ],
            animateRows: false,
            groupDefaultExpanded: -1,
            suppressAggFuncInHeader: true,
            rowData,
            ...extraOptions,
        });

    const groupCells = (api: GridApi, rowId: string) =>
        Object.fromEntries(
            [...getGridElement(api)!.querySelectorAll(`[row-id="${rowId}"] [col-id]`)].map((el) => [
                el.getAttribute('col-id'),
                el.textContent?.trim(),
            ])
        );

    test('a transaction update refreshes the derived column on the group row', async () => {
        const rowData = [
            { group: 'A', a: 1, b: 10 },
            { group: 'A', a: 2, b: 20 },
        ];
        const api = await createGrid(rowData);

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '3', b: '30', [TOTAL_COL_ID]: '33' });

        rowData[0].a = 101;
        api.applyTransaction({ update: [rowData[0]] });

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '103', b: '30', [TOTAL_COL_ID]: '133' });
    });

    test('moving a row between groups refreshes the derived column on both group rows', async () => {
        const rowData = [
            { group: 'A', a: 1, b: 10 },
            { group: 'A', a: 2, b: 20 },
            { group: 'B', a: 4, b: 40 },
        ];
        const api = await createGrid(rowData, {
            onCellValueChanged: (params: CellValueChangedEvent) => {
                if (params.data) {
                    params.api.applyTransaction({ update: [params.data] });
                }
            },
        });

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '3', b: '30', [TOTAL_COL_ID]: '33' });
        expect(groupCells(api, 'row-group-group-B')).toMatchObject({ a: '4', b: '40', [TOTAL_COL_ID]: '44' });

        api.getRowNode('0')!.setDataValue('group', 'B');
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(groupCells(api, 'row-group-group-A')).toMatchObject({ a: '2', b: '20', [TOTAL_COL_ID]: '22' });
        expect(groupCells(api, 'row-group-group-B')).toMatchObject({ a: '5', b: '50', [TOTAL_COL_ID]: '55' });
    });
});
