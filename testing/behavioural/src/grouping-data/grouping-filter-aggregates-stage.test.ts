import { ClientSideRowModelModule, NumberFilterModule, QuickFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

describe('ag-grid filterAggregatesStage', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('groupAggFiltering=true filters groups by aggregate values', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            groupAggFiltering: true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', gold: 1 },
                { country: 'Ireland', gold: 2 },
                { country: 'Italy', gold: 4 },
                { country: 'Italy', gold: 5 },
                { country: 'France', gold: 1 },
            ]),
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            │ ├── LEAF id:2 country:"Italy" gold:4
            │ └── LEAF id:3 country:"Italy" gold:5
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" gold:1
            · └── LEAF id:4 country:"France" gold:1
        `);

        // Filter: gold > 5 — only Italy (sum=9) passes
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 5 },
        });

        await new GridRows(api, 'gold > 5').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            · ├── LEAF id:2 country:"Italy" gold:4
            · └── LEAF id:3 country:"Italy" gold:5
        `);

        // Filter: gold >= 3 — Ireland (sum=3) and Italy (sum=9) pass
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThanOrEqual', filter: 3 },
        });

        await new GridRows(api, 'gold >= 3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            · ├── LEAF id:2 country:"Italy" gold:4
            · └── LEAF id:3 country:"Italy" gold:5
        `);

        // Clear filter
        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            │ ├── LEAF id:2 country:"Italy" gold:4
            │ └── LEAF id:3 country:"Italy" gold:5
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" gold:1
            · └── LEAF id:4 country:"France" gold:1
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
    });

    test('groupAggFiltering callback controls which rows are tested by the filter', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            // Only apply aggregate filter to group rows (not leaves)
            groupAggFiltering: (params) => params.node.group === true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', gold: 1 },
                { country: 'Ireland', gold: 2 },
                { country: 'Italy', gold: 4 },
                { country: 'Italy', gold: 5 },
                { country: 'France', gold: 1 },
            ]),
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            │ ├── LEAF id:2 country:"Italy" gold:4
            │ └── LEAF id:3 country:"Italy" gold:5
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" gold:1
            · └── LEAF id:4 country:"France" gold:1
        `);

        // Filter: gold > 5 — only group rows are tested, so Italy (sum=9) passes.
        // Leaves are NOT tested by the aggregate filter, so they're preserved.
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 5 },
        });

        await new GridRows(api, 'gold > 5, callback filters groups only').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            · ├── LEAF id:2 country:"Italy" gold:4
            · └── LEAF id:3 country:"Italy" gold:5
        `);

        // Change callback: apply filter to all rows (groups and leaves)
        api.setGridOption('groupAggFiltering', () => true);

        await new GridRows(api, 'gold > 5, callback filters all rows').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            · ├── LEAF id:2 country:"Italy" gold:4
            · └── LEAF id:3 country:"Italy" gold:5
        `);

        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:9
            │ ├── LEAF id:2 country:"Italy" gold:4
            │ └── LEAF id:3 country:"Italy" gold:5
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" gold:1
            · └── LEAF id:4 country:"France" gold:1
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
    });

    test('multi-level grouping: parent kept because child passes, parent filtered when no children pass', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: -1,
            // Only apply filter to leaf groups — filler groups are kept/removed based on whether children pass
            groupAggFiltering: (params) => params.node.leafGroup === true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', year: 2020, gold: 1 },
                { country: 'Ireland', year: 2021, gold: 10 },
                { country: 'Italy', year: 2020, gold: 2 },
                { country: 'Italy', year: 2021, gold: 3 },
            ]),
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 gold:1
            │ │ └── LEAF id:0 country:"Ireland" year:2020 gold:1
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            │ · └── LEAF id:1 country:"Ireland" year:2021 gold:10
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020 gold:2
            · │ └── LEAF id:2 country:"Italy" year:2020 gold:2
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021 gold:3
            · · └── LEAF id:3 country:"Italy" year:2021 gold:3
        `);

        // Filter: gold > 5 — only leaf groups are tested.
        // Ireland/2020 (1) fails, Ireland/2021 (10) passes → Ireland filler kept (has passing child).
        // Italy/2020 (2) fails, Italy/2021 (3) fails → Italy filler removed (no passing children).
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 5 },
        });

        await new GridRows(api, 'gold > 5').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            · · └── LEAF id:1 country:"Ireland" year:2021 gold:10
        `);

        // Filter: gold >= 2 — Ireland (2021=10 passes), Italy (2020=2 passes, 2021=3 passes)
        // Both filler groups kept because at least one leaf group passes.
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThanOrEqual', filter: 2 },
        });

        await new GridRows(api, 'gold >= 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            │ · └── LEAF id:1 country:"Ireland" year:2021 gold:10
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020 gold:2
            · │ └── LEAF id:2 country:"Italy" year:2020 gold:2
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021 gold:3
            · · └── LEAF id:3 country:"Italy" year:2021 gold:3
        `);

        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 gold:1
            │ │ └── LEAF id:0 country:"Ireland" year:2020 gold:1
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            │ · └── LEAF id:1 country:"Ireland" year:2021 gold:10
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020 gold:2
            · │ └── LEAF id:2 country:"Italy" year:2020 gold:2
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021 gold:3
            · · └── LEAF id:3 country:"Italy" year:2021 gold:3
        `);
    });

    test('all children filtered out by aggregate filter removes the group', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            groupAggFiltering: true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', gold: 1 },
                { country: 'Italy', gold: 2 },
            ]),
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:1
            │ └── LEAF id:0 country:"Ireland" gold:1
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:2
            · └── LEAF id:1 country:"Italy" gold:2
        `);

        // Filter: gold > 100 — no group passes, all removed
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 100 },
        });

        await new GridRows(api, 'gold > 100, all filtered out').check(`
            ROOT id:ROOT_NODE_ID
        `);

        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:1
            │ └── LEAF id:0 country:"Ireland" gold:1
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:2
            · └── LEAF id:1 country:"Italy" gold:2
        `);
    });

    test('groupAggFiltering=true with multi-level: passing parent preserves all descendants', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: -1,
            groupAggFiltering: true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', year: 2020, gold: 1 },
                { country: 'Ireland', year: 2021, gold: 10 },
                { country: 'Italy', year: 2020, gold: 2 },
                { country: 'Italy', year: 2021, gold: 3 },
            ]),
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 gold:1
            │ │ └── LEAF id:0 country:"Ireland" year:2020 gold:1
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            │ · └── LEAF id:1 country:"Ireland" year:2021 gold:10
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020 gold:2
            · │ └── LEAF id:2 country:"Italy" year:2020 gold:2
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021 gold:3
            · · └── LEAF id:3 country:"Italy" year:2021 gold:3
        `);

        // Filter: gold > 8 — Ireland filler (11) passes → all descendants recursively preserved.
        // Italy filler (5) fails, and no child passes either → removed entirely.
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 8 },
        });

        await new GridRows(api, 'gold > 8').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            · ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 gold:1
            · │ └── LEAF id:0 country:"Ireland" year:2020 gold:1
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            · · └── LEAF id:1 country:"Ireland" year:2021 gold:10
        `);

        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:11
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 gold:1
            │ │ └── LEAF id:0 country:"Ireland" year:2020 gold:1
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 gold:10
            │ · └── LEAF id:1 country:"Ireland" year:2021 gold:10
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:5
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020 gold:2
            · │ └── LEAF id:2 country:"Italy" year:2020 gold:2
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021 gold:3
            · · └── LEAF id:3 country:"Italy" year:2021 gold:3
        `);
    });

    test('groupAggFiltering=true with grandTotalRow and suppressAggFilteredOnly', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            grandTotalRow: 'top',
            alwaysAggregateAtRootLevel: true,
            groupAggFiltering: true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', gold: 1 },
                { country: 'Ireland', gold: 2 },
                { country: 'Italy', gold: 10 },
            ]),
        });

        // Filter: gold > 5 — only Italy passes
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 5 },
        });

        // Aggregation runs before filterAggregatesStage, so ROOT aggregates all children
        await new GridRows(api, 'gold > 5, default aggregation').check(`
            ROOT id:ROOT_NODE_ID gold:13
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:13
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);

        // With suppressAggFilteredOnly, aggregation always uses ALL children — same result here
        api.setGridOption('suppressAggFilteredOnly', true);

        await new GridRows(api, 'gold > 5, suppressAggFilteredOnly=true').check(`
            ROOT id:ROOT_NODE_ID gold:13
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " gold:13
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);
    });

    test('enabling groupAggFiltering at runtime triggers re-filter', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', gold: 1 },
                { country: 'Ireland', gold: 2 },
                { country: 'Italy', gold: 10 },
            ]),
        });

        // Without groupAggFiltering, filter applies to leaf rows (default predicate: !node.group)
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 5 },
        });

        await new GridRows(api, 'gold > 5, no groupAggFiltering').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);

        // Enable groupAggFiltering at runtime — now filter applies to groups by aggregate
        api.setGridOption('groupAggFiltering', true);

        await new GridRows(api, 'gold > 5, groupAggFiltering=true').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);

        // Filter: gold >= 3 — Ireland (sum=3) now passes because filter tests the aggregate
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThanOrEqual', filter: 3 },
        });

        await new GridRows(api, 'gold >= 3, groupAggFiltering=true').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);

        // Disable groupAggFiltering — revert to default leaf-only filtering
        api.setGridOption('groupAggFiltering', false);

        // gold >= 3: now filters leaf rows, so only Italy/gold=10 passes
        await new GridRows(api, 'gold >= 3, groupAggFiltering=false').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);
    });
});

describe('ag-grid filterAggregatesStage pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('pivot mode uses leafGroup predicate for aggregate filtering', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'athlete', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Athlete' },
            groupDefaultExpanded: -1,
            pivotMode: true,
            rowData: cachedJSONObjects.array([
                { athlete: 'Michael Phelps', gold: 8 },
                { athlete: 'Michael Phelps', gold: 6 },
                { athlete: 'Natalie Coughlin', gold: 1 },
                { athlete: 'Natalie Coughlin', gold: 2 },
            ]),
        });

        await new GridRows(api, 'initial pivot').check(`
            ROOT id:ROOT_NODE_ID gold:17
            ├─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:14
            │ ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
            │ └── LEAF hidden id:1 athlete:"Michael Phelps" gold:6
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Natalie Coughlin" ag-Grid-AutoColumn:"Natalie Coughlin" gold:3
            · ├── LEAF hidden id:2 athlete:"Natalie Coughlin" gold:1
            · └── LEAF hidden id:3 athlete:"Natalie Coughlin" gold:2
        `);

        // In pivot mode without groupAggFiltering, default predicate filters leafGroup nodes
        api.setFilterModel({
            gold: { filterType: 'number', type: 'greaterThan', filter: 7 },
        });

        await new GridRows(api, 'gold > 7 pivot mode').check(`
            ROOT id:ROOT_NODE_ID gold:17
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:14
            · ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
            · └── LEAF hidden id:1 athlete:"Michael Phelps" gold:6
        `);

        // Disable pivot mode — default predicate switches to !node.group (leaf rows only)
        api.setGridOption('pivotMode', false);

        await new GridRows(api, 'gold > 7 non-pivot').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:8
            · └── LEAF id:0 athlete:"Michael Phelps" gold:8
        `);

        // Re-enable pivot mode — filter applies to leaf groups again
        api.setGridOption('pivotMode', true);

        await new GridRows(api, 'gold > 7 pivot mode re-enabled').check(`
            ROOT id:ROOT_NODE_ID gold:17
            └─┬ LEAF_GROUP collapsed id:"row-group-athlete-Michael Phelps" ag-Grid-AutoColumn:"Michael Phelps" gold:14
            · ├── LEAF hidden id:0 athlete:"Michael Phelps" gold:8
            · └── LEAF hidden id:1 athlete:"Michael Phelps" gold:6
        `);
    });
});

describe('ag-grid filterAggregatesStage quick filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, QuickFilterModule, ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('quick filter on aggregate values with groupAggFiltering', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            groupAggFiltering: true,
            rowData: cachedJSONObjects.array([
                { country: 'Ireland', gold: 1 },
                { country: 'Ireland', gold: 2 },
                { country: 'Italy', gold: 10 },
            ]),
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);

        // Quick filter "10" — matches Italy leaf (gold=10) via quick filter on leaf data
        api.setGridOption('quickFilterText', '10');

        await new GridRows(api, 'quick filter "10"').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);

        api.setGridOption('quickFilterText', '');

        await new GridRows(api, 'quick filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" gold:3
            │ ├── LEAF id:0 country:"Ireland" gold:1
            │ └── LEAF id:1 country:"Ireland" gold:2
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" gold:10
            · └── LEAF id:2 country:"Italy" gold:10
        `);
    });
});

describe('ag-grid filterAggregatesStage tree data', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ClientSideRowModelModule, RowGroupingModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree data allChildrenCount includes groups and leaves', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'n' },
                { field: 'x', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
                { field: 'y', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Tree' },
            treeData: true,
            groupDefaultExpanded: -1,
            grandTotalRow: 'top',
            alwaysAggregateAtRootLevel: true,
            rowData: cachedJSONObjects.array([
                { id: 'A', n: 'A', y: 1 },
                { id: 'B', parentId: 'A', n: 'B', x: 10, y: 5 },
                { id: 'C', parentId: 'A', n: 'C', x: 20, y: 6 },
                { id: 'D', n: 'D', y: 2 },
                { id: 'E', parentId: 'D', n: 'E', x: 30, y: 3 },
            ]),
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
            groupSuppressBlankHeader: true,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID x:60
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:60
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" x:30 y:1
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" x:10 y:5
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" x:20 y:6
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" n:"D" x:30 y:2
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" n:"E" x:30 y:3
        `);

        // Filter by y > 4 — only B (y=5) and C (y=6) pass
        api.setFilterModel({
            y: { filterType: 'number', type: 'greaterThan', filter: 4 },
        });

        await new GridRows(api, 'y > 4').check(`
            ROOT id:ROOT_NODE_ID x:30
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:30
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" x:30 y:1
            · ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" x:10 y:5
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" x:20 y:6
        `);

        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID x:60
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " x:60
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" x:30 y:1
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" x:10 y:5
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" x:20 y:6
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" n:"D" x:30 y:2
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" n:"E" x:30 y:3
        `);
    });

    test('tree data groupAggFiltering filters on aggregate values', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'n' }, { field: 'x', aggFunc: 'sum', filter: 'agNumberColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Tree' },
            treeData: true,
            groupDefaultExpanded: -1,
            groupAggFiltering: true,
            rowData: cachedJSONObjects.array([
                { id: 'A', n: 'A' },
                { id: 'B', parentId: 'A', n: 'B', x: 10 },
                { id: 'C', parentId: 'A', n: 'C', x: 20 },
                { id: 'D', n: 'D' },
                { id: 'E', parentId: 'D', n: 'E', x: 5 },
            ]),
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
            groupSuppressBlankHeader: true,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" x:30
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" x:10
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" x:20
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" n:"D" x:5
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" n:"E" x:5
        `);

        // Filter x > 8 — A (sum=30) passes, D (sum=5) fails. All of A's children preserved.
        api.setFilterModel({
            x: { filterType: 'number', type: 'greaterThan', filter: 8 },
        });

        await new GridRows(api, 'x > 8').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" x:30
            · ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" x:10
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" x:20
        `);

        api.setFilterModel(null);

        await new GridRows(api, 'cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" n:"A" x:30
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" n:"B" x:10
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" n:"C" x:20
            └─┬ D GROUP id:D ag-Grid-AutoColumn:"D" n:"D" x:5
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" n:"E" x:5
        `);
    });
});
