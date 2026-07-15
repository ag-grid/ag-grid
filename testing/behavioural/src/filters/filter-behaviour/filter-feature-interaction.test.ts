import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { RowGroupingModule, SetFilterModule, TreeDataModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Black-box coverage for how column filters compose with OTHER grid features (sort, pagination, row
 * grouping, tree data, rowData replacement). Complements grouping-filter-aggregates-stage (aggregate
 * filtering) by exercising plain leaf-value filtering driven through the public filter-model API.
 */
describe('Filter + feature interaction', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            PaginationModule,
            RowGroupingModule,
            TreeDataModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('filter + sort: the filtered set stays sorted and changing the sort keeps the filter', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter' },
                { field: 'age', filter: 'agNumberColumnFilter' },
            ],
            rowData: [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 20 },
                { name: 'Bob', age: 45 },
                { name: 'Dave', age: 10 },
                { name: 'Eve', age: 50 },
            ],
        });

        // Sort by name ascending — no filter yet.
        api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }], defaultState: { sort: null } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(5);
        await new GridColumns(api, 'sort only columns').checkColumns(`
            CENTER
            ├── name "Name" width:200 sort:asc
            └── age "Age" width:200
        `);
        await new GridRows(api, 'sort asc, no filter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Alice" age:20
            ├── LEAF id:2 name:"Bob" age:45
            ├── LEAF id:0 name:"Charlie" age:30
            ├── LEAF id:3 name:"Dave" age:10
            └── LEAF id:4 name:"Eve" age:50
        `);

        // Apply age > 15 — Dave (10) drops; the remaining rows stay name-ascending.
        api.setFilterModel({ age: { filterType: 'number', type: 'greaterThan', filter: 15 } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(4);
        await new GridRows(api, 'age>15 sorted name asc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 name:"Alice" age:20
            ├── LEAF id:2 name:"Bob" age:45
            ├── LEAF id:0 name:"Charlie" age:30
            └── LEAF id:4 name:"Eve" age:50
        `);

        // Flip the sort to descending — the filter must remain applied.
        api.applyColumnState({ state: [{ colId: 'name', sort: 'desc' }], defaultState: { sort: null } });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: { filterType: 'number', type: 'greaterThan', filter: 15 } });
        expect(api.getDisplayedRowCount()).toBe(4);
        await new GridRows(api, 'age>15 sorted name desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 name:"Eve" age:50
            ├── LEAF id:0 name:"Charlie" age:30
            ├── LEAF id:2 name:"Bob" age:45
            └── LEAF id:1 name:"Alice" age:20
        `);

        // Clear the filter — the descending sort must survive.
        api.setFilterModel(null);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getDisplayedRowCount()).toBe(5);
        await new GridRows(api, 'no filter sorted name desc').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 name:"Eve" age:50
            ├── LEAF id:3 name:"Dave" age:10
            ├── LEAF id:0 name:"Charlie" age:30
            ├── LEAF id:2 name:"Bob" age:45
            └── LEAF id:1 name:"Alice" age:20
        `);
    });

    test('filter + pagination: filtered row count drives the page count and clamps the current page', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            pagination: true,
            paginationPageSize: 2,
            paginationPageSizeSelector: false,
            columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
            rowData: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }],
        });

        // 6 rows / pageSize 2 => 3 pages; navigate to the last page.
        expect(api.paginationGetTotalPages()).toBe(3);
        expect(api.paginationGetRowCount()).toBe(6);
        api.paginationGoToLastPage();
        await asyncSetTimeout(0);
        expect(api.paginationGetCurrentPage()).toBe(2);
        await new GridRows(api, 'pagination unfiltered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:1
            ├── LEAF id:1 value:2
            ├── LEAF id:2 value:3
            ├── LEAF id:3 value:4
            ├── LEAF id:4 value:5
            └── LEAF id:5 value:6
        `);

        // Filter value <= 2 => 2 rows / pageSize 2 => 1 page; the out-of-range current page clamps to 0.
        api.setFilterModel({ value: { filterType: 'number', type: 'lessThanOrEqual', filter: 2 } });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
        expect(api.paginationGetRowCount()).toBe(2);
        expect(api.paginationGetTotalPages()).toBe(1);
        expect(api.paginationGetCurrentPage()).toBe(0);
        await new GridRows(api, 'pagination filtered to one page').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:1
            └── LEAF id:1 value:2
        `);

        // Clearing the filter restores the full 3-page count.
        api.setFilterModel(null);
        await asyncSetTimeout(0);
        expect(api.paginationGetRowCount()).toBe(6);
        expect(api.paginationGetTotalPages()).toBe(3);
        await new GridRows(api, 'pagination filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 value:1
            ├── LEAF id:1 value:2
            ├── LEAF id:2 value:3
            ├── LEAF id:3 value:4
            ├── LEAF id:4 value:5
            └── LEAF id:5 value:6
        `);
    });

    test('filter + row grouping: leaf-value filtering reshapes the groups and their child counts', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', filter: 'agTextColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            rowData: [
                { country: 'Ireland', sport: 'Swimming' },
                { country: 'Ireland', sport: 'Cycling' },
                { country: 'Italy', sport: 'Swimming' },
                { country: 'Italy', sport: 'Skiing' },
                { country: 'France', sport: 'Cycling' },
            ],
        });

        await new GridRows(api, 'grouping unfiltered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:0 country:"Ireland" sport:"Swimming"
            │ └── LEAF id:1 country:"Ireland" sport:"Cycling"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:2 country:"Italy" sport:"Swimming"
            │ └── LEAF id:3 country:"Italy" sport:"Skiing"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" sport:"Cycling"
        `);

        // sport = Swimming — France has no swimmer and drops; Ireland/Italy keep only the swimming leaf.
        api.setFilterModel({ sport: { filterType: 'text', type: 'equals', filter: 'Swimming' } });
        await asyncSetTimeout(0);
        await new GridRows(api, 'grouping sport=Swimming').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:0 country:"Ireland" sport:"Swimming"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 country:"Italy" sport:"Swimming"
        `);

        // sport = Cycling — reshapes to Ireland + France; Italy drops.
        api.setFilterModel({ sport: { filterType: 'text', type: 'equals', filter: 'Cycling' } });
        await asyncSetTimeout(0);
        await new GridRows(api, 'grouping sport=Cycling').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" sport:"Cycling"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" sport:"Cycling"
        `);

        api.setFilterModel(null);
        await asyncSetTimeout(0);
        await new GridRows(api, 'grouping filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:0 country:"Ireland" sport:"Swimming"
            │ └── LEAF id:1 country:"Ireland" sport:"Cycling"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:2 country:"Italy" sport:"Swimming"
            │ └── LEAF id:3 country:"Italy" sport:"Skiing"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" sport:"Cycling"
        `);
    });

    test('filter + tree data: filtering leaf values keeps the ancestors of every match', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'n' }, { field: 'size', filter: 'agNumberColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Tree' },
            treeData: true,
            groupDefaultExpanded: -1,
            groupSuppressBlankHeader: true,
            rowData: [
                { id: 'A', n: 'A', size: 0 },
                { id: 'B', parentId: 'A', n: 'B', size: 5 },
                { id: 'C', parentId: 'A', n: 'C', size: 10 },
                { id: 'D', n: 'D', size: 0 },
                { id: 'E', parentId: 'D', n: 'E', size: 2 },
            ],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'tree unfiltered').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" size:0
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" size:5
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" size:10
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" n:"D" size:0
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" n:"E" size:2
        `);

        // size > 4 — B and C match; A (size 0) is kept purely as their ancestor. D/E drop entirely.
        api.setFilterModel({ size: { filterType: 'number', type: 'greaterThan', filter: 4 } });
        await asyncSetTimeout(0);
        await new GridRows(api, 'tree size>4 keeps ancestor A').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" size:0
            · ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" size:5
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" size:10
        `);

        // size > 8 — only C matches; A still retained as ancestor, B now drops.
        api.setFilterModel({ size: { filterType: 'number', type: 'greaterThan', filter: 8 } });
        await asyncSetTimeout(0);
        await new GridRows(api, 'tree size>8 keeps ancestor A only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" size:0
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" size:10
        `);

        api.setFilterModel(null);
        await asyncSetTimeout(0);
        await new GridRows(api, 'tree filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" size:0
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" size:5
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" size:10
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" n:"D" size:0
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" n:"E" size:2
        `);
    });

    test('text filter re-applies to fresh data after rowData is replaced via setGridOption', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            rowData: [{ name: 'Apple' }, { name: 'Banana' }, { name: 'Avocado' }],
        });

        await api.setColumnFilterModel('name', { filterType: 'text', type: 'startsWith', filter: 'A' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'startsWith A original data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apple"
            └── LEAF id:2 name:"Avocado"
        `);

        // Replace the data — the applied filter must re-run against the new rows unchanged.
        api.setGridOption('rowData', [{ name: 'Apricot' }, { name: 'Cherry' }, { name: 'Almond' }]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('name')).toEqual({ filterType: 'text', type: 'startsWith', filter: 'A' });
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'startsWith A replaced data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Apricot"
            └── LEAF id:2 name:"Almond"
        `);
    });

    test('set filter re-syncs its model to the new data on rowData replacement, pruning values that vanished', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'France' }, { country: 'Spain' }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Italy', 'France'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
        await new GridRows(api, 'set filter original data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            └── LEAF id:1 country:"France"
        `);

        // New data has France but not Italy — the set filter drops the now-absent 'Italy' from the model,
        // leaving only 'France' (values are sourced from the data, so they re-sync on replacement).
        api.setGridOption('rowData', [{ country: 'France' }, { country: 'Germany' }, { country: 'Spain' }]);
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['France'] });
        expect(api.getDisplayedRowCount()).toBe(1);
        await new GridRows(api, 'set filter replaced data').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"France"
        `);
    });
});
