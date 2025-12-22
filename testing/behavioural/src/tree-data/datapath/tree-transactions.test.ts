import type { RowDataTransaction } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import {
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    cachedJSONObjects,
    executeTransactionsAsync,
} from '../../test-utils';

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

        let gridRows = new GridRows(api, 'rowData');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── A LEAF id:0 ag-Grid-AutoColumn:"A" x:"0"
            └─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            · └─┬ Y filler id:row-group-0-X-1-Y ag-Grid-AutoColumn:"Y"
            · · └── Z LEAF id:1 ag-Grid-AutoColumn:"Z" x:"1a"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a]);

        applyTransactionChecked(api, transactions[0]);

        gridRows = new GridRows(api, 'Transaction 0');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── A LEAF id:0 ag-Grid-AutoColumn:"A" x:"0"
            └─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            · └─┬ Y filler id:row-group-0-X-1-Y ag-Grid-AutoColumn:"Y"
            · · └─┬ Z GROUP id:1 ag-Grid-AutoColumn:"Z" x:"1a"
            · · · └── W LEAF id:2 ag-Grid-AutoColumn:"W" x:"2"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1a, row2]);

        applyTransactionChecked(api, transactions[1]);

        gridRows = new GridRows(api, 'Transaction 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:"0"
            │ ├─┬ Y filler id:row-group-0-A-1-Y ag-Grid-AutoColumn:"Y"
            │ │ └── Z LEAF id:1 ag-Grid-AutoColumn:"Z" x:"1b"
            │ └── B LEAF id:3 ag-Grid-AutoColumn:"B" x:"3"
            ├─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            │ └─┬ Y filler id:row-group-0-X-1-Y ag-Grid-AutoColumn:"Y"
            │ · └─┬ Z filler id:row-group-0-X-1-Y-2-Z ag-Grid-AutoColumn:"Z"
            │ · · └── W LEAF id:2 ag-Grid-AutoColumn:"W" x:"2"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:4 ag-Grid-AutoColumn:"D" x:"4"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row1b, row2, row3, row4]);

        applyTransactionChecked(api, transactions[2]);

        gridRows = new GridRows(api, 'Transaction 2');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:"0"
            │ └── B LEAF id:3 ag-Grid-AutoColumn:"B" x:"3"
            ├─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            │ └─┬ Y filler id:row-group-0-X-1-Y ag-Grid-AutoColumn:"Y"
            │ · └─┬ Z filler id:row-group-0-X-1-Y-2-Z ag-Grid-AutoColumn:"Z"
            │ · · ├── W LEAF id:2 ag-Grid-AutoColumn:"W" x:"2"
            │ · · └── H LEAF id:5 ag-Grid-AutoColumn:"H" x:"5a"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:4 ag-Grid-AutoColumn:"D" x:"4"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row2, row3, row4, row5a]);

        applyTransactionChecked(api, transactions[3]);

        gridRows = new GridRows(api, 'final');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A" x:"0"
            │ └── B LEAF id:3 ag-Grid-AutoColumn:"B" x:"3"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · ├── D LEAF id:4 ag-Grid-AutoColumn:"D" x:"4"
            · └── E LEAF id:5 ag-Grid-AutoColumn:"E" x:"5b"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual([row0, row3, row4, row5b]);
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

        await new GridRows(api, 'rowData').check(`
            ROOT id:ROOT_NODE_ID
            ├── A LEAF id:0 ag-Grid-AutoColumn:"A"
            └─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            · └─┬ Y filler id:row-group-0-X-1-Y ag-Grid-AutoColumn:"Y"
            · · └── Z LEAF id:1 ag-Grid-AutoColumn:"Z"
        `);

        await executeTransactionsAsync(transactions, api);

        const gridRows = new GridRows(api, 'final');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:0 ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:3 ag-Grid-AutoColumn:"B"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · ├── D LEAF id:4 ag-Grid-AutoColumn:"D"
            · └── E LEAF id:5 ag-Grid-AutoColumn:"E"
        `);

        expect(gridRows.rowNodes.map((row) => row.data)).toEqual([row0, row3, undefined, row4, row5b]);
    });

    test('filler order is not important', async () => {
        const rowData = cachedJSONObjects.array([
            {
                id: 'X3',
                versionPath: {
                    value: ['filler1', 'X1', 'filler2', 'X2', 'X3'],
                },
            },
            {
                id: 'X2',
                versionPath: {
                    value: ['filler1', 'X1', 'filler2', 'X2'],
                },
            },
            {
                id: 'X1',
                versionPath: {
                    value: ['filler1', 'X1'],
                },
            },
        ]);

        let resolveLoaded: () => void;
        const loadedPromise = new Promise<void>((resolve) => {
            resolveLoaded = resolve;
        });

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }],
            autoGroupColumnDef: { cellRendererParams: { suppressCount: true } },
            treeData: true,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            getDataPath: (data) => data.versionPath.value,
            onGridReady: () => {
                applyTransactionChecked(api, { add: rowData });
                resolveLoaded();
            },
        });

        await loadedPromise;

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler1 filler id:row-group-0-filler1 ag-Grid-AutoColumn:"filler1"
            · └─┬ X1 GROUP id:X1 ag-Grid-AutoColumn:"X1" id:"X1"
            · · └─┬ filler2 filler id:row-group-0-filler1-1-X1-2-filler2 ag-Grid-AutoColumn:"filler2"
            · · · └─┬ X2 GROUP id:X2 ag-Grid-AutoColumn:"X2" id:"X2"
            · · · · └── X3 LEAF id:X3 ag-Grid-AutoColumn:"X3" id:"X3"
        `);

        // Add more nested data in shuffled order to ensure filler IDs are stable regardless of creation order
        const more = cachedJSONObjects.array([
            {
                id: 'X6',
                versionPath: {
                    value: ['filler1', 'X1', 'filler2', 'X2', 'X2.1', 'filler3', 'filler4', 'filler5', 'X6'],
                },
            },
            {
                id: 'X2.2',
                versionPath: { value: ['filler1', 'X1', 'filler2', 'X2', 'X2.1', 'X2.2'] },
            },
            {
                id: 'X4',
                versionPath: { value: ['filler1', 'X1', 'filler2', 'X2', 'filler3', 'X4'] },
            },
            {
                id: 'X5',
                versionPath: { value: ['filler1', 'X1', 'filler2', 'X5'] },
            },
            {
                id: 'X2.1',
                versionPath: { value: ['filler1', 'X1', 'filler2', 'X2', 'X2.1'] },
            },

            {
                id: 'X7',
                versionPath: {
                    value: ['filler1', 'X1', 'filler2', 'X2', 'X2.1', 'filler3', 'filler4', 'filler5', 'X7'],
                },
            },
        ]);

        applyTransactionChecked(api, { add: more });

        // Verify filler IDs and structure regardless of insertion order
        await new GridRows(api, 'more').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler1 filler id:row-group-0-filler1 ag-Grid-AutoColumn:"filler1"
            · └─┬ X1 GROUP id:X1 ag-Grid-AutoColumn:"X1" id:"X1"
            · · └─┬ filler2 filler id:row-group-0-filler1-1-X1-2-filler2 ag-Grid-AutoColumn:"filler2"
            · · · ├─┬ X2 GROUP id:X2 ag-Grid-AutoColumn:"X2" id:"X2"
            · · · │ ├── X3 LEAF id:X3 ag-Grid-AutoColumn:"X3" id:"X3"
            · · · │ ├─┬ filler3 filler id:row-group-0-filler1-1-X1-2-filler2-3-X2-4-filler3 ag-Grid-AutoColumn:"filler3"
            · · · │ │ └── X4 LEAF id:X4 ag-Grid-AutoColumn:"X4" id:"X4"
            · · · │ └─┬ X2.1 GROUP id:X2.1 ag-Grid-AutoColumn:"X2.1" id:"X2.1"
            · · · │ · ├─┬ filler3 filler id:row-group-0-filler1-1-X1-2-filler2-3-X2-4-X2.1-5-filler3 ag-Grid-AutoColumn:"filler3"
            · · · │ · │ └─┬ filler4 filler id:row-group-0-filler1-1-X1-2-filler2-3-X2-4-X2.1-5-filler3-6-filler4 ag-Grid-AutoColumn:"filler4"
            · · · │ · │ · └─┬ filler5 filler id:row-group-0-filler1-1-X1-2-filler2-3-X2-4-X2.1-5-filler3-6-filler4-7-filler5 ag-Grid-AutoColumn:"filler5"
            · · · │ · │ · · ├── X6 LEAF id:X6 ag-Grid-AutoColumn:"X6" id:"X6"
            · · · │ · │ · · └── X7 LEAF id:X7 ag-Grid-AutoColumn:"X7" id:"X7"
            · · · │ · └── X2.2 LEAF id:X2.2 ag-Grid-AutoColumn:"X2.2" id:"X2.2"
            · · · └── X5 LEAF id:X5 ag-Grid-AutoColumn:"X5" id:"X5"
        `);
    });
});
