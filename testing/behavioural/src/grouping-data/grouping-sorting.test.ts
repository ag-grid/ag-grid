import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid grouping sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grouping with custom sort', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Ireland', athlete: 'Bob Johnson', sport: 'Football', gold: 3 },
            { id: '4', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 4 },
            { id: '5', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football', gold: 5 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', filter: 'agTextColumnFilter' },
                { field: 'sport', sortable: true },
                { field: 'gold', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = {
            printIds: false,
            columns: ['athlete', 'sport', 'gold'],
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            │ ├── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ └── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            └─┬ LEAF_GROUP
            · ├── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            · └── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
        `);

        // Sort by sport ascending
        api.applyColumnState({
            state: [{ colId: 'sport', sort: 'asc' }],
        });

        await new GridRows(api, 'sort by sport asc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            │ ├── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            └─┬ LEAF_GROUP
            · ├── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
            · └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
        `);

        // Sort by gold descending
        api.applyColumnState({
            state: [{ colId: 'gold', sort: 'desc' }],
        });

        await new GridRows(api, 'sort by gold desc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP 
            │ ├── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            │ ├── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ └── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            └─┬ LEAF_GROUP
            · ├── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
            · └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
        `);

        // Multi-column sort: sport asc, then gold desc
        api.applyColumnState({
            state: [
                { colId: 'sport', sort: 'asc' },
                { colId: 'gold', sort: 'desc' },
            ],
        });

        await new GridRows(api, 'multi-column sort', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            │ ├── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            │ └── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            └─┬ LEAF_GROUP
            · ├── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
            · └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
        `);
    });

    test('grouping with sort and filter combined', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Ireland', athlete: 'Bob Johnson', sport: 'Football', gold: 3 },
            { id: '4', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer', gold: 4 },
            { id: '5', country: 'Italy', athlete: 'Luigi Verdi', sport: 'Football', gold: 5 },
            { id: '6', country: 'France', athlete: 'Jean Dupont', sport: 'Soccer', gold: 1 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete', sortable: true },
                { field: 'sport', filter: 'agTextColumnFilter', sortable: true },
                { field: 'gold', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = {
            printIds: false,
            columns: ['athlete', 'sport', 'gold'],
        };

        // Sort by gold descending first
        api.applyColumnState({
            state: [{ colId: 'gold', sort: 'desc' }],
        });

        await new GridRows(api, 'sort by gold desc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            │ ├── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ └── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
            │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            └─┬ LEAF_GROUP
            · └── LEAF athlete:"Jean Dupont" sport:"Soccer" gold:1
        `);

        // Filter by sport containing "Soccer"
        api.setFilterModel({
            sport: { filterType: 'text', type: 'contains', filter: 'Soccer' },
        });

        await new GridRows(api, 'filter Soccer + sort gold desc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ └── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP
            │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            └─┬ LEAF_GROUP
            · └── LEAF athlete:"Jean Dupont" sport:"Soccer" gold:1
        `);

        // Change sort to athlete ascending while filter is active
        api.applyColumnState({
            state: [{ colId: 'athlete', sort: 'asc' }],
        });

        await new GridRows(api, 'filter Soccer + sort athlete asc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ └── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            ├─┬ LEAF_GROUP
            │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            └─┬ LEAF_GROUP
            · └── LEAF athlete:"Jean Dupont" sport:"Soccer" gold:1
        `);

        // Clear filter, sort should remain
        api.setFilterModel(null);

        await new GridRows(api, 'clear filter, keep sort athlete asc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            │ ├── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ └── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            ├─┬ LEAF_GROUP
            │ ├── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
            │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            └─┬ LEAF_GROUP
            · └── LEAF athlete:"Jean Dupont" sport:"Soccer" gold:1
        `);
    });

    test('grouping with custom comparator', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', priority: 'High', task: 'Task A', score: 10 },
            { id: '2', country: 'Ireland', priority: 'Low', task: 'Task B', score: 5 },
            { id: '3', country: 'Ireland', priority: 'Medium', task: 'Task C', score: 8 },
            { id: '4', country: 'Italy', priority: 'High', task: 'Task D', score: 12 },
            { id: '5', country: 'Italy', priority: 'Low', task: 'Task E', score: 3 },
        ];

        const priorityOrder = { High: 1, Medium: 2, Low: 3 };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'task' },
                {
                    field: 'priority',
                    sortable: true,
                    comparator: (valueA, valueB) => {
                        return priorityOrder[valueA] - priorityOrder[valueB];
                    },
                },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = {
            printIds: false,
            columns: ['task', 'priority', 'score'],
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF task:"Task A" priority:"High" score:10
            │ ├── LEAF task:"Task B" priority:"Low" score:5
            │ └── LEAF task:"Task C" priority:"Medium" score:8
            └─┬ LEAF_GROUP
            · ├── LEAF task:"Task D" priority:"High" score:12
            · └── LEAF task:"Task E" priority:"Low" score:3
        `);

        // Sort by priority using custom comparator
        api.applyColumnState({
            state: [{ colId: 'priority', sort: 'asc' }],
        });

        await new GridRows(api, 'sort by priority with custom comparator', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF task:"Task A" priority:"High" score:10
            │ ├── LEAF task:"Task C" priority:"Medium" score:8
            │ └── LEAF task:"Task B" priority:"Low" score:5
            └─┬ LEAF_GROUP
            · ├── LEAF task:"Task D" priority:"High" score:12
            · └── LEAF task:"Task E" priority:"Low" score:3
        `);

        // Sort by priority descending
        api.applyColumnState({
            state: [{ colId: 'priority', sort: 'desc' }],
        });

        await new GridRows(api, 'sort by priority desc', gridRowsOptions).check(`
            ROOT
            ├─┬ LEAF_GROUP
            │ ├── LEAF task:"Task B" priority:"Low" score:5
            │ ├── LEAF task:"Task C" priority:"Medium" score:8
            │ └── LEAF task:"Task A" priority:"High" score:10
            └─┬ LEAF_GROUP
            · ├── LEAF task:"Task E" priority:"Low" score:3
            · └── LEAF task:"Task D" priority:"High" score:12
        `);
    });

    test('grouping with multi-level sorting', async () => {
        const rowData = [
            { id: '1', country: 'Ireland', year: 2020, athlete: 'John Smith', sport: 'Sailing', gold: 1 },
            { id: '2', country: 'Ireland', year: 2020, athlete: 'Jane Doe', sport: 'Soccer', gold: 2 },
            { id: '3', country: 'Ireland', year: 2021, athlete: 'Bob Johnson', sport: 'Football', gold: 3 },
            { id: '4', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer', gold: 4 },
            { id: '5', country: 'Italy', year: 2021, athlete: 'Luigi Verdi', sport: 'Football', gold: 5 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete', sortable: true },
                { field: 'sport', sortable: true },
                { field: 'gold', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions: GridRowsOptions = {
            printIds: false,
            columns: ['athlete', 'sport', 'gold'],
        };

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT
            ├─┬ filler
            │ ├─┬ LEAF_GROUP
            │ │ ├── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            │ │ └── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ └─┬ LEAF_GROUP
            │ · └── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            └─┬ filler
            · ├─┬ LEAF_GROUP
            · │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            · └─┬ LEAF_GROUP
            · · └── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
        `);

        // Sort by sport ascending within each group
        api.applyColumnState({
            state: [{ colId: 'sport', sort: 'asc' }],
        });

        await new GridRows(api, 'sort by sport asc', gridRowsOptions).check(`
            ROOT
            ├─┬ filler
            │ ├─┬ LEAF_GROUP
            │ │ ├── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            │ │ └── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ └─┬ LEAF_GROUP
            │ · └── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            └─┬ filler
            · ├─┬ LEAF_GROUP
            · │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            · └─┬ LEAF_GROUP
            · · └── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
        `);

        // Sort by gold descending within each group
        api.applyColumnState({
            state: [{ colId: 'gold', sort: 'desc' }],
        });

        await new GridRows(api, 'sort by gold desc', gridRowsOptions).check(`
            ROOT
            ├─┬ filler
            │ ├─┬ LEAF_GROUP
            │ │ ├── LEAF athlete:"Jane Doe" sport:"Soccer" gold:2
            │ │ └── LEAF athlete:"John Smith" sport:"Sailing" gold:1
            │ └─┬ LEAF_GROUP
            │ · └── LEAF athlete:"Bob Johnson" sport:"Football" gold:3
            └─┬ filler
            · ├─┬ LEAF_GROUP
            · │ └── LEAF athlete:"Mario Rossi" sport:"Soccer" gold:4
            · └─┬ LEAF_GROUP
            · · └── LEAF athlete:"Luigi Verdi" sport:"Football" gold:5
        `);
    });
});
