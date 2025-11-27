import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid grouping simple data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('toggle columnDefs updates grouping', async () => {
        const columnDefsA = [{ colId: '1', field: 'a', rowGroup: true }];
        const columnDefsB = [{ colId: '1', field: 'b', rowGroup: true }];
        const rowData = [{ a: 'bob', b: 'cat', id: '0' }];

        const gridOptions: GridOptions = {
            columnDefs: columnDefsA,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'column A');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-1-bob ag-Grid-AutoColumn:"bob"
            · └── LEAF id:0 1:"bob"
        `);

        api.setGridOption('columnDefs', columnDefsB);

        gridRows = new GridRows(api, 'column B');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-1-cat ag-Grid-AutoColumn:"cat"
            · └── LEAF id:0 1:"cat"
        `);

        api.setGridOption('columnDefs', columnDefsA);

        gridRows = new GridRows(api, 'column A (2)');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-1-bob ag-Grid-AutoColumn:"bob"
            · └── LEAF id:0 1:"bob"
        `);
    });
});
