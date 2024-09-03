import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { RowDataTransaction } from '@ag-grid-community/core';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import {
    TestGridsManager,
    executeTransactionsAsync,
    getAllRowData,
    getAllRows,
    verifyPositionInRootChildren,
} from '../../test-utils';
import type { TreeDiagramOptions } from './tree-test-utils';
import { TreeDiagram } from './tree-test-utils';

const treeDiagramOptions: TreeDiagramOptions = {
    checkDom: 'myGrid',
};

describe('ag-grid tree transactions', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, RowGroupingModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('ag-grid tree sync complex transaction', async () => {
        const row0 = { id: '0', x: '0', path: ['A'] };
        const row1a = { id: '1', x: '1a', path: ['X', 'Y', 'Z'] };
        const row2 = { id: '2', x: '2', path: ['X', 'Y', 'Z', 'W'] };
        const row3 = { id: '3', x: '3', path: ['A', 'B'] };
        const row4 = { id: '4', x: '4', path: ['C', 'D'] };
        const row5a = { id: '5', x: '5a', path: ['X', 'Y', 'Z', 'H'] };

        const row1b = { id: '1', x: '1b', path: ['A', 'Y', 'Z'] };
        const row5b = { id: '5', x: '5b', path: ['C', 'E'] };

        const rowData = [row0, row1a];
        const transactions: RowDataTransaction[] = [
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
            getDataPath: (data) => data.path,
        });

        let allData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allData).toEqual([row0, row1a]);

        new TreeDiagram(api, 'rowData', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├── A LEAF id:0
            └─┬ X filler id:row-group-0-X
            · └─┬ Y filler id:row-group-0-X-1-Y
            · · └── Z LEAF id:1
        `);

        api.applyTransaction(transactions[0]);

        allData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allData).toEqual([row0, row1a, row2]);

        new TreeDiagram(api, 'Transaction 0', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├── A LEAF id:0
            └─┬ X filler id:row-group-0-X
            · └─┬ Y filler id:row-group-0-X-1-Y
            · · └─┬ Z GROUP id:1
            · · · └── W LEAF id:2
        `);

        api.applyTransaction(transactions[1]);

        allData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allData).toEqual([row0, row1b, row2, row3, row4]);

        new TreeDiagram(api, 'Transaction 1', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0
            │ ├─┬ Y filler id:row-group-0-A-1-Y
            │ │ └── Z LEAF id:1
            │ └── B LEAF id:3
            ├─┬ X filler id:row-group-0-X
            │ └─┬ Y filler id:row-group-0-X-1-Y
            │ · └─┬ Z filler id:row-group-0-X-1-Y-2-Z
            │ · · └── W LEAF id:2
            └─┬ C filler id:row-group-0-C
            · └── D LEAF id:4
        `);

        api.applyTransaction(transactions[2]);

        allData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allData).toEqual([row0, row2, row3, row4, row5a]);

        new TreeDiagram(api, 'Transaction 2', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0
            │ └── B LEAF id:3
            ├─┬ X filler id:row-group-0-X
            │ └─┬ Y filler id:row-group-0-X-1-Y
            │ · └─┬ Z filler id:row-group-0-X-1-Y-2-Z
            │ · · ├── W LEAF id:2
            │ · · └── H LEAF id:5
            └─┬ C filler id:row-group-0-C
            · └── D LEAF id:4
        `);

        api.applyTransaction(transactions[3]);

        allData = getAllRowData(verifyPositionInRootChildren(api));
        expect(allData).toEqual([row0, row3, row4, row5b]);

        new TreeDiagram(api, 'final', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0
            │ └── B LEAF id:3
            └─┬ C filler id:row-group-0-C
            · ├── D LEAF id:4
            · └── E LEAF id:5
        `);
    });

    test('ag-grid tree async complex transaction', async () => {
        const row0 = { id: '0', path: ['A'] };
        const row1a = { id: '1', path: ['X', 'Y', 'Z'] };
        const row2 = { id: '2', path: ['X', 'Y', 'Z', 'W'] };
        const row3 = { id: '3', path: ['A', 'B'] };
        const row4 = { id: '4', path: ['C', 'D'] };
        const row5a = { id: '5', path: ['X', 'Y', 'Z', 'H'] };

        const row1b = { id: '1', path: ['A', 'Y', 'Z'] };
        const row5b = { id: '5', path: ['C', 'E'] };

        const rowData = [row0, row1a];
        const transactions: RowDataTransaction[] = [
            { add: [row2] },
            { update: [row1b], add: [row3, row4] },
            { remove: [row1b], add: [row5a] },
            { remove: [row2], update: [row5b] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data) => data.path,
        });

        new TreeDiagram(api, 'rowData', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├── A LEAF id:0
            └─┬ X filler id:row-group-0-X
            · └─┬ Y filler id:row-group-0-X-1-Y
            · · └── Z LEAF id:1
        `);

        await executeTransactionsAsync(transactions, api);

        const rows = getAllRows(api);

        new TreeDiagram(api, 'final', treeDiagramOptions).check(`
            ROOT_NODE_ID ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0
            │ └── B LEAF id:3
            └─┬ C filler id:row-group-0-C
            · ├── D LEAF id:4
            · └── E LEAF id:5
        `);

        expect(rows.length).toBe(5);

        expect(rows[0].data).toEqual(row0);
        expect(rows[1].data).toEqual(row3);
        expect(rows[2].data).toEqual(undefined);
        expect(rows[3].data).toEqual(row4);
        expect(rows[4].data).toEqual(row5b);
    });
});
