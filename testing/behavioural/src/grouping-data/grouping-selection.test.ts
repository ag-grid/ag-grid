import { ClientSideRowModelModule, RowSelectionModule, TextFilterModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridActions } from '../selection/utils';
import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping selection', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, RowSelectionModule, ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grouping selection and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football' },
            { id: '6', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis' },
            { id: '7', country: 'France', athlete: 'Marie Martin', sport: 'Soccer' },
            { id: '8', country: 'Spain', athlete: 'Carlos Garcia', sport: 'Basketball' },
            { id: '9', country: 'Germany', athlete: 'Hans Mueller', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport', filter: 'agTextColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Select multiple rows including groups and leaves
        api.setNodesSelected({
            nodes: [
                api.getRowNode('row-group-country-Ireland')!,
                api.getRowNode('3')!,
                api.getRowNode('4')!,
                api.getRowNode('row-group-country-France')!,
                api.getRowNode('9')!,
            ],
            newValue: true,
        });
        await new GridRows(api, 'initial selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF selected id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 country:"France" athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ └── LEAF id:8 country:"Spain" athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └── LEAF selected id:9 country:"Germany" athlete:"Hans Mueller" sport:"Football"
        `);

        // Add a new item and verify selection state is maintained
        applyTransactionChecked(api, {
            add: [{ id: '10', country: 'Ireland', athlete: "Pat O'Brien", sport: 'Rugby' }],
        });

        await new GridRows(api, 'after adding to Ireland').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ ├── LEAF selected id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            │ └── LEAF id:10 country:"Ireland" athlete:"Pat O'Brien" sport:"Rugby"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 country:"France" athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ └── LEAF id:8 country:"Spain" athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └── LEAF selected id:9 country:"Germany" athlete:"Hans Mueller" sport:"Football"
        `);

        // Select a new child in a selected group
        api.setNodesSelected({
            nodes: [api.getRowNode('10')!],
            newValue: true,
        });

        await new GridRows(api, 'select new child in selected group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ ├── LEAF selected id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            │ └── LEAF selected id:10 country:"Ireland" athlete:"Pat O'Brien" sport:"Rugby"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:6 country:"France" athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 country:"France" athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ └── LEAF id:8 country:"Spain" athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            · └── LEAF selected id:9 country:"Germany" athlete:"Hans Mueller" sport:"Football"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            └── sport "Sport" width:200
        `);
    });

    test('group selection checkbox behavior', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: {
                headerName: 'Country',
            },
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                headerCheckbox: true,
                checkboxes: true,
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Select Ireland group - should select all its children
        api.setNodesSelected({
            nodes: [api.getRowNode('row-group-country-Ireland')!],
            newValue: true,
        });

        await new GridRows(api, 'select Ireland group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Deselect one child - group should become unselected
        api.setNodesSelected({
            nodes: [api.getRowNode('1')!],
            newValue: false,
        });

        await new GridRows(api, 'deselect one child').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP indeterminate id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            └── sport "Sport" width:200
        `);
    });

    test('selection with filtering', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport', filter: 'agTextColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Select some nodes before filtering
        api.setNodesSelected({
            nodes: [api.getRowNode('1')!, api.getRowNode('2')!, api.getRowNode('4')!],
            newValue: true,
        });

        await new GridRows(api, 'initial selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);

        // Filter by sport = "Soccer"
        api.setFilterModel({ sport: { type: 'equals', filter: 'Soccer' } });

        await new GridRows(api, 'filter by Soccer').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Clear filter - selection should be preserved
        api.setFilterModel(null);

        await new GridRows(api, 'filter cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF selected id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF selected id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF selected id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);
    });

    test('selection with multi-level grouping', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', year: 2020, athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', year: 2020, athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', year: 2021, athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', year: 2021, athlete: 'Luigi Verdi', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Select nested groups and leaves
        api.setNodesSelected({
            nodes: [
                api.getRowNode('row-group-country-Ireland-year-2020')!,
                api.getRowNode('3')!,
                api.getRowNode('row-group-country-Italy')!,
            ],
            newValue: true,
        });

        await new GridRows(api, 'multi-level selection').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP selected id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF selected id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            └─┬ filler selected id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ └── LEAF id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:5 country:"Italy" year:2021 athlete:"Luigi Verdi" sport:"Football"
        `);
    });

    const threeLevel = () =>
        cachedJSONObjects.array([
            { id: '1', region: 'North America', country: 'Canada', city: 'Montreal' },
            { id: '2', region: 'North America', country: 'Canada', city: 'Toronto' },
            { id: '3', region: 'North America', country: 'Canada', city: 'Ottawa' },
            { id: '4', region: 'North America', country: 'United States', city: 'New York' },
            { id: '5', region: 'North America', country: 'United States', city: 'Chicago' },
            { id: '6', region: 'North America', country: 'United States', city: 'Los Angeles' },
        ]);

    const threeLevelColDefs = [
        { field: 'region', rowGroup: true, hide: true },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'city', rowGroup: true, hide: true },
    ];

    test('SHIFT-click does not select hidden descendants of collapsed groups', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: 1,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        // Displayed rows: North America (idx 0), Canada (idx 1), United States (idx 2)
        // City rows are hidden inside collapsed country groups
        const actions = new GridActions(api);
        actions.clickRowByIndex(1); // click Canada
        actions.clickRowByIndex(2, { shiftKey: true }); // shift-click United States

        await new GridRows(api, 'after shift-click').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler selected collapsed id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF hidden id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF hidden id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF hidden id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler selected collapsed id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF hidden id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF hidden id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });

    test('SHIFT-click upward does not select hidden descendants of collapsed groups', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: 1,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        // Displayed rows: North America (idx 0), Canada (idx 1), United States (idx 2)
        // Shift-click upward: click United States first, then shift-click Canada
        const actions = new GridActions(api);
        actions.clickRowByIndex(2); // click United States
        actions.clickRowByIndex(1, { shiftKey: true }); // shift-click Canada (upward)

        await new GridRows(api, 'after upward shift-click').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler selected collapsed id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF hidden id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF hidden id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF hidden id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler selected collapsed id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF hidden id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF hidden id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });

    test('SHIFT-click range spanning mixed expanded and collapsed groups selects only visible rows', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: -1,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        // All groups start expanded. Collapse United States (at idx 8) so its city children are hidden.
        const actions = new GridActions(api);
        await actions.collapseGroupAtIndex(8);

        // Canada remains expanded (its city groups and leaves are visible).
        // United States is now collapsed (its city children are hidden).
        // Display: North America (0), Canada (1), Montreal LEAF_GROUP (2), Montreal leaf (3),
        //          Toronto LEAF_GROUP (4), Toronto leaf (5), Ottawa LEAF_GROUP (6), Ottawa leaf (7),
        //          United States (8, collapsed)
        actions.clickRowByIndex(1); // click Canada
        actions.clickRowByIndex(8, { shiftKey: true }); // shift-click United States

        await new GridRows(api, 'after shift-click with mixed expansion').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler selected id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP selected id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF selected id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP selected id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF selected id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP selected id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF selected id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler selected collapsed id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP hidden id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF hidden id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP hidden id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF hidden id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP hidden id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });

    test('SHIFT-click with asymmetric expansion at multiple levels selects only visible rows at each depth', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: 2,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        // groupDefaultExpanded: 2 expands region and country levels; city LEAF_GROUPs start collapsed.
        // Initial display indices:
        //   0: North America  1: Canada
        //   2: Montreal LEAF_GROUP  3: Toronto LEAF_GROUP  4: Ottawa LEAF_GROUP
        //   5: United States
        //   6: New York LEAF_GROUP  7: Chicago LEAF_GROUP  8: Los Angeles LEAF_GROUP
        const actions = new GridActions(api);

        // Expand a subset of LEAF_GROUPs to create asymmetric depth across both country branches.
        // Canada branch:   Montreal expanded (leaf visible), Toronto collapsed (leaf hidden), Ottawa expanded (leaf visible)
        // US branch:       New York expanded (leaf visible), Chicago expanded (leaf visible), Los Angeles collapsed (leaf hidden)
        await actions.expandGroupAtIndex(2); // Montreal → inserts LEAF id:1 at idx 3
        await actions.expandGroupAtIndex(5); // Ottawa (shifted to idx 5) → inserts LEAF id:3 at idx 6
        await actions.expandGroupAtIndex(8); // New York (shifted to idx 8) → inserts LEAF id:4 at idx 9
        await actions.expandGroupAtIndex(10); // Chicago (shifted to idx 10) → inserts LEAF id:5 at idx 11

        actions.clickRowByIndex(3); // click LEAF id:1
        actions.clickRowByIndex(12, { shiftKey: true }); // shift-click Los Angeles LEAF_GROUP (idx 12)

        // id:2 inside collapsed Toronto and id:6 inside collapsed Los Angeles must NOT be selected.
        await new GridRows(api, 'after shift-click with asymmetric multi-level expansion').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF selected id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP selected collapsed id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF hidden id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP selected id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF selected id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler selected id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP selected id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF selected id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP selected id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF selected id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP selected collapsed id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });

    test('SHIFT-click with groupSelects descendants selects all descendants of groups in range', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                enableClickSelection: true,
                checkboxes: false,
                headerCheckbox: false,
                groupSelects: 'descendants',
            },
            groupDefaultExpanded: 1,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        // Displayed rows: North America (idx 0), Canada (idx 1), United States (idx 2)
        // First click selects Canada + all its hidden descendants via groupSelects:descendants.
        // Shift-click on United States extends the range to include United States, and
        // groupSelects:descendants propagates that to all its hidden descendants too.
        const actions = new GridActions(api);
        actions.clickRowByIndex(1); // click Canada — selects Canada + hidden city children
        actions.clickRowByIndex(2, { shiftKey: true }); // shift-click United States

        await new GridRows(api, 'after shift-click with groupSelects descendants').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler selected id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler selected collapsed id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP selected collapsed hidden id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF selected hidden id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP selected collapsed hidden id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF selected hidden id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP selected collapsed hidden id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF selected hidden id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler selected collapsed id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP selected collapsed hidden id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF selected hidden id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP selected collapsed hidden id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF selected hidden id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP selected collapsed hidden id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF selected hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });

    test('SHIFT-click between rows at different nesting levels selects all visible rows in range', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: 1,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        // Displayed rows: North America (idx 0, level 0), Canada (idx 1, level 1), United States (idx 2, level 1)
        // Click North America (level 0 filler), shift-click Canada (level 1 filler)
        const actions = new GridActions(api);
        actions.clickRowByIndex(0); // click North America
        actions.clickRowByIndex(1, { shiftKey: true }); // shift-click Canada

        await new GridRows(api, 'after shift-click across nesting levels').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler selected id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler selected collapsed id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF hidden id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF hidden id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF hidden id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler collapsed id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF hidden id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF hidden id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });

    test('selection state is preserved after collapsing and re-expanding a group', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: threeLevelColDefs,
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: 1,
            rowData: threeLevel(),
            getRowId: (params) => params.data.id,
        });

        const actions = new GridActions(api);
        actions.clickRowByIndex(1); // click Canada
        actions.clickRowByIndex(2, { shiftKey: true }); // shift-click United States — selects both

        // Collapse the North America group (idx 0) so Canada and United States become hidden
        await actions.collapseGroupAtIndex(0);

        // Re-expand — Canada and United States should still be selected
        await actions.expandGroupAtIndex(0);

        await new GridRows(api, 'after collapse and re-expand').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:"row-group-region-North America" ag-Grid-AutoColumn:"North America"
            · ├─┬ filler selected collapsed id:"row-group-region-North America-country-Canada" ag-Grid-AutoColumn:"Canada"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Montreal" ag-Grid-AutoColumn:"Montreal"
            · │ │ └── LEAF hidden id:1 region:"North America" country:"Canada" city:"Montreal"
            · │ ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Toronto" ag-Grid-AutoColumn:"Toronto"
            · │ │ └── LEAF hidden id:2 region:"North America" country:"Canada" city:"Toronto"
            · │ └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-Canada-city-Ottawa" ag-Grid-AutoColumn:"Ottawa"
            · │ · └── LEAF hidden id:3 region:"North America" country:"Canada" city:"Ottawa"
            · └─┬ filler selected collapsed id:"row-group-region-North America-country-United States" ag-Grid-AutoColumn:"United States"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-New York" ag-Grid-AutoColumn:"New York"
            · · │ └── LEAF hidden id:4 region:"North America" country:"United States" city:"New York"
            · · ├─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Chicago" ag-Grid-AutoColumn:"Chicago"
            · · │ └── LEAF hidden id:5 region:"North America" country:"United States" city:"Chicago"
            · · └─┬ LEAF_GROUP collapsed hidden id:"row-group-region-North America-country-United States-city-Los Angeles" ag-Grid-AutoColumn:"Los Angeles"
            · · · └── LEAF hidden id:6 region:"North America" country:"United States" city:"Los Angeles"
        `);
    });
});
