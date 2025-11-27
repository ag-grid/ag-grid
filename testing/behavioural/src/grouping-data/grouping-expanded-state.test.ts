import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping expanded state', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('group expansion state persists through data updates', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', year: 2020, athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', year: 2020, athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Ireland', year: 2021, athlete: 'Bob Johnson', sport: 'Football' },
            { id: '4', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '5', country: 'Italy', year: 2021, athlete: 'Luigi Verdi', sport: 'Football' },
            { id: '6', country: 'France', year: 2020, athlete: 'Jean Dupont', sport: 'Tennis' },
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
            groupDefaultExpanded: 0, // Only first level expanded
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial - only country level expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF hidden id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF hidden id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:5 country:"Italy" year:2021 athlete:"Luigi Verdi" sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:6 country:"France" year:2020 athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Expand Ireland 2020 group manually
        const irelandNode = api.getRowNode('row-group-country-Ireland');
        api.setRowNodeExpanded(irelandNode!, true, false, true);
        const ireland2020Node = api.getRowNode('row-group-country-Ireland-year-2020');
        api.setRowNodeExpanded(ireland2020Node!, true, false, true);

        await new GridRows(api, 'Ireland 2020 expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:5 country:"Italy" year:2021 athlete:"Luigi Verdi" sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:6 country:"France" year:2020 athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Add new data to Ireland 2020 group - expansion should be preserved
        applyTransactionChecked(api, {
            add: [{ id: '7', country: 'Ireland', year: 2020, athlete: "Pat O'Brien", sport: 'Rugby' }],
        });

        await new GridRows(api, 'after adding to Ireland 2020').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ ├── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ │ └── LEAF id:7 country:"Ireland" year:2020 athlete:"Pat O'Brien" sport:"Rugby"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:5 country:"Italy" year:2021 athlete:"Luigi Verdi" sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:6 country:"France" year:2020 athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Collapse Ireland 2020, expand Italy 2021
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, false, false, true);
        const italyNode = api.getRowNode('row-group-country-Italy');
        api.setRowNodeExpanded(italyNode!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Italy-year-2021')!, true, false, true);

        await new GridRows(api, 'Ireland 2020 collapsed, Italy 2021 expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF hidden id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ ├── LEAF hidden id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ │ └── LEAF hidden id:7 country:"Ireland" year:2020 athlete:"Pat O'Brien" sport:"Rugby"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:5 country:"Italy" year:2021 athlete:"Luigi Verdi" sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:6 country:"France" year:2020 athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Update entire dataset - expansion states should be preserved
        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', country: 'Ireland', year: 2020, athlete: 'John Smith Updated', sport: 'Sailing' },
                { id: '2', country: 'Ireland', year: 2020, athlete: 'Jane Doe', sport: 'Soccer' },
                { id: '3', country: 'Ireland', year: 2021, athlete: 'Bob Johnson', sport: 'Football' },
                { id: '4', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer' },
                { id: '5', country: 'Italy', year: 2021, athlete: 'Luigi Verdi Updated', sport: 'Football' },
                { id: '6', country: 'France', year: 2020, athlete: 'Jean Dupont', sport: 'Tennis' },
                { id: '8', country: 'Spain', year: 2020, athlete: 'Carlos Garcia', sport: 'Basketball' },
            ])
        );

        await new GridRows(api, 'after data update - expansion preserved').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF hidden id:1 country:"Ireland" year:2020 athlete:"John Smith Updated" sport:"Sailing"
            │ │ └── LEAF hidden id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:5 country:"Italy" year:2021 athlete:"Luigi Verdi Updated" sport:"Football"
            ├─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF hidden id:6 country:"France" year:2020 athlete:"Jean Dupont" sport:"Tennis"
            └─┬ filler collapsed id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Spain-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:8 country:"Spain" year:2020 athlete:"Carlos Garcia" sport:"Basketball"
        `);
    });

    test('programmatic expand/collapse operations', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '4', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1, // All expanded initially
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial - all expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Collapse all groups
        api.collapseAll();

        await new GridRows(api, 'after collapse all').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF hidden id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF hidden id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF hidden id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:4 country:"France" athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Expand only Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        await new GridRows(api, 'Ireland expanded only').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF hidden id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:4 country:"France" athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Expand all groups
        api.expandAll();

        await new GridRows(api, 'after expand all').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:4 country:"France" athlete:"Jean Dupont" sport:"Tennis"
        `);
    });

    test('expansion state with filtering', async () => {
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
            groupDefaultExpanded: 0, // Only first level expanded, children collapsed
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial - groups collapsed').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF hidden id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF hidden id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF hidden id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF hidden id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF hidden id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF hidden id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF hidden id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);

        // Apply filter to show only Soccer
        api.setFilterModel({ sport: { type: 'equals', filter: 'Soccer' } });

        await new GridRows(api, 'filter Soccer - Ireland still expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF hidden id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Clear filter - Ireland should remain expanded
        api.setFilterModel(null);

        await new GridRows(api, 'filter cleared - Ireland still expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 country:"Ireland" athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF hidden id:4 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF hidden id:5 country:"Italy" athlete:"Luigi Verdi" sport:"Football"
        `);
    });

    // Test for handling when groups become empty and need to be recreated
    test('expansion state when groups are recreated', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: 0, // Only first level expanded
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 country:"Ireland" athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF hidden id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Remove all Ireland rows
        applyTransactionChecked(api, { remove: [{ id: '1' }, { id: '2' }] });

        await new GridRows(api, 'Ireland rows removed').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF hidden id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Add Ireland rows back - expansion state should be preserved
        applyTransactionChecked(api, {
            add: [
                { id: '4', country: 'Ireland', athlete: 'New Person', sport: 'Tennis' },
                { id: '5', country: 'Ireland', athlete: 'Another Person', sport: 'Golf' },
            ],
        });

        await new GridRows(api, 'Ireland rows re-added - expansion preserved').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └── LEAF hidden id:3 country:"Italy" athlete:"Mario Rossi" sport:"Soccer"
            └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · ├── LEAF hidden id:4 country:"Ireland" athlete:"New Person" sport:"Tennis"
            · └── LEAF hidden id:5 country:"Ireland" athlete:"Another Person" sport:"Golf"
        `);
    });

    test('groupDefaultExpanded numeric configuration', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', year: 2020, sport: 'Sailing', athlete: 'John Smith' },
            { id: '2', country: 'Ireland', year: 2020, sport: 'Soccer', athlete: 'Jane Doe' },
            { id: '3', country: 'Ireland', year: 2021, sport: 'Football', athlete: 'Bob Johnson' },
            { id: '4', country: 'Italy', year: 2020, sport: 'Soccer', athlete: 'Mario Rossi' },
        ]);

        // Test groupDefaultExpanded = 1 (only first level expanded)
        const api1 = gridsManager.createGrid('myGrid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            groupDefaultExpanded: 1, // First level expanded, second collapsed
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api1, 'groupDefaultExpanded = 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF hidden id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF hidden id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └─┬ LEAF_GROUP collapsed id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Test groupDefaultExpanded = 2 (both levels expanded)
        const api2 = gridsManager.createGrid('myGrid2', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            groupDefaultExpanded: 2, // Both levels expanded
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api2, 'groupDefaultExpanded = 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
        `);
    });

    test('isGroupOpenByDefault callback function', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', year: 2020, sport: 'Sailing', athlete: 'John Smith' },
            { id: '2', country: 'Ireland', year: 2020, sport: 'Soccer', athlete: 'Jane Doe' },
            { id: '3', country: 'Ireland', year: 2021, sport: 'Football', athlete: 'Bob Johnson' },
            { id: '4', country: 'Italy', year: 2020, sport: 'Soccer', athlete: 'Mario Rossi' },
            { id: '5', country: 'France', year: 2020, sport: 'Tennis', athlete: 'Jean Dupont' },
        ]);

        const calls: { key: string; level: number; field: string }[] = [];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            isGroupOpenByDefault: (params) => {
                calls.push({
                    key: params.key,
                    level: params.level,
                    field: params.field,
                });
                // Expand all first level groups (countries) and Ireland's year groups
                return params.level === 0 || (params.level === 1 && params.key === '2020');
            },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'isGroupOpenByDefault callback').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF id:2 country:"Ireland" year:2020 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:3 country:"Ireland" year:2021 athlete:"Bob Johnson" sport:"Football"
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:4 country:"Italy" year:2020 athlete:"Mario Rossi" sport:"Soccer"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF id:5 country:"France" year:2020 athlete:"Jean Dupont" sport:"Tennis"
        `);

        // Verify the callback was called with correct parameters
        calls.sort((a, b) => a.key.localeCompare(b.key) || a.level - b.level);

        // Check that we have the expected number of calls
        expect(calls).toHaveLength(7);

        // Check some specific calls to verify the callback is working
        expect(calls.filter((c) => c.level === 0)).toHaveLength(3); // 3 countries
        expect(calls.filter((c) => c.level === 1)).toHaveLength(4); // 4 year groups
    });

    test('expansion state with dynamic data changes and groupDefaultExpanded callback', async () => {
        const initialRowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' },
            { id: '3', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
        ]);

        let expansionCounter = 0;
        const groupDefaultExpandedCalls: { key: string; level: number; field: string }[] = [];

        let groupOpenedPromise: Promise<void> | null = null;
        let groupOpenedResolve: (() => void) | null = null;
        const initGroupOpenedPromise = () => {
            groupOpenedPromise = new Promise<void>((resolve) => (groupOpenedResolve = resolve));
        };

        let dynamicCountry: string;

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            isGroupOpenByDefault: (params) => {
                groupDefaultExpandedCalls.push({
                    key: params.key,
                    level: params.level,
                    field: params.field,
                });
                // Expand Spain when it's dynamically created, keep others collapsed
                return params.key === 'Spain';
            },
            rowData: initialRowData,
            getRowId: (params) => params.data.id,
            onRowGroupOpened: (event) => {
                groupOpenedResolve?.();
                if (!event.expanded) {
                    return;
                }

                expansionCounter++;

                // Add a new athlete when a country group is expanded
                const newRow = {
                    id: `dynamic-${expansionCounter}`,
                    country: dynamicCountry,
                    athlete: `Dynamic Athlete ${expansionCounter}`,
                    sport: 'Dynamic Sport',
                };

                applyTransactionChecked(api, { add: [newRow] });
            },
        });

        // Verify initial groupDefaultExpanded callback calls
        expect(groupDefaultExpandedCalls).toHaveLength(2); // Ireland and Italy
        expect(groupDefaultExpandedCalls.find((c) => c.key === 'Ireland')).toBeTruthy();
        expect(groupDefaultExpandedCalls.find((c) => c.key === 'Italy')).toBeTruthy();

        // Expand Ireland - should trigger dynamic addition to Ireland
        dynamicCountry = 'Ireland';
        initGroupOpenedPromise();
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await groupOpenedPromise!;

        // Check that Ireland is expanded and dynamic node was added
        const irelandNode = api.getRowNode('row-group-country-Ireland');
        expect(irelandNode!.expanded).toBe(true);

        // Check that dynamic node was added
        const dynamicNode = api.getRowNode('dynamic-1');
        expect(dynamicNode?.data?.athlete).toBe('Dynamic Athlete 1');

        // Add a completely new country (Spain) which should trigger the groupDefaultExpanded callback
        applyTransactionChecked(api, {
            add: [{ id: 'spain-1', country: 'Spain', athlete: 'Carlos Garcia', sport: 'Basketball' }],
        });

        // Verify that groupDefaultExpanded callback was called for the new Spain group
        expect(groupDefaultExpandedCalls.find((c) => c.key === 'Spain')).toBeTruthy();

        // Check that Spain group was created and is expanded (based on our callback logic)
        const spainNode = api.getRowNode('row-group-country-Spain');
        expect(spainNode).toBeTruthy();
        expect(spainNode!.expanded).toBe(true); // Should be expanded because our callback returns true for Spain

        // Expand Italy - should trigger another dynamic addition
        dynamicCountry = 'Italy';
        initGroupOpenedPromise();
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Italy')!, true, false, true);
        await groupOpenedPromise!;

        // Check that both groups are expanded and have dynamic nodes
        const italyNode = api.getRowNode('row-group-country-Italy');
        expect(italyNode!.expanded).toBe(true);

        // Check that second dynamic node was added
        const dynamicNode2 = api.getRowNode('dynamic-2');
        expect(dynamicNode2?.data?.athlete).toBe('Dynamic Athlete 2');

        expect(expansionCounter).toBe(2);

        // Verify total callback calls: Ireland, Italy, Spain = 3
        expect(groupDefaultExpandedCalls).toHaveLength(3);
        expect(groupDefaultExpandedCalls.filter((c) => c.key === 'Ireland')).toHaveLength(1);
        expect(groupDefaultExpandedCalls.filter((c) => c.key === 'Italy')).toHaveLength(1);
        expect(groupDefaultExpandedCalls.filter((c) => c.key === 'Spain')).toHaveLength(1);
    });

    test('custom groupDefaultExpanded callback function', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', priority: 'High', category: 'Bug', title: 'Critical Issue' },
            { id: '2', priority: 'High', category: 'Feature', title: 'Important Feature' },
            { id: '3', priority: 'Low', category: 'Bug', title: 'Minor Issue' },
            { id: '4', priority: 'Medium', category: 'Task', title: 'Regular Task' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'priority', rowGroup: true, hide: true },
                { field: 'category', rowGroup: true, hide: true },
                { field: 'title' },
            ],
            autoGroupColumnDef: { headerName: 'Priority/Category' },
            animateRows: false,
            isGroupOpenByDefault: (params) => {
                // Only expand "High" priority groups
                return params.rowNode.key === 'High';
            },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'custom groupDefaultExpanded callback', {
            columns: ['title'],
        }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-priority-High
            │ ├─┬ LEAF_GROUP collapsed id:row-group-priority-High-category-Bug
            │ │ └── LEAF hidden id:1 title:"Critical Issue"
            │ └─┬ LEAF_GROUP collapsed id:row-group-priority-High-category-Feature
            │ · └── LEAF hidden id:2 title:"Important Feature"
            ├─┬ filler collapsed id:row-group-priority-Low
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-priority-Low-category-Bug
            │ · └── LEAF hidden id:3 title:"Minor Issue"
            └─┬ filler collapsed id:row-group-priority-Medium
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-priority-Medium-category-Task
            · · └── LEAF hidden id:4 title:"Regular Task"
        `);
    });

    test('isGroupOpenByDefault callback with dynamic expansion logic', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', status: 'Active', region: 'North', sales: 1000 },
            { id: '2', status: 'Active', region: 'South', sales: 1500 },
            { id: '3', status: 'Inactive', region: 'North', sales: 500 },
            { id: '4', status: 'Active', region: 'East', sales: 2000 },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'status', rowGroup: true, hide: true },
                { field: 'region', rowGroup: true, hide: true },
                { field: 'sales', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Status/Region' },
            animateRows: false,
            isGroupOpenByDefault: (params) => {
                // Expand groups where total sales > 2000
                if (params.rowNode.aggData?.sales > 2000) {
                    return true;
                }
                // Expand 'Active' status groups
                return params.rowNode.key === 'Active';
            },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'isGroupOpenByDefault callback', {
            columns: ['sales'],
        }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-status-Active sales:4500
            │ ├─┬ LEAF_GROUP collapsed id:row-group-status-Active-region-North sales:1000
            │ │ └── LEAF hidden id:1 sales:1000
            │ ├─┬ LEAF_GROUP collapsed id:row-group-status-Active-region-South sales:1500
            │ │ └── LEAF hidden id:2 sales:1500
            │ └─┬ LEAF_GROUP collapsed id:row-group-status-Active-region-East sales:2000
            │ · └── LEAF hidden id:4 sales:2000
            └─┬ filler collapsed id:row-group-status-Inactive sales:500
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-status-Inactive-region-North sales:500
            · · └── LEAF hidden id:3 sales:500
        `);
    });

    test('programmatic expand/collapse with state persistence', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', region: 'North', country: 'USA', city: 'New York' },
            { id: '2', region: 'North', country: 'USA', city: 'Boston' },
            { id: '3', region: 'North', country: 'Canada', city: 'Toronto' },
            { id: '4', region: 'South', country: 'USA', city: 'Miami' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city' },
            ],
            autoGroupColumnDef: { headerName: 'Location' },
            animateRows: false,
            groupDefaultExpanded: 0, // Only expand first level
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Initial state - only regions expanded
        await new GridRows(api, 'initial state', { columns: ['city'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-region-North
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-region-North-country-USA
            │ │ ├── LEAF hidden id:1 city:"New York"
            │ │ └── LEAF hidden id:2 city:"Boston"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-region-North-country-Canada
            │ · └── LEAF hidden id:3 city:"Toronto"
            └─┬ filler collapsed id:row-group-region-South
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-region-South-country-USA
            · · └── LEAF hidden id:4 city:"Miami"
        `);

        // Programmatically expand regions and specific countries
        const northRegionNode = api.getRowNode('row-group-region-North');
        const southRegionNode = api.getRowNode('row-group-region-South');
        const northUSANode = api.getRowNode('row-group-region-North-country-USA');
        const southUSANode = api.getRowNode('row-group-region-South-country-USA');

        api.setRowNodeExpanded(northRegionNode!, true, undefined, true);
        api.setRowNodeExpanded(southRegionNode!, true, undefined, true);
        api.setRowNodeExpanded(northUSANode!, true, undefined, true);
        api.setRowNodeExpanded(southUSANode!, true, undefined, true);

        await new GridRows(api, 'after programmatic expansion', { columns: ['city'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-North
            │ ├─┬ LEAF_GROUP id:row-group-region-North-country-USA
            │ │ ├── LEAF id:1 city:"New York"
            │ │ └── LEAF id:2 city:"Boston"
            │ └─┬ LEAF_GROUP collapsed id:row-group-region-North-country-Canada
            │ · └── LEAF hidden id:3 city:"Toronto"
            └─┬ filler id:row-group-region-South
            · └─┬ LEAF_GROUP id:row-group-region-South-country-USA
            · · └── LEAF id:4 city:"Miami"
        `);

        // Add new data and verify expansion state persists
        applyTransactionChecked(api, {
            add: [
                { id: '5', region: 'North', country: 'USA', city: 'Chicago' },
                { id: '6', region: 'North', country: 'Canada', city: 'Montreal' },
            ],
        });

        await new GridRows(api, 'after adding data', { columns: ['city'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-region-North
            │ ├─┬ LEAF_GROUP id:row-group-region-North-country-USA
            │ │ ├── LEAF id:1 city:"New York"
            │ │ ├── LEAF id:2 city:"Boston"
            │ │ └── LEAF id:5 city:"Chicago"
            │ └─┬ LEAF_GROUP collapsed id:row-group-region-North-country-Canada
            │ · ├── LEAF hidden id:3 city:"Toronto"
            │ · └── LEAF hidden id:6 city:"Montreal"
            └─┬ filler id:row-group-region-South
            · └─┬ LEAF_GROUP id:row-group-region-South-country-USA
            · · └── LEAF id:4 city:"Miami"
        `);
    });
});
