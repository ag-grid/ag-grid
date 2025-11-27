import { ClientSideRowModelModule } from 'ag-grid-community';
import type { RowDataTransaction } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, executeTransactionsAsync } from '../../test-utils';

describe('ag-grid tree transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    test('tree transaction remove', async () => {
        const rowA = { id: 'a', orgHierarchy: ['A'] };
        const rowC = { id: 'c', orgHierarchy: ['A', 'B', 'C'] };
        const rowD = { id: 'd', orgHierarchy: ['A', 'B', 'C', 'D'] };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowC, rowD],
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, '').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:a ag-Grid-AutoColumn:"A"
            · └─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            · · └─┬ C GROUP id:c ag-Grid-AutoColumn:"C"
            · · · └── D LEAF id:d ag-Grid-AutoColumn:"D"
        `);

        api.applyTransaction({ remove: [rowC] });
        api.applyTransaction({ remove: [rowD] });

        const gridRows = new GridRows(api, '');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── A LEAF id:a ag-Grid-AutoColumn:"A"
        `);

        const rows = gridRows.rootAllLeafChildren;
        expect(rows.length).toBe(1);
        expect(rows[0].data).toEqual(rowA);
    });

    describe('remove re-insert filler', () => {
        test('ag-grid tree sync remove re-insert filler', async () => {
            // This is actually a very important test. This proves that the implementation is commutative,
            // i.e. the grouping of the remove and insert operations does not matter.
            // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
            // or in isolated transactions does not change the final resulting order of the rows.

            const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
            const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
            const rowD = { id: 'd', orgHierarchy: ['D'] };

            const rowData = [rowB, rowC, rowD];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
                treeData: true,
                animateRows: false,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                │ ├── B LEAF id:b ag-Grid-AutoColumn:"B"
                │ └── C LEAF id:c ag-Grid-AutoColumn:"C"
                └── D LEAF id:d ag-Grid-AutoColumn:"D"
            `);

            api.applyTransaction({ remove: [rowB, rowC] });

            await new GridRows(api, 'Transaction[0]').check(`
                ROOT id:ROOT_NODE_ID
                └── D LEAF id:d ag-Grid-AutoColumn:"D"
            `);

            api.applyTransaction({ add: [rowC, rowB] });

            await new GridRows(api, 'finalSync').check(`
                ROOT id:ROOT_NODE_ID
                ├── D LEAF id:d ag-Grid-AutoColumn:"D"
                └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                · ├── C LEAF id:c ag-Grid-AutoColumn:"C"
                · └── B LEAF id:b ag-Grid-AutoColumn:"B"
            `);
        });

        test('ag-grid tree same transaction remove re-insert filler', async () => {
            const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
            const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
            const rowD = { id: 'd', orgHierarchy: ['D'] };

            const rowData = [rowB, rowC, rowD];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
                treeData: true,
                animateRows: false,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                │ ├── B LEAF id:b ag-Grid-AutoColumn:"B"
                │ └── C LEAF id:c ag-Grid-AutoColumn:"C"
                └── D LEAF id:d ag-Grid-AutoColumn:"D"
            `);

            api.applyTransaction({
                remove: [rowB, rowC],
                add: [rowC, rowB],
            });

            await new GridRows(api, 'finalTogether').check(`
                ROOT id:ROOT_NODE_ID
                ├── D LEAF id:d ag-Grid-AutoColumn:"D"
                └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                · ├── C LEAF id:c ag-Grid-AutoColumn:"C"
                · └── B LEAF id:b ag-Grid-AutoColumn:"B"
            `);
        });

        test('ag-grid tree async remove re-insert filler', async () => {
            // This is actually a very important test. This proves that the implementation is commutative,
            // i.e. the grouping of the remove and insert operations does not matter.
            // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
            // or in isolated transactions does not change the final resulting order of the rows.

            const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
            const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
            const rowD = { id: 'd', orgHierarchy: ['D'] };

            const rowData = [rowB, rowC, rowD];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
                autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
                treeData: true,
                animateRows: false,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                │ ├── B LEAF id:b ag-Grid-AutoColumn:"B"
                │ └── C LEAF id:c ag-Grid-AutoColumn:"C"
                └── D LEAF id:d ag-Grid-AutoColumn:"D"
            `);

            await executeTransactionsAsync([{ remove: [rowB, rowC] }, { add: [rowC, rowB] }], api);

            await new GridRows(api, 'finalAsync').check(`
                ROOT id:ROOT_NODE_ID
                ├── D LEAF id:d ag-Grid-AutoColumn:"D"
                └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                · ├── C LEAF id:c ag-Grid-AutoColumn:"C"
                · └── B LEAF id:b ag-Grid-AutoColumn:"B"
            `);
        });
    });

    test.each(['sync', 'async', 'together'] as const)('ag-grid tree %s remove re-insert filler', async (mode) => {
        // This is actually a very important test. This proves that the implementation is commutative,
        // i.e. the grouping of the remove and insert operations does not matter.
        // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
        // or in isolated transactions does not change the final resulting order of the rows.

        const rowB = { id: 'b', orgHierarchy: ['A', 'B'] };
        const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
        const rowD = { id: 'd', orgHierarchy: ['D'] };

        const rowData = [rowB, rowC, rowD];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├── B LEAF id:b ag-Grid-AutoColumn:"B"
            │ └── C LEAF id:c ag-Grid-AutoColumn:"C"
            └── D LEAF id:d ag-Grid-AutoColumn:"D"
        `);

        const transactions: RowDataTransaction[] = [{ remove: [rowB, rowC] }, { add: [rowC, rowB] }];

        if (mode === 'async') {
            await executeTransactionsAsync(transactions, api);
        } else if (mode === 'together') {
            api.applyTransaction({ ...transactions[0], ...transactions[1] });
        } else {
            api.applyTransaction(transactions[0]);

            await new GridRows(api, 'Transaction[0]').check(`
                ROOT id:ROOT_NODE_ID
                └── D LEAF id:d ag-Grid-AutoColumn:"D"
            `);

            api.applyTransaction(transactions[1]);
        }

        await new GridRows(api, 'final' + mode).check(`
            ROOT id:ROOT_NODE_ID
            ├── D LEAF id:d ag-Grid-AutoColumn:"D"
            └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            · ├── C LEAF id:c ag-Grid-AutoColumn:"C"
            · └── B LEAF id:b ag-Grid-AutoColumn:"B"
        `);
    });

    test.each(['sync', 'async', 'together'] as const)('ag-grid tree %s remove re-insert', async (mode) => {
        const rowB = { id: 'b', orgHierarchy: ['A', 'B', 'B'] };
        const rowC = { id: 'c', orgHierarchy: ['A', 'C'] };
        const rowD = { id: 'd', orgHierarchy: ['A', 'D'] };
        const rowE = { id: 'e', orgHierarchy: ['A', 'E', 'E'] };
        const rowF = { id: 'f', orgHierarchy: ['F'] };

        const rowData = [rowB, rowC, rowD, rowE, rowF];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            │ │ └── B LEAF id:b ag-Grid-AutoColumn:"B"
            │ ├── C LEAF id:c ag-Grid-AutoColumn:"C"
            │ ├── D LEAF id:d ag-Grid-AutoColumn:"D"
            │ └─┬ E filler id:row-group-0-A-1-E ag-Grid-AutoColumn:"E"
            │ · └── E LEAF id:e ag-Grid-AutoColumn:"E"
            └── F LEAF id:f ag-Grid-AutoColumn:"F"
        `);

        const transactions1: RowDataTransaction[] = [
            { remove: [{ id: 'e' }, { id: 'c' }, { id: 'd' }] },
            { add: [rowC, rowE, rowD] },
        ];

        if (mode === 'async') {
            await executeTransactionsAsync(transactions1, api);
        } else if (mode === 'together') {
            api.applyTransaction({ ...transactions1[0], ...transactions1[1] });
        } else {
            api.applyTransaction(transactions1[0]);

            await new GridRows(api, 'Transaction1[0]').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
                │ └─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
                │ · └── B LEAF id:b ag-Grid-AutoColumn:"B"
                └── F LEAF id:f ag-Grid-AutoColumn:"F"
            `);

            api.applyTransaction(transactions1[1]);
        }

        await new GridRows(api, 'Transactions1 ' + mode).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            │ │ └── B LEAF id:b ag-Grid-AutoColumn:"B"
            │ ├── C LEAF id:c ag-Grid-AutoColumn:"C"
            │ ├─┬ E filler id:row-group-0-A-1-E ag-Grid-AutoColumn:"E"
            │ │ └── E LEAF id:e ag-Grid-AutoColumn:"E"
            │ └── D LEAF id:d ag-Grid-AutoColumn:"D"
            └── F LEAF id:f ag-Grid-AutoColumn:"F"
        `);

        const transactions2 = [{ remove: [rowC, rowB, rowE, rowD] }, { add: [rowB, rowC, rowD, rowE] }];

        if (mode === 'async') {
            await executeTransactionsAsync(transactions2, api);
        } else if (mode === 'together') {
            api.applyTransaction({ ...transactions2[0], ...transactions2[1] });
        } else {
            api.applyTransaction(transactions2[0]);

            await new GridRows(api, 'Transaction2[0]').check(`
                ROOT id:ROOT_NODE_ID
                └── F LEAF id:f ag-Grid-AutoColumn:"F"
            `);

            api.applyTransaction(transactions2[1]);
        }

        await new GridRows(api, 'Transactions2 ' + mode).check(`
            ROOT id:ROOT_NODE_ID
            ├── F LEAF id:f ag-Grid-AutoColumn:"F"
            └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            · ├─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            · │ └── B LEAF id:b ag-Grid-AutoColumn:"B"
            · ├── C LEAF id:c ag-Grid-AutoColumn:"C"
            · ├── D LEAF id:d ag-Grid-AutoColumn:"D"
            · └─┬ E filler id:row-group-0-A-1-E ag-Grid-AutoColumn:"E"
            · · └── E LEAF id:e ag-Grid-AutoColumn:"E"
        `);
    });
});
