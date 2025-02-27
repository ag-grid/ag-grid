import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, executeTransactionsAsync } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

const gridRowsOptions: GridRowsOptions = {
    checkDom: true,
};

describe('ag-grid tree transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('ag-grid parentId tree sync complex transaction', async () => {
        const row0 = { id: '0', x: '0', parentId: null };
        const row1a = { id: '1', x: '1a', parentId: null };
        const row2 = { id: '2', x: '2', parentId: '1' };
        const row3 = { id: '3', x: '3', parentId: '0' };
        const row4 = { id: '4', x: '4' };
        const row5a = { id: '5', x: '5a', parentId: '4' };

        const row1b = { id: '1', x: '1b', parentId: '0' };
        const row2b = { id: '2', x: '2b', parentId: '0' };
        const row5b = { id: '5', x: '5b', parentId: '3' };

        const rowData = [row0, row1a];
        const transactions = [
            { add: [row2] },
            { update: [row1b], add: [row3, row4] },
            { remove: [row1b], update: [row2b], add: [row5a] },
            { remove: [row2], update: [row5b] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        let gridRows = new GridRows(api, 'rowData', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0
            └── 1 LEAF id:1
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a]);

        api.applyTransaction(transactions[0]);
        gridRows = new GridRows(api, 'Transaction 0', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0
            └─┬ 1 GROUP id:1
            · └── 2 LEAF id:2
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a, row2]);

        api.applyTransaction(transactions[1]);
        gridRows = new GridRows(api, 'Transaction 1', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0
            │ ├─┬ 1 GROUP id:1
            │ │ └── 2 LEAF id:2
            │ └── 3 LEAF id:3
            └── 4 LEAF id:4
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1b, row2, row3, row4]);

        api.applyTransaction(transactions[2]);
        gridRows = new GridRows(api, 'Transaction 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0
            │ ├── 2 LEAF id:2
            │ └── 3 LEAF id:3
            └─┬ 4 GROUP id:4
            · └── 5 LEAF id:5
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row2b, row3, row4, row5a]);

        api.applyTransaction(transactions[3]);
        gridRows = new GridRows(api, 'final', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0
            │ └─┬ 3 GROUP id:3
            │ · └── 5 LEAF id:5
            └── 4 LEAF id:4
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row3, row4, row5b]);
    });

    test('ag-grid parentId tree async complex transaction', async () => {
        const row0 = { id: '0', x: '0', parentId: null };
        const row1a = { id: '1', x: '1a', parentId: null };
        const row2 = { id: '2', x: '2', parentId: '1' };
        const row3 = { id: '3', x: '3', parentId: '0' };
        const row4 = { id: '4', x: '4', parentId: null };
        const row5a = { id: '5', x: '5a', parentId: '1' };

        const row1b = { id: '1', x: '1b', parentId: '0' };
        const row5b = { id: '5', x: '5b', parentId: '4' };

        const rowData = [row0, row1a];
        const transactions = [
            { add: [row2] },
            { update: [row1b], add: [row3, row4] },
            { remove: [row1b], add: [row5a] },
            { remove: [row2], update: [row5b] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        let gridRows = new GridRows(api, 'rowData', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0
            └── 1 LEAF id:1
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a]);

        await executeTransactionsAsync(transactions, api);

        gridRows = new GridRows(api, 'final', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0
            │ └── 3 LEAF id:3
            └─┬ 4 GROUP id:4
            · └── 5 LEAF id:5
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row3, row4, row5b]);
    });
});
