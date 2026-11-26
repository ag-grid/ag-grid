import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    cachedJSONObjects,
} from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    QuickFilterModule,
    enableDevValidations,
    getGridElement,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

function getVisibleAutoGroupColIds(api: GridApi): string[] {
    return api
        .getAllDisplayedColumns()
        .filter((col) => col.getColId().startsWith('ag-Grid-AutoColumn'))
        .map((col) => col.getColId());
}

function getDisplayedColIds(api: GridApi): string[] {
    return api.getAllDisplayedColumns().map((col) => col.getColId());
}

/** Returns col-id attributes from the first data row's cells in DOM order */
function getCellColIdsFromDom(api: GridApi): string[] {
    const gridElement = getGridElement(api);
    if (!gridElement) {
        return [];
    }
    const firstRow = gridElement.querySelector('[role="row"][row-index="0"]');
    if (!firstRow) {
        return [];
    }
    return Array.from(firstRow.querySelectorAll('[role="gridcell"]')).map((cell) => cell.getAttribute('col-id') ?? '');
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
        await new GridColumns(api, `default (false) - all auto columns visible when collapsed setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-year "Year" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `default (false) - all auto columns visible when collapsed setup`).check(`
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

        // All auto group columns visible even though nothing is expanded
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, `default (false) - all auto columns visible when collapsed final state`).check(`
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
        await new GridColumns(api, `default (false) - all auto columns remain visible after expand and collapse setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── ag-Grid-AutoColumn-year "Year" width:200
                ├── athlete "Athlete" width:200
                └── gold "Gold" width:200
            `);
        await new GridRows(api, `default (false) - all auto columns remain visible after expand and collapse setup`)
            .check(`
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

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await new GridRows(
            api,
            `default (false) - all auto columns remain visible after expand and collapse after setRowNodeExpanded`
        ).check(`
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

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        api.collapseAll();
        await new GridRows(
            api,
            `default (false) - all auto columns remain visible after expand and collapse after collapseAll`
        ).check(`
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
        await new GridColumns(api, `explicit false - all auto columns visible with 3-level grouping setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── ag-Grid-AutoColumn-year "Year" width:200
                ├── ag-Grid-AutoColumn-sport "Sport" width:200
                ├── athlete "Athlete" width:200
                └── gold "Gold" width:200
            `);
        await new GridRows(api, `explicit false - all auto columns visible with 3-level grouping setup`).check(`
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

        // All 3 auto group columns visible even with nothing expanded
        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);
        await new GridRows(api, `explicit false - all auto columns visible with 3-level grouping final state`).check(
            `
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
            `
        );
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

        await new GridColumns(api, 'all collapsed').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
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

        await new GridColumns(api, 'Ireland expanded').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-year "Year" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
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

        await new GridColumns(api, 'Ireland > 2020 expanded').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-year "Year" width:200
            ├── ag-Grid-AutoColumn-sport "Sport" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
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
        await new GridColumns(
            api,
            `expand level 0 - level 1 auto column appears, filter out row group column still  setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `expand level 0 - level 1 auto column appears, filter out row group column still  setup`
        ).check(`
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

        // Initially only level 0
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await new GridRows(
            api,
            `expand level 0 - level 1 auto column appears, filter out row group column still  after setRowNodeExpanded`
        ).check(`
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

        // Now both levels should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        api.setGridOption('quickFilterText', 'France');
        await new GridColumns(
            api,
            `expand level 0 - level 1 auto column appears, filter out row group column still  after setGridOption quickFilterText`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-year "Year" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `expand level 0 - level 1 auto column appears, filter out row group column still  after setGridOption quickFilterText`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

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
        await new GridColumns(api, `groupDefaultExpanded: 1 - levels 0 and 1 visible on initial load setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── ag-Grid-AutoColumn-year "Year" width:200
                ├── athlete "Athlete" width:200
                └── gold "Gold" width:200
            `);
        await new GridRows(api, `groupDefaultExpanded: 1 - levels 0 and 1 visible on initial load setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP collapsed id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        await new GridRows(api, `groupDefaultExpanded: 1 - levels 0 and 1 visible on initial load final state`).check(
            `
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
                ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
                │ ├─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020"
                │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
                │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
                ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
                │ └─┬ LEAF_GROUP collapsed id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020"
                │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
                └─┬ filler id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
                · └─┬ LEAF_GROUP collapsed id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021"
                · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
            `
        );
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
        await new GridColumns(api, `groupDefaultExpanded: -1 - all visible on initial load setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-year "Year" width:200
            ├── ag-Grid-AutoColumn-sport "Sport" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `groupDefaultExpanded: -1 - all visible on initial load setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            │ │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Sailing ag-Grid-AutoColumn-sport:"Sailing"
            │ │ │ └── LEAF id:1 country:"Ireland" year:"2020" sport:"Sailing" athlete:"John Smith" gold:1
            │ │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ │ · └── LEAF id:2 country:"Ireland" year:"2020" sport:"Soccer" athlete:"Jane Doe" gold:2
            │ └─┬ filler id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" ag-Grid-AutoColumn-sport:null
            │ · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ · · └── LEAF id:3 country:"Ireland" year:"2021" sport:"Soccer" athlete:"Bob Johnson" gold:3
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            · └─┬ filler id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            · · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            · · · └── LEAF id:4 country:"Italy" year:"2020" sport:"Soccer" athlete:"Mario Rossi" gold:4
        `);

        expect(getVisibleAutoGroupColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'ag-Grid-AutoColumn-sport',
        ]);
        await new GridRows(api, `groupDefaultExpanded: -1 - all visible on initial load final state`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            │ ├─┬ filler id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            │ │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Sailing ag-Grid-AutoColumn-sport:"Sailing"
            │ │ │ └── LEAF id:1 country:"Ireland" year:"2020" sport:"Sailing" athlete:"John Smith" gold:1
            │ │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ │ · └── LEAF id:2 country:"Ireland" year:"2020" sport:"Soccer" athlete:"Jane Doe" gold:2
            │ └─┬ filler id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" ag-Grid-AutoColumn-sport:null
            │ · └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            │ · · └── LEAF id:3 country:"Ireland" year:"2021" sport:"Soccer" athlete:"Bob Johnson" gold:3
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null ag-Grid-AutoColumn-sport:null
            · └─┬ filler id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" ag-Grid-AutoColumn-sport:null
            · · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020-sport-Soccer ag-Grid-AutoColumn-sport:"Soccer"
            · · · └── LEAF id:4 country:"Italy" year:"2020" sport:"Soccer" athlete:"Mario Rossi" gold:4
        `);
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

        // Enable feature — `groupHideColumnsUntilExpanded` is owned by autoColSvc (visibility only), so
        // columnModel no longer also refreshes: the toggle must be a single displayed-cols refresh.
        let displayedRefreshes = 0;
        api.addEventListener('displayedColumnsChanged', () => displayedRefreshes++);
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

        // Single refresh for the toggle (events are async — the awaited check above flushed them).
        await asyncSetTimeout(0);
        expect(displayedRefreshes).toBe(1);
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
        // Deliberately starts in the invalid combo and asserts #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        await new GridColumns(api, `runtime groupDisplayType change to multipleColumns - feature activates setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── athlete "Athlete" width:200
                └── gold "Gold" width:200
            `);
        await new GridRows(api, `runtime groupDisplayType change to multipleColumns - feature activates setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
                │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"2020"
                │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"2021"
                │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
                ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"2020"
                │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
                └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn:"2021"
                · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
            `
        );

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );

        // In singleColumn mode, feature has no effect - one auto col always visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);

        // Switch to multipleColumns at runtime
        api.updateGridOptions({ groupDisplayType: 'multipleColumns' });

        // Feature now active: only level 0 visible (nothing expanded)
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland to reveal level 1
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await new GridRows(
            api,
            `runtime groupDisplayType change to multipleColumns - feature activates after setRowNodeExpanded`
        ).check(`
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

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('runtime groupDisplayType change from multipleColumns - resets to singleColumn', async () => {
        // Deliberately transitions into the invalid combo and asserts #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        await new GridColumns(
            api,
            `runtime groupDisplayType change from multipleColumns - resets to singleColumn setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `runtime groupDisplayType change from multipleColumns - resets to singleColumn setup`)
            .check(`
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

        // Feature active: only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Switch back to singleColumn at runtime
        api.updateGridOptions({ groupDisplayType: 'singleColumn' });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );

        // Feature no longer active: single auto col visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);
        await new GridRows(
            api,
            `runtime groupDisplayType change from multipleColumns - resets to singleColumn final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('runtime groupHideOpenParents true - feature activates with multipleColumns behaviour', async () => {
        // Deliberately starts in the invalid combo and asserts #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        await new GridColumns(
            api,
            `runtime groupHideOpenParents true - feature activates with multipleColumns behav setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `runtime groupHideOpenParents true - feature activates with multipleColumns behav setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );

        // Without groupHideOpenParents, singleColumn mode (default) - feature has no effect
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);

        // Enable groupHideOpenParents at runtime (implies multipleColumns)
        api.updateGridOptions({ groupHideOpenParents: true });

        // Feature now active: only level 0 visible (nothing expanded)
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland to reveal level 1
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await new GridRows(
            api,
            `runtime groupHideOpenParents true - feature activates with multipleColumns behav after setRowNodeExpanded`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2020"
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            ├── filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            └── filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
        `);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('runtime groupHideOpenParents false - feature deactivates', async () => {
        // Deliberately transitions into the invalid combo and asserts #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        await new GridColumns(api, `runtime groupHideOpenParents false - feature deactivates setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `runtime groupHideOpenParents false - feature deactivates setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├── filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
            ├── filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            └── filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
        `);

        // Feature active via groupHideOpenParents: only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Disable groupHideOpenParents at runtime
        api.updateGridOptions({ groupHideOpenParents: false });

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );

        // Without multipleColumns mode, feature deactivates - single auto col visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);
        await new GridRows(api, `runtime groupHideOpenParents false - feature deactivates final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('groupDisplayType switched to singleColumn and back to multipleColumns at runtime - only the first level group column is displayed until a first-level group is expanded', async () => {
        // The switch to singleColumn enters the invalid combo and raises #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        expect(getDisplayedColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'athlete', 'gold']);

        api.setGridOption('groupDisplayType', 'singleColumn');
        expect(getDisplayedColIds(api)).toEqual(['ag-Grid-AutoColumn', 'athlete', 'gold']);

        api.setGridOption('groupDisplayType', 'multipleColumns');
        expect(api.getRowNode('row-group-country-Ireland')!.expanded).toBe(false);
        expect(getDisplayedColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'athlete', 'gold']);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        expect(getDisplayedColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'athlete',
            'gold',
        ]);
    });

    test('groupHideOpenParents set to false at runtime with multipleColumns - only the first level group column is displayed until a first-level group is expanded', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupHideOpenParents: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });
        expect(getDisplayedColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'athlete', 'gold']);

        api.setGridOption('groupHideOpenParents', false);
        expect(api.getRowNode('row-group-country-Ireland')!.expanded).toBe(false);
        expect(getDisplayedColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'athlete', 'gold']);

        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        expect(getDisplayedColIds(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'athlete',
            'gold',
        ]);
    });

    test('after moving a row group column to the top, expanding all rows shows both group columns', async () => {
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

        api.moveRowGroupColumn(0, 1);
        expect(api.getRowGroupColumns().map((col) => col.getColId())).toEqual(['year', 'country']);

        api.expandAll();
        expect(getVisibleAutoGroupColIds(api).sort()).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
        ]);

        api.collapseAll();
        expect(getDisplayedColIds(api)).toEqual(['ag-Grid-AutoColumn-year', 'athlete', 'gold']);
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
        await new GridColumns(api, `with groupHideOpenParents - feature works (forces multipleColumns mode) setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── athlete "Athlete" width:200
                └── gold "Gold" width:200
            `);
        await new GridRows(api, `with groupHideOpenParents - feature works (forces multipleColumns mode) setup`).check(
            `
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
                ├── filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null
                ├── filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
                └── filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            `
        );

        // Only level 0 visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await new GridRows(
            api,
            `with groupHideOpenParents - feature works (forces multipleColumns mode) after setRowNodeExpanded`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:"2020"
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021"
            ├── filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            └── filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
        `);

        // Now both levels should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
    });

    test('has no effect with singleColumn display type', async () => {
        // Deliberately sets the invalid combo and asserts #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        await new GridColumns(api, `has no effect with singleColumn display type setup`).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `has no effect with singleColumn display type setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );

        // Single auto group column should always be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn']);
        await new GridRows(api, `has no effect with singleColumn display type final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:"2020"
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:"2021"
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:"2020"
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn:"2021"
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test('DOM order of cells matches display order when group columns are revealed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'year', rowGroup: true },
                { field: 'athlete' },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            ensureDomOrder: true,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `DOM order of cells matches display order when group columns are revealed setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── country "Country" width:200 rowGroup
                ├── year "Year" width:200 rowGroup
                ├── athlete "Athlete" width:200
                └── gold "Gold" width:200
            `);
        await new GridRows(api, `DOM order of cells matches display order when group columns are revealed setup`).check(
            `
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
            `
        );

        // Initially only the country auto-group column is visible
        expect(getCellColIdsFromDom(api)).toEqual(['ag-Grid-AutoColumn-country', 'country', 'year', 'athlete', 'gold']);

        // Expand Ireland - year auto-group column becomes visible
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);
        await new GridRows(
            api,
            `DOM order of cells matches display order when group columns are revealed after setRowNodeExpanded`
        ).check(`
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

        // The newly revealed auto-group-year column should appear in the correct DOM position
        // (after auto-group-country, before the data columns)
        expect(getCellColIdsFromDom(api)).toEqual([
            'ag-Grid-AutoColumn-country',
            'ag-Grid-AutoColumn-year',
            'country',
            'year',
            'athlete',
            'gold',
        ]);
    });

    test('has no effect with groupRows display type', async () => {
        // Deliberately sets the invalid combo and asserts #319; suppress only that id.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
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
        await new GridColumns(api, `has no effect with groupRows display type setup`).checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(api, `has no effect with groupRows display type setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );

        // No auto group columns in groupRows mode
        expect(getVisibleAutoGroupColIds(api)).toEqual([]);
        await new GridRows(api, `has no effect with groupRows display type final state`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler collapsed id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" athlete:"John Smith" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" athlete:"Jane Doe" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" athlete:"Mario Rossi" gold:3
            └─┬ filler collapsed id:row-group-country-France
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021
            · · └── LEAF hidden id:4 country:"France" year:"2021" athlete:"Jean Dupont" gold:1
        `);
    });

    test.each([
        ['rowData=[]', { rowData: [] }],
        // ['rowData unspecified', {}],
    ])('groupHideColumnsUntilExpanded with %s — only level-0 auto col visible', async (_label, extraOpts) => {
        const api = gridsManager.createGrid(`hide-${_label}`, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            ...extraOpts,
        });

        await asyncSetTimeout(0);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
    });

    test('changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path)', async () => {
        // Start with rowGroup country. Then change row groups via api.applyColumnState (so the
        // rowGroup state explicitly transitions) — verifies the auto col list rebuilds to the new
        // slug. This exercises the isInSync slug-mismatch path in autoColService.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country' }, { field: 'sport' }, { field: 'gold' }],
            groupDisplayType: 'multipleColumns',
            rowData: [{ country: 'UK', sport: 'Swim', gold: 1 }],
        });
        await new GridColumns(
            api,
            `changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path setup`
        ).checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── sport "Sport" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"UK" sport:"Swim" gold:1
        `);

        api.applyColumnState({ state: [{ colId: 'country', rowGroup: true, hide: true }] });
        await new GridColumns(
            api,
            `changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── sport "Sport" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path after applyColumnState`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn-country:"UK"
            · └── LEAF hidden id:0 country:"UK" sport:"Swim" gold:1
        `);
        await asyncSetTimeout(0);
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Swap: clear country's rowGroup and set sport's rowGroup
        api.applyColumnState({
            state: [
                { colId: 'country', rowGroup: false, hide: false },
                { colId: 'sport', rowGroup: true, hide: true },
            ],
        });
        await new GridColumns(
            api,
            `changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path after applyColumnState #2`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-sport "Sport" width:200
            ├── country "Country" width:200
            └── gold "Gold" width:200
        `);
        await new GridRows(
            api,
            `changing row group in multi-auto-col mode rebuilds auto cols (slug mismatch path after applyColumnState #2`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-sport:null
            └─┬ LEAF_GROUP collapsed id:row-group-sport-Swim ag-Grid-AutoColumn-sport:"Swim"
            · └── LEAF hidden id:0 country:"UK" sport:"Swim" gold:1
        `);
        await asyncSetTimeout(0);

        // Auto col now keyed to sport — old country auto col gone
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-sport']);
    });

    test('expanding a group shows the next auto column and collapsing hides it, rows modelUpdated first then the columns that follow', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'gold' },
            ],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });

        const recorded: string[] = [];
        const orderedTypes = ['rowGroupOpened', 'modelUpdated', 'virtualColumnsChanged', 'displayedColumnsChanged'];
        api.addGlobalListener((type: string) => {
            if (orderedTypes.includes(type)) {
                recorded.push(type);
            }
        });

        // Let the events queued by the grid's creation arrive before recording the first action's.
        await asyncSetTimeout(0);
        recorded.length = 0;
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);

        // Expanding the first group shows the second group column
        api.getRowNode('row-group-country-Ireland')!.setExpanded(true);
        await vi.waitFor(() => expect(recorded).toContain('displayedColumnsChanged'), {
            timeout: 1000,
            interval: 5,
        });
        await asyncSetTimeout(0);
        expect(recorded).toEqual([
            'rowGroupOpened',
            'modelUpdated',
            'virtualColumnsChanged',
            'displayedColumnsChanged',
        ]);
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);

        // Collapsing hides it again
        recorded.length = 0;
        api.collapseAll();
        await vi.waitFor(() => expect(recorded).toContain('displayedColumnsChanged'), {
            timeout: 1000,
            interval: 5,
        });
        await asyncSetTimeout(0);
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        // collapseAll raises modelUpdated more than once: only the first one's place is the contract
        const firstModelUpdated = recorded.indexOf('modelUpdated');
        const firstVirtual = recorded.indexOf('virtualColumnsChanged');
        const firstDisplayed = recorded.indexOf('displayedColumnsChanged');
        expect({ recorded, rowsFirst: firstModelUpdated >= 0 && firstModelUpdated < firstVirtual }).toEqual({
            recorded,
            rowsFirst: true,
        });
        expect({ recorded, columnsFollow: firstVirtual >= 0 && firstModelUpdated < firstDisplayed }).toEqual({
            recorded,
            columnsFollow: true,
        });
    });

    test('only an expansion that shows or hides a level raises displayedColumnsChanged; a sort, a transaction adding groups and a regroup follow the expanded levels', async () => {
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
        const [COUNTRY, YEAR, SPORT] = ['country', 'year', 'sport'].map((level) => `ag-Grid-AutoColumn-${level}`);
        const recorded: string[] = [];
        const watched = ['rowGroupOpened', 'modelUpdated', 'virtualColumnsChanged', 'displayedColumnsChanged'];
        api.addGlobalListener((type: string) => {
            if (watched.includes(type)) {
                recorded.push(type);
            }
        });
        await asyncSetTimeout(0);

        /** Runs `action`, waits for the rows' modelUpdated and for the column events that follow it. */
        async function step(action: () => void) {
            recorded.length = 0;
            action();
            await vi.waitFor(() => expect(recorded).toContain('modelUpdated'), { timeout: 1000, interval: 5 });
            await asyncSetTimeout(0);
            return { shown: getVisibleAutoGroupColIds(api), events: [...recorded] };
        }
        const expand = (id: string) => () => api.setRowNodeExpanded(api.getRowNode(id)!, true, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual([COUNTRY]);

        const stepResults: { step: string; shown: string[]; displayedColumnsChanged: number }[] = [];
        const record = async (name: string, action: () => void) => {
            const { shown, events } = await step(action);
            const displayedColumnsChanged = events.filter((e) => e === 'displayedColumnsChanged').length;
            stepResults.push({ step: name, shown, displayedColumnsChanged });
        };

        // the first expansion is the positive control: the observer does see the column events when a level shows
        const control = await step(expand('row-group-country-Ireland'));
        // a second level-0 group opens: the level it needs is already shown
        const second = await step(expand('row-group-country-Italy'));
        await record('sort', () => api.applyColumnState({ state: [{ colId: 'athlete', sort: 'desc' }] }));
        await record('transaction adding groups', () =>
            api.applyTransaction({
                add: [
                    { id: '5', country: 'Spain', year: '2020', sport: 'Tennis', athlete: 'Rafa', gold: 1 },
                    { id: '6', country: 'Ireland', year: '2022', sport: 'Golf', athlete: 'Rory', gold: 1 },
                ],
            })
        );
        // dropping the middle level keeps the expanded first level, so the next level is the one shown
        await record('without the middle level', () => api.setRowGroupColumns(['country', 'sport']));
        // moving the sport level first changes every group id: all groups are collapsed again
        await record('sport level first', () => api.setRowGroupColumns(['sport', 'country']));

        expect({ control, second, shown: stepResults.map((r) => [r.step, r.shown]) }).toEqual({
            control: {
                shown: [COUNTRY, YEAR],
                events: ['rowGroupOpened', 'modelUpdated', 'virtualColumnsChanged', 'displayedColumnsChanged'],
            },
            second: { shown: [COUNTRY, YEAR], events: ['rowGroupOpened', 'modelUpdated'] },
            shown: [
                ['sort', [COUNTRY, YEAR]],
                ['transaction adding groups', [COUNTRY, YEAR]],
                ['without the middle level', [COUNTRY, SPORT]],
                ['sport level first', [SPORT]],
            ],
        });
        expect(stepResults.find((r) => r.step === 'transaction adding groups')!.displayedColumnsChanged).toBe(0);
    });

    test('with a single row group the auto column stays shown, expanded or collapsed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'gold' }],
            groupDisplayType: 'multipleColumns',
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: twoLevelRowData,
            getRowId: (params) => params.data.id,
        });
        const COUNTRY = ['ag-Grid-AutoColumn-country'];

        const collapsed = getVisibleAutoGroupColIds(api);
        api.expandAll();
        const expanded = getVisibleAutoGroupColIds(api);
        api.collapseAll();
        const collapsedAgain = getVisibleAutoGroupColIds(api);
        await asyncSetTimeout(0);

        expect({ collapsed, expanded, collapsedAgain, final: getVisibleAutoGroupColIds(api) }).toEqual({
            collapsed: COUNTRY,
            expanded: COUNTRY,
            collapsedAgain: COUNTRY,
            final: COUNTRY,
        });
    });
});

describe('ag-grid groupHideColumnsUntilExpanded with tree data', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, TreeDataModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('the single auto column of a tree stays shown, expanded or collapsed', async () => {
        // The option names multiple columns, so a tree grid warns about it (#319); only its column is asserted here.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
        const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        onTestFinished(() => warnSpy.mockRestore());
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'gold' }],
            treeData: true,
            getDataPath: (data) => data.path,
            groupHideColumnsUntilExpanded: true,
            groupDefaultExpanded: 0,
            rowData: [
                { id: 'i', path: ['Ireland'], gold: 1 },
                { id: 'ij', path: ['Ireland', 'John'], gold: 2 },
                { id: 'it', path: ['Italy'], gold: 3 },
            ],
            getRowId: (params) => params.data.id,
        });
        const AUTO = ['ag-Grid-AutoColumn'];

        const collapsed = getVisibleAutoGroupColIds(api);
        api.expandAll();
        const expanded = getVisibleAutoGroupColIds(api);
        api.collapseAll();
        const collapsedAgain = getVisibleAutoGroupColIds(api);
        await asyncSetTimeout(0);

        expect({ collapsed, expanded, collapsedAgain, final: getVisibleAutoGroupColIds(api) }).toEqual({
            collapsed: AUTO,
            expanded: AUTO,
            collapsedAgain: AUTO,
            final: AUTO,
        });
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('warning #319'),
            expect.stringContaining('groupHideColumnsUntilExpanded = true'),
            expect.any(String)
        );
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
        await new GridColumns(
            api,
            `pivot mode with active pivot result - auto group column visible (multipleColumns setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_gold "Gold" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              └── pivot_year_2021_gold "Gold" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `pivot mode with active pivot result - auto group column visible (multipleColumns setup`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:4 pivot_year_2021_gold:3
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:1 pivot_year_2021_gold:2
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-sport- ag-Grid-AutoColumn-sport:"(Blanks)" pivot_year_2020_gold:1 pivot_year_2021_gold:2
            │ · ├── LEAF hidden id:1 pivot_year_2020_gold:1 pivot_year_2021_gold:1
            │ · └── LEAF hidden id:2 pivot_year_2020_gold:2 pivot_year_2021_gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:3 pivot_year_2021_gold:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-sport- ag-Grid-AutoColumn-sport:"(Blanks)" pivot_year_2020_gold:3 pivot_year_2021_gold:null
            │ · └── LEAF hidden id:3 pivot_year_2020_gold:3 pivot_year_2021_gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:null pivot_year_2021_gold:1
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-sport- ag-Grid-AutoColumn-sport:"(Blanks)" pivot_year_2020_gold:null pivot_year_2021_gold:1
            · · └── LEAF hidden id:4 pivot_year_2020_gold:1 pivot_year_2021_gold:1
        `);

        // In pivot mode with results, single auto group column should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(
            api,
            `pivot mode with active pivot result - auto group column visible (multipleColumns final state`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:4 pivot_year_2021_gold:3
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:1 pivot_year_2021_gold:2
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-sport- ag-Grid-AutoColumn-sport:"(Blanks)" pivot_year_2020_gold:1 pivot_year_2021_gold:2
            │ · ├── LEAF hidden id:1 pivot_year_2020_gold:1 pivot_year_2021_gold:1
            │ · └── LEAF hidden id:2 pivot_year_2020_gold:2 pivot_year_2021_gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:3 pivot_year_2021_gold:null
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-sport- ag-Grid-AutoColumn-sport:"(Blanks)" pivot_year_2020_gold:3 pivot_year_2021_gold:null
            │ · └── LEAF hidden id:3 pivot_year_2020_gold:3 pivot_year_2021_gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:null pivot_year_2021_gold:1
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-sport- ag-Grid-AutoColumn-sport:"(Blanks)" pivot_year_2020_gold:null pivot_year_2021_gold:1
            · · └── LEAF hidden id:4 pivot_year_2020_gold:1 pivot_year_2021_gold:1
        `);
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
        await new GridColumns(
            api,
            `pivot mode with active pivot result - auto group column visible (groupHideOpenPa setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├─┬ "2020" GROUP
            │ └── pivot_year_2020_gold "Gold" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              └── pivot_year_2021_gold "Gold" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `pivot mode with active pivot result - auto group column visible (groupHideOpenPa setup`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:4 pivot_year_2021_gold:3
            ├── filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:1 pivot_year_2021_gold:2
            ├── filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:3 pivot_year_2021_gold:null
            └── filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:null pivot_year_2021_gold:1
        `);

        // In pivot mode with results, single auto group column should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
        await new GridRows(
            api,
            `pivot mode with active pivot result - auto group column visible (groupHideOpenPa final state`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:4 pivot_year_2021_gold:3
            ├── filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:1 pivot_year_2021_gold:2
            ├── filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:3 pivot_year_2021_gold:null
            └── filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-sport:null pivot_year_2020_gold:null pivot_year_2021_gold:1
        `);
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
        await new GridColumns(api, `pivot mode without pivot result - does not leak regular columns setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
        await new GridRows(api, `pivot mode without pivot result - does not leak regular columns setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null gold:7
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null gold:3
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" gold:1
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" gold:2
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null gold:3
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" gold:3
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null gold:1
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021" gold:1
            · · └── LEAF hidden id:4 country:"France" year:"2021" gold:1
        `);

        // In pivot mode without pivot columns, only auto group + value columns should be shown
        // Regular columns like 'country' and 'year' must NOT leak through
        const nonAutoCols = getVisibleNonAutoColIds(api);
        expect(nonAutoCols).toEqual(['gold']);
        await new GridRows(api, `pivot mode without pivot result - does not leak regular columns final state`).check(
            `
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null gold:7
                ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null gold:3
                │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" gold:1
                │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" gold:1
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" gold:2
                │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" gold:2
                ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null gold:3
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" gold:3
                │ · └── LEAF hidden id:3 country:"Italy" year:"2020" gold:3
                └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null gold:1
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021" gold:1
                · · └── LEAF hidden id:4 country:"France" year:"2021" gold:1
            `
        );
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
        await new GridColumns(api, `pivot mode without pivot result and feature off - auto group always visible setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country "Country" width:200
                ├── ag-Grid-AutoColumn-year "Year" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
        await new GridRows(api, `pivot mode without pivot result and feature off - auto group always visible setup`)
            .check(`
                ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null gold:7
                ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null gold:3
                │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" gold:1
                │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" gold:1
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" gold:2
                │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" gold:2
                ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null gold:3
                │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" gold:3
                │ · └── LEAF hidden id:3 country:"Italy" year:"2020" gold:3
                └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null gold:1
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021" gold:1
                · · └── LEAF hidden id:4 country:"France" year:"2021" gold:1
            `);

        // Auto group column always visible when feature is off
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
        // Only value columns alongside auto group
        const nonAutoCols = getVisibleNonAutoColIds(api);
        expect(nonAutoCols).toEqual(['gold']);
        await new GridRows(
            api,
            `pivot mode without pivot result and feature off - auto group always visible final state`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null gold:7
            ├─┬ filler collapsed id:row-group-country-Ireland ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-year:null gold:3
            │ ├─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn-year:"2020" gold:1
            │ │ └── LEAF hidden id:1 country:"Ireland" year:"2020" gold:1
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn-year:"2021" gold:2
            │ · └── LEAF hidden id:2 country:"Ireland" year:"2021" gold:2
            ├─┬ filler collapsed id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null gold:3
            │ └─┬ LEAF_GROUP collapsed hidden id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn-year:"2020" gold:3
            │ · └── LEAF hidden id:3 country:"Italy" year:"2020" gold:3
            └─┬ filler collapsed id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null gold:1
            · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:"2021" gold:1
            · · └── LEAF hidden id:4 country:"France" year:"2021" gold:1
        `);
    });
});

describe('ag-grid auto group columns cannot be hidden or shown by the user', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, GridStateModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = cachedJSONObjects.array([
        { id: '1', country: 'Ireland', year: '2020', athlete: 'John Smith', gold: 1 },
        { id: '2', country: 'Italy', year: '2021', athlete: 'Mario Rossi', gold: 3 },
    ]);

    const MULTI_IDS = ['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year'];
    const SINGLE_IDS = ['ag-Grid-AutoColumn'];

    const rowGroupColumnDefs = [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', rowGroup: true, hide: true },
        { field: 'athlete' },
        { field: 'gold' },
    ];

    function createGrid(options: GridOptions) {
        const autoColumnVisibleEvents: string[][] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: rowGroupColumnDefs,
            rowData,
            getRowId: (params) => params.data.id,
            ...options,
            onColumnVisible: (event) => {
                const colIds = (event.columns ?? []).map((col) => col.getColId());
                if (colIds.some((colId) => colId.startsWith('ag-Grid-AutoColumn'))) {
                    autoColumnVisibleEvents.push(colIds);
                }
            },
        });
        return { api, autoColumnVisibleEvents };
    }

    /** Every observer of the auto columns' visibility: displayed columns, column state, state and events. */
    async function readAutoColumns(api: GridApi, autoColumnVisibleEvents: string[][], colIds: string[]) {
        await asyncSetTimeout(0);
        const columnState = api.getColumnState();
        return {
            displayed: getVisibleAutoGroupColIds(api),
            hide: colIds.map((colId) => columnState.find((s) => s.colId === colId)?.hide),
            autoHiddenColIds: (api.getState().columnVisibility?.hiddenColIds ?? []).filter((colId) =>
                colId.startsWith('ag-Grid-AutoColumn')
            ),
            events: autoColumnVisibleEvents,
        };
    }

    const shown = (colIds: string[]) => ({
        displayed: colIds,
        hide: colIds.map(() => false),
        autoHiddenColIds: [],
        events: [],
    });

    test('autoGroupColumnDef hide: true leaves the auto columns displayed, multiple columns then a single one', async () => {
        const { api, autoColumnVisibleEvents } = createGrid({
            groupDisplayType: 'multipleColumns',
            autoGroupColumnDef: { hide: true },
        });
        expect(await readAutoColumns(api, autoColumnVisibleEvents, MULTI_IDS)).toEqual(shown(MULTI_IDS));

        api.setGridOption('groupDisplayType', 'singleColumn');
        expect(await readAutoColumns(api, autoColumnVisibleEvents, SINGLE_IDS)).toEqual(shown(SINGLE_IDS));
    });

    test('autoGroupColumnDef initialHide: true leaves the auto columns displayed, multiple columns then a single one', async () => {
        const { api, autoColumnVisibleEvents } = createGrid({
            groupDisplayType: 'multipleColumns',
            autoGroupColumnDef: { initialHide: true },
        });
        expect(await readAutoColumns(api, autoColumnVisibleEvents, MULTI_IDS)).toEqual(shown(MULTI_IDS));

        api.setGridOption('groupDisplayType', 'singleColumn');
        expect(await readAutoColumns(api, autoColumnVisibleEvents, SINGLE_IDS)).toEqual(shown(SINGLE_IDS));
    });

    test('autoGroupColumnDef hide: true leaves the single auto column of a new grid displayed', async () => {
        const { api, autoColumnVisibleEvents } = createGrid({
            groupDisplayType: 'singleColumn',
            autoGroupColumnDef: { hide: true },
        });

        expect(await readAutoColumns(api, autoColumnVisibleEvents, SINGLE_IDS)).toEqual(shown(SINGLE_IDS));
    });

    test('defaultColDef hide: true hides the user columns but not the auto columns', async () => {
        const { api, autoColumnVisibleEvents } = createGrid({
            groupDisplayType: 'multipleColumns',
            defaultColDef: { hide: true },
        });

        expect(await readAutoColumns(api, autoColumnVisibleEvents, MULTI_IDS)).toEqual(shown(MULTI_IDS));
        // the user columns are hidden by the default, so the auto columns are the only ones displayed
        expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(MULTI_IDS);
    });

    describe('with groupHideColumnsUntilExpanded: true', () => {
        const COUNTRY = ['ag-Grid-AutoColumn-country'];
        const YEAR = ['ag-Grid-AutoColumn-year'];

        function createCollapsedGrid() {
            return createGrid({
                groupDisplayType: 'multipleColumns',
                groupHideColumnsUntilExpanded: true,
                groupDefaultExpanded: 0,
            });
        }

        test('column state and grid state report the auto column hidden until expanded, before an expand and after collapseAll', async () => {
            const { api, autoColumnVisibleEvents } = createCollapsedGrid();
            const BOTH = [...COUNTRY, ...YEAR];
            const read = async () => {
                const { displayed, hide, autoHiddenColIds } = await readAutoColumns(api, autoColumnVisibleEvents, BOTH);
                return {
                    displayed,
                    hiddenByColumnState: BOTH.filter((_colId, i) => hide[i]),
                    hiddenByGridState: autoHiddenColIds,
                };
            };

            expect(await read()).toEqual({ displayed: COUNTRY, hiddenByColumnState: YEAR, hiddenByGridState: YEAR });

            api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

            api.collapseAll();
            expect(await read()).toEqual({ displayed: COUNTRY, hiddenByColumnState: YEAR, hiddenByGridState: YEAR });
        });
    });
});

describe('ag-grid auto group columns are shown by the grid alone, with the server-side row model', () => {
    const gridsManager = new TestGridsManager({ modules: [ServerSideRowModelModule, RowGroupingModule] });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const serverRows = [
        { country: 'Ireland', gold: 1 },
        { country: 'Italy', gold: 2 },
    ];

    test.each<[string, GridOptions]>([
        ['autoGroupColumnDef hide: true', { autoGroupColumnDef: { hide: true } }],
        ['autoGroupColumnDef initialHide: true', { autoGroupColumnDef: { initialHide: true } }],
        [
            'autoGroupColumnDef hide: true with groupDisplayType multipleColumns',
            { groupDisplayType: 'multipleColumns', autoGroupColumnDef: { hide: true } },
        ],
    ])('%s leaves the auto group column displayed once the rows have loaded', async (_title, options) => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'gold' }],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => {
                    setTimeout(() => params.success({ rowData: serverRows }), 0);
                },
            },
            ...options,
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(serverRows.length), {
            timeout: 2000,
            onTimeout: (error) => new Error(`server-side rows never loaded: ${error.message}`),
        });

        const autoColumn = api.getAllGridColumns().find((col) => col.getColId().startsWith('ag-Grid-AutoColumn'))!;
        expect(autoColumn).toBeDefined();
        expect({
            displayed: api.getAllDisplayedColumns().includes(autoColumn),
            isVisible: autoColumn.isVisible(),
            stateHide: api.getColumnState().find((s) => s.colId === autoColumn.getColId())?.hide,
        }).toEqual({ displayed: true, isVisible: true, stateHide: false });
    });
});
