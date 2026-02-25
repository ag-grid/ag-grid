import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

function getVisibleAutoGroupColIds(api: GridApi): string[] {
    return api
        .getAllDisplayedColumns()
        .filter((col) => col.getColId().startsWith('ag-Grid-AutoColumn'))
        .map((col) => col.getColId());
}

describe('ag-grid groupHideColumnsUntilExpanded', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, QuickFilterModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Some tests intentionally create a grid where `groupHideColumnsUntilExpanded = true` is
    // combined with an incompatible display type, which produces an expected AG Grid warning.
    // Suppress the console noise and assert the warning in those tests.
    let warnSpy: ReturnType<typeof vitest.spyOn>;
    beforeEach(() => {
        warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warnSpy.mockRestore();
    });

    const twoLevelRowData = cachedJSONObjects.array([
        { id: '1', country: 'Ireland', year: '2020', athlete: 'John Smith', gold: 1 },
        { id: '2', country: 'Ireland', year: '2021', athlete: 'Jane Doe', gold: 2 },
        { id: '3', country: 'Italy', year: '2020', athlete: 'Mario Rossi', gold: 3 },
        { id: '4', country: 'France', year: '2021', athlete: 'Jean Dupont', gold: 1 },
    ]);

    const threeLevelRowData = cachedJSONObjects.array([
        { id: '1', country: 'Ireland', year: '2020', sport: 'Sailing', athlete: 'John Smith', gold: 1 },
        { id: '2', country: 'Ireland', year: '2020', sport: 'Soccer', athlete: 'Jane Doe', gold: 2 },
        { id: '3', country: 'Ireland', year: '2021', sport: 'Soccer', athlete: 'Bob Johnson', gold: 3 },
        { id: '4', country: 'Italy', year: '2020', sport: 'Soccer', athlete: 'Mario Rossi', gold: 4 },
    ]);

    const fourLevelRowData = cachedJSONObjects.array([
        { id: '1', country: 'Ireland', year: '2020', sport: 'Sailing', athlete: 'John Smith', gold: 1 },
        { id: '2', country: 'Ireland', year: '2020', sport: 'Soccer', athlete: 'Jane Doe', gold: 2 },
        { id: '3', country: 'Ireland', year: '2021', sport: 'Soccer', athlete: 'Bob Johnson', gold: 3 },
        { id: '4', country: 'Italy', year: '2020', sport: 'Soccer', athlete: 'Mario Rossi', gold: 4 },
    ]);

    test('default (false) - all auto columns visible when collapsed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // All auto group columns visible even though nothing is expanded
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('default (false) - all auto columns remain visible after expand and collapse', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        api.collapseAll();

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('explicit false - all auto columns visible with 3-level grouping', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: false,
            groupDefaultExpanded: 0,
            rowData: threeLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // All 3 auto group columns visible even with nothing expanded
        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);
    });

    test('all collapsed - only level 0 auto column visible', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        const visibleCols = getVisibleAutoGroupColIds(api);
        expect(visibleCols).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'all collapsed').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('expand level 0 - level 1 auto column appears', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Initially only level 0
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'all collapsed').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        // Now both levels should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('3-level grouping - expand level 1 shows level 2 auto column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: threeLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Initially only level 0
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'all collapsed').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            │ ├─┬ filler collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            │ │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Sailing ag-Grid-AutoColumn-sport:"Sailing"
            │ │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" sport:"Sailing" athlete:"John Smith" gold:1
            │ │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:"2020" sport:"Soccer" athlete:"Jane Doe" gold:2
            │ └─┬ filler collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" ag-Grid-AutoColumn-sport:null
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:"2021" sport:"Soccer" athlete:"Bob Johnson" gold:3
            └─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            · └─┬ filler collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            · · · └── LEAF hidden id:4 country:"Italy" year:"2020" sport:"Soccer" athlete:"Mario Rossi" gold:4
        `);

        // Expand Ireland (level 0)
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            │ ├─┬ filler collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            │ │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Sailing ag-Grid-AutoColumn-sport:"Sailing"
            │ │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" sport:"Sailing" athlete:"John Smith" gold:1
            │ │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:"2020" sport:"Soccer" athlete:"Jane Doe" gold:2
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" ag-Grid-AutoColumn-sport:null
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:"2021" sport:"Soccer" athlete:"Bob Johnson" gold:3
            └─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            · └─┬ filler collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            · · · └── LEAF hidden id:4 country:"Italy" year:"2020" sport:"Soccer" athlete:"Mario Rossi" gold:4
        `);

        // Expand Ireland > 2020 (level 1)
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);
        await new GridRows(api, 'Ireland > 2020 expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            │ │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020-sport-Sailing ag-Grid-AutoColumn-sport:"Sailing"
            │ │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" sport:"Sailing" athlete:"John Smith" gold:1
            │ │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ │ · └── LEAF hidden id:2 country:"Ireland" year:"2020" sport:"Soccer" athlete:"Jane Doe" gold:2
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" ag-Grid-AutoColumn-sport:null
            │ · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ · · └── LEAF hidden id:3 country:"Ireland" year:"2021" sport:"Soccer" athlete:"Bob Johnson" gold:3
            └─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            · └─┬ filler collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            · · · └── LEAF hidden id:4 country:"Italy" year:"2020" sport:"Soccer" athlete:"Mario Rossi" gold:4
        `);
    });

    test('4-level grouping - each expansion reveals the next auto column', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'athlete', rowGroup: true, hide: true },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: fourLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Initially only level 0
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland (level 0)
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        // Expand Ireland > 2020 (level 1)
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020')!, true, false, true);
        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);

        // Expand Ireland > 2020 > Sailing (level 2)
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland-year-2020-sport-Sailing')!, true, false, true);
        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
            'ag-Grid-AutoColumn-athlete',
        ]);

        // Collapse Ireland > 2020 > Sailing (level 2) - athlete column should hide
        api.setRowNodeExpanded(
            api.getRowNode('row-group-country-Ireland-year-2020-sport-Sailing')!,
            false,
            false,
            true
        );
        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);
        await new GridRows(api, 'after collapse Sailing').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-athlete:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-athlete:null
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-athlete:null
            │ │ ├─┬ filler collapsed id:row-group-country-Ireland-year-2020-sport-Sailing ag-Grid-AutoColumn-sport:"Sailing" ag-Grid-AutoColumn-athlete:null
            │ │ │ └─┬ LEAF_GROUP collapsed hidden id:"row-group-country-Ireland-year-2020-sport-Sailing-athlete-John Smith" ag-Grid-AutoColumn-athlete:"John Smith"
            │ │ │ · └── LEAF hidden id:1 country:"Ireland" year:"2020" sport:"Sailing" athlete:"John Smith" gold:1
            │ │ └─┬ filler collapsed id:row-group-country-Ireland-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer" ag-Grid-AutoColumn-athlete:null
            │ │ · └─┬ LEAF_GROUP collapsed hidden id:"row-group-country-Ireland-year-2020-sport-Soccer-athlete-Jane Doe" ag-Grid-AutoColumn-athlete:"Jane Doe"
            │ │ · · └── LEAF hidden id:2 country:"Ireland" year:"2020" sport:"Soccer" athlete:"Jane Doe" gold:2
            │ └─┬ filler collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-athlete:null
            │ · └─┬ filler collapsed hidden id:row-group-country-Ireland-year-2021-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer" ag-Grid-AutoColumn-athlete:null
            │ · · └─┬ LEAF_GROUP collapsed hidden id:"row-group-country-Ireland-year-2021-sport-Soccer-athlete-Bob Johnson" ag-Grid-AutoColumn-athlete:"Bob Johnson"
            │ · · · └── LEAF hidden id:3 country:"Ireland" year:"2021" sport:"Soccer" athlete:"Bob Johnson" gold:3
            └─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-athlete:null
            · └─┬ filler collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null ag-Grid-AutoColumn-athlete:null
            · · └─┬ filler collapsed hidden id:row-group-country-Italy-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer" ag-Grid-AutoColumn-athlete:null
            · · · └─┬ LEAF_GROUP collapsed hidden id:"row-group-country-Italy-year-2020-sport-Soccer-athlete-Mario Rossi" ag-Grid-AutoColumn-athlete:"Mario Rossi"
            · · · · └── LEAF hidden id:4 country:"Italy" year:"2020" sport:"Soccer" athlete:"Mario Rossi" gold:4
        `);
    });

    test('expand level 0 - level 1 auto column appears, filter out row group column still visible', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Initially only level 0
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        // Now both levels should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        api.setGridOption('quickFilterText', 'France');

        // Filter hides Ireland rows - only France group row is displayed
        expect(api.getDisplayedRowCount()).toBe(1);
        expect(api.getDisplayedRowAtIndex(0)!.key).toBe('France');

        // Year column remains visible even though the expanded Ireland group is now filtered out
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('collapse all level 0 - hides level 1+', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'Ireland expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        // Collapse Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, false, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'Ireland collapsed').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('expandAll - all auto columns visible', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'all collapsed').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        api.expandAll();

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'all expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('collapseAll - only level 0 visible', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: -1,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // All expanded initially
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'all expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        api.collapseAll();

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'all collapsed').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('groupDefaultExpanded: 1 - levels 0 and 1 visible on initial load', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 1,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('groupDefaultExpanded: -1 - all visible on initial load', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: -1,
            rowData: threeLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);
    });

    test('runtime toggle - turning option on hides unexpanded columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: false,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Both visible by default when feature is off
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'feature off').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        // Enable feature
        api.updateGridOptions({ groupHideColumnsUntilExpanded: true });

        // Now only level 0 should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'feature on').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('runtime toggle - turning option off restores all columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(api, 'feature on').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        // Disable feature
        api.updateGridOptions({ groupHideColumnsUntilExpanded: false });

        // Both should be visible again
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, 'feature off').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('runtime groupDisplayType change to multipleColumns - feature activates', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'singleColumn',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('groupHideColumnsUntilExpanded = true'));

        // In singleColumn mode, feature has no effect - one auto col always visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);

        // Switch to multipleColumns at runtime
        api.updateGridOptions({ groupDisplayType: 'multipleColumns' });

        // Feature now active: only level 0 visible (nothing expanded)
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland to reveal level 1
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('runtime groupDisplayType change from multipleColumns - resets to singleColumn', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Feature active: only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Switch back to singleColumn at runtime
        api.updateGridOptions({ groupDisplayType: 'singleColumn' });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('groupHideColumnsUntilExpanded = true'));

        // Feature no longer active: single auto col visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);
    });

    test('runtime groupHideOpenParents true - feature activates with multipleColumns behaviour', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupHideOpenParents: false,
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('groupHideColumnsUntilExpanded = true'));

        // Without groupHideOpenParents, singleColumn mode (default) - feature has no effect
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);

        // Enable groupHideOpenParents at runtime (implies multipleColumns)
        api.updateGridOptions({ groupHideOpenParents: true });

        // Feature now active: only level 0 visible (nothing expanded)
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland to reveal level 1
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('runtime groupHideOpenParents false - feature deactivates', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupHideOpenParents: true,
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Feature active via groupHideOpenParents: only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Disable groupHideOpenParents at runtime
        api.updateGridOptions({ groupHideOpenParents: false });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('groupHideColumnsUntilExpanded = true'));

        // Without multipleColumns mode, feature deactivates - single auto col visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);
    });

    test('with groupHideOpenParents - feature works (forces multipleColumns mode)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupHideOpenParents: true,
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        // Only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        // Now both levels should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('has no effect with singleColumn display type', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'singleColumn',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('groupHideColumnsUntilExpanded = true'));

        // Single auto group column should always be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);
    });

    test('has no effect with groupRows display type', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'groupRows',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('groupHideColumnsUntilExpanded = true'));

        // No auto group columns in groupRows mode
        expect(getVisibleAutoGroupColIds(api)).toEqual([]);
    });
});

describe('ag-grid groupHideColumnsUntilExpanded with pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const pivotRowData = cachedJSONObjects.array([
        { id: '1', country: 'Ireland', year: '2020', gold: 1 },
        { id: '2', country: 'Ireland', year: '2021', gold: 2 },
        { id: '3', country: 'Italy', year: '2020', gold: 3 },
        { id: '4', country: 'France', year: '2021', gold: 1 },
    ]);

    function getVisibleNonAutoColIds(api: GridApi): string[] {
        return api
            .getAllDisplayedColumns()
            .filter((col) => !col.getColId().startsWith('ag-Grid-AutoColumn'))
            .map((col) => col.getColId());
    }

    test('pivot mode with active pivot result - auto group column visible (multipleColumns)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            groupHideColumnsUntilExpanded: true,
            groupDisplayType: 'multipleColumns',
            groupDefaultExpanded: 0,
            rowData: pivotRowData,
            getRowId: (params) => params.data.id,
        });

        // In pivot mode with results, single auto group column should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
    });

    test('pivot mode with active pivot result - auto group column visible (groupHideOpenParents)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum', hide: true },
            ],
            pivotMode: true,
            groupHideColumnsUntilExpanded: true,
            groupHideOpenParents: true,
            groupDefaultExpanded: 0,
            rowData: pivotRowData,
            getRowId: (params) => params.data.id,
        });

        // In pivot mode with results, single auto group column should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
    });

    test('pivot mode without pivot result - does not leak regular columns', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', rowGroup: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: pivotRowData,
            getRowId: (params) => params.data.id,
        });

        // In pivot mode without pivot columns, only auto group + value columns should be shown
        // Regular columns like 'country' and 'year' must NOT leak through
        const nonAutoCols = getVisibleNonAutoColIds(api);
        expect(nonAutoCols).toEqual(['gold']);
    });

    test('pivot mode without pivot result and feature off - auto group always visible', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', rowGroup: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: false,
            groupDefaultExpanded: 0,
            rowData: pivotRowData,
            getRowId: (params) => params.data.id,
        });

        // Auto group column always visible when feature is off
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        // Only value columns alongside auto group
        const nonAutoCols = getVisibleNonAutoColIds(api);
        expect(nonAutoCols).toEqual(['gold']);
    });
});
