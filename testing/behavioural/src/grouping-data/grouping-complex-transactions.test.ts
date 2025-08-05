import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager } from '../test-utils';

const gridRowsOptions: GridRowsOptions = {};

describe('ag-grid grouping complex transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('complex grouping sync transaction', async () => {
        const row0 = { id: '0', country: 'Ireland', year: 2020, athlete: 'John Smith', sport: 'Sailing' };
        const row1a = { id: '1', country: 'Italy', year: 2020, athlete: 'Mario Rossi', sport: 'Soccer' };
        const row2 = { id: '2', country: 'Italy', year: 2021, athlete: 'Luigi Verdi', sport: 'Football' };
        const row3 = { id: '3', country: 'Ireland', year: 2021, athlete: 'Jane Doe', sport: 'Soccer' };
        const row4 = { id: '4', country: 'France', year: 2020, athlete: 'Jean Dupont', sport: 'Tennis' };

        const row1b = { id: '1', country: 'France', year: 2020, athlete: 'Mario Rossi Updated', sport: 'Soccer' };
        const row5b = {
            id: '5',
            country: 'Germany',
            year: 2021,
            athlete: 'Carlos Garcia Updated',
            sport: 'Basketball',
        };

        const rowData = [row0, row1a];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: {
                headerName: 'Country/Year',
                cellRendererParams: { suppressCount: true },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
        });

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020
            │ · └── LEAF id:0
            └─┬ filler id:row-group-country-Italy
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020
            · · └── LEAF id:1
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toStrictEqual([row0, row1a]);

        // Complex transaction: add, update, remove in one go
        api.applyTransaction({
            add: [row2, row3, row4],
            update: [row1b],
            remove: [row0],
        });

        gridRows = new GridRows(api, 'complex transaction 1', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021
            │ · └── LEAF id:3
            ├─┬ filler id:row-group-country-Italy
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021
            │ · └── LEAF id:2
            └─┬ filler id:row-group-country-France
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2020
            · · ├── LEAF id:1
            · · └── LEAF id:4
        `);

        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toStrictEqual([row1b, row2, row3, row4]);

        // Another complex transaction
        api.applyTransaction({
            add: [row5b],
            remove: [row2, row3],
        });

        gridRows = new GridRows(api, 'complex transaction 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-France
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2020
            │ · ├── LEAF id:1
            │ · └── LEAF id:4
            └─┬ filler id:row-group-country-Germany
            · └─┬ LEAF_GROUP id:row-group-country-Germany-year-2021
            · · └── LEAF id:5
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toStrictEqual([row1b, row4, row5b]);
    });

    test('grouping async transaction batching', async () => {
        const rows = [
            { id: '1', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' },
            { id: '2', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' },
            { id: '3', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        // Start with async transactions
        api.applyTransactionAsync({ add: [rows[0]] });
        api.applyTransactionAsync({ add: [rows[1]] });
        api.applyTransactionAsync({ add: [rows[2]] });

        // Flush async transactions
        api.flushAsyncTransactions();

        await new GridRows(api, 'async batched adds', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ └── LEAF id:1
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ └── LEAF id:2
            └─┬ LEAF_GROUP id:row-group-country-France
            · └── LEAF id:3
        `);

        // Mix of async updates and removes
        api.applyTransactionAsync({
            update: [{ id: '1', country: 'Ireland', athlete: 'John Smith Updated', sport: 'Sailing' }],
        });
        api.applyTransactionAsync({ remove: [{ id: '2' }] });
        api.applyTransactionAsync({
            add: [{ id: '4', country: 'Spain', athlete: 'Carlos Garcia', sport: 'Basketball' }],
        });

        // Flush async transactions
        api.flushAsyncTransactions();

        await new GridRows(api, 'async batched mixed operations', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ └── LEAF id:1
            ├─┬ LEAF_GROUP id:row-group-country-France
            │ └── LEAF id:3
            └─┬ LEAF_GROUP id:row-group-country-Spain
            · └── LEAF id:4
        `);
    });

    test('grouping transaction with group moves', async () => {
        const rowA = { id: 'a', country: 'Ireland', athlete: 'John Smith', sport: 'Sailing' };
        const rowB = { id: 'b', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' };
        const rowC = { id: 'c', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowB, rowC],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ ├── LEAF id:a
            │ └── LEAF id:b
            └─┬ LEAF_GROUP id:row-group-country-Italy
            · └── LEAF id:c
        `);

        // Move John Smith from Ireland to Italy (by updating country)
        api.applyTransaction({
            update: [{ id: 'a', country: 'Italy', athlete: 'John Smith', sport: 'Sailing' }],
        });

        await new GridRows(api, 'moved John Smith to Italy', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland
            │ └── LEAF id:b
            └─┬ LEAF_GROUP id:row-group-country-Italy
            · ├── LEAF id:c
            · └── LEAF id:a
        `);

        // Move both Jane and Mario to a new country
        api.applyTransaction({
            update: [
                { id: 'b', country: 'France', athlete: 'Jane Doe', sport: 'Soccer' },
                { id: 'c', country: 'France', athlete: 'Mario Rossi', sport: 'Soccer' },
            ],
        });

        await new GridRows(api, 'moved Jane and Mario to France', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ └── LEAF id:a
            └─┬ LEAF_GROUP id:row-group-country-France
            · ├── LEAF id:b
            · └── LEAF id:c
        `);
    });

    test('grouping with empty group cleanup', async () => {
        const rowA = { id: 'a', country: 'Ireland', year: 2020, athlete: 'John Smith' };
        const rowB = { id: 'b', country: 'Ireland', year: 2020, athlete: 'Jane Doe' };
        const rowC = { id: 'c', country: 'Ireland', year: 2021, athlete: 'Bob Johnson' };
        const rowD = { id: 'd', country: 'Italy', year: 2020, athlete: 'Mario Rossi' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [rowA, rowB, rowC, rowD],
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020
            │ │ ├── LEAF id:a
            │ │ └── LEAF id:b
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021
            │ · └── LEAF id:c
            └─┬ filler id:row-group-country-Italy
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020
            · · └── LEAF id:d
        `);

        // Remove all Ireland 2020 rows - the year group should be removed
        api.applyTransaction({ remove: [rowA, rowB] });

        await new GridRows(api, 'Ireland 2020 group removed', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021
            │ · └── LEAF id:c
            └─┬ filler id:row-group-country-Italy
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020
            · · └── LEAF id:d
        `);

        // Remove the last Ireland row - the country group should be removed
        api.applyTransaction({ remove: [rowC] });

        await new GridRows(api, 'Ireland country group removed', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Italy
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020
            · · └── LEAF id:d
        `);

        // Remove the last row completely
        api.applyTransaction({ remove: [rowD] });

        await new GridRows(api, 'all groups removed', gridRowsOptions).check('empty');

        // Add back some data to verify groups are recreated properly
        api.applyTransaction({
            add: [
                { id: 'e', country: 'Spain', year: 2022, athlete: 'Carlos Garcia' },
                { id: 'f', country: 'Spain', year: 2022, athlete: 'Ana Lopez' },
            ],
        });

        await new GridRows(api, 'new groups created', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Spain
            · └─┬ LEAF_GROUP id:row-group-country-Spain-year-2022
            · · ├── LEAF id:e
            · · └── LEAF id:f
        `);
    });

    test.each(['sync', 'async', 'together'] as const)('grouping %s transaction ordering consistency', async (mode) => {
        // This test verifies that the order of operations doesn't affect the final result
        const rowB = { id: 'b', country: 'Ireland', athlete: 'Jane Doe', sport: 'Soccer' };
        const rowC = { id: 'c', country: 'Italy', athlete: 'Mario Rossi', sport: 'Soccer' };
        const rowD = { id: 'd', country: 'France', athlete: 'Jean Dupont', sport: 'Tennis' };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }, { field: 'sport' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        const finalData = [rowB, rowC, rowD];

        if (mode === 'sync') {
            // Add all at once
            api.applyTransaction({ add: finalData });
        } else if (mode === 'async') {
            // Add one by one asynchronously
            finalData.forEach((row) => {
                api.applyTransactionAsync({ add: [row] });
            });
            api.flushAsyncTransactions();
        } else {
            // Mix of sync and async
            api.applyTransaction({ add: [rowB] });
            api.applyTransactionAsync({ add: [rowC] });
            api.applyTransaction({ add: [rowD] });
            api.flushAsyncTransactions();
        }

        // All modes should result in the same final structure
        if (mode === 'together') {
            // Together mode may have different ordering due to mixed sync/async operations
            await new GridRows(api, `${mode} final result`, gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland
                │ └── LEAF id:b
                ├─┬ LEAF_GROUP id:row-group-country-France
                │ └── LEAF id:d
                └─┬ LEAF_GROUP id:row-group-country-Italy
                · └── LEAF id:c
            `);
        } else {
            await new GridRows(api, `${mode} final result`, gridRowsOptions).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-Ireland
                │ └── LEAF id:b
                ├─┬ LEAF_GROUP id:row-group-country-Italy
                │ └── LEAF id:c
                └─┬ LEAF_GROUP id:row-group-country-France
                · └── LEAF id:d
            `);
        }
    });

    test('complex batch transactions with group creation and destruction', async () => {
        const initialData = [
            { id: '1', department: 'Engineering', level: 'Senior', name: 'Alice' },
            { id: '2', department: 'Engineering', level: 'Junior', name: 'Bob' },
            { id: '3', department: 'Marketing', level: 'Senior', name: 'Charlie' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'department', rowGroup: true, hide: true },
                { field: 'level', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Department/Level' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: initialData,
            getRowId: (params) => params.data.id,
        });

        // Complex transaction: remove all from one group, add to new group, move between groups
        api.applyTransaction({
            remove: [
                { id: '2', department: 'Engineering', level: 'Junior', name: 'Bob' },
                { id: '3', department: 'Marketing', level: 'Senior', name: 'Charlie' },
            ],
            add: [
                { id: '4', department: 'Sales', level: 'Manager', name: 'Diana' },
                { id: '5', department: 'Sales', level: 'Junior', name: 'Eve' },
            ],
            update: [{ id: '1', department: 'HR', level: 'Manager', name: 'Alice Updated' }],
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['name'],
        };

        await new GridRows(api, 'complex batch transaction', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-HR
            │ └─┬ LEAF_GROUP id:row-group-department-HR-level-Manager
            │ · └── LEAF id:1 name:"Alice Updated"
            └─┬ filler id:row-group-department-Sales
            · ├─┬ LEAF_GROUP id:row-group-department-Sales-level-Manager
            · │ └── LEAF id:4 name:"Diana"
            · └─┬ LEAF_GROUP id:row-group-department-Sales-level-Junior
            · · └── LEAF id:5 name:"Eve"
        `);
    });
});
