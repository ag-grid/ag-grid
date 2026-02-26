import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid grouping simple data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('toggle columnDefs updates grouping', async () => {
        const columnDefsA = [{ colId: '1', field: 'a', rowGroup: true }];
        const columnDefsB = [{ colId: '1', field: 'b', rowGroup: true }];
        const rowData = [{ a: 'bob', b: 'cat', id: '0' }];

        const gridOptions: GridOptions = {
            columnDefs: columnDefsA,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'column A');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-1-bob ag-Grid-AutoColumn:"bob"
            · └── LEAF id:0 1:"bob"
        `);

        api.setGridOption('columnDefs', columnDefsB);

        gridRows = new GridRows(api, 'column B');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-1-cat ag-Grid-AutoColumn:"cat"
            · └── LEAF id:0 1:"cat"
        `);

        api.setGridOption('columnDefs', columnDefsA);

        gridRows = new GridRows(api, 'column A (2)');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-1-bob ag-Grid-AutoColumn:"bob"
            · └── LEAF id:0 1:"bob"
        `);
    });

    test('expanding groups then adding a deeper group column preserves expansion state', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020 },
            { id: '2', country: 'Ireland', year: 2021 },
            { id: '3', country: 'France', year: 2020 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }],
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" year:2020
            │ └── LEAF id:2 country:"Ireland" year:2021
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" year:2020
        `);

        // Add year as a second grouping column
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
        ]);

        // Ireland should remain expanded; new year sub-groups follow groupDefaultExpanded (collapsed by default)
        await new GridRows(api, 'after adding year as group column').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:2 country:"Ireland" year:2021
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:3 country:"France" year:2020
        `);
    });

    test('expanding groups then removing the deepest group column preserves expansion state', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020 },
            { id: '2', country: 'Ireland', year: 2021 },
            { id: '3', country: 'France', year: 2020 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

        await new GridRows(api, 'Ireland and Ireland/2020 expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:1 country:"Ireland" year:2020
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:2 country:"Ireland" year:2021
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:3 country:"France" year:2020
        `);

        // Remove year from grouping - only country remains
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: false },
        ]);

        // Ireland should remain expanded; France should remain collapsed
        await new GridRows(api, 'after removing year group column').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" year:2020
            │ └── LEAF id:2 country:"Ireland" year:2021
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" year:2020
        `);
    });

    test('removing the top group column resets all expansion to default', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020 },
            { id: '2', country: 'Ireland', year: 2021 },
            { id: '3', country: 'France', year: 2020 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

        await new GridRows(api, 'Ireland and Ireland/2020 expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:1 country:"Ireland" year:2020
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:2 country:"Ireland" year:2021
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:3 country:"France" year:2020
        `);

        // Remove country (top level) from grouping — only year remains
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: false },
            { field: 'year', rowGroup: true, hide: true },
        ]);

        // All year-level IDs change (old: row-group-country-Ireland-year-2020, new: row-group-year-2020)
        // so no saved IDs match — all groups fall back to groupDefaultExpanded (collapsed)
        await new GridRows(api, 'after removing top group column').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP collapsed id:row-group-year-2020 ag-Grid-AutoColumn:2020
            │ ├── LEAF hidden id:1 country:"Ireland" year:2020
            │ └── LEAF hidden id:3 country:"France" year:2020
            └─┬ LEAF_GROUP collapsed id:row-group-year-2021 ag-Grid-AutoColumn:2021
            · └── LEAF hidden id:2 country:"Ireland" year:2021
        `);
    });

    test('removing a middle group column does not preserve deeper level expansion state', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020, sport: 'Football' },
            { id: '2', country: 'Ireland', year: 2020, sport: 'Rugby' },
            { id: '3', country: 'Ireland', year: 2021, sport: 'Football' },
            { id: '4', country: 'France', year: 2020, sport: 'Football' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
            ],
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Expand Ireland → 2020 → Football (all three levels)
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);
        api.setRowNodeExpanded(
            api.getRowNode('row-group-country-Ireland-year-2020-sport-Football')!,
            true,
            false,
            true
        );

        await new GridRows(api, 'three levels expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ │ └── LEAF id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Football ag-Grid-AutoColumn:"Football"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ filler collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            · · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);

        // Remove the middle group column (year)
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: false },
            { field: 'sport', rowGroup: true, hide: true },
        ]);

        // Country-level expansion IS preserved (Ireland expanded, France collapsed).
        // Sport-level expansion is NOT preserved because IDs encode the full ancestor path:
        // before: row-group-country-Ireland-year-2020-sport-Football
        // after:  row-group-country-Ireland-sport-Football
        // The IDs no longer match, so sport groups fall back to groupDefaultExpanded (collapsed).
        await new GridRows(api, 'after removing middle group column').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ ├── LEAF hidden id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-sport-Football ag-Grid-AutoColumn:"Football"
            · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);
    });

    test('swapping 2nd and 3rd group columns resets expansion at those levels', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020, sport: 'Football' },
            { id: '2', country: 'Ireland', year: 2020, sport: 'Rugby' },
            { id: '3', country: 'Ireland', year: 2021, sport: 'Football' },
            { id: '4', country: 'France', year: 2020, sport: 'Football' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroupIndex: 0, hide: true },
                { field: 'year', rowGroupIndex: 1, hide: true },
                { field: 'sport', rowGroupIndex: 2, hide: true },
            ],
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Expand Ireland → 2020 → Football
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);
        api.setRowNodeExpanded(
            api.getRowNode('row-group-country-Ireland-year-2020-sport-Football')!,
            true,
            false,
            true
        );

        await new GridRows(api, 'three levels expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ │ └── LEAF id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Football ag-Grid-AutoColumn:"Football"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ filler collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            · · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);

        // Swap year and sport column order
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 2, hide: true },
            { field: 'sport', rowGroupIndex: 1, hide: true },
        ]);

        // Country-level expansion is preserved (Ireland expanded, France collapsed).
        // Levels 2 and 3 reset because IDs change when column order changes:
        // old: row-group-country-Ireland-year-2020-sport-Football
        // new: row-group-country-Ireland-sport-Football-year-2020
        await new GridRows(api, 'after swapping year and sport').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ filler collapsed id:row-group-country-Ireland-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-sport-Football-year-2020 ag-Grid-AutoColumn:2020
            │ │ │ └── LEAF hidden id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-sport-Football-year-2021 ag-Grid-AutoColumn:2021
            │ │ · └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            │ └─┬ filler collapsed id:row-group-country-Ireland-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-sport-Rugby-year-2020 ag-Grid-AutoColumn:2020
            │ · · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ filler collapsed hidden id:row-group-country-France-sport-Football ag-Grid-AutoColumn:"Football"
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-sport-Football-year-2020 ag-Grid-AutoColumn:2020
            · · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);
    });

    test('swapping group columns with isGroupOpenByDefault expands via callback at reset levels', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020, sport: 'Football' },
            { id: '2', country: 'Ireland', year: 2020, sport: 'Rugby' },
            { id: '3', country: 'Ireland', year: 2021, sport: 'Football' },
            { id: '4', country: 'France', year: 2020, sport: 'Football' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroupIndex: 0, hide: true },
                { field: 'year', rowGroupIndex: 1, hide: true },
                { field: 'sport', rowGroupIndex: 2, hide: true },
            ],
            rowData,
            getRowId: (params) => params.data.id,
            // Expand sport="Football" groups regardless of level
            isGroupOpenByDefault: (params) => params.field === 'sport' && params.key === 'Football',
        });

        // Initially: sport=Football groups are expanded, others collapsed.
        // Manually expand Ireland and Ireland/2020 as well.
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

        await new GridRows(api, 'initial state').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ │ └── LEAF id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └─┬ LEAF_GROUP hidden id:row-group-country-Ireland-year-2021-sport-Football ag-Grid-AutoColumn:"Football"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ filler collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └─┬ LEAF_GROUP hidden id:row-group-country-France-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            · · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);

        // Swap year and sport column order
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 2, hide: true },
            { field: 'sport', rowGroupIndex: 1, hide: true },
        ]);

        // Country-level expansion is preserved (Ireland expanded, France collapsed).
        // Levels 2 and 3 IDs change, so saved IDs don't match — but isGroupOpenByDefault
        // fires for sport="Football" nodes, expanding them at their new level.
        await new GridRows(api, 'after swap with isGroupOpenByDefault').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ filler id:row-group-country-Ireland-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-sport-Football-year-2020 ag-Grid-AutoColumn:2020
            │ │ │ └── LEAF hidden id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-sport-Football-year-2021 ag-Grid-AutoColumn:2021
            │ │ · └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            │ └─┬ filler collapsed id:row-group-country-Ireland-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-sport-Rugby-year-2020 ag-Grid-AutoColumn:2020
            │ · · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ filler hidden id:row-group-country-France-sport-Football ag-Grid-AutoColumn:"Football"
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-sport-Football-year-2020 ag-Grid-AutoColumn:2020
            · · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);
    });

    test('groupDefaultExpanded -1 with added group column keeps all groups expanded', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020 },
            { id: '2', country: 'Ireland', year: 2021 },
            { id: '3', country: 'France', year: 2020 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }],
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial - all countries expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" year:2020
            │ └── LEAF id:2 country:"Ireland" year:2021
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" year:2020
        `);

        // Add year as a second grouping column
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
        ]);

        // All country groups should remain expanded; new year sub-groups should also be expanded
        // because groupDefaultExpanded: -1 applies to newly created group nodes
        await new GridRows(api, 'after adding year as group column').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:1 country:"Ireland" year:2020
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:2 country:"Ireland" year:2021
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF id:3 country:"France" year:2020
        `);
    });

    test('adding a group column above existing resets all expansion to default', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020 },
            { id: '2', country: 'Ireland', year: 2021 },
            { id: '3', country: 'France', year: 2020 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country' }, { field: 'year', rowGroupIndex: 0, hide: true }],
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setRowNodeExpanded(api.getRowNode('row-group-year-2020')!, true, false, true);

        await new GridRows(api, 'year 2020 expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-year-2020 ag-Grid-AutoColumn:2020
            │ ├── LEAF id:1 country:"Ireland" year:2020
            │ └── LEAF id:3 country:"France" year:2020
            └─┬ LEAF_GROUP collapsed id:row-group-year-2021 ag-Grid-AutoColumn:2021
            · └── LEAF hidden id:2 country:"Ireland" year:2021
        `);

        // Add country as a new top-level group column above year
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 1, hide: true },
        ]);

        // Year-level IDs change (old: row-group-year-2020, new: row-group-country-Ireland-year-2020)
        // so no saved IDs match — all groups fall back to groupDefaultExpanded (collapsed)
        await new GridRows(api, 'after adding country above year').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF hidden id:2 country:"Ireland" year:2021
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:3 country:"France" year:2020
        `);
    });

    test('adding a group column in the middle does not preserve deeper level expansion state', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020, sport: 'Football' },
            { id: '2', country: 'Ireland', year: 2020, sport: 'Rugby' },
            { id: '3', country: 'Ireland', year: 2021, sport: 'Football' },
            { id: '4', country: 'France', year: 2020, sport: 'Football' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroupIndex: 0, hide: true },
                { field: 'year' },
                { field: 'sport', rowGroupIndex: 1, hide: true },
            ],
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-sport-Football')!, true, false, true);

        await new GridRows(api, 'Ireland and Ireland/Football expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └── LEAF id:3 country:"Ireland" year:2021 sport:"Football"
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-sport-Football ag-Grid-AutoColumn:"Football"
            · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);

        // Add year as a middle group column between country and sport
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroupIndex: 0, hide: true },
            { field: 'year', rowGroupIndex: 1, hide: true },
            { field: 'sport', rowGroupIndex: 2, hide: true },
        ]);

        // Country-level expansion is preserved (Ireland expanded, France collapsed).
        // Sport-level IDs change (old: row-group-country-Ireland-sport-Football,
        // new: row-group-country-Ireland-year-2020-sport-Football) so sport expansion resets.
        await new GridRows(api, 'after adding year in the middle').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ filler collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            │ │ │ └── LEAF hidden id:1 country:"Ireland" year:2020 sport:"Football"
            │ │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Rugby ag-Grid-AutoColumn:"Rugby"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:2020 sport:"Rugby"
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Football ag-Grid-AutoColumn:"Football"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:2021 sport:"Football"
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ filler collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
            · · · └── LEAF hidden id:4 country:"France" year:2020 sport:"Football"
        `);
    });

    test('groupDefaultExpanded -1 with explicit collapse preserves collapsed state on column change', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020 },
            { id: '2', country: 'Ireland', year: 2021 },
            { id: '3', country: 'France', year: 2020 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }],
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial - all expanded').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" year:2020
            │ └── LEAF id:2 country:"Ireland" year:2021
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF id:3 country:"France" year:2020
        `);

        // Explicitly collapse France
        api.setRowNodeExpanded(api.getRowNode('row-group-country-France')!, false, false, true);

        await new GridRows(api, 'France collapsed').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" year:2020
            │ └── LEAF id:2 country:"Ireland" year:2021
            └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └── LEAF hidden id:3 country:"France" year:2020
        `);

        // Add year as a second grouping column
        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
        ]);

        // Ireland stays expanded (saved expanded ID match). France stays collapsed (saved collapsed ID match).
        // New year sub-groups follow groupDefaultExpanded: -1 (expanded).
        await new GridRows(api, 'after adding year — France stays collapsed').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ └── LEAF id:1 country:"Ireland" year:2020
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:2 country:"Ireland" year:2021
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF hidden id:3 country:"France" year:2020
        `);
    });
});
