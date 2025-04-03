import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../../test-utils';
import { GridRows, TestGridsManager } from '../../test-utils';

describe('ag-grid grouping parentId treeData is reactive', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('ag-grid grouping treeData is reactive', async () => {
        const rowData = [
            { id: 'A', g: 0, v: 0 },
            { id: 'B', g: 1, v: 1, parentId: 'A' },
            { id: 'C', g: 1, v: 1, parentId: 'B' },
            { id: 'D', g: 0, v: 1 },
            { id: 'E', g: 0, v: 2, parentId: 'D' },
            { id: 'F', g: 0, v: 3, parentId: 'D' },
            { id: 'G', g: 1, v: 4 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'g', rowGroup: true }, { field: 'v' }],
            autoGroupColumnDef: {
                headerName: 'group column',
                valueGetter: (params) => {
                    return 'X-' + params.node?.id;
                },
            },
            treeDataParentIdField: 'parentId',
            treeData: false,
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: true,
        };

        for (let repeat = 0; repeat < 2; repeat++) {
            api.setGridOption('treeData', false);

            let gridRows = new GridRows(api, 'data 1 ' + repeat, gridRowsOptions);
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"X-ROOT_NODE_ID"
                ├─┬ filler id:row-group-g-0 ag-Grid-AutoColumn:0
                │ ├── LEAF id:A ag-Grid-AutoColumn:"X-A" g:0 v:0
                │ ├── LEAF id:D ag-Grid-AutoColumn:"X-D" g:0 v:1
                │ ├── LEAF id:E ag-Grid-AutoColumn:"X-E" g:0 v:2
                │ └── LEAF id:F ag-Grid-AutoColumn:"X-F" g:0 v:3
                └─┬ filler id:row-group-g-1 ag-Grid-AutoColumn:1
                · ├── LEAF id:B ag-Grid-AutoColumn:"X-B" g:1 v:1
                · ├── LEAF id:C ag-Grid-AutoColumn:"X-C" g:1 v:1
                · └── LEAF id:G ag-Grid-AutoColumn:"X-G" g:1 v:4
            `);

            // Switch to treeData

            api.setGridOption('treeData', true);

            gridRows = new GridRows(api, 'data 2 ' + repeat, gridRowsOptions);
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn:"X-ROOT_NODE_ID"
                ├─┬ A GROUP id:A ag-Grid-AutoColumn:"X-A" g:0 v:0
                │ └─┬ B GROUP id:B ag-Grid-AutoColumn:"X-B" g:1 v:1
                │ · └── C LEAF id:C ag-Grid-AutoColumn:"X-C" g:1 v:1
                ├─┬ D GROUP id:D ag-Grid-AutoColumn:"X-D" g:0 v:1
                │ ├── E LEAF id:E ag-Grid-AutoColumn:"X-E" g:0 v:2
                │ └── F LEAF id:F ag-Grid-AutoColumn:"X-F" g:0 v:3
                └── G LEAF id:G ag-Grid-AutoColumn:"X-G" g:1 v:4
            `);
        }
    });
});
