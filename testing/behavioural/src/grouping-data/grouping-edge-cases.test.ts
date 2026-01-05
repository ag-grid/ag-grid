import { afterEach, beforeEach, describe, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping edge cases', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('groupHideOpenParents - hide expanded parent groups', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', country: 'Ireland', city: 'Dublin', sport: 'Sailing' },
            { id: '2', country: 'Ireland', city: 'Cork', sport: 'Soccer' },
            { id: '3', country: 'Ireland', city: 'Dublin', sport: 'Football' },
            { id: '4', country: 'Italy', city: 'Rome', sport: 'Soccer' },
            { id: '5', country: 'Italy', city: 'Milan', sport: 'Football' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'city', rowGroup: true, hide: true },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { headerName: 'Location' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupHideOpenParents: true,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'groupHideOpenParents=true').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-city:null
            ├── LEAF id:1 ag-Grid-AutoColumn-country:"Ireland" ag-Grid-AutoColumn-city:"Dublin" country:"Ireland" city:"Dublin" sport:"Sailing"
            ├── LEAF id:3 country:"Ireland" city:"Dublin" sport:"Football"
            ├── LEAF id:2 ag-Grid-AutoColumn-city:"Cork" country:"Ireland" city:"Cork" sport:"Soccer"
            ├── LEAF id:4 ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-city:"Rome" country:"Italy" city:"Rome" sport:"Soccer"
            └── LEAF id:5 ag-Grid-AutoColumn-city:"Milan" country:"Italy" city:"Milan" sport:"Football"
        `);
    });

    test('groupHideParentOfSingleChild - remove groups with single children', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', department: 'Engineering', team: 'Frontend', name: 'Alice' },
            { id: '2', department: 'Engineering', team: 'Backend', name: 'Bob' },
            { id: '3', department: 'Marketing', team: 'Digital', name: 'Charlie' },
            { id: '4', department: 'Sales', team: 'Enterprise', name: 'Diana' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'department', rowGroup: true, hide: true },
                { field: 'team', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Organization' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupHideParentOfSingleChild: true,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'groupHideParentOfSingleChild=true').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Engineering ag-Grid-AutoColumn:"Engineering"
            │ ├── LEAF id:1 department:"Engineering" team:"Frontend" name:"Alice"
            │ └── LEAF id:2 department:"Engineering" team:"Backend" name:"Bob"
            ├── LEAF id:3 department:"Marketing" team:"Digital" name:"Charlie"
            └── LEAF id:4 department:"Sales" team:"Enterprise" name:"Diana"
        `);
    });

    test('groupHideParentOfSingleChild="leafGroupsOnly" - remove only leaf groups with single children', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', department: 'Engineering', team: 'Frontend', name: 'Alice' },
            { id: '2', department: 'Marketing', team: 'Digital', name: 'Charlie' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'department', rowGroup: true, hide: true },
                { field: 'team', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Organization' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupHideParentOfSingleChild: 'leafGroupsOnly',
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'groupHideParentOfSingleChild="leafGroupsOnly"').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Engineering ag-Grid-AutoColumn:"Engineering"
            │ └── LEAF id:1 department:"Engineering" team:"Frontend" name:"Alice"
            └─┬ filler id:row-group-department-Marketing ag-Grid-AutoColumn:"Marketing"
            · └── LEAF id:2 department:"Marketing" team:"Digital" name:"Charlie"
        `);
    });

    test('groupAllowUnbalanced with null/undefined group values', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', category: 'A', subcategory: 'A1', name: 'Item 1' },
            { id: '2', category: 'A', subcategory: null, name: 'Item 2' },
            { id: '3', category: 'B', subcategory: undefined, name: 'Item 3' },
            { id: '4', category: null, subcategory: 'C1', name: 'Item 4' },
            { id: '5', category: '', subcategory: '', name: 'Item 5' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'subcategory', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupAllowUnbalanced: true,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'groupAllowUnbalanced with nulls').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:5 category:"" subcategory:"" name:"Item 5"
            ├─┬ filler id:row-group-category-A ag-Grid-AutoColumn:"A"
            │ ├── LEAF id:2 category:"A" subcategory:null name:"Item 2"
            │ └─┬ LEAF_GROUP id:row-group-category-A-subcategory-A1 ag-Grid-AutoColumn:"A1"
            │ · └── LEAF id:1 category:"A" subcategory:"A1" name:"Item 1"
            ├─┬ filler id:row-group-category-B ag-Grid-AutoColumn:"B"
            │ └── LEAF id:3 category:"B" name:"Item 3"
            └─┬ filler id:row-group-subcategory-C1 ag-Grid-AutoColumn:"C1"
            · └── LEAF id:4 category:null subcategory:"C1" name:"Item 4"
        `);
    });

    test('groupSuppressBlankHeader behavior', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', category: '', subcategory: 'Sub1', name: 'Item 1' },
            { id: '2', category: null, subcategory: 'Sub2', name: 'Item 2' },
            { id: '3', category: 'Valid', subcategory: '', name: 'Item 3' },
            { id: '4', category: 'Valid', subcategory: null, name: 'Item 4' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'subcategory', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Category/Sub' },
            animateRows: false,
            groupDefaultExpanded: -1,
            groupSuppressBlankHeader: true,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'groupSuppressBlankHeader=true').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-category-Valid ag-Grid-AutoColumn:"Valid"
            │ └─┬ LEAF_GROUP id:row-group-category-Valid-subcategory- ag-Grid-AutoColumn:"(Blanks)"
            │ · ├── LEAF id:3 category:"Valid" subcategory:"" name:"Item 3"
            │ · └── LEAF id:4 category:"Valid" subcategory:null name:"Item 4"
            └─┬ filler id:row-group-category- ag-Grid-AutoColumn:"(Blanks)"
            · ├─┬ LEAF_GROUP id:row-group-category--subcategory-Sub1 ag-Grid-AutoColumn:"Sub1"
            · │ └── LEAF id:1 category:"" subcategory:"Sub1" name:"Item 1"
            · └─┬ LEAF_GROUP id:row-group-category--subcategory-Sub2 ag-Grid-AutoColumn:"Sub2"
            · · └── LEAF id:2 category:null subcategory:"Sub2" name:"Item 2"
        `);
    });
});
