import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../../test-utils';
import { getColumnOrder } from '../column-test-utils';

describe('pivot value column reorder', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { country: 'Ireland', year: 2000, gold: 1, silver: 2, bronze: 3 },
        { country: 'Ireland', year: 2004, gold: 4, silver: 5, bronze: 6 },
        { country: 'Italy', year: 2000, gold: 7, silver: 8, bronze: 9 },
    ];

    const columnDefs: (ColDef | ColGroupDef)[] = [
        { field: 'country', rowGroup: true },
        { field: 'year', pivot: true },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ];

    test('setValueColumns reorder updates generated pivot column order', () => {
        const gridApi = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            pivotMode: true,
        });

        gridApi.setValueColumns(['bronze', 'gold', 'silver']);

        expect(getColumnOrder(gridApi, 'center').filter((id) => id.startsWith('pivot_year_2000_'))).toEqual([
            'pivot_year_2000_bronze',
            'pivot_year_2000_gold',
            'pivot_year_2000_silver',
        ]);
    });
});
