import { ClientSideRowModelModule, TreeDataModule } from '@ag-grid-community/client-side-row-model';
import type { GridOptions } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import { GridRows, TestGridsManager } from '../test-utils';
import type { GridRowsOptions } from '../test-utils';

describe('ag-grid treeDataChildrenField', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('ag-grid treeDataChildrenField with plain row data can be switched on and off ', async () => {
        const rowData = [
            { id: '1', x: 'a' },
            { id: '2', x: 'b' },
            { id: '3', x: 'c' },
            { id: '4', x: 'd' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'groupType',
                    valueGetter: (params) => (params.data ? 'Provided' : 'Filler'),
                },
            ],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
        };

        let gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1
            ├── LEAF id:2
            ├── LEAF id:3
            └── LEAF id:4
        `);

        api.setGridOption('treeDataChildrenField', 'children');

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1
            ├── LEAF id:2
            ├── LEAF id:3
            └── LEAF id:4
        `);

        api.setGridOption('treeDataChildrenField', undefined);

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1
            ├── LEAF id:2
            ├── LEAF id:3
            └── LEAF id:4
        `);
    });
});
