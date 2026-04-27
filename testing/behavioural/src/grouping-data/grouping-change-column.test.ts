import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, GridStateModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('ag-grid grouping simple data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, RowGroupingModule],
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

        await new GridColumns(api, 'column A (2)').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── 1 "A" width:200 rowGroup
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

        // Flush the debounced state update (rowExpansionStateChanged is debounced with 0ms)
        await asyncSetTimeout(0);

        // Expansion state debounce has settled — Ireland is in the expanded set
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['row-group-country-Ireland'],
            collapsedRowGroupIds: [],
        });

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

        // Flush the debounced state update
        await asyncSetTimeout(0);

        // Ireland's ID is unchanged so it remains in the expanded set after the column change
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['row-group-country-Ireland'],
            collapsedRowGroupIds: [],
        });

        await new GridColumns(api, 'after adding year as group column').checkColumns(`
            CENTER
            └── ag-Grid-AutoColumn "Group" width:200
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

        // Flush the debounced state update
        await asyncSetTimeout(0);

        // Expansion state debounce has settled — both expanded nodes are in the set
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['row-group-country-Ireland', 'row-group-country-Ireland-year-2020'],
            collapsedRowGroupIds: [],
        });

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

        // Flush the debounced state update
        await asyncSetTimeout(0);

        // Year sub-group nodes are gone — only Ireland remains in the expanded set
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['row-group-country-Ireland'],
            collapsedRowGroupIds: [],
        });

        await new GridColumns(api, 'after removing year group column').checkColumns(`
            CENTER
            └── ag-Grid-AutoColumn "Group" width:200
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

        // Flush the debounced state update
        await asyncSetTimeout(0);

        // Expansion state debounce has settled — both expanded nodes are in the set
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: ['row-group-country-Ireland', 'row-group-country-Ireland-year-2020'],
            collapsedRowGroupIds: [],
        });

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

        // Flush the debounced state update
        await asyncSetTimeout(0);

        // All year-level IDs changed so none matched — state resets to empty
        expect(api.getState().rowGroupExpansion).toEqual({
            expandedRowGroupIds: [],
            collapsedRowGroupIds: [],
        });
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

    describe('resetRowGroupExpansion', () => {
        test('resets all groups back to collapsed (default groupDefaultExpanded: 0)', async () => {
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

            // Expand Ireland and Ireland/2020
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

            // Flush the debounced state update
            await asyncSetTimeout(0);

            // Expansion state debounce has settled — both expanded nodes are in the set
            expect(api.getState().rowGroupExpansion).toEqual({
                expandedRowGroupIds: ['row-group-country-Ireland', 'row-group-country-Ireland-year-2020'],
                collapsedRowGroupIds: [],
            });

            api.resetRowGroupExpansion();

            // All groups should be collapsed (groupDefaultExpanded defaults to 0)
            await new GridRows(api, 'after resetRowGroupExpansion').check(`
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

            // Flush the debounced state update
            await asyncSetTimeout(0);

            // Expansion state debounce settled — reset returns state to empty
            expect(api.getState().rowGroupExpansion).toEqual({
                expandedRowGroupIds: [],
                collapsedRowGroupIds: [],
            });
        });

        test('resets to groupDefaultExpanded: -1 (all expanded)', async () => {
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
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // Collapse France and Ireland/2020
            api.setRowNodeExpanded(api.getRowNode('row-group-country-France')!, false, false, true);
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, false, false, true);

            await new GridRows(api, 'France collapsed, Ireland/2020 collapsed').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF id:2 country:"Ireland" year:2021
                └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);

            api.resetRowGroupExpansion();

            // All groups should be expanded (groupDefaultExpanded: -1)
            await new GridRows(api, 'after resetRowGroupExpansion — all expanded').check(`
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

        test('resets to groupDefaultExpanded: 1 (first level expanded only)', async () => {
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
                groupDefaultExpanded: 1,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // Collapse Ireland and expand Ireland/2020 (overrides both levels)
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, false, false, true);
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

            await new GridRows(api, 'Ireland collapsed, Ireland/2020 expanded (override)').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF hidden id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);

            api.resetRowGroupExpansion();

            // Level 0 expanded, level 1 collapsed (groupDefaultExpanded: 1)
            await new GridRows(api, 'after resetRowGroupExpansion — level 0 expanded, level 1 collapsed').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF hidden id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);
        });

        test('re-evaluates isGroupOpenByDefault callback', async () => {
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
                // Only Ireland should be expanded by default
                isGroupOpenByDefault: (params) => params.key === 'Ireland',
            });

            await new GridRows(api, 'initial — Ireland expanded via callback').check(`
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

            // Override: collapse Ireland, expand France and Ireland/2020
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, false, false, true);
            api.setRowNodeExpanded(api.getRowNode('row-group-country-France')!, true, false, true);
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

            await new GridRows(api, 'user overrides applied').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF hidden id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);

            api.resetRowGroupExpansion();

            // Callback re-evaluated: Ireland expanded, France collapsed (back to initial state)
            await new GridRows(api, 'after resetRowGroupExpansion — callback re-evaluated').check(`
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

        test('resets preserved expansion state after column change', async () => {
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

            // Expand Ireland
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

            // Add year as group column — Ireland stays expanded (preserved)
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ]);

            // columnRowGroupChanged updates state synchronously — Ireland's ID is unchanged so it remains expanded
            expect(api.getState().rowGroupExpansion).toEqual({
                expandedRowGroupIds: ['row-group-country-Ireland'],
                collapsedRowGroupIds: [],
            });

            await new GridRows(api, 'Ireland preserved expanded after column change').check(`
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

            api.resetRowGroupExpansion();

            // Reset clears the preserved expansion — all groups return to default (collapsed)
            await new GridRows(api, 'after resetRowGroupExpansion — all collapsed').check(`
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

            // Flush the debounced state update
            await asyncSetTimeout(0);

            // Expansion state debounce settled — reset returns state to empty
            expect(api.getState().rowGroupExpansion).toEqual({
                expandedRowGroupIds: [],
                collapsedRowGroupIds: [],
            });
        });
    });

    describe('pivot mode', () => {
        const pivotGridsManager = new TestGridsManager({
            modules: [ClientSideRowModelModule, GridStateModule, RowGroupingModule, PivotModule],
        });

        beforeEach(() => {
            pivotGridsManager.reset();
        });

        afterEach(() => {
            pivotGridsManager.reset();
        });

        test('pivot mode without active pivot — add deeper group column preserves non-leaf expansion, leaf groups forced collapsed', async () => {
            const rowData = [
                { id: '1', country: 'Ireland', year: 2020, sport: 'Football' },
                { id: '2', country: 'Ireland', year: 2021, sport: 'Rugby' },
                { id: '3', country: 'France', year: 2020, sport: 'Football' },
            ];

            const api = pivotGridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', rowGroup: true, hide: true },
                ],
                pivotMode: true,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // Country is non-leaf (filler), year is LEAF_GROUP → forced collapsed in pivot mode
            await new GridRows(api, 'initial — all collapsed in pivot mode').check(`
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

            // Expand Ireland (non-leaf group)
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

            await new GridRows(api, 'Ireland expanded, year leaf groups forced collapsed').check(`
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

            // Add sport as 3rd group column
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
            ]);

            // Ireland preserved expanded (non-leaf, snapshot match).
            // Year now non-leaf → stays collapsed (snapshot match).
            // Sport is new leaf group → forced collapsed in pivot mode.
            await new GridRows(api, 'after adding sport — leaf groups forced collapsed').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ filler collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
                │ │ · └── LEAF hidden id:1 country:"Ireland" year:2020 sport:"Football"
                │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Rugby ag-Grid-AutoColumn:"Rugby"
                │ · · └── LEAF hidden id:2 country:"Ireland" year:2021 sport:"Rugby"
                └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ filler collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020-sport-Football ag-Grid-AutoColumn:"Football"
                · · · └── LEAF hidden id:3 country:"France" year:2020 sport:"Football"
            `);
        });

        test('pivot mode with active pivot — add deeper group column preserves non-leaf expansion, leaf groups forced collapsed', async () => {
            const rowData = [
                { id: '1', country: 'Ireland', year: 2020, sport: 'Football', medals: 2 },
                { id: '2', country: 'Ireland', year: 2021, sport: 'Rugby', medals: 3 },
                { id: '3', country: 'France', year: 2020, sport: 'Football', medals: 4 },
            ];

            const gridRowsOptions = {
                forcedColumns: ['ag-Grid-AutoColumn', 'pivot_sport_Football_medals', 'pivot_sport_Rugby_medals'],
            };

            const api = pivotGridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', pivot: true, hide: true },
                    { field: 'medals', aggFunc: 'sum', hide: true },
                    { field: 'year' },
                ],
                pivotMode: true,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // Country is LEAF_GROUP → forced collapsed in pivot mode
            // Secondary pivot columns created from sport values
            await new GridRows(api, 'initial — leaf groups forced collapsed with pivot', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_sport_Football_medals:6 pivot_sport_Rugby_medals:3
                ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_sport_Football_medals:2 pivot_sport_Rugby_medals:3
                │ ├── LEAF hidden id:1 pivot_sport_Football_medals:2 pivot_sport_Rugby_medals:2
                │ └── LEAF hidden id:2 pivot_sport_Football_medals:3 pivot_sport_Rugby_medals:3
                └─┬ LEAF_GROUP collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_sport_Football_medals:4 pivot_sport_Rugby_medals:null
                · └── LEAF hidden id:3 pivot_sport_Football_medals:4 pivot_sport_Rugby_medals:4
            `);

            // Expand Ireland (leaf group in pivot — user override)
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

            // Add year as 2nd group column — country becomes non-leaf
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'medals', aggFunc: 'sum', hide: true },
            ]);

            // Ireland preserved expanded (non-leaf now, snapshot match).
            // Year groups are new leaf groups → forced collapsed in pivot mode.
            await new GridRows(api, 'after adding year — non-leaf preserved, leaf collapsed', gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID pivot_sport_Football_medals:6 pivot_sport_Rugby_medals:3
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" pivot_sport_Football_medals:2 pivot_sport_Rugby_medals:3
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020 pivot_sport_Football_medals:2 pivot_sport_Rugby_medals:null
                │ │ └── LEAF hidden id:1 pivot_sport_Football_medals:2 pivot_sport_Rugby_medals:2
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021 pivot_sport_Football_medals:null pivot_sport_Rugby_medals:3
                │ · └── LEAF hidden id:2 pivot_sport_Football_medals:3 pivot_sport_Rugby_medals:3
                └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France" pivot_sport_Football_medals:4 pivot_sport_Rugby_medals:null
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020 pivot_sport_Football_medals:4 pivot_sport_Rugby_medals:null
                · · └── LEAF hidden id:3 pivot_sport_Football_medals:4 pivot_sport_Rugby_medals:4
            `);
        });

        test('resetRowGroupExpansion in pivot mode forces leaf groups collapsed, re-evaluates non-leaf defaults', async () => {
            const rowData = [
                { id: '1', country: 'Ireland', year: 2020, sport: 'Football' },
                { id: '2', country: 'Ireland', year: 2021, sport: 'Rugby' },
                { id: '3', country: 'France', year: 2020, sport: 'Football' },
            ];

            const api = pivotGridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', rowGroup: true, hide: true },
                ],
                pivotMode: true,
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // groupDefaultExpanded: -1 expands non-leaf groups; leaf groups forced collapsed in pivot
            await new GridRows(api, 'initial — non-leaf expanded, leaf forced collapsed').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF hidden id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);

            // Collapse Ireland, expand year leaf groups (user overrides)
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, false, false, true);
            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

            // Leaf groups in pivot mode are never expanded (getter returns false),
            // so setRowNodeExpanded(true) has no visible effect on leaf groups.
            await new GridRows(api, 'user overrides: Ireland collapsed, year 2020 expanded').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF hidden id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);

            api.resetRowGroupExpansion();

            // Non-leaf groups re-evaluated against groupDefaultExpanded: -1 → expanded.
            // Leaf groups forced collapsed in pivot mode regardless.
            await new GridRows(api, 'after reset — non-leaf expanded, leaf forced collapsed').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF hidden id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF hidden id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF hidden id:3 country:"France" year:2020
            `);
        });
    });

    describe('selection during group column changes', () => {
        const gridsManagerWithSelection = new TestGridsManager({
            modules: [ClientSideRowModelModule, GridStateModule, RowSelectionModule, RowGroupingModule],
        });

        beforeEach(() => {
            gridsManagerWithSelection.reset();
        });

        afterEach(() => {
            gridsManagerWithSelection.reset();
        });

        test('group and leaf selections are preserved when adding a deeper group column', async () => {
            const rowData = [
                { id: '1', country: 'Ireland', year: 2020 },
                { id: '2', country: 'Ireland', year: 2021 },
                { id: '3', country: 'France', year: 2020 },
                { id: '4', country: 'France', year: 2021 },
            ];

            const api = gridsManagerWithSelection.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'year' }],
                rowSelection: { mode: 'multiRow' },
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // Select a group node and some leaf nodes
            api.setNodesSelected({
                nodes: [api.getRowNode('row-group-country-Ireland')!, api.getRowNode('1')!, api.getRowNode('3')!],
                newValue: true,
            });

            await new GridRows(api, 'initial selection').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├── LEAF selected id:1 country:"Ireland" year:2020
                │ └── LEAF id:2 country:"Ireland" year:2021
                └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                · ├── LEAF selected id:3 country:"France" year:2020
                · └── LEAF id:4 country:"France" year:2021
            `);

            // Add year as a second grouping column — triggers shotgunResetEverything
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ]);

            // Leaf selections (id:1, id:3) and the Ireland group selection are preserved
            // because group nodes with the same ID are reused during the regroup.
            await new GridRows(api, 'after adding year group column').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF selected id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · ├─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · │ └── LEAF selected id:3 country:"France" year:2020
                · └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn:2021
                · · └── LEAF id:4 country:"France" year:2021
            `);
        });

        test('group selections are preserved for reused nodes but lost for destroyed nodes when removing a group column', async () => {
            const rowData = [
                { id: '1', country: 'Ireland', year: 2020 },
                { id: '2', country: 'Ireland', year: 2021 },
                { id: '3', country: 'France', year: 2020 },
            ];

            const api = gridsManagerWithSelection.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', rowGroup: true, hide: true },
                ],
                rowSelection: { mode: 'multiRow' },
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
            });

            // Select group nodes and leaf nodes
            api.setNodesSelected({
                nodes: [
                    api.getRowNode('row-group-country-Ireland')!,
                    api.getRowNode('row-group-country-Ireland-year-2020')!,
                    api.getRowNode('1')!,
                    api.getRowNode('3')!,
                ],
                newValue: true,
            });

            await new GridRows(api, 'initial selection').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP selected id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
                │ │ └── LEAF selected id:1 country:"Ireland" year:2020
                │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
                │ · └── LEAF id:2 country:"Ireland" year:2021
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
                · · └── LEAF selected id:3 country:"France" year:2020
            `);

            // Remove year from grouping
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: false },
            ]);

            // Leaf selections preserved. Ireland group selection preserved (same ID reused).
            // Year sub-group selections lost (those nodes are destroyed).
            await new GridRows(api, 'after removing year group column').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP selected id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├── LEAF selected id:1 country:"Ireland" year:2020
                │ └── LEAF id:2 country:"Ireland" year:2021
                └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └── LEAF selected id:3 country:"France" year:2020
            `);
        });
    });
});
