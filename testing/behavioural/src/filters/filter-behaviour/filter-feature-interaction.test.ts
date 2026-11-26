import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    runToIdle,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';
import { onTestFinished, vi } from 'vitest';

import type { GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    PaginationModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    AggregationModule,
    FormulaModule,
    MasterDetailModule,
    MultiFilterModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    SetFilterModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

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
            MultiFilterModule,
            PaginationModule,
            RowGroupingModule,
            AggregationModule,
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

    test("filter + tree data: a Set Filter lists the values of the rows the other filters show, a match's relatives included", async () => {
        for (const excludeChildrenWhenTreeDataFiltering of [false, true]) {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'n', filter: 'agSetColumnFilter' }],
                autoGroupColumnDef: { filter: 'agTextColumnFilter' },
                treeData: true,
                excludeChildrenWhenTreeDataFiltering,
                rowData: [
                    { id: 'A', n: 'A' },
                    { id: 'B', parentId: 'A', n: 'B' },
                    { id: 'C', parentId: 'A', n: 'C' },
                    { id: 'D', n: 'D' },
                    { id: 'E', parentId: 'D', n: 'E' },
                ],
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
            });
            const listed = async (match: string) => {
                api.setFilterModel({ 'ag-Grid-AutoColumn': { filterType: 'text', type: 'equals', filter: match } });
                await asyncSetTimeout(0);
                const filter = await ColumnFilterHarness.open(api, 'n');
                const labels = filter.setFilterItemLabels();
                api.hidePopupMenu();
                return labels;
            };
            // A matches, and its children are shown unless excluded.
            expect({ excludeChildrenWhenTreeDataFiltering, labels: await listed('A') }).toEqual({
                excludeChildrenWhenTreeDataFiltering,
                labels: excludeChildrenWhenTreeDataFiltering ? ['(Select All)', 'A'] : ['(Select All)', 'A', 'B', 'C'],
            });
            // C matches, and A is shown as its parent either way.
            expect({ excludeChildrenWhenTreeDataFiltering, labels: await listed('C') }).toEqual({
                excludeChildrenWhenTreeDataFiltering,
                labels: ['(Select All)', 'A', 'C'],
            });
            gridsManager.reset();
        }
    });

    test("filter + tree data: a Multi Filter's Set child lists the rows its sibling shows, a match's relatives included", async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
        const listed: Record<string, string[]> = {};
        for (const enableFilterHandlers of [false, true]) {
            for (const excludeChildrenWhenTreeDataFiltering of [false, true]) {
                const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                    enableFilterHandlers,
                    columnDefs: [
                        {
                            field: 'n',
                            filter: 'agMultiColumnFilter',
                            filterParams: {
                                filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }],
                            },
                        },
                    ],
                    autoGroupColumnDef: {},
                    treeData: true,
                    excludeChildrenWhenTreeDataFiltering,
                    rowData: [
                        { id: 'A', n: 'A' },
                        { id: 'B', parentId: 'A', n: 'B' },
                        { id: 'C', parentId: 'A', n: 'C' },
                        { id: 'D', n: 'D' },
                    ],
                    getRowId: (params) => params.data.id,
                    treeDataParentIdField: 'parentId',
                });
                await api.setColumnFilterModel('n', {
                    filterType: 'multi',
                    filterModels: [{ filterType: 'text', type: 'equals', filter: 'A' }, null],
                });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                const filter = await ColumnFilterHarness.open(api, 'n');
                listed[`handlers ${enableFilterHandlers}, exclude ${excludeChildrenWhenTreeDataFiltering}`] =
                    filter.setFilterItemLabels();
                gridsManager.reset();
            }
        }
        // A matches through the Text child, and its children are shown unless excluded.
        expect(listed).toEqual({
            'handlers false, exclude false': ['(Select All)', 'A', 'B', 'C'],
            'handlers false, exclude true': ['(Select All)', 'A'],
            'handlers true, exclude false': ['(Select All)', 'A', 'B', 'C'],
            'handlers true, exclude true': ['(Select All)', 'A'],
        });
    });

    test.each([
        [false, 'n'],
        [true, 'n'],
        [false, 'ag-Grid-AutoColumn'],
        [true, 'ag-Grid-AutoColumn'],
    ])(
        'with enableFilterHandlers %s, new filterParams on column %s re-filter the rows once, raising no filterChanged',
        async (enableFilterHandlers, colId) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
            const textFilter = (caseSensitive: boolean) => ({
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive },
            });
            const counts = { modelUpdated: 0, filterChanged: 0 };
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: [{ field: 'n', ...textFilter(true) }],
                autoGroupColumnDef: textFilter(true),
                treeData: true,
                groupDefaultExpanded: -1,
                rowData: [
                    { id: 'A', n: 'A' },
                    { id: 'B', parentId: 'A', n: 'B' },
                    { id: 'D', n: 'D' },
                ],
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
                onModelUpdated: () => ++counts.modelUpdated,
                onFilterChanged: () => ++counts.filterChanged,
            });
            api.setFilterModel({ [colId]: { filterType: 'text', type: 'equals', filter: 'a' } });
            await asyncSetTimeout(0);
            expect({ displayed: api.getDisplayedRowCount(), filterChanged: counts.filterChanged }).toEqual({
                displayed: 0,
                filterChanged: 1,
            });

            counts.modelUpdated = 0;
            counts.filterChanged = 0;
            if (colId === 'n') {
                api.setGridOption('columnDefs', [{ field: 'n', ...textFilter(false) }]);
            } else {
                api.setGridOption('autoGroupColumnDef', textFilter(false));
            }
            await asyncSetTimeout(0);

            const displayed: (string | undefined)[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                displayed.push(api.getDisplayedRowAtIndex(i)?.id);
            }
            expect(api.getFilterModel()).toEqual({ [colId]: { filterType: 'text', type: 'equals', filter: 'a' } });
            expect(displayed).toEqual(['A', 'B']);
            expect(counts).toEqual({ modelUpdated: 1, filterChanged: 0 });
        }
    );

    test.each(['n', 'ag-Grid-AutoColumn'])(
        'with a sort on column %s, a new comparator re-sorts the rows once, raising no sortChanged',
        async (colId) => {
            const comparator = (reversed: boolean) => (_a: unknown, _b: unknown, nodeA: IRowNode, nodeB: IRowNode) => {
                const order = String(nodeA.data.n).localeCompare(String(nodeB.data.n));
                return reversed ? -order : order;
            };
            const counts = { modelUpdated: 0, sortChanged: 0 };
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'n', comparator: comparator(false) }],
                autoGroupColumnDef: { comparator: comparator(false) },
                treeData: true,
                groupDefaultExpanded: -1,
                rowData: [
                    { id: 'A', n: 'A' },
                    { id: 'B', parentId: 'A', n: 'B' },
                    { id: 'D', n: 'D' },
                ],
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
                onModelUpdated: () => ++counts.modelUpdated,
                onSortChanged: () => ++counts.sortChanged,
            });
            api.applyColumnState({ state: [{ colId, sort: 'asc' }] });
            await asyncSetTimeout(0);
            const order = () => {
                const ids: (string | undefined)[] = [];
                api.forEachNodeAfterFilterAndSort((node) => ids.push(node.id));
                return ids;
            };
            expect({ order: order(), sortChanged: counts.sortChanged }).toEqual({
                order: ['A', 'B', 'D'],
                sortChanged: 1,
            });

            counts.modelUpdated = 0;
            counts.sortChanged = 0;
            if (colId === 'n') {
                api.setGridOption('columnDefs', [{ field: 'n', comparator: comparator(true) }]);
            } else {
                api.setGridOption('autoGroupColumnDef', { comparator: comparator(true) });
            }
            await asyncSetTimeout(0);

            expect(order()).toEqual(['D', 'A', 'B']);
            expect(counts).toEqual({ modelUpdated: 1, sortChanged: 0 });
        }
    );

    test('with a sorted auto group column or a sorted column of a type, a comparator changed only through columnTypes re-sorts the rows once, raising no sortChanged', async () => {
        const comparator = (reversed: boolean) => (_a: unknown, _b: unknown, nodeA: IRowNode, nodeB: IRowNode) => {
            const order = String(nodeA.data.n).localeCompare(String(nodeB.data.n));
            return reversed ? -order : order;
        };
        const ascending = comparator(false);
        const descending = comparator(true);
        const counts = { modelUpdated: 0, sortChanged: 0 };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'n', type: 't' }],
            autoGroupColumnDef: { type: 'grp' },
            columnTypes: { grp: { comparator: ascending }, t: { comparator: ascending } },
            treeData: true,
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'A', n: 'A' },
                { id: 'B', parentId: 'A', n: 'B' },
                { id: 'D', n: 'D' },
            ],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
            onModelUpdated: () => ++counts.modelUpdated,
            onSortChanged: () => ++counts.sortChanged,
        });
        const order = () => {
            const ids: (string | undefined)[] = [];
            api.forEachNodeAfterFilterAndSort((node) => ids.push(node.id));
            return ids;
        };

        for (const [colId, columnTypes] of [
            ['ag-Grid-AutoColumn', { grp: { comparator: descending }, t: { comparator: ascending } }],
            ['n', { grp: { comparator: descending }, t: { comparator: descending } }],
        ] as const) {
            counts.sortChanged = 0;
            api.applyColumnState({ state: [{ colId, sort: 'asc' }], defaultState: { sort: null } });
            await asyncSetTimeout(0);
            expect({ colId, order: order(), sortChanged: counts.sortChanged }).toEqual({
                colId,
                order: ['A', 'B', 'D'],
                sortChanged: 1,
            });

            counts.modelUpdated = 0;
            counts.sortChanged = 0;
            api.setGridOption('columnTypes', columnTypes);
            await asyncSetTimeout(0);

            expect({ colId, order: order(), counts }).toEqual({
                colId,
                order: ['D', 'A', 'B'],
                counts: { modelUpdated: 1, sortChanged: 0 },
            });
        }
    });

    test('with a filtered auto group column, filterParams changed only through columnTypes re-filter the rows once, raising no filterChanged', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
        const textFilter = (caseSensitive: boolean) => ({
            filter: 'agTextColumnFilter',
            filterParams: { caseSensitive },
        });
        const counts = { modelUpdated: 0, filterChanged: 0 };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: false,
            columnDefs: [{ field: 'n' }],
            autoGroupColumnDef: { type: 'grp' },
            columnTypes: { grp: textFilter(true) },
            treeData: true,
            groupDefaultExpanded: -1,
            rowData: [
                { id: 'A', n: 'A' },
                { id: 'B', parentId: 'A', n: 'B' },
                { id: 'D', n: 'D' },
            ],
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
            onModelUpdated: () => ++counts.modelUpdated,
            onFilterChanged: () => ++counts.filterChanged,
        });
        const model = { 'ag-Grid-AutoColumn': { filterType: 'text', type: 'equals', filter: 'a' } };
        api.setFilterModel(model);
        await asyncSetTimeout(0);
        expect({ displayed: api.getDisplayedRowCount(), filterChanged: counts.filterChanged }).toEqual({
            displayed: 0,
            filterChanged: 1,
        });

        counts.modelUpdated = 0;
        counts.filterChanged = 0;
        api.setGridOption('columnTypes', { grp: textFilter(false) });
        await asyncSetTimeout(0);

        const displayed: (string | undefined)[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            displayed.push(api.getDisplayedRowAtIndex(i)?.id);
        }
        expect(api.getFilterModel()).toEqual(model);
        expect(displayed).toEqual(['A', 'B']);
        expect(counts).toEqual({ modelUpdated: 1, filterChanged: 0 });
    });

    test('with the server-side row model, a comparator changed only through columnTypes on a sorted auto group column requests nothing from the server', async () => {
        const comparator = (reversed: boolean) => (a: string, b: string) => (reversed ? -1 : 1) * a.localeCompare(b);
        let getRowsCalls = 0;
        const api: GridApi = await gridsManager.createGridAndWait(
            'grid1',
            {
                rowModelType: 'serverSide',
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }],
                autoGroupColumnDef: { type: 'grp' },
                columnTypes: { grp: { comparator: comparator(false) } },
                serverSideDatasource: {
                    getRows: (params) => {
                        ++getRowsCalls;
                        params.success({ rowData: [{ country: 'B' }, { country: 'A' }], rowCount: 2 });
                    },
                },
            },
            { modules: [ServerSideRowModelModule] }
        );
        await waitForNoLoadingRows(api);
        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
        await waitForNoLoadingRows(api);
        const sort = () => api.getColumnState().find((state) => state.colId === 'ag-Grid-AutoColumn')?.sort;
        expect(sort()).toBe('asc');

        const callsBefore = getRowsCalls;
        await runToIdle(() => api.setGridOption('columnTypes', { grp: { comparator: comparator(true) } }));
        expect({ calls: getRowsCalls - callsBefore, sort: sort() }).toEqual({ calls: 0, sort: 'asc' });

        // Positive control: the same observer sees a server sort change after the same wait.
        await runToIdle(() => api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'desc' }] }));
        expect(getRowsCalls).toBeGreaterThan(callsBefore);
    });

    test('a sorted auto group column of the object data type refreshes no rows when another column is resized', async () => {
        const fmt = (params: { value: unknown }) => JSON.stringify(params.value);
        let modelUpdated = 0;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'w' }],
            autoGroupColumnDef: { field: 'o', valueFormatter: fmt },
            rowData: [
                { country: 'B', o: { n: 1 }, w: 1 },
                { country: 'A', o: { n: 2 }, w: 2 },
            ],
            onModelUpdated: () => ++modelUpdated,
        });
        const state = (colId: string) => api.getColumnState().find((s) => s.colId === colId);
        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
        await asyncSetTimeout(0);
        expect(state('ag-Grid-AutoColumn')?.sort).toBe('asc');

        modelUpdated = 0;
        api.applyColumnState({ state: [{ colId: 'w', width: 150 }] });
        await asyncSetTimeout(0);
        expect({ modelUpdated, width: state('w')?.width }).toEqual({ modelUpdated: 0, width: 150 });

        // Positive control: the same observer sees a sort change of the group column after the same wait.
        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'desc' }] });
        await asyncSetTimeout(0);
        expect(modelUpdated).toBe(1);
    });

    test('a filtered auto group column of the date data type refreshes no rows when another column is resized', async () => {
        let modelUpdated = 0;
        const api: GridApi = await gridsManager.createGridAndWait(
            'grid1',
            {
                columnDefs: [{ field: 'w' }],
                autoGroupColumnDef: { field: 'd', cellDataType: 'dateString', filter: 'agDateColumnFilter' },
                treeData: true,
                groupDefaultExpanded: -1,
                rowData: [
                    { id: 'A', d: '2024-01-01', w: 1 },
                    { id: 'B', d: '2024-02-01', w: 2 },
                ],
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
                onModelUpdated: () => ++modelUpdated,
            },
            { modules: [DateFilterModule] }
        );
        const model = { filterType: 'date', type: 'equals', dateFrom: '2024-01-01 00:00:00', dateTo: null };
        api.setFilterModel({ 'ag-Grid-AutoColumn': model });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(1);
        const state = (colId: string) => api.getColumnState().find((s) => s.colId === colId);

        modelUpdated = 0;
        api.applyColumnState({ state: [{ colId: 'w', width: 150 }] });
        await asyncSetTimeout(0);
        expect({ modelUpdated, width: state('w')?.width, displayed: api.getDisplayedRowCount() }).toEqual({
            modelUpdated: 0,
            width: 150,
            displayed: 1,
        });

        // Positive control: the same observer sees a sort change of the group column after the same wait.
        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'desc' }] });
        await asyncSetTimeout(0);
        expect(modelUpdated).toBe(1);
    });

    test('a new autoGroupColumnDef comparator on a sorted group column reverses the groups without re-aggregating them', async () => {
        const country = (node: IRowNode): string => node.key ?? node.data.country;
        const ascending = (_a: unknown, _b: unknown, nodeA: IRowNode, nodeB: IRowNode) =>
            country(nodeA).localeCompare(country(nodeB));
        const descending = (_a: unknown, _b: unknown, nodeA: IRowNode, nodeB: IRowNode) =>
            country(nodeB).localeCompare(country(nodeA));
        let aggFuncCalls = 0;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                {
                    field: 'v',
                    aggFunc: (params) => {
                        ++aggFuncCalls;
                        return params.values.reduce((sum: number, value: number) => sum + value, 0);
                    },
                },
            ],
            autoGroupColumnDef: { comparator: ascending },
            rowData: [
                { country: 'B', v: 2 },
                { country: 'A', v: 1 },
                { country: 'C', v: 4 },
                { country: 'A', v: 8 },
            ],
        });
        api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
        await asyncSetTimeout(0);
        const displayed = () => {
            const groups: { key: string | null | undefined; v: unknown }[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                const node = api.getDisplayedRowAtIndex(i);
                groups.push({ key: node?.key, v: node?.aggData?.v });
            }
            return groups;
        };
        expect(displayed()).toEqual([
            { key: 'A', v: 9 },
            { key: 'B', v: 2 },
            { key: 'C', v: 4 },
        ]);

        aggFuncCalls = 0;
        api.setGridOption('autoGroupColumnDef', { comparator: descending });
        await asyncSetTimeout(0);

        expect({ groups: displayed(), aggFuncCalls }).toEqual({
            groups: [
                { key: 'C', v: 4 },
                { key: 'B', v: 2 },
                { key: 'A', v: 9 },
            ],
            aggFuncCalls: 0,
        });
    });

    describe('row groups sorted by the auto group column', () => {
        const reversed = (valueA: string, valueB: string) => {
            if (valueA === valueB) {
                return 0;
            }
            return valueA < valueB ? 1 : -1;
        };
        const createGroupedGrid = (autoGroupColumnDef: GridOptions['autoGroupColumnDef']) =>
            gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }],
                autoGroupColumnDef,
                rowData: [{ country: 'B' }, { country: 'A' }, { country: 'C' }],
            });
        const groups = (api: GridApi) => {
            const keys: (string | null | undefined)[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                keys.push(api.getDisplayedRowAtIndex(i)?.key);
            }
            return keys;
        };

        test('a comparator set, removed and set again on autoGroupColumnDef re-sorts the groups each time', async () => {
            const withoutComparator: GridApi = await createGroupedGrid({});
            withoutComparator.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
            await asyncSetTimeout(0);
            const defaultOrder = groups(withoutComparator);
            expect(defaultOrder).not.toEqual(['C', 'B', 'A']);
            gridsManager.reset();

            const api: GridApi = await createGroupedGrid({ comparator: reversed });
            api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect(groups(api)).toEqual(['C', 'B', 'A']);

            const autoColumn = () => ({
                sort: api.getColumnState().find((state) => state.colId === 'ag-Grid-AutoColumn')?.sort,
                comparator: api.getColumn('ag-Grid-AutoColumn')?.getColDef().comparator,
            });

            api.setGridOption('autoGroupColumnDef', {});
            await asyncSetTimeout(0);
            expect({ groups: groups(api), ...autoColumn() }).toEqual({
                groups: defaultOrder,
                sort: 'asc',
                comparator: undefined,
            });

            api.setGridOption('autoGroupColumnDef', { comparator: reversed });
            await asyncSetTimeout(0);
            expect({ groups: groups(api), ...autoColumn() }).toEqual({
                groups: ['C', 'B', 'A'],
                sort: 'asc',
                comparator: reversed,
            });
        });

        test('a comparator given with masterDetail in one updateGridOptions call re-sorts the groups, whatever the key order', async () => {
            const forward = (valueA: string, valueB: string) => valueA.localeCompare(valueB);
            const update = (comparator: typeof forward, masterDetailFirst: boolean) =>
                masterDetailFirst
                    ? { masterDetail: true, autoGroupColumnDef: { comparator } }
                    : { autoGroupColumnDef: { comparator }, masterDetail: true };
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => {
                vi.restoreAllMocks();
            });
            const results = new Map<string, (string | null | undefined)[]>();
            for (const order of ['masterDetail first', 'autoGroupColumnDef first']) {
                const api: GridApi = await gridsManager.createGridAndWait(
                    'grid1',
                    {
                        columnDefs: [
                            { field: 'country', rowGroup: true, hide: true },
                            { field: 'v', allowFormula: true },
                        ],
                        autoGroupColumnDef: { comparator: forward },
                        rowData: [
                            { country: 'B', v: 1 },
                            { country: 'A', v: 2 },
                            { country: 'C', v: 3 },
                        ],
                    },
                    { modules: [FormulaModule, MasterDetailModule] }
                );
                api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
                await asyncSetTimeout(0);
                expect(groups(api)).toEqual(['A', 'B', 'C']);

                api.updateGridOptions(update(reversed, order === 'masterDetail first'));
                await asyncSetTimeout(0);
                results.set(order, groups(api));
                gridsManager.reset();
            }
            expect([...results]).toEqual([
                ['masterDetail first', ['C', 'B', 'A']],
                ['autoGroupColumnDef first', ['C', 'B', 'A']],
            ]);
            // a formula column is refused by each service the grid has, once per grid, and nothing else is logged
            const refused = (service: string) => [
                'AG Grid: warning #295',
                `\`colDef.allowFormula\` is not supported with ${service}. Formulas has been turned off.`,
            ];
            expect(warnSpy.mock.calls.map((call) => call.slice(0, 2))).toEqual([
                refused('Row Groups'),
                refused('Master Detail'),
                refused('Row Groups'),
                refused('Master Detail'),
            ]);
        });

        test('filterParams given with masterDetail in one updateGridOptions call re-filter the rows, whatever the key order', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [295] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            onTestFinished(() => {
                vi.restoreAllMocks();
            });
            const textFilter = (caseSensitive: boolean) => ({
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive },
            });
            const results = new Map<string, (string | undefined)[]>();
            for (const order of ['masterDetail first', 'autoGroupColumnDef first']) {
                const api: GridApi = await gridsManager.createGridAndWait(
                    'grid1',
                    {
                        columnDefs: [{ field: 'n', allowFormula: true }],
                        autoGroupColumnDef: textFilter(true),
                        treeData: true,
                        groupDefaultExpanded: -1,
                        rowData: [
                            { id: 'A', n: 'A' },
                            { id: 'B', parentId: 'A', n: 'B' },
                            { id: 'D', n: 'D' },
                        ],
                        getRowId: (params) => params.data.id,
                        treeDataParentIdField: 'parentId',
                        detailCellRendererParams: {
                            detailGridOptions: { columnDefs: [{ field: 'x' }] },
                            getDetailRowData: (params: any) => params.successCallback([]),
                        },
                    },
                    { modules: [FormulaModule, MasterDetailModule] }
                );
                api.setFilterModel({ 'ag-Grid-AutoColumn': { filterType: 'text', type: 'equals', filter: 'a' } });
                await asyncSetTimeout(0);
                expect(api.getDisplayedRowCount()).toBe(0);

                api.updateGridOptions(
                    order === 'masterDetail first'
                        ? { masterDetail: true, autoGroupColumnDef: textFilter(false) }
                        : { autoGroupColumnDef: textFilter(false), masterDetail: true }
                );
                await asyncSetTimeout(0);
                const displayed: (string | undefined)[] = [];
                for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                    const node = api.getDisplayedRowAtIndex(i);
                    if (!node?.detail) {
                        displayed.push(node?.id);
                    }
                }
                results.set(order, displayed);
                gridsManager.reset();
            }
            expect([...results]).toEqual([
                ['masterDetail first', ['A', 'B']],
                ['autoGroupColumnDef first', ['A', 'B']],
            ]);
            // a formula column is refused by each service the grid has, once per grid, and nothing else is logged
            const refused = (service: string) => [
                'AG Grid: warning #295',
                `\`colDef.allowFormula\` is not supported with ${service}. Formulas has been turned off.`,
            ];
            expect(warnSpy.mock.calls.map((call) => call.slice(0, 2))).toEqual([
                refused('Tree Data'),
                refused('Master Detail'),
                refused('Tree Data'),
                refused('Master Detail'),
            ]);
        });

        test('a comparator added or removed while the row group column is sorted gives the groups a grid created with that option gives', async () => {
            const sortCountry = async (api: GridApi) => {
                api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
                await asyncSetTimeout(0);
                expect(api.getColumnState().find((state) => state.colId === 'country')?.sort).toBe('desc');
                return groups(api);
            };
            const without = await sortCountry(await createGroupedGrid({}));
            gridsManager.reset();
            const withComparator = await sortCountry(await createGroupedGrid({ comparator: reversed }));
            gridsManager.reset();
            expect(without).not.toEqual(withComparator);

            const api: GridApi = await createGroupedGrid({});
            expect(await sortCountry(api)).toEqual(without);

            api.setGridOption('autoGroupColumnDef', { comparator: reversed });
            await asyncSetTimeout(0);
            const added = groups(api);

            api.setGridOption('autoGroupColumnDef', {});
            await asyncSetTimeout(0);
            expect({ added, removed: groups(api) }).toEqual({ added: withComparator, removed: without });
        });

        test('with one auto group column per row group column, a comparator added or removed while a row group column is sorted gives the groups a grid created with that option gives', async () => {
            const createGrid = (autoGroupColumnDef: GridOptions['autoGroupColumnDef']) =>
                gridsManager.createGridAndWait('grid1', {
                    columnDefs: [
                        { field: 'country', rowGroup: true, hide: true },
                        { field: 'sport', rowGroup: true, hide: true },
                    ],
                    groupDisplayType: 'multipleColumns',
                    groupDefaultExpanded: -1,
                    autoGroupColumnDef,
                    rowData: [
                        { country: 'B', sport: 'x' },
                        { country: 'A', sport: 'y' },
                        { country: 'C', sport: 'z' },
                        { country: 'A', sport: 'z' },
                    ],
                });
            const groupKeys = (api: GridApi) => {
                const keys: (string | null | undefined)[] = [];
                for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                    const node = api.getDisplayedRowAtIndex(i);
                    if (node?.group) {
                        keys.push(node.key);
                    }
                }
                return keys;
            };
            const sortCountry = async (api: GridApi) => {
                api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
                await asyncSetTimeout(0);
                expect(api.getColumnState().find((state) => state.colId === 'country')?.sort).toBe('desc');
                return groupKeys(api);
            };
            const without = await sortCountry(await createGrid({}));
            gridsManager.reset();
            const withComparator = await sortCountry(await createGrid({ comparator: reversed }));
            gridsManager.reset();
            expect(without).not.toEqual(withComparator);

            const api: GridApi = await createGrid({});
            expect(await sortCountry(api)).toEqual(without);

            api.setGridOption('autoGroupColumnDef', { comparator: reversed });
            await asyncSetTimeout(0);
            const added = groupKeys(api);

            api.setGridOption('autoGroupColumnDef', {});
            await asyncSetTimeout(0);
            expect({ added, removed: groupKeys(api) }).toEqual({ added: withComparator, removed: without });
        });

        test('a comparator given at runtime to a grid created without one re-sorts the groups', async () => {
            const api: GridApi = await createGroupedGrid(undefined);
            api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect(api.getColumnState().find((state) => state.colId === 'ag-Grid-AutoColumn')?.sort).toBe('asc');

            api.setGridOption('autoGroupColumnDef', { comparator: reversed });
            await asyncSetTimeout(0);
            expect(groups(api)).toEqual(['C', 'B', 'A']);
        });

        test('switching treeData at runtime sorts the new groups by the auto group column, as a grid created with that treeData does', async () => {
            const options = (treeData: boolean): GridOptions => ({
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }],
                treeData,
                getDataPath: (data) => data.path,
                rowData: [
                    { path: ['B', 'b1'], country: 'X' },
                    { path: ['A', 'a1'], country: 'Y' },
                    { path: ['C', 'c1'], country: 'X' },
                ],
            });
            const sortByAutoGroupColumn = async (api: GridApi) => {
                api.applyColumnState({ state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }] });
                await asyncSetTimeout(0);
                expect(api.getColumnState().find((state) => state.colId === 'ag-Grid-AutoColumn')?.sort).toBe('asc');
            };

            const api: GridApi = await gridsManager.createGridAndWait('grid1', options(false));
            await sortByAutoGroupColumn(api);
            expect(groups(api)).toEqual(['X', 'Y']);

            api.setGridOption('treeData', true);
            await asyncSetTimeout(0);
            const switched = groups(api);

            gridsManager.reset();
            const created: GridApi = await gridsManager.createGridAndWait('grid1', options(true));
            await sortByAutoGroupColumn(created);

            expect({ switched, created: groups(created) }).toEqual({
                switched: ['A', 'B', 'C'],
                created: ['A', 'B', 'C'],
            });
        });
    });

    test('an autoGroupColumnDef equal to the current one, passed as a new object, refreshes nothing', async () => {
        const comparator = (_a: unknown, _b: unknown, nodeA: IRowNode, nodeB: IRowNode) =>
            String(nodeA.data.n).localeCompare(String(nodeB.data.n));
        const autoGroupColumnDef = () => ({
            headerName: 'Group',
            filter: 'agTextColumnFilter',
            filterParams: { caseSensitive: true },
            comparator,
        });
        const filterModel = { filterType: 'text', type: 'notEqual', filter: 'C' };
        // Each update on its own grid, so a refresh the equal one queues cannot be credited to the control.
        const refreshesAfterUpdate = async (update: GridOptions['autoGroupColumnDef']) => {
            let modelUpdated = 0;
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'n' }],
                autoGroupColumnDef: autoGroupColumnDef(),
                treeData: true,
                groupDefaultExpanded: -1,
                rowData: [
                    { id: 'A', n: 'A' },
                    { id: 'B', parentId: 'A', n: 'B' },
                    { id: 'C', n: 'C' },
                    { id: 'D', n: 'D' },
                ],
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
                onModelUpdated: () => ++modelUpdated,
            });
            await api.setColumnFilterModel('ag-Grid-AutoColumn', filterModel);
            api.onFilterChanged();
            await asyncSetTimeout(0);
            const column = api.getColumn('ag-Grid-AutoColumn');
            const filter = await api.getColumnFilterInstance('ag-Grid-AutoColumn');
            modelUpdated = 0;
            api.setGridOption('autoGroupColumnDef', update);
            await asyncSetTimeout(0);
            return {
                api,
                refreshes: modelUpdated,
                columnKept: api.getColumn('ag-Grid-AutoColumn') === column,
                filterKept: (await api.getColumnFilterInstance('ag-Grid-AutoColumn')) === filter,
            };
        };

        const equal = await refreshesAfterUpdate(autoGroupColumnDef());
        const afterEqual = {
            refreshes: equal.refreshes,
            columnKept: equal.columnKept,
            filterKept: equal.filterKept,
            filterModel: equal.api.getColumnFilterModel('ag-Grid-AutoColumn'),
        };
        gridsManager.reset();
        // The positive control: a changed definition that re-sorts the rows is counted in the same window.
        const changed = await refreshesAfterUpdate({ ...autoGroupColumnDef(), headerName: 'Tree', sort: 'desc' });
        const api = changed.api;
        const rowOrder: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => rowOrder.push(node.id!));

        expect({
            afterEqual,
            afterChanged: changed.refreshes > 0,
            rowOrder,
            header: api.getDisplayNameForColumn(api.getColumn('ag-Grid-AutoColumn')!, 'header'),
        }).toEqual({
            afterEqual: { refreshes: 0, columnKept: true, filterKept: true, filterModel },
            afterChanged: true,
            rowOrder: ['D', 'A', 'B'],
            header: 'Tree',
        });
    });

    describe('a new autoGroupColumnDef re-sorts or re-filters the rows only for what it changes in a group column that sorts or filters them', () => {
        const GROUP_COL = 'ag-Grid-AutoColumn';
        const reversed = (valueA: string, valueB: string) => {
            if (valueA === valueB) {
                return 0;
            }
            return valueA < valueB ? 1 : -1;
        };
        const counts = { modelUpdated: 0, sortChanged: 0, filterChanged: 0 };
        const resetCounts = () => {
            counts.modelUpdated = 0;
            counts.sortChanged = 0;
            counts.filterChanged = 0;
        };
        const listeners: GridOptions = {
            onModelUpdated: () => ++counts.modelUpdated,
            onSortChanged: () => ++counts.sortChanged,
            onFilterChanged: () => ++counts.filterChanged,
        };
        const createGroupedGrid = (autoGroupColumnDef: GridOptions['autoGroupColumnDef']) =>
            gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'v' }],
                autoGroupColumnDef,
                rowData: [
                    { country: 'B', v: 1 },
                    { country: 'A', v: 2 },
                    { country: 'C', v: 3 },
                    { country: 'A', v: 4 },
                    { country: 'C', v: 5 },
                ],
                ...listeners,
            });
        const groupKeys = (api: GridApi) => {
            const keys: (string | null | undefined)[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                keys.push(api.getDisplayedRowAtIndex(i)?.key);
            }
            return keys;
        };
        const sortOf = (api: GridApi) => api.getColumnState().find((state) => state.colId === GROUP_COL)?.sort;
        const createTreeGrid = (autoGroupColumnDef: GridOptions['autoGroupColumnDef']) =>
            gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'n' }],
                autoGroupColumnDef,
                treeData: true,
                groupDefaultExpanded: -1,
                rowData: [
                    { id: 'A', n: 'A' },
                    { id: 'B', parentId: 'A', n: 'B' },
                    { id: 'D', n: 'D' },
                ],
                getRowId: (params) => params.data.id,
                treeDataParentIdField: 'parentId',
                ...listeners,
            });
        const displayedIds = (api: GridApi) => {
            const ids: (string | undefined)[] = [];
            for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
                ids.push(api.getDisplayedRowAtIndex(i)?.id);
            }
            return ids;
        };
        const equalsA = { filterType: 'text', type: 'equals', filter: 'a' };

        test('on a sorted group column, a new definition with the same comparator or another header re-sorts nothing, one with a new comparator re-sorts once', async () => {
            const api: GridApi = await createGroupedGrid({
                headerName: 'G',
                valueFormatter: (params) => String(params.value),
            });
            api.applyColumnState({ state: [{ colId: GROUP_COL, sort: 'desc' }] });
            await asyncSetTimeout(0);
            const sorted = groupKeys(api);
            expect({ sort: sortOf(api), sortChanged: counts.sortChanged }).toEqual({ sort: 'desc', sortChanged: 1 });

            resetCounts();
            api.setGridOption('autoGroupColumnDef', {
                headerName: 'G',
                valueFormatter: (params) => String(params.value),
            });
            await asyncSetTimeout(0);
            expect({ groups: groupKeys(api), counts: { ...counts } }).toEqual({
                groups: sorted,
                counts: { modelUpdated: 0, sortChanged: 0, filterChanged: 0 },
            });

            api.setGridOption('autoGroupColumnDef', {
                headerName: 'Renamed',
                valueFormatter: (params) => `${params.value}`,
            });
            await asyncSetTimeout(0);
            expect({
                groups: groupKeys(api),
                counts: { ...counts },
                header: api.getDisplayNameForColumn(api.getColumn(GROUP_COL)!, 'header'),
            }).toEqual({
                groups: sorted,
                counts: { modelUpdated: 0, sortChanged: 0, filterChanged: 0 },
                header: 'Renamed',
            });

            api.setGridOption('autoGroupColumnDef', { headerName: 'Renamed', comparator: reversed });
            await asyncSetTimeout(0);
            expect({ groups: groupKeys(api), counts: { ...counts } }).toEqual({
                groups: ['A', 'B', 'C'],
                counts: { modelUpdated: 1, sortChanged: 0, filterChanged: 0 },
            });
        });

        test('on a filtered group column, a new definition with equal filterParams re-filters nothing, one with changed filterParams re-filters once', async () => {
            const api: GridApi = await createTreeGrid({
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive: true },
                valueFormatter: (params) => String(params.value),
            });
            api.setFilterModel({ [GROUP_COL]: equalsA });
            await asyncSetTimeout(0);
            expect({ displayed: displayedIds(api), filterChanged: counts.filterChanged }).toEqual({
                displayed: [],
                filterChanged: 1,
            });

            resetCounts();
            api.setGridOption('autoGroupColumnDef', {
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive: true },
                valueFormatter: (params) => `${params.value}`,
            });
            await asyncSetTimeout(0);
            expect({ displayed: displayedIds(api), model: api.getFilterModel(), counts: { ...counts } }).toEqual({
                displayed: [],
                model: { [GROUP_COL]: equalsA },
                counts: { modelUpdated: 0, sortChanged: 0, filterChanged: 0 },
            });

            api.setGridOption('autoGroupColumnDef', {
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive: false },
                valueFormatter: (params) => `${params.value}`,
            });
            await asyncSetTimeout(0);
            expect({ displayed: displayedIds(api), model: api.getFilterModel(), counts: { ...counts } }).toEqual({
                displayed: ['A', 'B'],
                model: { [GROUP_COL]: equalsA },
                counts: { modelUpdated: 1, sortChanged: 0, filterChanged: 0 },
            });
        });

        test('a comparator given with another grid option in one updateGridOptions call re-sorts the groups once', async () => {
            const api: GridApi = await createGroupedGrid({});
            api.applyColumnState({ state: [{ colId: GROUP_COL, sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect({ sort: sortOf(api), sortChanged: counts.sortChanged }).toEqual({ sort: 'asc', sortChanged: 1 });

            resetCounts();
            api.updateGridOptions({ autoGroupColumnDef: { comparator: reversed }, hidePaddedHeaderRows: true });
            await asyncSetTimeout(0);

            expect({ groups: groupKeys(api), counts: { ...counts } }).toEqual({
                groups: ['C', 'B', 'A'],
                counts: { modelUpdated: 1, sortChanged: 0, filterChanged: 0 },
            });
        });

        test('filterParams given with another grid option in one updateGridOptions call re-filter the rows once', async () => {
            const api: GridApi = await createTreeGrid({
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive: true },
            });
            api.setFilterModel({ [GROUP_COL]: equalsA });
            await asyncSetTimeout(0);
            expect({ displayed: displayedIds(api), filterChanged: counts.filterChanged }).toEqual({
                displayed: [],
                filterChanged: 1,
            });

            resetCounts();
            api.updateGridOptions({
                autoGroupColumnDef: { filter: 'agTextColumnFilter', filterParams: { caseSensitive: false } },
                hidePaddedHeaderRows: true,
            });
            await asyncSetTimeout(0);

            expect({ displayed: displayedIds(api), counts: { ...counts } }).toEqual({
                displayed: ['A', 'B'],
                counts: { modelUpdated: 1, sortChanged: 0, filterChanged: 0 },
            });
        });

        test('a new comparator and filterParams on a group column that neither sorts nor filters refresh no rows, until it sorts', async () => {
            const comparator = (direction: number) => (_a: unknown, _b: unknown, nodeA: IRowNode, nodeB: IRowNode) =>
                direction * String(nodeA.data.n).localeCompare(String(nodeB.data.n));
            const ascending = comparator(1);
            const descending = comparator(-1);
            const another = comparator(-1);
            const groupColDef = (caseSensitive: boolean, groupComparator: typeof ascending) => ({
                filter: 'agTextColumnFilter',
                filterParams: { caseSensitive },
                comparator: groupComparator,
            });
            const comparatorOf = (api: GridApi) => api.getColumn(GROUP_COL)?.getColDef().comparator;
            const api: GridApi = await createTreeGrid(groupColDef(true, ascending));
            expect({ sort: sortOf(api), filterModel: api.getFilterModel(), comparator: comparatorOf(api) }).toEqual({
                sort: null,
                filterModel: {},
                comparator: ascending,
            });

            resetCounts();
            api.setGridOption('autoGroupColumnDef', groupColDef(false, descending));
            await asyncSetTimeout(0);
            expect({ counts: { ...counts }, comparator: comparatorOf(api) }).toEqual({
                counts: { modelUpdated: 0, sortChanged: 0, filterChanged: 0 },
                comparator: descending,
            });

            api.applyColumnState({ state: [{ colId: GROUP_COL, sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect(sortOf(api)).toBe('asc');

            resetCounts();
            api.setGridOption('autoGroupColumnDef', groupColDef(false, another));
            await asyncSetTimeout(0);
            expect({ counts: { ...counts }, comparator: comparatorOf(api) }).toEqual({
                counts: { modelUpdated: 1, sortChanged: 0, filterChanged: 0 },
                comparator: another,
            });
        });

        test('with nothing sorted, adding or removing an autoGroupColumnDef comparator refreshes no rows, until a column is sorted', async () => {
            const api: GridApi = await createGroupedGrid({});
            expect(api.getColumnState().map((state) => state.sort ?? null)).toEqual([null, null, null]);

            resetCounts();
            api.setGridOption('autoGroupColumnDef', { comparator: reversed });
            await asyncSetTimeout(0);
            expect(counts.modelUpdated).toBe(0);

            api.setGridOption('autoGroupColumnDef', {});
            await asyncSetTimeout(0);
            expect(counts.modelUpdated).toBe(0);

            // Positive control: the same observer sees one refresh when a column is sorted, after the same wait.
            api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
            await asyncSetTimeout(0);
            expect({
                sort: api.getColumnState().find((state) => state.colId === 'country')?.sort,
                counts: { ...counts },
            }).toEqual({ sort: 'desc', counts: { modelUpdated: 1, sortChanged: 1, filterChanged: 0 } });
        });

        test('with the row group column sorted, an autoGroupColumnDef change adding or removing no comparator refreshes no rows, and one adding a comparator refreshes once', async () => {
            const api: GridApi = await createGroupedGrid({ headerName: 'A' });
            api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
            await asyncSetTimeout(0);
            const sorted = groupKeys(api);
            expect(api.getColumnState().find((state) => state.colId === 'country')?.sort).toBe('desc');
            const header = () => api.getDisplayNameForColumn(api.getColumn(GROUP_COL)!, 'header');
            expect(header()).toBe('A');

            resetCounts();
            api.setGridOption('autoGroupColumnDef', { headerName: 'B' });
            await asyncSetTimeout(0);
            expect({ header: header(), groups: groupKeys(api), modelUpdated: counts.modelUpdated }).toEqual({
                header: 'B',
                groups: sorted,
                modelUpdated: 0,
            });

            // Positive control: the same observer sees one refresh once a comparator is added.
            api.setGridOption('autoGroupColumnDef', { headerName: 'B', comparator: reversed });
            await asyncSetTimeout(0);
            expect(counts.modelUpdated).toBe(1);
        });

        test('a comparator map by sort type re-sorts the groups only when a function in it differs, not for a new map of the same functions', async () => {
            const ascending = (valueA: string, valueB: string) => {
                if (valueA === valueB) {
                    return 0;
                }
                return valueA < valueB ? -1 : 1;
            };
            const api: GridApi = await createGroupedGrid({ comparator: { default: reversed } });
            api.applyColumnState({ state: [{ colId: GROUP_COL, sort: 'desc' }] });
            await asyncSetTimeout(0);
            // `reversed` under a descending sort puts the groups in ascending key order.
            expect({ sort: sortOf(api), groups: groupKeys(api), sortChanged: counts.sortChanged }).toEqual({
                sort: 'desc',
                groups: ['A', 'B', 'C'],
                sortChanged: 1,
            });

            resetCounts();
            api.setGridOption('autoGroupColumnDef', { comparator: { default: reversed } });
            await asyncSetTimeout(0);
            expect({ groups: groupKeys(api), counts: { ...counts } }).toEqual({
                groups: ['A', 'B', 'C'],
                counts: { modelUpdated: 0, sortChanged: 0, filterChanged: 0 },
            });

            api.setGridOption('autoGroupColumnDef', { comparator: { default: ascending } });
            await asyncSetTimeout(0);
            expect({ groups: groupKeys(api), counts: { ...counts } }).toEqual({
                groups: ['C', 'B', 'A'],
                counts: { modelUpdated: 1, sortChanged: 0, filterChanged: 0 },
            });
        });
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

    test('two boolean columns with the Text filter each keep their own filterOptions when one is edited', () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { colId: 'a', field: 'a', cellDataType: 'boolean', filter: 'agTextColumnFilter' },
                { colId: 'b', field: 'b', cellDataType: 'boolean', filter: 'agTextColumnFilter' },
            ],
            rowData: [{ a: true, b: false }],
        });
        const filterOptions = (colId: string): unknown[] =>
            api.getColumn(colId)!.getColDef().filterParams.filterOptions;
        expect(Array.isArray(filterOptions('a'))).toBe(true);
        expect(Array.isArray(filterOptions('b'))).toBe(true);
        const optionsOfB = [...filterOptions('b')];
        const optionsOfA = [...filterOptions('a')];

        filterOptions('a').push('contains');

        expect({ a: filterOptions('a'), b: filterOptions('b') }).toEqual({
            a: [...optionsOfA, 'contains'],
            b: optionsOfB,
        });
    });

    test('two grids alive at once each list the blanks of a boolean and a date Set Filter with their own localeText', async () => {
        const columnDefs = [
            { colId: 'bool', field: 'bool', cellDataType: 'boolean', filter: 'agSetColumnFilter' },
            { colId: 'date', field: 'date', cellDataType: 'date', filter: 'agSetColumnFilter' },
        ];
        const rowData = [
            { bool: true, date: new Date(2024, 0, 1) },
            { bool: null, date: null },
        ];
        const modules = { modules: [LocaleModule, DateFilterModule] };
        const api1 = gridsManager.createGrid('grid1', { columnDefs, rowData, localeText: { blanks: 'Vide' } }, modules);
        const api2 = gridsManager.createGrid('grid2', { columnDefs, rowData, localeText: { blanks: 'Leer' } }, modules);

        const blanksEntries = async (api: GridApi, colId: string) => {
            const filter = await ColumnFilterHarness.open(api, colId);
            let labels: string[] = [];
            await vi.waitFor(
                () => {
                    labels = filter.setFilterItemLabels();
                    expect(labels.length).toBeGreaterThan(1);
                },
                { timeout: 1000 }
            );
            api.hideColumnFilter();
            await asyncSetTimeout(0);
            return labels.filter((label) => ['Vide', 'Leer', '(Blanks)'].includes(label));
        };
        expect({
            grid1: { bool: await blanksEntries(api1, 'bool'), date: await blanksEntries(api1, 'date') },
            grid2: { bool: await blanksEntries(api2, 'bool'), date: await blanksEntries(api2, 'date') },
        }).toEqual({
            grid1: { bool: ['Vide'], date: ['Vide'] },
            grid2: { bool: ['Leer'], date: ['Leer'] },
        });
    });

    test('a dateString Set Filter follows the dateParser and dateFormatter of new dataTypeDefinitions', async () => {
        const parserFor = (order: 'year-month-day' | 'year-day-month') => (value: string | undefined) => {
            if (value == null) {
                return undefined;
            }
            const [year, first, second] = value.split('-').map(Number);
            return order === 'year-month-day' ? new Date(year, first - 1, second) : new Date(year, second - 1, first);
        };
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateFormatterIso = (date: Date | undefined) =>
            date == null ? undefined : `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        const dateFormatterDmy = (date: Date | undefined) =>
            date == null ? undefined : `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
        const definitions = (
            dateParser: (value: string | undefined) => Date | undefined,
            dateFormatter: (date: Date | undefined) => string | undefined
        ) => ({
            dateString: {
                baseDataType: 'dateString' as const,
                extendsDataType: 'dateString' as const,
                valueParser: (params: { newValue: string | null | undefined }) => params.newValue ?? null,
                valueFormatter: (params: { value: string | null | undefined }) =>
                    dateFormatter(dateParser(params.value ?? undefined)) ?? '',
                dateParser,
                dateFormatter,
            },
        });
        const api: GridApi = gridsManager.createGrid(
            'grid1',
            {
                columnDefs: [
                    { colId: 'tree', field: 'd', cellDataType: 'dateString', filter: 'agSetColumnFilter' },
                    {
                        colId: 'flat',
                        field: 'd',
                        cellDataType: 'dateString',
                        filter: 'agSetColumnFilter',
                        filterParams: { treeList: false },
                    },
                ],
                dataTypeDefinitions: definitions(parserFor('year-month-day'), dateFormatterIso),
                rowData: [{ d: '2024-01-02' }, { d: '2025-03-04' }],
            },
            { modules: [DateFilterModule] }
        );
        const items = async (colId: string) => {
            const filter = await ColumnFilterHarness.open(api, colId);
            let labels: string[] = [];
            await vi.waitFor(
                () => {
                    labels = filter.setFilterItemLabels();
                    expect(labels.filter((label) => label !== '(Select All)' && label !== '(Blanks)')).not.toEqual([]);
                },
                { timeout: 1000 }
            );
            if (colId === 'tree') {
                // The (Select All) row's icon expands every group down to the days.
                document.querySelector<HTMLElement>('.ag-filter-menu .ag-set-filter-group-closed-icon')!.click();
                await asyncSetTimeout(0);
                labels = filter.setFilterItemLabels();
            } else {
                labels = labels.filter((label) => label !== '(Select All)').sort();
            }
            api.hideColumnFilter();
            await asyncSetTimeout(0);
            return labels;
        };
        // 'YYYY-MM-DD': 2 January 2024 and 4 March 2025.
        expect({ tree: await items('tree'), flat: await items('flat') }).toEqual({
            tree: ['(Select All)', '2024', 'January', '02', '2025', 'March', '04'],
            flat: ['2024-01-02', '2025-03-04'],
        });

        // 'YYYY-DD-MM' reads the same strings as 1 February 2024 and 3 April 2025.
        api.setGridOption('dataTypeDefinitions', definitions(parserFor('year-day-month'), dateFormatterDmy));
        await asyncSetTimeout(0);

        expect({ tree: await items('tree'), flat: await items('flat') }).toEqual({
            tree: ['(Select All)', '2024', 'February', '01', '2025', 'April', '03'],
            flat: ['01/02/2024', '03/04/2025'],
        });
    });
});
