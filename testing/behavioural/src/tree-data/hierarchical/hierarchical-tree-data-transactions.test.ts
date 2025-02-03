import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, executeTransactionsAsync } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

const defaultGridRowsOptions: GridRowsOptions = {
    checkDom: true,
};

describe('ag-grid hierarchical tree data reset', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleErrorSpy?.mockRestore();
    });

    test('transactions are no-ops and an error is generated', async () => {
        const rowData = [
            { id: 'A', children: [{ id: 'B' }] },
            { id: 'C', children: [{ id: 'D' }, { id: 'E' }] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            ['treeDataChildrenField' as any]: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
        });

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        const transactionResult = api.applyTransaction({
            add: [{ id: 'F', children: [{ id: 'G' }] }],
            remove: [{ id: 'A' }],
            update: [{ id: 'C', children: [{ id: 'D' }] }],
        });

        expect(transactionResult).toEqual({ add: [], remove: [], update: [] });

        const asyncTransactionResult = await executeTransactionsAsync(
            [{ add: [{ id: 'F', children: [{ id: 'G' }] }] }, { update: [{ id: 'C', children: [{ id: 'D' }] }] }],
            api
        );

        expect(asyncTransactionResult).toEqual([
            { add: [], remove: [], update: [] },
            { add: [], remove: [], update: [] },
        ]);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'AG Grid: error #268',
            "Transactions aren't supported with tree data when using treeDataChildrenField",
            expect.anything()
        );

        await new GridRows(api, 'tree', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A
            │ └── B LEAF id:B
            └─┬ C GROUP id:C
            · ├── D LEAF id:D
            · └── E LEAF id:E
        `);
    });
});
