import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, executeTransactionsAsync } from '../../test-utils';

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

        let gridRows = new GridRows(api, 'rowData');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0" x:"0"
            └── 1 LEAF id:1 ag-Grid-AutoColumn:"1" x:"1a"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a]);

        applyTransactionChecked(api, transactions[0]);
        gridRows = new GridRows(api, 'Transaction 0');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0" x:"0"
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" x:"1a"
            · └── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"2"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a, row2]);

        applyTransactionChecked(api, transactions[1]);
        gridRows = new GridRows(api, 'Transaction 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" x:"0"
            │ ├─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" x:"1b"
            │ │ └── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"2"
            │ └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" x:"3"
            └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" x:"4"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1b, row2, row3, row4]);

        applyTransactionChecked(api, transactions[2]);
        gridRows = new GridRows(api, 'Transaction 2');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" x:"0"
            │ ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"2b"
            │ └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" x:"3"
            └─┬ 4 GROUP id:4 ag-Grid-AutoColumn:"4" x:"4"
            · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" x:"5a"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row2b, row3, row4, row5a]);

        applyTransactionChecked(api, transactions[3]);
        gridRows = new GridRows(api, 'final');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" x:"0"
            │ └─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" x:"3"
            │ · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" x:"5b"
            └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" x:"4"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row3, row4, row5b]);
    });

    test('allChildrenCount updates correctly through add/remove transactions (0→1→2→1→0)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'parent', x: 'parent' },
                { id: 'sibling', x: 'sibling' },
            ],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        // Initial: parent is a LEAF with no children (allChildrenCount = null)
        let gridRows = new GridRows(api, '0 children');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── parent LEAF id:parent ag-Grid-AutoColumn:"parent" x:"parent"
            └── sibling LEAF id:sibling ag-Grid-AutoColumn:"sibling" x:"sibling"
        `);
        expect(api.getRowNode('parent')?.allChildrenCount).toBeNull();

        // Add first child: parent becomes GROUP with allChildrenCount = 1
        applyTransactionChecked(api, { add: [{ id: 'child-1', x: 'child-1', parentId: 'parent' }] });
        gridRows = new GridRows(api, '1 child');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" x:"parent"
            │ └── child-1 LEAF id:child-1 ag-Grid-AutoColumn:"child-1" x:"child-1"
            └── sibling LEAF id:sibling ag-Grid-AutoColumn:"sibling" x:"sibling"
        `);
        expect(api.getRowNode('parent')?.allChildrenCount).toBe(1);

        // Add second child: allChildrenCount = 2
        applyTransactionChecked(api, { add: [{ id: 'child-2', x: 'child-2', parentId: 'parent' }] });
        gridRows = new GridRows(api, '2 children');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" x:"parent"
            │ ├── child-1 LEAF id:child-1 ag-Grid-AutoColumn:"child-1" x:"child-1"
            │ └── child-2 LEAF id:child-2 ag-Grid-AutoColumn:"child-2" x:"child-2"
            └── sibling LEAF id:sibling ag-Grid-AutoColumn:"sibling" x:"sibling"
        `);
        expect(api.getRowNode('parent')?.allChildrenCount).toBe(2);

        // Remove first child: allChildrenCount = 1
        applyTransactionChecked(api, { remove: [{ id: 'child-1' }] });
        gridRows = new GridRows(api, '1 child again');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ parent GROUP id:parent ag-Grid-AutoColumn:"parent" x:"parent"
            │ └── child-2 LEAF id:child-2 ag-Grid-AutoColumn:"child-2" x:"child-2"
            └── sibling LEAF id:sibling ag-Grid-AutoColumn:"sibling" x:"sibling"
        `);
        expect(api.getRowNode('parent')?.allChildrenCount).toBe(1);

        // Remove last child: parent becomes LEAF, allChildrenCount = null
        applyTransactionChecked(api, { remove: [{ id: 'child-2' }] });
        gridRows = new GridRows(api, '0 children again');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── parent LEAF id:parent ag-Grid-AutoColumn:"parent" x:"parent"
            └── sibling LEAF id:sibling ag-Grid-AutoColumn:"sibling" x:"sibling"
        `);
        expect(api.getRowNode('parent')?.allChildrenCount).toBeNull();
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

        let gridRows = new GridRows(api, 'rowData');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0" x:"0"
            └── 1 LEAF id:1 ag-Grid-AutoColumn:"1" x:"1a"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a]);

        await executeTransactionsAsync(transactions, api);

        gridRows = new GridRows(api, 'final');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" x:"0"
            │ └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" x:"3"
            └─┬ 4 GROUP id:4 ag-Grid-AutoColumn:"4" x:"4"
            · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" x:"5b"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row3, row4, row5b]);
    });
});
