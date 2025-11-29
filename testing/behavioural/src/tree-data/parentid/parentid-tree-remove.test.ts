import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, executeTransactionsAsync } from '../../test-utils';

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

        await new GridRows(api, '').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · └─┬ b GROUP id:b ag-Grid-AutoColumn:"b"
            · · └─┬ c GROUP id:c ag-Grid-AutoColumn:"c"
            · · · └── d LEAF id:d ag-Grid-AutoColumn:"d"
        `);

        applyTransactionChecked(api, { remove: [rowD] });
        applyTransactionChecked(api, { remove: [rowC] });

        const gridRows = new GridRows(api, '');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · └── b LEAF id:b ag-Grid-AutoColumn:"b"
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

        await new GridRows(api, '').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · └─┬ b GROUP id:b ag-Grid-AutoColumn:"b"
            · · └─┬ c-xDhjGsdDc GROUP id:c-xDhjGsdDc ag-Grid-AutoColumn:"c-xDhjGsdDc"
            · · · └── d-xDhjGsdDd LEAF id:d-xDhjGsdDd ag-Grid-AutoColumn:"d-xDhjGsdDd"
        `);

        applyTransactionChecked(api, { remove: [rowC] });

        const gridRows = new GridRows(api, '');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            │ └── b LEAF id:b ag-Grid-AutoColumn:"b"
            └── d-xDhjGsdDd LEAF id:d-xDhjGsdDd ag-Grid-AutoColumn:"d-xDhjGsdDd"
        `);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: warning #271',
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

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            │ ├── b LEAF id:b ag-Grid-AutoColumn:"b"
            │ └── c LEAF id:c ag-Grid-AutoColumn:"c"
            └── d LEAF id:d ag-Grid-AutoColumn:"d"
        `);

        applyTransactionChecked(api, { remove: [rowB, rowC] });

        await new GridRows(api, 'Transaction[0]').check(`
            ROOT id:ROOT_NODE_ID
            ├── a LEAF id:a ag-Grid-AutoColumn:"a"
            └── d LEAF id:d ag-Grid-AutoColumn:"d"
        `);

        applyTransactionChecked(api, { remove: [rowA] });

        await new GridRows(api, 'Transaction[0]').check(`
            ROOT id:ROOT_NODE_ID
            └── d LEAF id:d ag-Grid-AutoColumn:"d"
        `);

        applyTransactionChecked(api, { add: [rowC, rowA, rowB] });

        await new GridRows(api, 'finalSync').check(`
            ROOT id:ROOT_NODE_ID
            ├── d LEAF id:d ag-Grid-AutoColumn:"d"
            └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · └── b LEAF id:b ag-Grid-AutoColumn:"b"
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

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            │ ├── b LEAF id:b ag-Grid-AutoColumn:"b"
            │ └── c LEAF id:c ag-Grid-AutoColumn:"c"
            └── d LEAF id:d ag-Grid-AutoColumn:"d"
        `);

        applyTransactionChecked(api, { remove: [rowA, rowB, rowC], add: [rowC, rowA, rowB] });

        await new GridRows(api, 'finalTogether').check(`
            ROOT id:ROOT_NODE_ID
            ├── d LEAF id:d ag-Grid-AutoColumn:"d"
            └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · └── b LEAF id:b ag-Grid-AutoColumn:"b"
        `);

        applyTransactionChecked(api, { update: [{ ...rowA, parentId: 'd' }] });

        await new GridRows(api, 'moved').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ d GROUP id:d ag-Grid-AutoColumn:"d"
            · └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · · └── b LEAF id:b ag-Grid-AutoColumn:"b"
        `);

        applyTransactionChecked(api, { update: [{ ...rowD, parentId: 'x' }], add: [{ id: 'x' }] });

        await new GridRows(api, 'moved 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ x GROUP id:x ag-Grid-AutoColumn:"x"
            · └─┬ d GROUP id:d ag-Grid-AutoColumn:"d"
            · · └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · · · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · · · └── b LEAF id:b ag-Grid-AutoColumn:"b"
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

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            │ ├── b LEAF id:b ag-Grid-AutoColumn:"b"
            │ └── c LEAF id:c ag-Grid-AutoColumn:"c"
            └── d LEAF id:d ag-Grid-AutoColumn:"d"
        `);

        await executeTransactionsAsync(
            [{ remove: [rowB, rowC] }, { remove: [rowA] }, { add: [rowC, rowB] }, { add: [rowA] }],
            api
        );

        await new GridRows(api, 'finalTogether').check(`
            ROOT id:ROOT_NODE_ID
            ├── d LEAF id:d ag-Grid-AutoColumn:"d"
            └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · └── b LEAF id:b ag-Grid-AutoColumn:"b"
        `);

        await executeTransactionsAsync({ update: [{ ...rowA, parentId: 'd' }] }, api);

        await new GridRows(api, 'moved').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ d GROUP id:d ag-Grid-AutoColumn:"d"
            · └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · · └── b LEAF id:b ag-Grid-AutoColumn:"b"
        `);

        await executeTransactionsAsync({ update: [{ ...rowD, parentId: 'x' }], add: [{ id: 'x' }] }, api);

        await new GridRows(api, 'moved 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ x GROUP id:x ag-Grid-AutoColumn:"x"
            · └─┬ d GROUP id:d ag-Grid-AutoColumn:"d"
            · · └─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            · · · ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            · · · └── b LEAF id:b ag-Grid-AutoColumn:"b"
        `);
    });
});
