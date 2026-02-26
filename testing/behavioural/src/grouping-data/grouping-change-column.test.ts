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
});
