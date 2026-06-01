import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../../test-utils';

describe('group order maintenance / sort modes', () => {
    const gridsManager = new TestGridsManager({
        modules: [QuickFilterModule, ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => gridsManager.reset());

    test('runtime groupMaintainOrder toggle: option is in refreshProps, takes effect immediately', async () => {
        // Insertion order is Italy, USA, Audi (NOT alphabetical, NOT sales-asc). `sales` is
        // aggregated, so a group-level sort by `sales` reads `aggData.sales` and produces
        // distinct values per country (Italy=10, USA=50, Audi=20). The toggle's effect on the
        // country level is therefore observable:
        //   maintainOrder=false → country sorted by [sales asc]: Italy(10), Audi(20), USA(50)
        //   maintainOrder=true  → country structural: Italy, USA, Audi
        const rowData = [
            { id: '1', country: 'Italy', sales: 10 },
            { id: '2', country: 'USA', sales: 50 },
            { id: '3', country: 'Audi', sales: 20 },
        ];

        const api = gridsManager.createGrid('grid-runtime-toggle', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'sales', aggFunc: 'sum', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: false,
            rowData,
            getRowId: (p) => p.data.id,
        });

        // With maintainOrder=false, [sales asc] cascades to the country level (full sortOptions
        // applied everywhere). Country level sorts by aggregated sales: Italy(10), Audi(20), USA(50).
        api.applyColumnState({ state: [{ colId: 'sales', sort: 'asc' }] });
        await new GridRows(api, 'maintainOrder=false: country level cascades, sorted by sales asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:10
            │ └── LEAF id:1 country:"Italy" sales:10
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:20
            │ └── LEAF id:3 country:"Audi" sales:20
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:50
            · └── LEAF id:2 country:"USA" sales:50
        `);

        // `groupMaintainOrder` is in `refreshProps` — toggling triggers an immediate sort refresh.
        // With maintainOrder=true, [sales asc] routes to the leaf bucket only; the country level
        // takes the no-sort branch and reverts to STRUCTURAL order [Italy, USA, Audi] (insertion).
        api.setGridOption('groupMaintainOrder', true);
        await new GridRows(api, 'toggle ON: refresh applied, country reverts to structural order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:10
            │ └── LEAF id:1 country:"Italy" sales:10
            ├─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:50
            │ └── LEAF id:2 country:"USA" sales:50
            └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:20
            · └── LEAF id:3 country:"Audi" sales:20
        `);

        // Toggle back to false: refresh re-cascades [sales asc] to the country level.
        api.setGridOption('groupMaintainOrder', false);
        await new GridRows(api, 'toggle OFF: refresh applied, country re-sorted by sales asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" sales:10
            │ └── LEAF id:1 country:"Italy" sales:10
            ├─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" sales:20
            │ └── LEAF id:3 country:"Audi" sales:20
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" sales:50
            · └── LEAF id:2 country:"USA" sales:50
        `);
    });

    test('pivot mode: leaf-group children are not reordered by an active leaf-column sort', async () => {
        const rowData = [
            { id: '1', country: 'Audi', year: 2020, athlete: 'Z' },
            { id: '2', country: 'Audi', year: 2020, athlete: 'A' },
            { id: '3', country: 'Audi', year: 2021, athlete: 'M' },
        ];

        const api = gridsManager.createGrid('grid-pivot-leaf-skip', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'athlete', sort: 'asc' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (p) => p.data.id,
        });
        await new GridColumns(
            api,
            `pivot mode: leaf-group children are not reordered by an active leaf-column sort setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── athlete "Athlete" width:200 sort:asc
        `);
        await new GridRows(api, `pivot mode: leaf-group children are not reordered by an active leaf-column sort setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
                · ├── LEAF id:2 country:"Audi" year:2020 athlete:"A"
                · ├── LEAF id:3 country:"Audi" year:2021 athlete:"M"
                · └── LEAF id:1 country:"Audi" year:2020 athlete:"Z"
            `);

        const audi = () => api.getRowNode('row-group-country-Audi')!;
        const childIds = () => audi().childrenAfterSort?.map((n) => n.id);

        expect(childIds()).toEqual(['2', '3', '1']);

        api.setGridOption('pivotMode', true);
        await new GridColumns(
            api,
            `pivot mode: leaf-group children are not reordered by an active leaf-column sort after setGridOption pivotMode`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_ "-" width:200
            └─┬ "2021" GROUP
              └── pivot_year_2021_ "-" width:200
        `);
        await new GridRows(
            api,
            `pivot mode: leaf-group children are not reordered by an active leaf-column sort after setGridOption pivotMode`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Audi ag-Grid-AutoColumn:"Audi"
            · ├── LEAF hidden id:1
            · ├── LEAF hidden id:2
            · └── LEAF hidden id:3
        `);
        expect(childIds()).toEqual(['1', '2', '3']);
    });

    test('pivot mode + groupMaintainOrder: filter cycle preserves group order', async () => {
        const rowData = [
            { id: '1', country: 'Audi', year: 2020, sales: 10 },
            { id: '2', country: 'BMW', year: 2020, sales: 20 },
            { id: '3', country: 'Tesla', year: 2021, sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-pivot', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            pivotMode: true,
            rowData,
            getRowId: (p) => p.data.id,
        });
        await new GridColumns(api, `pivot mode + groupMaintainOrder: filter cycle preserves group order setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Country" width:200
                ├─┬ "2020" GROUP
                │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
                └─┬ "2021" GROUP
                  └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
            `);
        await new GridRows(api, `pivot mode + groupMaintainOrder: filter cycle preserves group order setup`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:30 pivot_year_2021_sales:30
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" pivot_year_2020_sales:10 pivot_year_2021_sales:null
            │ └── LEAF hidden id:1 pivot_year_2020_sales:10 pivot_year_2021_sales:10
            ├─┬ LEAF_GROUP collapsed id:row-group-country-BMW ag-Grid-AutoColumn:"BMW" pivot_year_2020_sales:20 pivot_year_2021_sales:null
            │ └── LEAF hidden id:2 pivot_year_2020_sales:20 pivot_year_2021_sales:20
            └─┬ LEAF_GROUP collapsed id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla" pivot_year_2020_sales:null pivot_year_2021_sales:30
            · └── LEAF hidden id:3 pivot_year_2020_sales:30 pivot_year_2021_sales:30
        `);

        const initialOrder = ['Audi', 'BMW', 'Tesla'];
        const renderedKeys = () =>
            api
                .getRenderedNodes()
                .filter((n) => n.level === 0 && n.group)
                .map((n) => n.key);

        expect(renderedKeys()).toEqual(initialOrder);

        api.setGridOption('quickFilterText', 'BMW');
        await new GridColumns(
            api,
            `pivot mode + groupMaintainOrder: filter cycle preserves group order after setGridOption quickFilterText`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `pivot mode + groupMaintainOrder: filter cycle preserves group order after setGridOption quickFilterText`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:30 pivot_year_2021_sales:30
            └─┬ LEAF_GROUP collapsed id:row-group-country-BMW ag-Grid-AutoColumn:"BMW" pivot_year_2020_sales:20 pivot_year_2021_sales:null
            · └── LEAF hidden id:2 pivot_year_2020_sales:20 pivot_year_2021_sales:20
        `);
        expect(renderedKeys()).toEqual(['BMW']);

        api.setGridOption('quickFilterText', undefined);
        await new GridColumns(
            api,
            `pivot mode + groupMaintainOrder: filter cycle preserves group order after setGridOption quickFilterText #2`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              └── pivot_year_2021_sales "Sales" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `pivot mode + groupMaintainOrder: filter cycle preserves group order after setGridOption quickFilterText #2`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:30 pivot_year_2021_sales:30
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Audi ag-Grid-AutoColumn:"Audi" pivot_year_2020_sales:10 pivot_year_2021_sales:null
            │ └── LEAF hidden id:1 pivot_year_2020_sales:10 pivot_year_2021_sales:10
            ├─┬ LEAF_GROUP collapsed id:row-group-country-BMW ag-Grid-AutoColumn:"BMW" pivot_year_2020_sales:20 pivot_year_2021_sales:null
            │ └── LEAF hidden id:2 pivot_year_2020_sales:20 pivot_year_2021_sales:20
            └─┬ LEAF_GROUP collapsed id:row-group-country-Tesla ag-Grid-AutoColumn:"Tesla" pivot_year_2020_sales:null pivot_year_2021_sales:30
            · └── LEAF hidden id:3 pivot_year_2020_sales:30 pivot_year_2021_sales:30
        `);
        expect(renderedKeys()).toEqual(initialOrder);
    });

    test('updating a row without changing group does not change group order (groupMaintainOrder=false)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'I1' },
            { id: '2', country: 'Ireland', athlete: 'I2' },
            { id: '3', country: 'Italy', athlete: 'It1' },
            { id: '4', country: 'France', athlete: 'F1' },
        ];

        const api = gridsManager.createGrid('grid-update-no-group-change', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: false,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);

        applyTransactionChecked(api, { update: [{ id: '2', country: 'Ireland', athlete: 'I2-upd' }] });

        await new GridRows(api, 'after update').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"I1"
            │ └── LEAF id:2 country:"Ireland" athlete:"I2-upd"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"It1"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"F1"
        `);
    });

    test('leaf-column sort preserves group order (groupMaintainOrder=true)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'Zed' },
            { id: '2', country: 'Italy', athlete: 'Ann' },
            { id: '3', country: 'France', athlete: 'Mike' },
        ];

        const api = gridsManager.createGrid('grid-leaf-sort-preserves', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Zed"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"Ann"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"Mike"
        `);

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });

        await new GridRows(api, 'leaf sort asc preserves group order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Zed"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"Ann"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"Mike"
        `);
    });

    test('group-column sort reorders groups (sorting coupled)', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'A' },
            { id: '2', country: 'Italy', athlete: 'B' },
            { id: '3', country: 'France', athlete: 'C' },
        ];

        const api = gridsManager.createGrid('grid-group-col-sort-reorders', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"B"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"C"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: 'asc' }] });

        await new GridRows(api, 'group sort asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:3 country:"France" athlete:"C"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 country:"Italy" athlete:"B"
        `);

        // Change to desc: Italy, Ireland, France
        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });

        await new GridRows(api, 'group sort desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"B"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"C"
        `);
    });

    test('adding a leaf sort while a group sort is active: each level sorts with its own options', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'Z' },
            { id: '2', country: 'Italy', athlete: 'A' },
            { id: '3', country: 'France', athlete: 'M' },
        ];

        const api = gridsManager.createGrid('grid-leaf-sort-while-group-sort-active', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, sortable: true },
                { field: 'athlete', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridRows(api, 'initial unsorted').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Z"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"A"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"M"
        `);

        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
        await new GridRows(api, 'after group sort desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Z"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"M"
        `);

        api.applyColumnState({ state: [{ colId: 'athlete', sort: 'asc' }] });
        await new GridRows(api, 'leaf sort maintains last group order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:2 country:"Italy" athlete:"A"
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:1 country:"Ireland" athlete:"Z"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" athlete:"M"
        `);
    });

    test('multi-level groupMaintainOrder: sort at one level only reorders that level', async () => {
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
            { id: '5', country: 'USA', year: 2018, sales: 70 },
        ];

        const api = gridsManager.createGrid('grid-multi-level-sort', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sales' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'year', sort: 'asc' }] });
        await new GridRows(api, 'inner (year) sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:2 country:"Italy" year:2020 sales:50
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:1 country:"Italy" year:2021 sales:100
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:3 country:"France" year:2019 sales:200
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:4 country:"France" year:2022 sales:30
            └─┬ filler id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            · └─┬ LEAF_GROUP id:row-group-country-USA-year-2018 ag-Grid-AutoColumn:2018
            · · └── LEAF id:5 country:"USA" year:2018 sales:70
        `);

        api.applyColumnState({
            state: [{ colId: 'country', sort: 'asc' }],
            defaultState: { sort: null },
        });
        await new GridRows(api, 'outer (country) sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:3 country:"France" year:2019 sales:200
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:4 country:"France" year:2022 sales:30
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ │ └── LEAF id:1 country:"Italy" year:2021 sales:100
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:2 country:"Italy" year:2020 sales:50
            └─┬ filler id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            · └─┬ LEAF_GROUP id:row-group-country-USA-year-2018 ag-Grid-AutoColumn:2018
            · · └── LEAF id:5 country:"USA" year:2018 sales:70
        `);
    });

    test('multi-level groupMaintainOrder + secondary leaf sort: leaf rows sort inside each leaf group', async () => {
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, athlete: 'Zed' },
            { id: '2', country: 'Italy', year: 2021, athlete: 'Anna' },
            { id: '3', country: 'France', year: 2019, athlete: 'Mark' },
            { id: '4', country: 'France', year: 2019, athlete: 'Bob' },
        ];

        const api = gridsManager.createGrid('grid-leaf-sort-secondary', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'athlete', sort: 'asc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'leaf-sort-secondary: country reorders, leaf rows sort by athlete').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ · ├── LEAF id:4 country:"France" year:2019 athlete:"Bob"
            │ · └── LEAF id:3 country:"France" year:2019 athlete:"Mark"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · ├── LEAF id:2 country:"Italy" year:2021 athlete:"Anna"
            · · └── LEAF id:1 country:"Italy" year:2021 athlete:"Zed"
        `);
    });

    test('singleColumn + groupMaintainOrder: cascade-equivalent group sort reorders every level', async () => {
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-single-col-cascade', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sales' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({
            state: [
                { colId: 'country', sort: 'asc', sortIndex: 0 },
                { colId: 'year', sort: 'asc', sortIndex: 1 },
            ],
        });

        await new GridRows(api, 'singleColumn cascade: country and year both reorder').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2019 ag-Grid-AutoColumn:2019
            │ │ └── LEAF id:3 country:"France" year:2019 sales:200
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2022 ag-Grid-AutoColumn:2022
            │ · └── LEAF id:4 country:"France" year:2022 sales:30
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ └── LEAF id:2 country:"Italy" year:2020 sales:50
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:1 country:"Italy" year:2021 sales:100
        `);
    });

    test('singleColumn cascade with 5 group levels: every level reorders', async () => {
        const rowData = [
            { id: '1', a: 'Z', b: 'X', c: 'Q', d: 'M', e: 'C' },
            { id: '2', a: 'A', b: 'Y', c: 'P', d: 'L', e: 'B' },
            { id: '3', a: 'M', b: 'B', c: 'O', d: 'K', e: 'A' },
            { id: '4', a: 'C', b: 'A', c: 'N', d: 'J', e: 'D' },
        ];

        const api = gridsManager.createGrid('grid-five-level-cascade', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'b', rowGroup: true, hide: true },
                { field: 'c', rowGroup: true, hide: true },
                { field: 'd', rowGroup: true, hide: true },
                { field: 'e', rowGroup: true, hide: true },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        await new GridColumns(api, 'five-level: single auto-display column').checkColumns(`
            CENTER
            └── ag-Grid-AutoColumn "Group" width:200
        `);

        api.applyColumnState({
            state: [
                { colId: 'a', sort: 'asc', sortIndex: 0 },
                { colId: 'b', sort: 'asc', sortIndex: 1 },
                { colId: 'c', sort: 'asc', sortIndex: 2 },
                { colId: 'd', sort: 'asc', sortIndex: 3 },
                { colId: 'e', sort: 'asc', sortIndex: 4 },
            ],
        });

        await new GridRows(api, 'five-level cascade asc: every level reorders').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-a-A ag-Grid-AutoColumn:"A"
            │ └─┬ filler id:row-group-a-A-b-Y ag-Grid-AutoColumn:"Y"
            │ · └─┬ filler id:row-group-a-A-b-Y-c-P ag-Grid-AutoColumn:"P"
            │ · · └─┬ filler id:row-group-a-A-b-Y-c-P-d-L ag-Grid-AutoColumn:"L"
            │ · · · └─┬ LEAF_GROUP id:row-group-a-A-b-Y-c-P-d-L-e-B ag-Grid-AutoColumn:"B"
            │ · · · · └── LEAF id:2 a:"A" b:"Y" c:"P" d:"L" e:"B"
            ├─┬ filler id:row-group-a-C ag-Grid-AutoColumn:"C"
            │ └─┬ filler id:row-group-a-C-b-A ag-Grid-AutoColumn:"A"
            │ · └─┬ filler id:row-group-a-C-b-A-c-N ag-Grid-AutoColumn:"N"
            │ · · └─┬ filler id:row-group-a-C-b-A-c-N-d-J ag-Grid-AutoColumn:"J"
            │ · · · └─┬ LEAF_GROUP id:row-group-a-C-b-A-c-N-d-J-e-D ag-Grid-AutoColumn:"D"
            │ · · · · └── LEAF id:4 a:"C" b:"A" c:"N" d:"J" e:"D"
            ├─┬ filler id:row-group-a-M ag-Grid-AutoColumn:"M"
            │ └─┬ filler id:row-group-a-M-b-B ag-Grid-AutoColumn:"B"
            │ · └─┬ filler id:row-group-a-M-b-B-c-O ag-Grid-AutoColumn:"O"
            │ · · └─┬ filler id:row-group-a-M-b-B-c-O-d-K ag-Grid-AutoColumn:"K"
            │ · · · └─┬ LEAF_GROUP id:row-group-a-M-b-B-c-O-d-K-e-A ag-Grid-AutoColumn:"A"
            │ · · · · └── LEAF id:3 a:"M" b:"B" c:"O" d:"K" e:"A"
            └─┬ filler id:row-group-a-Z ag-Grid-AutoColumn:"Z"
            · └─┬ filler id:row-group-a-Z-b-X ag-Grid-AutoColumn:"X"
            · · └─┬ filler id:row-group-a-Z-b-X-c-Q ag-Grid-AutoColumn:"Q"
            · · · └─┬ filler id:row-group-a-Z-b-X-c-Q-d-M ag-Grid-AutoColumn:"M"
            · · · · └─┬ LEAF_GROUP id:row-group-a-Z-b-X-c-Q-d-M-e-C ag-Grid-AutoColumn:"C"
            · · · · · └── LEAF id:1 a:"Z" b:"X" c:"Q" d:"M" e:"C"
        `);

        // Flip to descending — order reverses on every level: Z → M → C → A (ids 1,3,4,2).
        api.applyColumnState({
            state: [
                { colId: 'a', sort: 'desc', sortIndex: 0 },
                { colId: 'b', sort: 'desc', sortIndex: 1 },
                { colId: 'c', sort: 'desc', sortIndex: 2 },
                { colId: 'd', sort: 'desc', sortIndex: 3 },
                { colId: 'e', sort: 'desc', sortIndex: 4 },
            ],
        });

        await new GridRows(api, 'five-level cascade desc: every level reverses').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-a-Z ag-Grid-AutoColumn:"Z"
            │ └─┬ filler id:row-group-a-Z-b-X ag-Grid-AutoColumn:"X"
            │ · └─┬ filler id:row-group-a-Z-b-X-c-Q ag-Grid-AutoColumn:"Q"
            │ · · └─┬ filler id:row-group-a-Z-b-X-c-Q-d-M ag-Grid-AutoColumn:"M"
            │ · · · └─┬ LEAF_GROUP id:row-group-a-Z-b-X-c-Q-d-M-e-C ag-Grid-AutoColumn:"C"
            │ · · · · └── LEAF id:1 a:"Z" b:"X" c:"Q" d:"M" e:"C"
            ├─┬ filler id:row-group-a-M ag-Grid-AutoColumn:"M"
            │ └─┬ filler id:row-group-a-M-b-B ag-Grid-AutoColumn:"B"
            │ · └─┬ filler id:row-group-a-M-b-B-c-O ag-Grid-AutoColumn:"O"
            │ · · └─┬ filler id:row-group-a-M-b-B-c-O-d-K ag-Grid-AutoColumn:"K"
            │ · · · └─┬ LEAF_GROUP id:row-group-a-M-b-B-c-O-d-K-e-A ag-Grid-AutoColumn:"A"
            │ · · · · └── LEAF id:3 a:"M" b:"B" c:"O" d:"K" e:"A"
            ├─┬ filler id:row-group-a-C ag-Grid-AutoColumn:"C"
            │ └─┬ filler id:row-group-a-C-b-A ag-Grid-AutoColumn:"A"
            │ · └─┬ filler id:row-group-a-C-b-A-c-N ag-Grid-AutoColumn:"N"
            │ · · └─┬ filler id:row-group-a-C-b-A-c-N-d-J ag-Grid-AutoColumn:"J"
            │ · · · └─┬ LEAF_GROUP id:row-group-a-C-b-A-c-N-d-J-e-D ag-Grid-AutoColumn:"D"
            │ · · · · └── LEAF id:4 a:"C" b:"A" c:"N" d:"J" e:"D"
            └─┬ filler id:row-group-a-A ag-Grid-AutoColumn:"A"
            · └─┬ filler id:row-group-a-A-b-Y ag-Grid-AutoColumn:"Y"
            · · └─┬ filler id:row-group-a-A-b-Y-c-P ag-Grid-AutoColumn:"P"
            · · · └─┬ filler id:row-group-a-A-b-Y-c-P-d-L ag-Grid-AutoColumn:"L"
            · · · · └─┬ LEAF_GROUP id:row-group-a-A-b-Y-c-P-d-L-e-B ag-Grid-AutoColumn:"B"
            · · · · · └── LEAF id:2 a:"A" b:"Y" c:"P" d:"L" e:"B"
        `);
    });

    test('multipleColumns + custom colId on rowGroup column: per-level isolation is preserved', async () => {
        // Each rowGroup column has a custom colId; multipleColumns generates one auto-display
        // column per level whose `showRowGroup` is the source colId. Locks in the unified
        // buildLevelSortTargeted lookup: matches source rowGroup columns by reference AND
        // auto-display columns by `colDef.showRowGroup`, regardless of coupling.
        const rowData = [
            { id: '1', country: 'Italy', year: 2021, sales: 100 },
            { id: '2', country: 'Italy', year: 2020, sales: 50 },
            { id: '3', country: 'France', year: 2019, sales: 200 },
            { id: '4', country: 'France', year: 2022, sales: 30 },
        ];

        const api = gridsManager.createGrid('grid-multi-cols-custom-colid', {
            columnDefs: [
                { colId: 'customCountry', field: 'country', rowGroup: true, hide: true },
                { colId: 'customYear', field: 'year', rowGroup: true, hide: true },
                { field: 'sales' },
            ],
            groupDisplayType: 'multipleColumns',
            animateRows: false,
            groupDefaultExpanded: -1,
            groupMaintainOrder: true,
            rowData,
            getRowId: (p) => p.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'customYear', sort: 'asc' }] });

        // Country groups stay in structural order (Italy, France); year groups within each
        // country are sorted ascending.
        await new GridRows(api, 'multipleColumns: year sort respects per-level isolation').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-customCountry:null ag-Grid-AutoColumn-customYear:null
            ├─┬ filler id:row-group-customCountry-Italy ag-Grid-AutoColumn-customCountry:"Italy" ag-Grid-AutoColumn-customYear:null
            │ ├─┬ LEAF_GROUP id:row-group-customCountry-Italy-customYear-2020 ag-Grid-AutoColumn-customYear:2020
            │ │ └── LEAF id:2 customCountry:"Italy" customYear:2020 sales:50
            │ └─┬ LEAF_GROUP id:row-group-customCountry-Italy-customYear-2021 ag-Grid-AutoColumn-customYear:2021
            │ · └── LEAF id:1 customCountry:"Italy" customYear:2021 sales:100
            └─┬ filler id:row-group-customCountry-France ag-Grid-AutoColumn-customCountry:"France" ag-Grid-AutoColumn-customYear:null
            · ├─┬ LEAF_GROUP id:row-group-customCountry-France-customYear-2019 ag-Grid-AutoColumn-customYear:2019
            · │ └── LEAF id:3 customCountry:"France" customYear:2019 sales:200
            · └─┬ LEAF_GROUP id:row-group-customCountry-France-customYear-2022 ag-Grid-AutoColumn-customYear:2022
            · · └── LEAF id:4 customCountry:"France" customYear:2022 sales:30
        `);

        await new GridColumns(api, 'multipleColumns: auto-display columns + sales').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-customCountry "Country" width:200
            ├── ag-Grid-AutoColumn-customYear "Year" width:200
            └── sales "Sales" width:200
        `);
    });
});
