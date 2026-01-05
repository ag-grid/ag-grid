import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, executeTransactionsAsync } from '../../test-utils';

describe('ag-grid hierarchical tree data reset', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
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
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
        });

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const transactionResult = applyTransactionChecked(api, {
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

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #268',
            "Transactions aren't supported with tree data when using treeDataChildrenField",
            expect.anything()
        );

        await new GridRows(api, 'tree').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B"
            └─┬ C GROUP id:C ag-Grid-AutoColumn:"C"
            · ├── D LEAF id:D ag-Grid-AutoColumn:"D"
            · └── E LEAF id:E ag-Grid-AutoColumn:"E"
        `);
    });
});
