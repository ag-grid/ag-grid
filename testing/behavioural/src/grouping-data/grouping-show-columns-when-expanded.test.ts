import type { GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, QuickFilterModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, cachedJSONObjects } from '../test-utils';

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

        // Expand Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, true, false, true);

        // Now both levels should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
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

        // Collapse Ireland
        api.setRowNodeExpanded(api.getRowNode('row-group-country-Ireland')!, false, false, true);

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
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

        api.expandAll();

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
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

        api.collapseAll();

        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
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

        // Enable feature
        api.updateGridOptions({ groupHideColumnsUntilExpanded: true });

        // Now only level 0 should be visible
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country']);
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

        // Disable feature
        api.updateGridOptions({ groupHideColumnsUntilExpanded: false });

        // Both should be visible again
        expect(getVisibleAutoGroupColIds(api)).toEqual(['ag-Grid-AutoColumn-country', 'ag-Grid-AutoColumn-year']);
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
