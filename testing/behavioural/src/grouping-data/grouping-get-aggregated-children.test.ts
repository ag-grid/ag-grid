import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, PinnedRowModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('IRowNode.getAggregatedChildren()', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            NumberFilterModule,
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            SetFilterModule,
            PinnedRowModule,
        ],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('with row grouping', () => {
        test('returns all leaf children for group row without column key', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Country' },
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sport: 'Sailing', gold: 1 },
                    { id: '2', country: 'Ireland', sport: 'Soccer', gold: 2 },
                    { id: '3', country: 'Ireland', sport: 'Football', gold: 1 },
                    { id: '4', country: 'Italy', sport: 'Soccer', gold: 3 },
                    { id: '5', country: 'Italy', sport: 'Football', gold: 2 },
                ],
            });

            await new GridRows(api, 'after data load').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:4
                │ ├── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1
                │ ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
                │ └── LEAF id:3 country:"Ireland" sport:"Football" gold:1
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5
                · ├── LEAF id:4 country:"Italy" sport:"Soccer" gold:3
                · └── LEAF id:5 country:"Italy" sport:"Football" gold:2
            `);

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();
            expect(irelandGroup!.group).toBe(true);

            // With a non-pivot column key, returns childrenAfterAggFilter (all children)
            // since pivot key filtering only applies to pivot columns
            const children = irelandGroup!.getAggregatedChildren('gold');
            expect(children.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3']);

            const italyGroup = api.getRowNode('row-group-country-Italy');
            expect(italyGroup).toBeDefined();
            // Pass Column object to verify it works
            const goldCol = api.getColumn('gold')!;
            const italyChildren = italyGroup!.getAggregatedChildren(goldCol);
            expect(italyChildren.map((n) => n.data?.id).sort()).toEqual(['4', '5']);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Country" width:200
                ├── sport "Sport" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
        });

        test('with multiple grouping levels, returns only direct children', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', region: 'Europe', country: 'Ireland', gold: 10 },
                    { id: '2', region: 'Europe', country: 'Ireland', gold: 20 },
                    { id: '3', region: 'Europe', country: 'France', gold: 15 },
                    { id: '4', region: 'Americas', country: 'USA', gold: 30 },
                ],
            });

            await new GridRows(api, 'after data load').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" gold:45
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:30
                │ │ ├── LEAF id:1 region:"Europe" country:"Ireland" gold:10
                │ │ └── LEAF id:2 region:"Europe" country:"Ireland" gold:20
                │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" gold:15
                │ · └── LEAF id:3 region:"Europe" country:"France" gold:15
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" gold:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" gold:30
                · · └── LEAF id:4 region:"Americas" country:"USA" gold:30
            `);

            // Get the Europe region group
            const europeGroup = api.getRowNode('row-group-region-Europe');
            expect(europeGroup).toBeDefined();

            // getAggregatedChildren returns the childrenAfterAggFilter (country groups, not leaf nodes)
            // Pass 'gold' column to verify non-pivot column works
            const europeChildren = europeGroup!.getAggregatedChildren('gold');
            expect(europeChildren.length).toBe(2);
            expect(europeChildren.every((n) => n.group)).toBe(true);

            // Get the Ireland country group within Europe
            const irelandGroup = api.getRowNode('row-group-region-Europe-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // getAggregatedChildren returns the leaf children
            const irelandChildren = irelandGroup!.getAggregatedChildren(null);
            expect(irelandChildren.map((n) => n.data?.id).sort()).toEqual(['1', '2']);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
        });

        test('respects filtering - returns only filtered children', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                    { field: 'sport', filter: 'agSetColumnFilter' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sport: 'Sailing', gold: 1 },
                    { id: '2', country: 'Ireland', sport: 'Soccer', gold: 2 },
                    { id: '3', country: 'Ireland', sport: 'Football', gold: 1 },
                ],
            });

            await new GridRows(api, 'before filter').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:4
                · ├── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1
                · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
                · └── LEAF id:3 country:"Ireland" sport:"Football" gold:1
            `);

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // Before filter, should have all 3 children
            let children = irelandGroup!.getAggregatedChildren(null);
            expect(children.length).toBe(3);

            // Apply filter to show only Soccer
            await api.setColumnFilterModel('sport', { values: ['Soccer'] });
            api.onFilterChanged();

            await new GridRows(api, 'after Soccer filter').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:2
                · └── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
            `);

            // After filter, should have only 1 child
            children = irelandGroup!.getAggregatedChildren(null);
            expect(children.length).toBe(1);
            expect(children[0].data?.id).toBe('2');

            // Clear filter
            await api.setColumnFilterModel('sport', null);
            api.onFilterChanged();

            await new GridRows(api, 'after clearing filter').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:4
                · ├── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1
                · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
                · └── LEAF id:3 country:"Ireland" sport:"Football" gold:1
            `);

            // After clearing filter, should have all 3 again
            children = irelandGroup!.getAggregatedChildren(null);
            expect(children.length).toBe(3);
        });

        test('returns empty array for leaf nodes', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [{ id: '1', country: 'Ireland', gold: 10 }],
            });

            await new GridRows(api, 'after data load').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:10
                · └── LEAF id:1 country:"Ireland" gold:10
            `);

            const leafNode = api.getRowNode('1');
            expect(leafNode).toBeDefined();
            expect(leafNode!.group).toBeFalsy();

            // Leaf nodes return empty array regardless of column key
            const children = leafNode!.getAggregatedChildren('gold');
            expect(children).toEqual([]);
        });
    });

    describe('with pivot mode', () => {
        test('returns children matching pivot key for specific pivot column', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2021, sales: 1200 },
                    { id: '3', country: 'Ireland', year: 2020, sales: 500 },
                    { id: '4', country: 'Italy', year: 2020, sales: 2000 },
                ],
            });

            const gridRowsOptions: GridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_year_2020_sales', 'pivot_year_2021_sales'],
                printHiddenRows: false,
            };
            await new GridRows(api, 'basic pivot', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:3500 pivot_year_2021_sales:1200
                ├── LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                └── LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" pivot_year_2020_sales:2000 pivot_year_2021_sales:null
            `);

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // Get the 2020 pivot column from pivot result columns
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // getAggregatedChildren with pivot column should return only children matching that pivot key
            const children2020 = irelandGroup!.getAggregatedChildren(pivot2020Col!);
            expect(children2020.map((n) => n.data?.id).sort()).toEqual(['1', '3']);

            // Get the 2021 pivot column
            const pivot2021Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2021_sales');
            expect(pivot2021Col).toBeDefined();

            const children2021 = irelandGroup!.getAggregatedChildren(pivot2021Col!);
            expect(children2021.map((n) => n.data?.id)).toEqual(['2']);
        });

        test('without column key in pivot mode, returns all children', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `without column key in pivot mode, returns all children setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(api, `without column key in pivot mode, returns all children setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2021, sales: 1200 },
                    { id: '3', country: 'Ireland', year: 2020, sales: 500 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // Without column key, returns all children
            const allChildren = irelandGroup!.getAggregatedChildren(null);
            expect(allChildren.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3']);
            await new GridRows(api, `without column key in pivot mode, returns all children final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                · ├── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                · └── LEAF hidden id:3 pivot_year_2020_sales:500 pivot_year_2021_sales:500
            `);
        });

        test('with multiple pivot columns (hierarchy), returns children matching all pivot keys', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'quarter', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `with multiple pivot columns (hierarchy), returns children matching all pivot key setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(
                api,
                `with multiple pivot columns (hierarchy), returns children matching all pivot key setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, quarter: 'Q1', sales: 100 },
                    { id: '2', country: 'Ireland', year: 2020, quarter: 'Q2', sales: 200 },
                    { id: '3', country: 'Ireland', year: 2021, quarter: 'Q1', sales: 300 },
                    { id: '4', country: 'Ireland', year: 2021, quarter: 'Q2', sales: 400 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();
            expect(irelandGroup!.leafGroup).toBe(true);

            // Get pivot columns from pivot result columns
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();

            // Get the 2020 Q1 pivot column (most specific - matches only Q1 of 2020)
            const pivot2020Q1Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year-quarter_2020-Q1_sales');
            expect(pivot2020Q1Col).toBeDefined();

            const children2020Q1 = irelandGroup!.getAggregatedChildren(pivot2020Q1Col!);
            expect(children2020Q1.map((n) => n.data?.id)).toEqual(['1']);

            // Get the 2020 Q2 column
            const pivot2020Q2Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year-quarter_2020-Q2_sales');
            expect(pivot2020Q2Col).toBeDefined();

            const children2020Q2 = irelandGroup!.getAggregatedChildren(pivot2020Q2Col!);
            expect(children2020Q2.map((n) => n.data?.id)).toEqual(['2']);

            // Get the 2021 Q1 column
            const pivot2021Q1Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year-quarter_2021-Q1_sales');
            expect(pivot2021Q1Col).toBeDefined();

            const children2021Q1 = irelandGroup!.getAggregatedChildren(pivot2021Q1Col!);
            expect(children2021Q1.map((n) => n.data?.id)).toEqual(['3']);
            await new GridRows(
                api,
                `with multiple pivot columns (hierarchy), returns children matching all pivot key final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year-quarter_2020-Q1_sales:100 pivot_year-quarter_2020-Q2_sales:200 pivot_year-quarter_2020_sales:300 pivot_year-quarter_2021-Q1_sales:300 pivot_year-quarter_2021-Q2_sales:400 pivot_year-quarter_2021_sales:700
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year-quarter_2020-Q1_sales:100 pivot_year-quarter_2020-Q2_sales:200 pivot_year-quarter_2020_sales:300 pivot_year-quarter_2021-Q1_sales:300 pivot_year-quarter_2021-Q2_sales:400 pivot_year-quarter_2021_sales:700
                · ├── LEAF hidden id:1 pivot_year-quarter_2020-Q1_sales:100 pivot_year-quarter_2020-Q2_sales:100 pivot_year-quarter_2020_sales:100 pivot_year-quarter_2021-Q1_sales:100 pivot_year-quarter_2021-Q2_sales:100 pivot_year-quarter_2021_sales:100
                · ├── LEAF hidden id:2 pivot_year-quarter_2020-Q1_sales:200 pivot_year-quarter_2020-Q2_sales:200 pivot_year-quarter_2020_sales:200 pivot_year-quarter_2021-Q1_sales:200 pivot_year-quarter_2021-Q2_sales:200 pivot_year-quarter_2021_sales:200
                · ├── LEAF hidden id:3 pivot_year-quarter_2020-Q1_sales:300 pivot_year-quarter_2020-Q2_sales:300 pivot_year-quarter_2020_sales:300 pivot_year-quarter_2021-Q1_sales:300 pivot_year-quarter_2021-Q2_sales:300 pivot_year-quarter_2021_sales:300
                · └── LEAF hidden id:4 pivot_year-quarter_2020-Q1_sales:400 pivot_year-quarter_2020-Q2_sales:400 pivot_year-quarter_2020_sales:400 pivot_year-quarter_2021-Q1_sales:400 pivot_year-quarter_2021-Q2_sales:400 pivot_year-quarter_2021_sales:400
            `);
        });

        test('pivot column for non-leaf group returns matching children from subgroups', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `pivot column for non-leaf group returns matching children from subgroups setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── sales "Sales" width:200 aggFunc:sum !visible
                `);
            await new GridRows(api, `pivot column for non-leaf group returns matching children from subgroups setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', region: 'Europe', country: 'Ireland', year: 2020, sales: 1000 },
                    { id: '2', region: 'Europe', country: 'Ireland', year: 2021, sales: 1200 },
                    { id: '3', region: 'Europe', country: 'France', year: 2020, sales: 800 },
                    { id: '4', region: 'Europe', country: 'France', year: 2021, sales: 900 },
                ],
            });

            const europeGroup = api.getRowNode('row-group-region-Europe');
            expect(europeGroup).toBeDefined();

            // For the region (non-leaf) group, getAggregatedChildren returns country subgroups
            const children = europeGroup!.getAggregatedChildren(null);
            expect(children.length).toBe(2);
            expect(children.every((n) => n.group)).toBe(true);

            // Get pivot columns from pivot result columns
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // Non-leaf groups return their childrenAfterAggFilter (which are country groups)
            // because pivot key filtering only applies at the leaf group level
            const europeChildren2020 = europeGroup!.getAggregatedChildren(pivot2020Col!);
            expect(europeChildren2020.length).toBe(2);
            await new GridRows(
                api,
                `pivot column for non-leaf group returns matching children from subgroups final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1800 pivot_year_2021_sales:2100
                └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:1800 pivot_year_2021_sales:2100
                · ├─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                · │ ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                · │ └── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                · └─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" pivot_year_2020_sales:800 pivot_year_2021_sales:900
                · · ├── LEAF hidden id:3 pivot_year_2020_sales:800 pivot_year_2021_sales:800
                · · └── LEAF hidden id:4 pivot_year_2020_sales:900 pivot_year_2021_sales:900
            `);
        });

        test('respects filtering in pivot mode', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'status', filter: 'agSetColumnFilter' },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `respects filtering in pivot mode setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(api, `respects filtering in pivot mode setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, status: 'active', sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2020, status: 'pending', sales: 500 },
                    { id: '3', country: 'Ireland', year: 2021, status: 'active', sales: 1200 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();
            expect(irelandGroup!.leafGroup).toBe(true);

            // Get pivot columns from pivot result columns
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // Before filter: 2 children for 2020 (ids 1 and 2)
            let children2020 = irelandGroup!.getAggregatedChildren(pivot2020Col!);
            expect(children2020.map((n) => n.data?.id).sort()).toEqual(['1', '2']);

            // Apply filter to show only active
            await api.setColumnFilterModel('status', { values: ['active'] });
            api.onFilterChanged();

            // After filter: only 1 child for 2020 (id 1, the active one)
            children2020 = irelandGroup!.getAggregatedChildren(pivot2020Col!);
            expect(children2020.length).toBe(1);
            expect(children2020[0].data?.id).toBe('1');
            await new GridRows(api, `respects filtering in pivot mode final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                · └── LEAF hidden id:3 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
            `);
        });

        test('pivot column group totals return all children (not filtered by pivot keys)', async () => {
            // When pivotColumnGroupTotals is enabled, total columns have pivotTotalColumnIds
            // and their pivotKeys are a prefix (e.g., ['2020'] for year total in year/quarter pivot).
            // These columns should return all filtered children, not just those matching the prefix key.
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'quarter', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                pivotColumnGroupTotals: 'after',
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `pivot column group totals return all children (not filtered by pivot keys) setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(api, `pivot column group totals return all children (not filtered by pivot keys) setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, quarter: 'Q1', sales: 100 },
                    { id: '2', country: 'Ireland', year: 2020, quarter: 'Q2', sales: 200 },
                    { id: '3', country: 'Ireland', year: 2021, quarter: 'Q1', sales: 300 },
                    { id: '4', country: 'Ireland', year: 2021, quarter: 'Q2', sales: 400 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();
            expect(irelandGroup!.leafGroup).toBe(true);

            // Get pivot columns from pivot result columns
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();

            // Find a specific pivot column (non-total) - e.g., 2020 Q1
            const pivot2020Q1Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year-quarter_2020-Q1_sales');
            expect(pivot2020Q1Col).toBeDefined();
            expect(pivot2020Q1Col!.getColDef().pivotTotalColumnIds).toBeUndefined();

            // For regular pivot columns, getAggregatedChildren returns only matching children
            const children2020Q1 = irelandGroup!.getAggregatedChildren(pivot2020Q1Col!);
            expect(children2020Q1.length).toBe(1);
            expect(children2020Q1[0].data?.id).toBe('1');

            // Find a year total column (pivotColumnGroupTotals column)
            // This column has pivotTotalColumnIds and pivotKeys that are a prefix ['2020']
            const year2020TotalCol = pivotColumns!.find(
                (col) =>
                    col.getColDef().pivotTotalColumnIds !== undefined &&
                    col.getColDef().pivotKeys?.length === 1 &&
                    col.getColDef().pivotKeys?.[0] === '2020'
            );
            expect(year2020TotalCol).toBeDefined();

            // For total columns, getAggregatedChildren should return ALL filtered children
            // because the aggregation for total columns uses childrenAfterFilter, not childrenMapped
            const children2020Total = irelandGroup!.getAggregatedChildren(year2020TotalCol!);
            // Should return all 4 children (total columns aggregate all children, not just matching pivot keys)
            expect(children2020Total.length).toBe(4);
            expect(children2020Total.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3', '4']);
            await new GridRows(
                api,
                `pivot column group totals return all children (not filtered by pivot keys) final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year-quarter_2020-Q1_sales:100 pivot_year-quarter_2020-Q2_sales:200 pivot_year-quarter_2020_:300 pivot_year-quarter_2021-Q1_sales:300 pivot_year-quarter_2021-Q2_sales:400 pivot_year-quarter_2021_:700
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year-quarter_2020-Q1_sales:100 pivot_year-quarter_2020-Q2_sales:200 pivot_year-quarter_2020_:300 pivot_year-quarter_2021-Q1_sales:300 pivot_year-quarter_2021-Q2_sales:400 pivot_year-quarter_2021_:700
                · ├── LEAF hidden id:1 pivot_year-quarter_2020-Q1_sales:100 pivot_year-quarter_2020-Q2_sales:100 pivot_year-quarter_2020_:100 pivot_year-quarter_2021-Q1_sales:100 pivot_year-quarter_2021-Q2_sales:100 pivot_year-quarter_2021_:100
                · ├── LEAF hidden id:2 pivot_year-quarter_2020-Q1_sales:200 pivot_year-quarter_2020-Q2_sales:200 pivot_year-quarter_2020_:200 pivot_year-quarter_2021-Q1_sales:200 pivot_year-quarter_2021-Q2_sales:200 pivot_year-quarter_2021_:200
                · ├── LEAF hidden id:3 pivot_year-quarter_2020-Q1_sales:300 pivot_year-quarter_2020-Q2_sales:300 pivot_year-quarter_2020_:300 pivot_year-quarter_2021-Q1_sales:300 pivot_year-quarter_2021-Q2_sales:300 pivot_year-quarter_2021_:300
                · └── LEAF hidden id:4 pivot_year-quarter_2020-Q1_sales:400 pivot_year-quarter_2020-Q2_sales:400 pivot_year-quarter_2020_:400 pivot_year-quarter_2021-Q1_sales:400 pivot_year-quarter_2021-Q2_sales:400 pivot_year-quarter_2021_:400
            `);
        });
    });

    describe('column key variations', () => {
        test('accepts Column object as key', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { colId: 'salesCol', field: 'sales', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `accepts Column object as key setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── salesCol "Sales" width:200 aggFunc:sum
            `);
            await new GridRows(api, `accepts Column object as key setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sales: 100 },
                    { id: '2', country: 'Ireland', sales: 200 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            const salesCol = api.getColumn('salesCol');
            expect(salesCol).toBeDefined();

            // With a non-pivot column, getAggregatedChildren still returns all children
            // (pivot key filtering only applies to pivot columns)
            const children = irelandGroup!.getAggregatedChildren(salesCol!);
            expect(children.length).toBe(2);
            await new GridRows(api, `accepts Column object as key final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" salesCol:300
                · ├── LEAF id:1 country:"Ireland" salesCol:100
                · └── LEAF id:2 country:"Ireland" salesCol:200
            `);
        });

        test('accepts column ID string as key', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { colId: 'salesCol', field: 'sales', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `accepts column ID string as key setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── salesCol "Sales" width:200 aggFunc:sum
            `);
            await new GridRows(api, `accepts column ID string as key setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sales: 100 },
                    { id: '2', country: 'Ireland', sales: 200 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // Using string column ID
            const children = irelandGroup!.getAggregatedChildren('salesCol');
            expect(children.length).toBe(2);
            await new GridRows(api, `accepts column ID string as key final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" salesCol:300
                · ├── LEAF id:1 country:"Ireland" salesCol:100
                · └── LEAF id:2 country:"Ireland" salesCol:200
            `);
        });

        test('returns all children when column key is invalid', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sales', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `returns all children when column key is invalid setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum
            `);
            await new GridRows(api, `returns all children when column key is invalid setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sales: 100 },
                    { id: '2', country: 'Ireland', sales: 200 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // Using invalid column ID falls back to returning all children
            const children = irelandGroup!.getAggregatedChildren('nonexistent-column');
            expect(children.length).toBe(2);
            await new GridRows(api, `returns all children when column key is invalid final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" sales:300
                · ├── LEAF id:1 country:"Ireland" sales:100
                · └── LEAF id:2 country:"Ireland" sales:200
            `);
        });
    });

    describe('suppressAggFilteredOnly behaviour', () => {
        test('with suppressAggFilteredOnly: false (default), returns only filtered children', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', filter: 'agSetColumnFilter' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                suppressAggFilteredOnly: false, // explicit default
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sport: 'Sailing', gold: 1 },
                    { id: '2', country: 'Ireland', sport: 'Soccer', gold: 2 },
                    { id: '3', country: 'Ireland', sport: 'Football', gold: 3 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            await new GridRows(api, 'before filter').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:6
                · ├── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1
                · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
                · └── LEAF id:3 country:"Ireland" sport:"Football" gold:3
            `);

            // Before filter: 3 children, aggData should sum to 6
            // Pass 'gold' column to verify column parameter works
            expect(irelandGroup!.aggData?.gold).toBe(6);
            let children = irelandGroup!.getAggregatedChildren('gold');
            expect(children.length).toBe(3);

            // Apply filter to show only Soccer
            await api.setColumnFilterModel('sport', { values: ['Soccer'] });
            api.onFilterChanged();

            await new GridRows(api, 'after Soccer filter').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:2
                · └── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
            `);

            // After filter: 1 visible child, aggData should sum to 2 (only filtered values)
            expect(irelandGroup!.aggData?.gold).toBe(2);
            children = irelandGroup!.getAggregatedChildren(null);
            expect(children.length).toBe(1);
            expect(children[0].data?.id).toBe('2');
        });

        test('with suppressAggFilteredOnly: true, returns ALL children (ignores filter)', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', filter: 'agSetColumnFilter' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                suppressAggFilteredOnly: true, // aggregate all, not just filtered
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', sport: 'Sailing', gold: 1 },
                    { id: '2', country: 'Ireland', sport: 'Soccer', gold: 2 },
                    { id: '3', country: 'Ireland', sport: 'Football', gold: 3 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            await new GridRows(api, 'before filter').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:6
                · ├── LEAF id:1 country:"Ireland" sport:"Sailing" gold:1
                · ├── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
                · └── LEAF id:3 country:"Ireland" sport:"Football" gold:3
            `);

            // Before filter: 3 children, aggData should sum to 6
            // Pass Column object to verify it works
            const goldCol = api.getColumn('gold')!;
            expect(irelandGroup!.aggData?.gold).toBe(6);
            let children = irelandGroup!.getAggregatedChildren(goldCol);
            expect(children.length).toBe(3);

            // Apply filter to show only Soccer
            await api.setColumnFilterModel('sport', { values: ['Soccer'] });
            api.onFilterChanged();

            await new GridRows(api, 'after Soccer filter (suppressAggFilteredOnly=true)').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:6
                · └── LEAF id:2 country:"Ireland" sport:"Soccer" gold:2
            `);

            // After filter: with suppressAggFilteredOnly=true, aggData STILL sums ALL rows (6, not 2)
            expect(irelandGroup!.aggData?.gold).toBe(6);

            // getAggregatedChildren should return ALL children (3, not 1)
            // because it returns the children used for aggregation
            children = irelandGroup!.getAggregatedChildren(null);
            expect(children.length).toBe(3);
            expect(children.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3']);
        });

        test('in pivot mode, filtering applies to childrenMapped regardless of suppressAggFilteredOnly', async () => {
            // Note: In pivot mode, childrenMapped is built from childrenAfterFilter during the pivot stage.
            // This means filtering always affects pivot aggregation, regardless of suppressAggFilteredOnly.
            // This is different from non-pivot aggregation where suppressAggFilteredOnly controls behavior.
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'status', filter: 'agSetColumnFilter' },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                suppressAggFilteredOnly: true, // This doesn't affect pivot - pivot uses childrenMapped from filtered children
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `in pivot mode, filtering applies to childrenMapped regardless of suppressAggFilt setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(
                api,
                `in pivot mode, filtering applies to childrenMapped regardless of suppressAggFilt setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, status: 'active', sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2020, status: 'pending', sales: 500 },
                    { id: '3', country: 'Ireland', year: 2021, status: 'active', sales: 1200 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();

            // Get pivot columns from pivot result columns
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // Before filter: 2 children for 2020, sum should be 1500
            expect(irelandGroup!.aggData?.['pivot_year_2020_sales']).toBe(1500);
            let children2020 = irelandGroup!.getAggregatedChildren(pivot2020Col!);
            expect(children2020.map((n) => n.data?.id).sort()).toEqual(['1', '2']);

            // Apply filter to show only active status
            await api.setColumnFilterModel('status', { values: ['active'] });
            api.onFilterChanged();

            // In pivot mode, filtering ALWAYS applies (childrenMapped is rebuilt from filtered children)
            // So 2020 sum is 1000 (only the active row), NOT 1500
            expect(irelandGroup!.aggData?.['pivot_year_2020_sales']).toBe(1000);

            // getAggregatedChildren for pivot column returns the filtered children matching pivot key
            children2020 = irelandGroup!.getAggregatedChildren(pivot2020Col!);
            expect(children2020.map((n) => n.data?.id)).toEqual(['1']);
            await new GridRows(
                api,
                `in pivot mode, filtering applies to childrenMapped regardless of suppressAggFilt final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                · └── LEAF hidden id:3 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
            `);
        });

        test('in pivot mode with non-leaf groups, getAggregatedChildren uses childrenAfterFilter regardless of suppressAggFilteredOnly', async () => {
            // This test verifies that for pivot columns on non-leaf groups, getAggregatedChildren
            // always returns childrenAfterFilter to match the actual aggregation behaviour.
            // aggregateRowNodeUsingValuesAndPivot always uses childrenAfterFilter for non-leaf groups,
            // so getAggregatedChildren must do the same even when suppressAggFilteredOnly=true.
            //
            // To properly test this, we need filtering to REMOVE an entire child group from
            // childrenAfterFilter while keeping it in childrenAfterGroup.
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'status', filter: 'agSetColumnFilter' },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                suppressAggFilteredOnly: true, // For pivot non-leaf groups, this should be ignored
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `in pivot mode with non-leaf groups, getAggregatedChildren uses childrenAfterFilt setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(
                api,
                `in pivot mode with non-leaf groups, getAggregatedChildren uses childrenAfterFilt setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    // Ireland: all rows are 'active'
                    { id: '1', region: 'Europe', country: 'Ireland', year: 2020, status: 'active', sales: 1000 },
                    { id: '2', region: 'Europe', country: 'Ireland', year: 2020, status: 'active', sales: 500 },
                    // France: all rows are 'pending' - will be filtered out entirely
                    { id: '3', region: 'Europe', country: 'France', year: 2020, status: 'pending', sales: 800 },
                    { id: '4', region: 'Europe', country: 'France', year: 2020, status: 'pending', sales: 200 },
                ],
            });

            const europeGroup = api.getRowNode('row-group-region-Europe');
            expect(europeGroup).toBeDefined();
            expect(europeGroup!.leafGroup).toBe(false); // non-leaf group

            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // Before filter: Europe has 2 country subgroups, aggregated sum = 2500
            expect(europeGroup!.aggData?.['pivot_year_2020_sales']).toBe(2500);
            let europeChildren = europeGroup!.getAggregatedChildren(pivot2020Col!);
            expect(europeChildren.length).toBe(2); // Ireland and France subgroups

            // Apply filter to show only active status - this will remove France entirely
            await api.setColumnFilterModel('status', { values: ['active'] });
            api.onFilterChanged();

            // After filter: France is completely filtered out
            // Aggregation uses childrenAfterFilter which now only has Ireland
            // Ireland: 1000 + 500 = 1500
            expect(europeGroup!.aggData?.['pivot_year_2020_sales']).toBe(1500);

            // getAggregatedChildren for pivot column on non-leaf group should return childrenAfterFilter
            // NOT childrenAfterGroup, even though suppressAggFilteredOnly=true
            // childrenAfterFilter has 1 group (Ireland), childrenAfterGroup has 2 (Ireland + France)
            europeChildren = europeGroup!.getAggregatedChildren(pivot2020Col!);

            // This is the critical assertion - if we incorrectly use childrenAfterGroup,
            // we would get 2 children. The correct answer is 1 (only Ireland).
            expect(europeChildren.length).toBe(1);
            expect(europeChildren[0].key).toBe('Ireland');

            // Verify that getAggregatedChildren matches what was used for aggregation
            const childrenSum = europeChildren.reduce(
                (sum, child) => sum + (child.aggData?.['pivot_year_2020_sales'] ?? 0),
                0
            );
            expect(childrenSum).toBe(europeGroup!.aggData?.['pivot_year_2020_sales']);
            await new GridRows(
                api,
                `in pivot mode with non-leaf groups, getAggregatedChildren uses childrenAfterFilt final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1500
                └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" pivot_year_2020_sales:1500
                · └─┬ LEAF_GROUP collapsed id:row-group-region-Europe-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500
                · · ├── LEAF hidden id:1 pivot_year_2020_sales:1000
                · · └── LEAF hidden id:2 pivot_year_2020_sales:500
            `);
        });

        test('pivot row total columns (pivotKeys: []) use childrenAfterFilter regardless of suppressAggFilteredOnly', async () => {
            // Pivot row total columns are created with pivotKeys: [] (empty array, not undefined).
            // They aggregate across all pivot columns for a given row, and must use childrenAfterFilter
            // to match the actual aggregation behavior in aggregateRowNodeUsingValuesAndPivot.
            //
            // This test ensures that columns with pivotKeys: [] are correctly identified as pivot columns
            // and don't fall through to the non-pivot branch which might use childrenAfterGroup.
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'status', filter: 'agSetColumnFilter' },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                pivotRowTotals: 'after', // Enable pivot row totals - these will have pivotKeys: []
                suppressAggFilteredOnly: true, // Should be ignored for pivot row totals
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(
                api,
                `pivot row total columns (pivotKeys: []) use childrenAfterFilter regardless of su setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── sales "Sales" width:200 aggFunc:sum !visible
            `);
            await new GridRows(
                api,
                `pivot row total columns (pivotKeys: []) use childrenAfterFilter regardless of su setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', country: 'Ireland', year: 2020, status: 'active', sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2020, status: 'pending', sales: 500 },
                    { id: '3', country: 'Ireland', year: 2021, status: 'active', sales: 1200 },
                ],
            });

            const irelandGroup = api.getRowNode('row-group-country-Ireland');
            expect(irelandGroup).toBeDefined();
            expect(irelandGroup!.leafGroup).toBe(true);

            // Find the pivot row total column (should have pivotKeys: [])
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();

            // The total column should have pivotKeys: [] (empty array, not undefined)
            const totalCol = pivotColumns!.find((col) => {
                const colDef = col.getColDef();
                return Array.isArray(colDef.pivotKeys) && colDef.pivotKeys.length === 0;
            });
            expect(totalCol).toBeDefined();
            expect(totalCol!.getColDef().pivotKeys).toEqual([]);

            // Before filter: total should be 2700 (1000 + 500 + 1200)
            const totalColId = totalCol!.getColId();
            expect(irelandGroup!.aggData?.[totalColId]).toBe(2700);

            // getAggregatedChildren should return all 3 leaf rows
            let children = irelandGroup!.getAggregatedChildren(totalCol!);
            expect(children.length).toBe(3);
            expect(children.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3']);

            // Apply filter to show only active status
            await api.setColumnFilterModel('status', { values: ['active'] });
            api.onFilterChanged();

            // After filter: total should only include active rows (1000 + 1200 = 2200)
            // Even with suppressAggFilteredOnly=true, pivot totals must use filtered children
            expect(irelandGroup!.aggData?.[totalColId]).toBe(2200);

            // getAggregatedChildren for pivot row total should return filtered children
            // This is the key assertion: pivotKeys: [] must be treated as a pivot column
            // and use childrenAfterFilter, not childrenAfterGroup
            children = irelandGroup!.getAggregatedChildren(totalCol!);
            expect(children.length).toBe(2);
            expect(children.map((n) => n.data?.id).sort()).toEqual(['1', '3']);
            await new GridRows(
                api,
                `pivot row total columns (pivotKeys: []) use childrenAfterFilter regardless of su final state`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1000 pivot_year_2021_sales:1200 PivotRowTotal_pivot_year__sales:2200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200 PivotRowTotal_pivot_year__sales:2200
                · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000 PivotRowTotal_pivot_year__sales:1000
                · └── LEAF hidden id:3 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200 PivotRowTotal_pivot_year__sales:1200
            `);
        });
    });

    describe('with pinned siblings', () => {
        test('pinned sibling in non-pivot mode returns same children as source', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', gold: 1 },
                    { id: '2', country: 'Ireland', gold: 2 },
                    { id: '3', country: 'Italy', gold: 3 },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'Ireland' && node.group ? 'top' : null),
            };

            const api = await gridsManager.createGridAndWait('myGrid', gridOptions);

            await new GridRows(api, 'after data load with pinned sibling').check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
                │ ├── LEAF id:1 country:"Ireland" gold:1
                │ └── LEAF id:2 country:"Ireland" gold:2
                └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:3
                · └── LEAF id:3 country:"Italy" gold:3
            `);

            const sourceGroup = api.getRowNode('row-group-country-Ireland');
            const pinnedGroup = api.getPinnedTopRow(0);

            expect(sourceGroup).toBeDefined();
            expect(pinnedGroup).toBeDefined();
            expect(pinnedGroup!.key).toBe('Ireland');

            // Both should return the same children
            const sourceChildren = sourceGroup!.getAggregatedChildren('gold');
            const pinnedChildren = pinnedGroup!.getAggregatedChildren('gold');

            expect(sourceChildren.length).toBe(2);
            expect(pinnedChildren.length).toBe(2);
            expect(sourceChildren.map((n) => n.data?.id).sort()).toEqual(['1', '2']);
            expect(pinnedChildren.map((n) => n.data?.id).sort()).toEqual(['1', '2']);
        });

        test('pinned sibling reflects filtering after source is filtered', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', gold: 1 },
                    { id: '2', country: 'Ireland', gold: 5 },
                    { id: '3', country: 'Ireland', gold: 3 },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'Ireland' && node.group ? 'top' : null),
            };

            const api = await gridsManager.createGridAndWait('myGrid', gridOptions);

            const pinnedGroup = api.getPinnedTopRow(0);
            expect(pinnedGroup).toBeDefined();

            await new GridRows(api, 'before filter').check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:9
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:9
                · ├── LEAF id:1 country:"Ireland" gold:1
                · ├── LEAF id:2 country:"Ireland" gold:5
                · └── LEAF id:3 country:"Ireland" gold:3
            `);

            // Before filter: all 3 children
            let pinnedChildren = pinnedGroup!.getAggregatedChildren('gold');
            expect(pinnedChildren.length).toBe(3);

            // Apply filter to show only gold >= 3
            await api.setColumnFilterModel('gold', {
                filterType: 'number',
                type: 'greaterThanOrEqual',
                filter: 3,
            });
            api.onFilterChanged();

            await new GridRows(api, 'after gold>=3 filter').check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:8
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:8
                · ├── LEAF id:2 country:"Ireland" gold:5
                · └── LEAF id:3 country:"Ireland" gold:3
            `);

            // After filter: only 2 children (gold >= 3)
            pinnedChildren = pinnedGroup!.getAggregatedChildren('gold');
            expect(pinnedChildren.length).toBe(2);
            expect(pinnedChildren.map((n) => n.data?.id).sort()).toEqual(['2', '3']);
        });

        test('pinned sibling in pivot mode returns correct children for pivot column', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', year: 2020, sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2021, sales: 1200 },
                    { id: '3', country: 'Ireland', year: 2020, sales: 500 },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'Ireland' && node.group ? 'top' : null),
            };

            const api = await gridsManager.createGridAndWait('myGrid', gridOptions);
            await new GridColumns(api, `pinned sibling in pivot mode returns correct children for pivot column setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
                `);
            await new GridRows(api, `pinned sibling in pivot mode returns correct children for pivot column setup`)
                .check(`
                    PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                    └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                    · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                    · ├── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                    · └── LEAF hidden id:3 pivot_year_2020_sales:500 pivot_year_2021_sales:500
                `);

            const sourceGroup = api.getRowNode('row-group-country-Ireland');
            const pinnedGroup = api.getPinnedTopRow(0);

            expect(sourceGroup).toBeDefined();
            expect(pinnedGroup).toBeDefined();

            // Get the 2020 pivot column
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // Both source and pinned should return same children for 2020
            const sourceChildren2020 = sourceGroup!.getAggregatedChildren(pivot2020Col!);
            const pinnedChildren2020 = pinnedGroup!.getAggregatedChildren(pivot2020Col!);

            expect(sourceChildren2020.length).toBe(2);
            expect(pinnedChildren2020.length).toBe(2);
            expect(sourceChildren2020.map((n) => n.data?.id).sort()).toEqual(['1', '3']);
            expect(pinnedChildren2020.map((n) => n.data?.id).sort()).toEqual(['1', '3']);

            // Get the 2021 pivot column
            const pivot2021Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2021_sales');
            expect(pivot2021Col).toBeDefined();

            // Both should return same children for 2021
            const sourceChildren2021 = sourceGroup!.getAggregatedChildren(pivot2021Col!);
            const pinnedChildren2021 = pinnedGroup!.getAggregatedChildren(pivot2021Col!);

            expect(sourceChildren2021.length).toBe(1);
            expect(pinnedChildren2021.length).toBe(1);
            expect(sourceChildren2021.map((n) => n.data?.id)).toEqual(['2']);
            expect(pinnedChildren2021.map((n) => n.data?.id)).toEqual(['2']);
            await new GridRows(
                api,
                `pinned sibling in pivot mode returns correct children for pivot column final state`
            ).check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                · ├── LEAF hidden id:2 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                · └── LEAF hidden id:3 pivot_year_2020_sales:500 pivot_year_2021_sales:500
            `);
        });

        test('pinned sibling in pivot mode reflects filtering for pivot column', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'status', filter: 'agSetColumnFilter' },
                    { field: 'sales', aggFunc: 'sum', hide: true },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', year: 2020, status: 'active', sales: 1000 },
                    { id: '2', country: 'Ireland', year: 2020, status: 'pending', sales: 500 },
                    { id: '3', country: 'Ireland', year: 2021, status: 'active', sales: 1200 },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'Ireland' && node.group ? 'top' : null),
            };

            const api = await gridsManager.createGridAndWait('myGrid', gridOptions);
            await new GridColumns(api, `pinned sibling in pivot mode reflects filtering for pivot column setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2020" GROUP
                    │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                    └─┬ "2021" GROUP
                      └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
                `);
            await new GridRows(api, `pinned sibling in pivot mode reflects filtering for pivot column setup`).check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1500 pivot_year_2021_sales:1200
                · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                · ├── LEAF hidden id:2 pivot_year_2020_sales:500 pivot_year_2021_sales:500
                · └── LEAF hidden id:3 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
            `);

            const pinnedGroup = api.getPinnedTopRow(0);
            expect(pinnedGroup).toBeDefined();

            // Get the 2020 pivot column
            const pivotColumns = api.getPivotResultColumns();
            expect(pivotColumns).not.toBeNull();
            const pivot2020Col = pivotColumns!.find((col) => col.getColId() === 'pivot_year_2020_sales');
            expect(pivot2020Col).toBeDefined();

            // Before filter: 2 children for 2020
            let pinnedChildren = pinnedGroup!.getAggregatedChildren(pivot2020Col!);
            expect(pinnedChildren.length).toBe(2);
            expect(pinnedChildren.map((n) => n.data?.id).sort()).toEqual(['1', '2']);

            // Apply filter to show only active status
            await api.setColumnFilterModel('status', { values: ['active'] });
            api.onFilterChanged();

            // After filter: only 1 child for 2020 (the active one)
            pinnedChildren = pinnedGroup!.getAggregatedChildren(pivot2020Col!);
            expect(pinnedChildren.length).toBe(1);
            expect(pinnedChildren.map((n) => n.data?.id)).toEqual(['1']);
            await new GridRows(api, `pinned sibling in pivot mode reflects filtering for pivot column final state`)
                .check(`
                    PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    ROOT id:ROOT_NODE_ID pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
                    · ├── LEAF hidden id:1 pivot_year_2020_sales:1000 pivot_year_2021_sales:1000
                    · └── LEAF hidden id:3 pivot_year_2020_sales:1200 pivot_year_2021_sales:1200
                `);
        });

        test('pinned sibling reflects transaction updates to source', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '1', country: 'Ireland', gold: 1 },
                    { id: '2', country: 'Ireland', gold: 2 },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
                enableRowPinning: true,
                isRowPinned: (node) => (node.key === 'Ireland' && node.group ? 'top' : null),
            };

            const api = await gridsManager.createGridAndWait('myGrid', gridOptions);

            const pinnedGroup = api.getPinnedTopRow(0);
            expect(pinnedGroup).toBeDefined();

            await new GridRows(api, 'initial state').check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
                · ├── LEAF id:1 country:"Ireland" gold:1
                · └── LEAF id:2 country:"Ireland" gold:2
            `);

            // Initial: 2 children
            let pinnedChildren = pinnedGroup!.getAggregatedChildren('gold');
            expect(pinnedChildren.length).toBe(2);

            // Add a new row
            applyTransactionChecked(api, {
                add: [{ id: '3', country: 'Ireland', gold: 3 }],
            });

            await new GridRows(api, 'after adding row 3').check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:6
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:6
                · ├── LEAF id:1 country:"Ireland" gold:1
                · ├── LEAF id:2 country:"Ireland" gold:2
                · └── LEAF id:3 country:"Ireland" gold:3
            `);

            // After add: 3 children
            pinnedChildren = pinnedGroup!.getAggregatedChildren('gold');
            expect(pinnedChildren.length).toBe(3);
            expect(pinnedChildren.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3']);

            // Remove a row
            applyTransactionChecked(api, {
                remove: [{ id: '1' }],
            });

            await new GridRows(api, 'after removing row 1').check(`
                PINNED_TOP id:t-top-row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:5
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:5
                · ├── LEAF id:2 country:"Ireland" gold:2
                · └── LEAF id:3 country:"Ireland" gold:3
            `);

            // After remove: 2 children
            pinnedChildren = pinnedGroup!.getAggregatedChildren('gold');
            expect(pinnedChildren.length).toBe(2);
            expect(pinnedChildren.map((n) => n.data?.id).sort()).toEqual(['2', '3']);
        });
    });

    describe('recursive option', () => {
        test('recursive returns all leaf descendants through multiple group levels', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', region: 'Europe', country: 'Ireland', gold: 10 },
                    { id: '2', region: 'Europe', country: 'Ireland', gold: 20 },
                    { id: '3', region: 'Europe', country: 'France', gold: 15 },
                    { id: '4', region: 'Americas', country: 'USA', gold: 30 },
                ],
            });

            await new GridRows(api, 'after data load').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" gold:45
                │ ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:30
                │ │ ├── LEAF id:1 region:"Europe" country:"Ireland" gold:10
                │ │ └── LEAF id:2 region:"Europe" country:"Ireland" gold:20
                │ └─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" gold:15
                │ · └── LEAF id:3 region:"Europe" country:"France" gold:15
                └─┬ filler id:row-group-region-Americas ag-Grid-AutoColumn:"Americas" gold:30
                · └─┬ LEAF_GROUP id:row-group-region-Americas-country-USA ag-Grid-AutoColumn:"USA" gold:30
                · · └── LEAF id:4 region:"Americas" country:"USA" gold:30
            `);

            const europeGroup = api.getRowNode('row-group-region-Europe')!;

            // Without recursive: returns the 2 country subgroups
            const immediateChildren = europeGroup.getAggregatedChildren('gold');
            expect(immediateChildren.length).toBe(2);
            expect(immediateChildren.every((n) => n.group)).toBe(true);

            // With recursive: returns all 3 leaf rows
            const allLeaves = europeGroup.getAggregatedChildren('gold', true);
            expect(allLeaves.length).toBe(3);
            expect(allLeaves.every((n) => !n.group)).toBe(true);
            expect(allLeaves.map((n) => n.data?.id).sort()).toEqual(['1', '2', '3']);

            // For a leaf group, recursive returns the same rows as non-recursive
            const irelandGroup = api.getRowNode('row-group-region-Europe-country-Ireland')!;
            const irelandImmediate = irelandGroup.getAggregatedChildren(null);
            const irelandRecursive = irelandGroup.getAggregatedChildren(null, true);
            expect(irelandRecursive.map((n) => n.data?.id).sort()).toEqual(
                irelandImmediate.map((n) => n.data?.id).sort()
            );
        });

        test('recursive respects filtering', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', filter: 'agSetColumnFilter' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `recursive respects filtering setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── sport "Sport" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            await new GridRows(api, `recursive respects filtering setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', region: 'Europe', country: 'Ireland', sport: 'Soccer', gold: 10 },
                    { id: '2', region: 'Europe', country: 'Ireland', sport: 'Rugby', gold: 20 },
                    { id: '3', region: 'Europe', country: 'France', sport: 'Soccer', gold: 15 },
                ],
            });

            const europeGroup = api.getRowNode('row-group-region-Europe')!;

            // Before filter: 3 leaves
            let allLeaves = europeGroup.getAggregatedChildren('gold', true);
            expect(allLeaves.length).toBe(3);

            // Apply filter
            await api.setColumnFilterModel('sport', { values: ['Soccer'] });
            api.onFilterChanged();

            // After filter: only 2 Soccer leaves
            allLeaves = europeGroup.getAggregatedChildren('gold', true);
            expect(allLeaves.length).toBe(2);
            expect(allLeaves.map((n) => n.data?.id).sort()).toEqual(['1', '3']);
            await new GridRows(api, `recursive respects filtering final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" gold:25
                · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:10
                · │ └── LEAF id:1 region:"Europe" country:"Ireland" sport:"Soccer" gold:10
                · └─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" gold:15
                · · └── LEAF id:3 region:"Europe" country:"France" sport:"Soccer" gold:15
            `);
        });

        test('recursive returns empty array for leaf nodes', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `recursive returns empty array for leaf nodes setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            await new GridRows(api, `recursive returns empty array for leaf nodes setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [{ id: '1', country: 'Ireland', gold: 10 }],
            });

            const leafNode = api.getRowNode('1')!;
            expect(leafNode.getAggregatedChildren('gold', true)).toEqual([]);
            await new GridRows(api, `recursive returns empty array for leaf nodes final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:10
                · └── LEAF id:1 country:"Ireland" gold:10
            `);
        });

        test('recursive with false behaves identically to no argument', async () => {
            const gridOptions: GridOptions = {
                columnDefs: [
                    { field: 'region', rowGroup: true, hide: true },
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                groupDefaultExpanded: -1,
                getRowId: ({ data }) => data.id,
            };

            const api = gridsManager.createGrid('myGrid', gridOptions);
            await new GridColumns(api, `recursive with false behaves identically to no argument setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── gold "Gold" width:200 aggFunc:sum
                `
            );
            await new GridRows(api, `recursive with false behaves identically to no argument setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            applyTransactionChecked(api, {
                add: [
                    { id: '1', region: 'Europe', country: 'Ireland', gold: 10 },
                    { id: '2', region: 'Europe', country: 'France', gold: 15 },
                ],
            });

            const europeGroup = api.getRowNode('row-group-region-Europe')!;

            const withoutArg = europeGroup.getAggregatedChildren('gold');
            const withFalse = europeGroup.getAggregatedChildren('gold', false);

            // Same array reference (no allocation)
            expect(withFalse).toBe(withoutArg);
            await new GridRows(api, `recursive with false behaves identically to no argument final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler id:row-group-region-Europe ag-Grid-AutoColumn:"Europe" gold:25
                · ├─┬ LEAF_GROUP id:row-group-region-Europe-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:10
                · │ └── LEAF id:1 region:"Europe" country:"Ireland" gold:10
                · └─┬ LEAF_GROUP id:row-group-region-Europe-country-France ag-Grid-AutoColumn:"France" gold:15
                · · └── LEAF id:2 region:"Europe" country:"France" gold:15
            `);
        });
    });
});
