import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, ColumnApiModule } from 'ag-grid-community';
import { PivotModule } from 'ag-grid-enterprise';

describe('moving a column while pivoting', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ColumnApiModule, PivotModule] });
    afterEach(() => gridsManager.reset());

    test('a primary column hidden by pivot mode cannot be moved into the pivot view', () => {
        const api = gridsManager.createGrid('pivot', {
            columnDefs: [
                { field: 'region', rowGroup: true },
                { field: 'sector', pivot: true },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'profit', aggFunc: 'sum' },
            ],
            rowData: [{ region: 'EMEA', sector: 'Retail', revenue: 1, profit: 2 }],
            pivotMode: true,
        });
        const before = api.getAllDisplayedColumns().map((c) => c.getColId());
        api.moveColumns(['profit'], 1);
        expect(api.getAllDisplayedColumns().map((c) => c.getColId())).toEqual(before);
    });
});
