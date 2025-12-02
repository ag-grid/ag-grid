import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, applyTransactionChecked, cachedJSONObjects } from '../test-utils';

describe('ag-grid grouping selection', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['athlete', 'sport'],
            checkSelectedNodes: true,
        };

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
        await new GridRows(api, 'initial selection', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF selected id:3 athlete:"Bob Johnson" sport:"Football"
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF selected id:4 athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France
            │ ├── LEAF id:6 athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain
            │ └── LEAF id:8 athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany
            · └── LEAF selected id:9 athlete:"Hans Mueller" sport:"Football"
        `);

        // Add a new item and verify selection state is maintained
        applyTransactionChecked(api, {
            add: [{ id: '10', country: 'Ireland', athlete: "Pat O'Brien", sport: 'Rugby' }],
        });

        await new GridRows(api, 'after adding to Ireland', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland 
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 athlete:"Jane Doe" sport:"Soccer"
            │ ├── LEAF selected id:3 athlete:"Bob Johnson" sport:"Football"
            │ └── LEAF id:10 athlete:"Pat O'Brien" sport:"Rugby"
            ├─┬ LEAF_GROUP id:row-group-country-Italy 
            │ ├── LEAF selected id:4 athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France 
            │ ├── LEAF id:6 athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain 
            │ └── LEAF id:8 athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany 
            · └── LEAF selected id:9 athlete:"Hans Mueller" sport:"Football"
        `);

        // Select a new child in a selected group
        api.setNodesSelected({
            nodes: [api.getRowNode('10')!],
            newValue: true,
        });

        await new GridRows(api, 'select new child in selected group', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland 
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF id:2 athlete:"Jane Doe" sport:"Soccer"
            │ ├── LEAF selected id:3 athlete:"Bob Johnson" sport:"Football"
            │ └── LEAF selected id:10 athlete:"Pat O'Brien" sport:"Rugby"
            ├─┬ LEAF_GROUP id:row-group-country-Italy 
            │ ├── LEAF selected id:4 athlete:"Mario Rossi" sport:"Soccer"
            │ └── LEAF id:5 athlete:"Luigi Verdi" sport:"Football"
            ├─┬ LEAF_GROUP selected id:row-group-country-France 
            │ ├── LEAF id:6 athlete:"Jean Dupont" sport:"Tennis"
            │ └── LEAF id:7 athlete:"Marie Martin" sport:"Soccer"
            ├─┬ LEAF_GROUP id:row-group-country-Spain 
            │ └── LEAF id:8 athlete:"Carlos Garcia" sport:"Basketball"
            └─┬ LEAF_GROUP id:row-group-country-Germany 
            · └── LEAF selected id:9 athlete:"Hans Mueller" sport:"Football"
        `);
    });

    // TODO: Test temporarily skipped, there might be a bug in grouping deselection of deleted filler nodes
    test.skip('group selection checkbox behavior', async () => {
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['athlete', 'sport'],
            checkSelectedNodes: true,
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland 
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing"
            │ └── LEAF id:2 athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy 
            · └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Select Ireland group - should select all its children
        api.setNodesSelected({
            nodes: [api.getRowNode('row-group-country-Ireland')!],
            newValue: true,
        });

        await new GridRows(api, 'select Ireland group', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP selected id:row-group-country-Ireland 
            │ ├── LEAF selected id:1 athlete:"John Smith" sport:"Sailing"
            │ └── LEAF selected id:2 athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy 
            · └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Deselect one child - group should become unselected
        api.setNodesSelected({
            nodes: [api.getRowNode('1')!],
            newValue: false,
        });

        await new GridRows(api, 'deselect one child', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland 
            │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing"
            │ └── LEAF selected id:2 athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy 
            · └── LEAF id:3 athlete:"Mario Rossi" sport:"Soccer"
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['athlete', 'sport'],
            checkSelectedNodes: true,
        };

        // Select some nodes before filtering
        api.setNodesSelected({
            nodes: [api.getRowNode('1')!, api.getRowNode('2')!, api.getRowNode('4')!],
            newValue: true,
        });

        await new GridRows(api, 'initial selection', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland 
            │ ├── LEAF selected id:1 athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF selected id:2 athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP id:row-group-country-Italy 
            · ├── LEAF selected id:4 athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:5 athlete:"Luigi Verdi" sport:"Football"
        `);

        // Filter by sport = "Soccer"
        api.setFilterModel({ sport: { type: 'equals', filter: 'Soccer' } });

        await new GridRows(api, 'filter by Soccer', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland 
            │ └── LEAF selected id:2 athlete:"Jane Doe" sport:"Soccer"
            └─┬ LEAF_GROUP id:row-group-country-Italy 
            · └── LEAF selected id:4 athlete:"Mario Rossi" sport:"Soccer"
        `);

        // Clear filter - selection should be preserved
        api.setFilterModel(null);

        await new GridRows(api, 'filter cleared', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland 
            │ ├── LEAF selected id:1 athlete:"John Smith" sport:"Sailing"
            │ ├── LEAF selected id:2 athlete:"Jane Doe" sport:"Soccer"
            │ └── LEAF id:3 athlete:"Bob Johnson" sport:"Football"
            └─┬ LEAF_GROUP id:row-group-country-Italy 
            · ├── LEAF selected id:4 athlete:"Mario Rossi" sport:"Soccer"
            · └── LEAF id:5 athlete:"Luigi Verdi" sport:"Football"
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

        const gridRowsOptions: GridRowsOptions = {
            columns: ['athlete', 'sport'],
            checkSelectedNodes: true,
        };

        // Select nested groups and leaves
        api.setNodesSelected({
            nodes: [
                api.getRowNode('row-group-country-Ireland-year-2020')!,
                api.getRowNode('3')!,
                api.getRowNode('row-group-country-Italy')!,
            ],
            newValue: true,
        });

        await new GridRows(api, 'multi-level selection', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland 
            │ ├─┬ LEAF_GROUP selected id:row-group-country-Ireland-year-2020 
            │ │ ├── LEAF id:1 athlete:"John Smith" sport:"Sailing"
            │ │ └── LEAF id:2 athlete:"Jane Doe" sport:"Soccer"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 
            │ · └── LEAF selected id:3 athlete:"Bob Johnson" sport:"Football"
            └─┬ filler selected id:row-group-country-Italy 
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 
            · │ └── LEAF id:4 athlete:"Mario Rossi" sport:"Soccer"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 
            · · └── LEAF id:5 athlete:"Luigi Verdi" sport:"Football"
        `);
    });
});
