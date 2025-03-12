import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

describe('ag-grid grouping parentId tree data with groupRows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree grouping', async () => {
        const rowData = [
            { x: 'A', parentId: null },
            { x: 'B', parentId: 'A' },
            { x: 'C', parentId: undefined },
            { x: 'D', parentId: 'C' },
            { x: 'E' },
            { x: 'F', parentId: 'E' },
            { x: 'G', parentId: 'F' },
            { x: 'H', parentId: 'G' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            treeData: true,
            treeDataParentIdField: 'parentId',
            autoGroupColumnDef: { headerName: 'tree' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            groupDisplayType: 'groupRows',
            getRowId: (params) => params.data.x,
        });

        const gridRowsOptions: GridRowsOptions = {
            checkDom: false,
            columns: true,
        };

        const gridRows = new GridRows(api, '', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A x:"A"
            │ └── B LEAF id:B x:"B"
            ├─┬ C GROUP id:C x:"C"
            │ └── D LEAF id:D x:"D"
            └─┬ E GROUP id:E x:"E"
            · └─┬ F GROUP id:F x:"F"
            · · └─┬ G GROUP id:G x:"G"
            · · · └── H LEAF id:H x:"H"
        `);
    });
});
