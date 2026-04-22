import { ClientSideRowModelModule, TextFilterModule } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

describe('CSRM stage dispatch', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('flat grid without filter module', () => {
        test('flat grid works without filter module', async () => {
            const api = await gridsManager.createGridAndWait('flat-no-filter', {
                columnDefs: [{ field: 'name' }, { field: 'value' }],
                rowData: [
                    { name: 'A', value: 1 },
                    { name: 'B', value: 2 },
                    { name: 'C', value: 3 },
                ],
            });

            const gridRows = new GridRows(api, 'initial');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"A" value:1
                ├── LEAF id:1 name:"B" value:2
                └── LEAF id:2 name:"C" value:3
            `);
        });

        test('flat grid sorts correctly without filter module', async () => {
            const api = await gridsManager.createGridAndWait('flat-sort-no-filter', {
                columnDefs: [{ field: 'name', sort: 'desc' }, { field: 'value' }],
                rowData: [
                    { name: 'A', value: 1 },
                    { name: 'B', value: 2 },
                    { name: 'C', value: 3 },
                ],
            });

            const gridRows = new GridRows(api, 'sorted desc');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 name:"C" value:3
                ├── LEAF id:1 name:"B" value:2
                └── LEAF id:0 name:"A" value:1
            `);
        });
    });

    describe('hierarchical grid without filter module', () => {
        const treeGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, TreeDataModule],
        });

        beforeEach(() => {
            treeGridsManager.reset();
        });

        afterEach(() => {
            treeGridsManager.reset();
        });

        test('tree data works without filter module', async () => {
            const api = await treeGridsManager.createGridAndWait('tree-no-filter', {
                columnDefs: [{ field: 'name' }],
                rowData: [
                    { id: '1', path: ['A'], name: 'A' },
                    { id: '2', path: ['A', 'B'], name: 'B' },
                    { id: '3', path: ['A', 'C'], name: 'C' },
                ],
                treeData: true,
                getDataPath: (data: any) => data.path,
                getRowId: ({ data }: { data: any }) => data.id,
                groupDefaultExpanded: -1,
            });

            const gridRows = new GridRows(api, 'initial');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"A"
                · ├── B LEAF id:2 ag-Grid-AutoColumn:"B" name:"B"
                · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"C"
            `);
        });

        test('tree data sorts correctly without filter module', async () => {
            const api = await treeGridsManager.createGridAndWait('tree-sort-no-filter', {
                columnDefs: [{ field: 'name', sort: 'desc' }],
                rowData: [
                    { id: '1', path: ['A'], name: 'A' },
                    { id: '2', path: ['A', 'B'], name: 'B' },
                    { id: '3', path: ['A', 'C'], name: 'C' },
                ],
                treeData: true,
                getDataPath: (data: any) => data.path,
                getRowId: ({ data }: { data: any }) => data.id,
                groupDefaultExpanded: -1,
            });

            const gridRows = new GridRows(api, 'sorted desc');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"A"
                · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"C"
                · └── B LEAF id:2 ag-Grid-AutoColumn:"B" name:"B"
            `);
        });

        test('tree data handles transactions without filter module', async () => {
            const api: GridApi = await treeGridsManager.createGridAndWait('tree-txn-no-filter', {
                columnDefs: [{ field: 'name' }],
                rowData: [
                    { id: '1', path: ['A'], name: 'A' },
                    { id: '2', path: ['A', 'B'], name: 'B' },
                ],
                treeData: true,
                getDataPath: (data: any) => data.path,
                getRowId: ({ data }: { data: any }) => data.id,
                groupDefaultExpanded: -1,
            });

            api.applyTransaction({ add: [{ id: '3', path: ['A', 'C'], name: 'C' }] });

            const gridRows = new GridRows(api, 'after add');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"A"
                · ├── B LEAF id:2 ag-Grid-AutoColumn:"B" name:"B"
                · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"C"
            `);
        });
    });

    describe('hierarchical grid with filter module', () => {
        const filterGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, TreeDataModule, TextFilterModule],
        });

        beforeEach(() => {
            filterGridsManager.reset();
        });

        afterEach(() => {
            filterGridsManager.reset();
        });

        test('tree data filtering works with filter module', async () => {
            const api = await filterGridsManager.createGridAndWait('tree-with-filter', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
                rowData: [
                    { id: '1', path: ['A'], name: 'A' },
                    { id: '2', path: ['A', 'Banana'], name: 'Banana' },
                    { id: '3', path: ['A', 'Cherry'], name: 'Cherry' },
                ],
                treeData: true,
                getDataPath: (data: any) => data.path,
                getRowId: ({ data }: { data: any }) => data.id,
                groupDefaultExpanded: -1,
            });

            api.setFilterModel({ name: { filterType: 'text', type: 'contains', filter: 'Ban' } });

            const gridRows = new GridRows(api, 'filtered');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"A"
                · └── Banana LEAF id:2 ag-Grid-AutoColumn:"Banana" name:"Banana"
            `);

            api.setFilterModel(null);

            const gridRowsAfterClear = new GridRows(api, 'filter cleared');
            await gridRowsAfterClear.check(`
                ROOT id:ROOT_NODE_ID
                └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"A"
                · ├── Banana LEAF id:2 ag-Grid-AutoColumn:"Banana" name:"Banana"
                · └── Cherry LEAF id:3 ag-Grid-AutoColumn:"Cherry" name:"Cherry"
            `);
        });
    });

    describe('row grouping without filter module', () => {
        const groupGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, RowGroupingModule],
        });

        beforeEach(() => {
            groupGridsManager.reset();
        });

        afterEach(() => {
            groupGridsManager.reset();
        });

        test('row grouping works without filter module', async () => {
            const api = await groupGridsManager.createGridAndWait('group-no-filter', {
                columnDefs: [{ field: 'category', rowGroup: true, hide: true }, { field: 'name' }],
                rowData: [
                    { category: 'Fruit', name: 'Apple' },
                    { category: 'Fruit', name: 'Banana' },
                    { category: 'Veggie', name: 'Carrot' },
                ],
                groupDefaultExpanded: -1,
            });

            const gridRows = new GridRows(api, 'initial');
            await gridRows.check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-category-Fruit ag-Grid-AutoColumn:"Fruit"
                │ ├── LEAF id:0 category:"Fruit" name:"Apple"
                │ └── LEAF id:1 category:"Fruit" name:"Banana"
                └─┬ LEAF_GROUP id:row-group-category-Veggie ag-Grid-AutoColumn:"Veggie"
                · └── LEAF id:2 category:"Veggie" name:"Carrot"
            `);
        });
    });
});
