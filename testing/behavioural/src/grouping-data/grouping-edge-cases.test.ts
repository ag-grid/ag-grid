import { afterEach, beforeEach, describe, test } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['sport'],
        };

        await new GridRows(api, 'groupHideOpenParents=true', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 sport:"Sailing"
            ├── LEAF id:3 sport:"Football"
            ├── LEAF id:2 sport:"Soccer"
            ├── LEAF id:4 sport:"Soccer"
            └── LEAF id:5 sport:"Football"
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name'],
        };

        await new GridRows(api, 'groupHideParentOfSingleChild=true', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Engineering
            │ ├── LEAF id:1 name:"Alice"
            │ └── LEAF id:2 name:"Bob"
            ├── LEAF id:3 name:"Charlie"
            └── LEAF id:4 name:"Diana"
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name'],
        };

        await new GridRows(api, 'groupHideParentOfSingleChild="leafGroupsOnly"', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Engineering
            │ └── LEAF id:1 name:"Alice"
            └─┬ filler id:row-group-department-Marketing
            · └── LEAF id:2 name:"Charlie"
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name'],
        };

        await new GridRows(api, 'groupAllowUnbalanced with nulls', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:5 name:"Item 5"
            ├─┬ filler id:row-group-category-A
            │ ├── LEAF id:2 name:"Item 2"
            │ └─┬ LEAF_GROUP id:row-group-category-A-subcategory-A1
            │ · └── LEAF id:1 name:"Item 1"
            ├─┬ filler id:row-group-category-B
            │ └── LEAF id:3 name:"Item 3"
            └─┬ filler id:row-group-subcategory-C1
            · └── LEAF id:4 name:"Item 4"
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name'],
        };

        await new GridRows(api, 'groupSuppressBlankHeader=true', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-category-Valid
            │ └─┬ LEAF_GROUP id:row-group-category-Valid-subcategory-
            │ · ├── LEAF id:3 name:"Item 3"
            │ · └── LEAF id:4 name:"Item 4"
            └─┬ filler id:row-group-category-
            · ├─┬ LEAF_GROUP id:row-group-category--subcategory-Sub1
            · │ └── LEAF id:1 name:"Item 1"
            · └─┬ LEAF_GROUP id:row-group-category--subcategory-Sub2
            · · └── LEAF id:2 name:"Item 2"
        `);
    });
});
