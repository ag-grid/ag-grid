import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, executeTransactionsAsync } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

const gridRowsOptions: GridRowsOptions = {
    checkDom: true,
};

describe('ag-grid parentId tree remove', () => {
    let consoleWarnSpy: MockInstance | undefined;

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
        consoleWarnSpy?.mockRestore();
    });

    test('tree transaction remove', async () => {
        const rowA = { id: 'a', orgHierarchy: ['A'] };
        const rowB = { id: 'b', parentId: 'a' };
        const rowC = { id: 'c', parentId: 'b' };
        const rowD = { id: 'd', parentId: 'c' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowB, rowC, rowD],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ a GROUP id:a
            · └─┬ b GROUP id:b
            · · └─┬ c GROUP id:c
            · · · └── d LEAF id:d
        `);

        api.applyTransaction({ remove: [rowD] });
        api.applyTransaction({ remove: [rowC] });

        const gridRows = new GridRows(api, '', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ a GROUP id:a
            · └── b LEAF id:b
        `);

        const rows = gridRows.rootAllLeafChildren;
        expect(rows.length).toBe(2);
        expect(rows[0].data).toEqual(rowA);
        expect(rows[1].data).toEqual(rowB);
    });

    test('tree transaction remove parent with children raises warning', async () => {
        const rowA = { id: 'a', orgHierarchy: ['A'] };
        const rowB = { id: 'b', parentId: 'a' };
        const rowC = { id: 'c-xDhjGsdDc', parentId: 'b' };
        const rowD = { id: 'd-xDhjGsdDd', parentId: 'c-xDhjGsdDc' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowB, rowC, rowD],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        await new GridRows(api, '', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ a GROUP id:a
            · └─┬ b GROUP id:b
            · · └─┬ c-xDhjGsdDc GROUP id:c-xDhjGsdDc
            · · · └── d-xDhjGsdDd LEAF id:d-xDhjGsdDd
        `);

        api.applyTransaction({ remove: [rowC] });

        const gridRows = new GridRows(api, '', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a
            │ └── b LEAF id:b
            └── d-xDhjGsdDd LEAF id:d-xDhjGsdDd
        `);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: error #271',
            "Parent row not found for row with id='d-xDhjGsdDd' and parent id='c-xDhjGsdDc'. Showing row with id='d-xDhjGsdDd' as a root-level node.",
            expect.anything()
        );
    });

    test('ag-grid tree sync remove re-insert filler', async () => {
        // This is actually a very important test. This proves that the implementation is commutative,
        // i.e. the grouping of the remove and insert operations does not matter.
        // i.e. executing a remove-add in the same transaction, in multiple async transactions followed by a single commit,
        // or in isolated transactions does not change the final resulting order of the rows.

        const rowA = { id: 'a' };
        const rowB = { id: 'b', parentId: 'a' };
        const rowC = { id: 'c', parentId: 'a' };
        const rowD = { id: 'd' };

        const rowData = [rowA, rowB, rowC, rowD];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ a GROUP id:a
                │ ├── b LEAF id:b
                │ └── c LEAF id:c
                └── d LEAF id:d
            `);

        api.applyTransaction({ remove: [rowB, rowC] });

        await new GridRows(api, 'Transaction[0]', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├── a LEAF id:a
                └── d LEAF id:d
            `);

        api.applyTransaction({ remove: [rowA] });

        await new GridRows(api, 'Transaction[0]', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └── d LEAF id:d
            `);

        api.applyTransaction({ add: [rowC, rowA, rowB] });

        await new GridRows(api, 'finalSync', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├── d LEAF id:d
                └─┬ a GROUP id:a
                · ├── c LEAF id:c
                · └── b LEAF id:b
            `);
    });

    test('ag-grid tree same transaction remove re-insert', async () => {
        const rowA = { id: 'a' };
        const rowB = { id: 'b', parentId: 'a' };
        const rowC = { id: 'c', parentId: 'a' };
        const rowD = { id: 'd' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowB, rowC, rowD],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'initial', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ a GROUP id:a
                │ ├── b LEAF id:b
                │ └── c LEAF id:c
                └── d LEAF id:d
            `);

        api.applyTransaction({ remove: [rowA, rowB, rowC], add: [rowC, rowA, rowB] });

        await new GridRows(api, 'finalTogether', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├── d LEAF id:d
                └─┬ a GROUP id:a
                · ├── c LEAF id:c
                · └── b LEAF id:b
            `);

        api.applyTransaction({ update: [{ ...rowA, parentId: 'd' }] });

        await new GridRows(api, 'moved', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ d GROUP id:d
                · └─┬ a GROUP id:a
                · · ├── c LEAF id:c
                · · └── b LEAF id:b
            `);

        api.applyTransaction({ update: [{ ...rowD, parentId: 'x' }], add: [{ id: 'x' }] });

        await new GridRows(api, 'moved 2', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ x GROUP id:x
                · └─┬ d GROUP id:d
                · · └─┬ a GROUP id:a
                · · · ├── c LEAF id:c
                · · · └── b LEAF id:b
            `);
    });

    test('ag-grid tree async remove re-insert', async () => {
        const rowA = { id: 'a' };
        const rowB = { id: 'b', parentId: 'a' };
        const rowC = { id: 'c', parentId: 'a' };
        const rowD = { id: 'd' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowB, rowC, rowD],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a
            │ ├── b LEAF id:b
            │ └── c LEAF id:c
            └── d LEAF id:d
        `);

        await executeTransactionsAsync(
            [{ remove: [rowB, rowC] }, { remove: [rowA] }, { add: [rowC, rowB] }, { add: [rowA] }],
            api
        );

        await new GridRows(api, 'finalTogether', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── d LEAF id:d
            └─┬ a GROUP id:a
            · ├── c LEAF id:c
            · └── b LEAF id:b
        `);

        await executeTransactionsAsync({ update: [{ ...rowA, parentId: 'd' }] }, api);

        await new GridRows(api, 'moved', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ d GROUP id:d
            · └─┬ a GROUP id:a
            · · ├── c LEAF id:c
            · · └── b LEAF id:b
        `);

        await executeTransactionsAsync({ update: [{ ...rowD, parentId: 'x' }], add: [{ id: 'x' }] }, api);

        await new GridRows(api, 'moved 2', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ x GROUP id:x
            · └─┬ d GROUP id:d
            · · └─┬ a GROUP id:a
            · · · ├── c LEAF id:c
            · · · └── b LEAF id:b
        `);
    });
});
