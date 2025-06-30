import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, executeTransactionsAsync } from '../test-utils';

describe('ag-grid grouping with transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('grouping with transactions', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.applyTransaction({
            add: [
                { id: '0', country: 'Ireland', year: 2000, name: 'John Von Neumann' },
                { id: '1', country: 'Ireland', year: 2000, name: 'Ada Lovelace' },
                { id: '2', country: 'Ireland', year: 2001, name: 'Alan Turing' },
                { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
                { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
            ],
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['country', 'year', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        let gridRows = new GridRows(api, 'first', gridRowsOptions);

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            └─┬ filler id:row-group-country-Italy
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);

        api.applyTransaction({ add: [{ id: '5', country: 'Ireland', year: 2001, name: 'Grace Hopper' }] });

        gridRows = new GridRows(api, 'add', gridRowsOptions);

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001
            │ · ├── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            │ · └── LEAF id:5 name:"Grace Hopper" country:"Ireland" year:2001
            └─┬ filler id:row-group-country-Italy
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);

        api.applyTransaction({
            remove: [{ id: '3' }],
            update: [
                { id: '2', country: 'Italy', year: 1940, name: 'Alan M. Turing' },
                { id: '5', country: 'Italy', year: 1940, name: 'Grace Brewster Murray Hopper' },
            ],
            add: [{ id: '6', country: 'Italy', year: 1940, name: 'unknown' }],
        });

        gridRows = new GridRows(api, 'remove, update, add', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ · ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ · └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            └─┬ filler id:row-group-country-Italy
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            · │ └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-1940
            · · ├── LEAF id:2 name:"Alan M. Turing" country:"Italy" year:1940
            · · ├── LEAF id:5 name:"Grace Brewster Murray Hopper" country:"Italy" year:1940
            · · └── LEAF id:6 name:"unknown" country:"Italy" year:1940
        `);

        await executeTransactionsAsync(
            [
                {
                    remove: [{ id: '6' }],
                    add: [{ id: '6', country: 'Italy', year: 1900, name: 'unknown 2' }],
                },
                {
                    update: [{ id: '6', country: 'Italy', year: 1901, name: 'unknown 3' }],
                },
            ],
            api
        );

        gridRows = new GridRows(api, 'async transaction 1', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ · ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ · └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            └─┬ filler id:row-group-country-Italy
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            · │ └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-1940
            · │ ├── LEAF id:2 name:"Alan M. Turing" country:"Italy" year:1940
            · │ └── LEAF id:5 name:"Grace Brewster Murray Hopper" country:"Italy" year:1940
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-1901
            · · └── LEAF id:6 name:"unknown 3" country:"Italy" year:1901
        `);

        await executeTransactionsAsync(
            [
                {
                    remove: [{ id: '6' }],
                    add: [{ id: '6', country: 'Italy', year: 1900, name: 'unknown 4' }],
                },
                {
                    remove: [{ id: '6' }],
                    update: [{ id: '2', country: 'Italy', year: 1950, name: 'unknown 5' }],
                    add: [{ id: '6', country: 'Italy', year: 1901, name: 'unknown 5' }],
                },
                {
                    remove: [{ id: '6' }],
                    add: [{ id: '6', country: 'Germany', year: 1902, name: 'unknown 6' }],
                },
            ],
            api
        );

        gridRows = new GridRows(api, 'async transaction 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ · ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ · └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            │ │ └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-1940
            │ │ └── LEAF id:5 name:"Grace Brewster Murray Hopper" country:"Italy" year:1940
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-1950
            │ · └── LEAF id:2 name:"unknown 5" country:"Italy" year:1950
            └─┬ filler id:row-group-country-Germany
            · └─┬ LEAF_GROUP id:row-group-country-Germany-year-1902
            · · └── LEAF id:6 name:"unknown 6" country:"Germany" year:1902
        `);
    });

    test('can change an entire group with async transactions', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await executeTransactionsAsync(
            [
                {
                    add: [
                        { id: '0', country: 'Ireland', year: 2000, name: 'John Von Neumann' },
                        { id: '1', country: 'Ireland', year: 2000, name: 'Ada Lovelace' },
                    ],
                },
                {
                    add: [
                        { id: '2', country: 'Ireland', year: 2001, name: 'Alan Turing' },
                        { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
                        { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
                    ],
                },
            ],
            api
        );

        const gridRowsOptions: GridRowsOptions = {
            columns: ['country', 'year', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        let gridRows = new GridRows(api, 'first', gridRowsOptions);

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            └─┬ filler id:row-group-country-Italy
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);

        await executeTransactionsAsync(
            [
                {
                    update: [{ id: '0', country: 'Germany', year: 2000, name: 'John Von Neumann' }],
                },
                {
                    update: [
                        { id: '2', country: 'Germany', year: 2001, name: 'Alan Turing' },
                        { id: '1', country: 'Germany', year: 2000, name: 'Ada Lovelace' },
                    ],
                },
            ],
            api
        );

        gridRows = new GridRows(api, 'update 1', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            │ │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            │ · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
            └─┬ filler id:row-group-country-Germany
            · ├─┬ LEAF_GROUP id:row-group-country-Germany-year-2000
            · │ ├── LEAF id:0 name:"John Von Neumann" country:"Germany" year:2000
            · │ └── LEAF id:1 name:"Ada Lovelace" country:"Germany" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Germany-year-2001
            · · └── LEAF id:2 name:"Alan Turing" country:"Germany" year:2001
        `);
    });

    test('grouping data with complex batch transactions', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await executeTransactionsAsync(
            [
                {
                    add: [
                        { id: '0', country: 'Ireland', year: 2000, name: 'John Von Neumann' },
                        { id: '1', country: 'Ireland', year: 2000, name: 'Ada Lovelace' },
                        { id: '2', country: 'Ireland', year: 2001, name: 'Alan Turing' },
                    ],
                },
                {
                    add: [
                        { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
                        { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
                    ],
                },
            ],
            api
        );

        const gridRowsOptions: GridRowsOptions = {
            columns: ['country', 'year', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };
        let gridRows = new GridRows(api, 'first', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            └─┬ filler id:row-group-country-Italy
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);

        await executeTransactionsAsync(
            [
                { add: [{ id: '5', country: 'Germany', year: 2001, name: 'Grace Hopper' }] },
                { update: [{ id: '5', country: 'Germany', year: 2002, name: 'Grace Hopper 2' }] },
                { remove: [{ id: '5' }] },
                { add: [{ id: '5', country: 'Germany', year: 2001, name: 'Grace Hopper 3' }] },
                { update: [{ id: '5', country: 'Italy', year: 1980, name: 'Grace Hopper 4' }] },
                { remove: [{ id: '5' }] },
                { update: [{ id: '0', country: 'Switzerland', year: 2000, name: 'John Von Neumann' }] },
                { add: [{ id: '5', country: 'Italy', year: 2001, name: 'Grace Hopper 5' }] },
                { update: [{ id: '5', country: 'Italy', year: 2000, name: 'Grace Hopper 6' }] },
            ],
            api
        );

        gridRows = new GridRows(api, 'transaction 1', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            │ │ ├── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            │ │ └── LEAF id:5 name:"Grace Hopper 6" country:"Italy" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            │ · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
            └─┬ filler id:row-group-country-Switzerland
            · └─┬ LEAF_GROUP id:row-group-country-Switzerland-year-2000
            · · └── LEAF id:0 name:"John Von Neumann" country:"Switzerland" year:2000
        `);

        await executeTransactionsAsync(
            [
                {
                    update: [
                        { id: '0', country: 'Germany', year: 3000, name: 'John Von Neumann' },
                        { id: '1', country: 'Germany', year: 3000, name: 'Ada Lovelace' },
                    ],
                },
                { update: [{ id: '5', country: 'Switzerland', year: 1999, name: 'to remove' }] },
                { remove: [{ id: '5' }] },
                { update: [{ id: '2', country: 'Germany', year: 3000, name: 'Alan Turing' }] },
                {
                    add: [
                        { id: '6', country: 'Germany', year: 3000, name: 'Albert Einstein' },
                        { id: '5', country: 'Germany', year: 3000, name: 'added' },
                    ],
                },
            ],
            api
        );

        gridRows = new GridRows(api, 'transaction 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            │ │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001
            │ · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
            └─┬ filler id:row-group-country-Germany
            · └─┬ LEAF_GROUP id:row-group-country-Germany-year-3000
            · · ├── LEAF id:0 name:"John Von Neumann" country:"Germany" year:3000
            · · ├── LEAF id:1 name:"Ada Lovelace" country:"Germany" year:3000
            · · ├── LEAF id:2 name:"Alan Turing" country:"Germany" year:3000
            · · ├── LEAF id:6 name:"Albert Einstein" country:"Germany" year:3000
            · · └── LEAF id:5 name:"added" country:"Germany" year:3000
        `);

        await executeTransactionsAsync(
            [
                {
                    update: [
                        { id: '4', country: 'Germany', year: 2001, name: 'Marvin Minsky' },
                        { id: '1', country: 'Germany', year: 2000, name: 'Ada Lovelace' },
                        { id: '3', country: 'Germany', year: 2000, name: 'Donald Knuth' },
                    ],
                },
                {
                    remove: [{ id: '0' }],
                    update: [{ id: '2', country: 'Germany', year: 2001, name: 'Alan Turing' }],
                },
            ],
            api
        );

        gridRows = new GridRows(api, 'transaction 2', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Germany
            · ├─┬ LEAF_GROUP id:row-group-country-Germany-year-3000
            · │ ├── LEAF id:6 name:"Albert Einstein" country:"Germany" year:3000
            · │ └── LEAF id:5 name:"added" country:"Germany" year:3000
            · ├─┬ LEAF_GROUP id:row-group-country-Germany-year-2001
            · │ ├── LEAF id:4 name:"Marvin Minsky" country:"Germany" year:2001
            · │ └── LEAF id:2 name:"Alan Turing" country:"Germany" year:2001
            · └─┬ LEAF_GROUP id:row-group-country-Germany-year-2000
            · · ├── LEAF id:1 name:"Ada Lovelace" country:"Germany" year:2000
            · · └── LEAF id:3 name:"Donald Knuth" country:"Germany" year:2000
        `);
    });

    test('empty group removal and cleanup', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // Create initial data with multiple groups
        api.applyTransaction({
            add: [
                { id: '1', country: 'Ireland', year: 2000, name: 'John' },
                { id: '2', country: 'Ireland', year: 2001, name: 'Jane' },
                { id: '3', country: 'Italy', year: 2000, name: 'Mario' },
                { id: '4', country: 'France', year: 2000, name: 'Pierre' },
            ],
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['country', 'year', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        // Verify initial structure
        await new GridRows(api, 'initial with multiple groups', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ └── LEAF id:1 name:"John" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001
            │ · └── LEAF id:2 name:"Jane" country:"Ireland" year:2001
            ├─┬ filler id:row-group-country-Italy
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            │ · └── LEAF id:3 name:"Mario" country:"Italy" year:2000
            └─┬ filler id:row-group-country-France
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2000
            · · └── LEAF id:4 name:"Pierre" country:"France" year:2000
        `);

        // Remove all items from one year group - should remove the year group
        api.applyTransaction({
            remove: [{ id: '2' }],
        });

        await new GridRows(api, 'after removing year 2001 group', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ · └── LEAF id:1 name:"John" country:"Ireland" year:2000
            ├─┬ filler id:row-group-country-Italy
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            │ · └── LEAF id:3 name:"Mario" country:"Italy" year:2000
            └─┬ filler id:row-group-country-France
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2000
            · · └── LEAF id:4 name:"Pierre" country:"France" year:2000
        `);

        // Remove all items from a country - should remove the entire country group
        api.applyTransaction({
            remove: [{ id: '4' }],
        });

        await new GridRows(api, 'after removing entire France group', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ · └── LEAF id:1 name:"John" country:"Ireland" year:2000
            └─┬ filler id:row-group-country-Italy
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            · · └── LEAF id:3 name:"Mario" country:"Italy" year:2000
        `);

        // Remove all items from Ireland, leaving only one item in the whole grid
        api.applyTransaction({
            remove: [{ id: '1' }],
        });

        await new GridRows(api, 'after removing Ireland group', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ filler id:row-group-country-Italy
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2000
            · · └── LEAF id:3 name:"Mario" country:"Italy" year:2000
        `);
    });

    test('groupAllowUnbalanced with missing values', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            groupAllowUnbalanced: true,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // Add data with missing values in grouping columns
        api.applyTransaction({
            add: [
                { id: '1', country: 'Ireland', year: 2000, name: 'John' },
                { id: '2', country: 'Ireland', name: 'Jane' }, // missing year
                { id: '3', year: 2000, name: 'Mario' }, // missing country
                { id: '4', country: '', year: '', name: 'Empty' }, // empty strings
                { id: '5', country: null, year: null, name: 'Null' }, // null values
                { id: '6', name: 'Orphan' }, // missing both group fields
            ],
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['country', 'year', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        await new GridRows(api, 'unbalanced groups with missing values', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 name:"Empty" country:"" year:""
            ├── LEAF id:5 name:"Null" country:null year:null
            ├── LEAF id:6 name:"Orphan" country:undefined year:undefined
            ├─┬ filler id:row-group-country-Ireland
            │ ├── LEAF id:2 name:"Jane" country:"Ireland" year:undefined
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ · └── LEAF id:1 name:"John" country:"Ireland" year:2000
            └─┬ filler id:row-group-year-2000
            · └── LEAF id:3 name:"Mario" country:undefined year:2000
        `);

        // Test with groupAllowUnbalanced: false - should create empty groups
        api.setGridOption('groupAllowUnbalanced', false);
        api.refreshClientSideRowModel();

        await new GridRows(api, 'balanced groups with empty keys', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000
            │ │ └── LEAF id:1 name:"John" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-
            │ · └── LEAF id:2 name:"Jane" country:"Ireland" year:undefined
            └─┬ filler id:row-group-country-
            · ├─┬ LEAF_GROUP id:row-group-country--year-2000
            · │ └── LEAF id:3 name:"Mario" country:undefined year:2000
            · └─┬ LEAF_GROUP id:row-group-country--year-
            · · ├── LEAF id:4 name:"Empty" country:"" year:""
            · · ├── LEAF id:5 name:"Null" country:null year:null
            · · └── LEAF id:6 name:"Orphan" country:undefined year:undefined
        `);
    });

    test('custom key creators with complex logic', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    keyCreator: (params) => {
                        // Custom key creator that groups by continent
                        const countryToContinentMap: Record<string, string> = {
                            Ireland: 'Europe',
                            France: 'Europe',
                            USA: 'North America',
                            Canada: 'North America',
                            Brazil: 'South America',
                        };
                        return countryToContinentMap[params.value] || 'Other';
                    },
                },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                    keyCreator: (params) => {
                        // Custom key creator that groups by decade
                        const year = parseInt(params.value);
                        const decade = Math.floor(year / 10) * 10;
                        return `${decade}s`;
                    },
                },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        api.applyTransaction({
            add: [
                { id: '1', country: 'Ireland', year: 2001, name: 'John' },
                { id: '2', country: 'France', year: 2005, name: 'Pierre' },
                { id: '3', country: 'USA', year: 2001, name: 'Bob' },
                { id: '4', country: 'Canada', year: 1995, name: 'Alex' },
                { id: '5', country: 'Brazil', year: 1999, name: 'Carlos' },
                { id: '6', country: 'Unknown', year: 2010, name: 'Mystery' },
            ],
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['country', 'year', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        await new GridRows(api, 'custom key creators grouping', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Europe
            │ └─┬ LEAF_GROUP id:row-group-country-Europe-year-2000s
            │ · ├── LEAF id:1 name:"John" country:"Ireland" year:2001
            │ · └── LEAF id:2 name:"Pierre" country:"France" year:2005
            ├─┬ filler id:"row-group-country-North America"
            │ ├─┬ LEAF_GROUP id:"row-group-country-North America-year-2000s"
            │ │ └── LEAF id:3 name:"Bob" country:"USA" year:2001
            │ └─┬ LEAF_GROUP id:"row-group-country-North America-year-1990s"
            │ · └── LEAF id:4 name:"Alex" country:"Canada" year:1995
            ├─┬ filler id:"row-group-country-South America"
            │ └─┬ LEAF_GROUP id:"row-group-country-South America-year-1990s"
            │ · └── LEAF id:5 name:"Carlos" country:"Brazil" year:1999
            └─┬ filler id:row-group-country-Other
            · └─┬ LEAF_GROUP id:row-group-country-Other-year-2010s
            · · └── LEAF id:6 name:"Mystery" country:"Unknown" year:2010
        `);

        // Test updating data that changes the custom key
        api.applyTransaction({
            update: [{ id: '6', country: 'Ireland', year: 2010, name: 'Mystery Irish' }],
        });

        await new GridRows(api, 'after updating to change custom key', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Europe
            │ ├─┬ LEAF_GROUP id:row-group-country-Europe-year-2000s
            │ │ ├── LEAF id:1 name:"John" country:"Ireland" year:2001
            │ │ └── LEAF id:2 name:"Pierre" country:"France" year:2005
            │ └─┬ LEAF_GROUP id:row-group-country-Europe-year-2010s
            │ · └── LEAF id:6 name:"Mystery Irish" country:"Ireland" year:2010
            ├─┬ filler id:"row-group-country-North America"
            │ ├─┬ LEAF_GROUP id:"row-group-country-North America-year-2000s"
            │ │ └── LEAF id:3 name:"Bob" country:"USA" year:2001
            │ └─┬ LEAF_GROUP id:"row-group-country-North America-year-1990s"
            │ · └── LEAF id:4 name:"Alex" country:"Canada" year:1995
            └─┬ filler id:"row-group-country-South America"
            · └─┬ LEAF_GROUP id:"row-group-country-South America-year-1990s"
            · · └── LEAF id:5 name:"Carlos" country:"Brazil" year:1999
        `);
    });

    test('node movement between groups during updates', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'department', rowGroup: true, hide: true },
                { field: 'level', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // Create initial data
        api.applyTransaction({
            add: [
                { id: '1', department: 'Engineering', level: 'Junior', name: 'Alice' },
                { id: '2', department: 'Engineering', level: 'Senior', name: 'Bob' },
                { id: '3', department: 'Sales', level: 'Junior', name: 'Charlie' },
                { id: '4', department: 'Sales', level: 'Senior', name: 'Diana' },
            ],
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: ['department', 'level', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        await new GridRows(api, 'initial departments', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Engineering
            │ ├─┬ LEAF_GROUP id:row-group-department-Engineering-level-Junior
            │ │ └── LEAF id:1 name:"Alice" department:"Engineering" level:"Junior"
            │ └─┬ LEAF_GROUP id:row-group-department-Engineering-level-Senior
            │ · └── LEAF id:2 name:"Bob" department:"Engineering" level:"Senior"
            └─┬ filler id:row-group-department-Sales
            · ├─┬ LEAF_GROUP id:row-group-department-Sales-level-Junior
            · │ └── LEAF id:3 name:"Charlie" department:"Sales" level:"Junior"
            · └─┬ LEAF_GROUP id:row-group-department-Sales-level-Senior
            · · └── LEAF id:4 name:"Diana" department:"Sales" level:"Senior"
        `);

        // Move Alice from Engineering to Sales (department change)
        api.applyTransaction({
            update: [{ id: '1', department: 'Sales', level: 'Junior', name: 'Alice' }],
        });

        await new GridRows(api, 'after moving Alice to Sales', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Engineering
            │ └─┬ LEAF_GROUP id:row-group-department-Engineering-level-Senior
            │ · └── LEAF id:2 name:"Bob" department:"Engineering" level:"Senior"
            └─┬ filler id:row-group-department-Sales
            · ├─┬ LEAF_GROUP id:row-group-department-Sales-level-Junior
            · │ ├── LEAF id:3 name:"Charlie" department:"Sales" level:"Junior"
            · │ └── LEAF id:1 name:"Alice" department:"Sales" level:"Junior"
            · └─┬ LEAF_GROUP id:row-group-department-Sales-level-Senior
            · · └── LEAF id:4 name:"Diana" department:"Sales" level:"Senior"
        `);

        // Move Bob to a completely new department and level
        api.applyTransaction({
            update: [{ id: '2', department: 'Marketing', level: 'Manager', name: 'Bob' }],
        });

        await new GridRows(api, 'after moving Bob to new department', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Sales
            │ ├─┬ LEAF_GROUP id:row-group-department-Sales-level-Junior
            │ │ ├── LEAF id:3 name:"Charlie" department:"Sales" level:"Junior"
            │ │ └── LEAF id:1 name:"Alice" department:"Sales" level:"Junior"
            │ └─┬ LEAF_GROUP id:row-group-department-Sales-level-Senior
            │ · └── LEAF id:4 name:"Diana" department:"Sales" level:"Senior"
            └─┬ filler id:row-group-department-Marketing
            · └─┬ LEAF_GROUP id:row-group-department-Marketing-level-Manager
            · · └── LEAF id:2 name:"Bob" department:"Marketing" level:"Manager"
        `);

        // Batch update that moves multiple nodes to different paths
        api.applyTransaction({
            update: [
                { id: '3', department: 'Engineering', level: 'Senior', name: 'Charlie' },
                { id: '4', department: 'Engineering', level: 'Junior', name: 'Diana' },
            ],
        });

        await new GridRows(api, 'after batch move to Engineering', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-department-Sales
            │ └─┬ LEAF_GROUP id:row-group-department-Sales-level-Junior
            │ · └── LEAF id:1 name:"Alice" department:"Sales" level:"Junior"
            ├─┬ filler id:row-group-department-Marketing
            │ └─┬ LEAF_GROUP id:row-group-department-Marketing-level-Manager
            │ · └── LEAF id:2 name:"Bob" department:"Marketing" level:"Manager"
            └─┬ filler id:row-group-department-Engineering
            · ├─┬ LEAF_GROUP id:row-group-department-Engineering-level-Senior
            · │ └── LEAF id:3 name:"Charlie" department:"Engineering" level:"Senior"
            · └─┬ LEAF_GROUP id:row-group-department-Engineering-level-Junior
            · · └── LEAF id:4 name:"Diana" department:"Engineering" level:"Junior"
        `);
    });

    test('complex async transactions with concurrent group changes', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'status', rowGroup: true, hide: true },
                { field: 'priority', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // Initial data setup
        await executeTransactionsAsync(
            [
                {
                    add: [
                        { id: '1', status: 'Active', priority: 'High', name: 'Task1' },
                        { id: '2', status: 'Active', priority: 'Low', name: 'Task2' },
                        { id: '3', status: 'Pending', priority: 'High', name: 'Task3' },
                    ],
                },
            ],
            api
        );

        const gridRowsOptions: GridRowsOptions = {
            columns: ['status', 'priority', 'name'],
            printHiddenRows: true,
            checkDom: true,
        };

        // Complex async operations that test race conditions
        await executeTransactionsAsync(
            [
                // Transaction 1: Add and immediately move
                { add: [{ id: '4', status: 'Active', priority: 'Medium', name: 'Task4' }] },
                { update: [{ id: '4', status: 'Completed', priority: 'Medium', name: 'Task4' }] },

                // Transaction 2: Create new group and populate it
                { add: [{ id: '5', status: 'Blocked', priority: 'Critical', name: 'Task5' }] },
                { add: [{ id: '6', status: 'Blocked', priority: 'Critical', name: 'Task6' }] },

                // Transaction 3: Move existing nodes around
                { update: [{ id: '1', status: 'Completed', priority: 'High', name: 'Task1' }] },
                { update: [{ id: '2', status: 'Blocked', priority: 'Low', name: 'Task2' }] },

                // Transaction 4: Remove some nodes to test empty group cleanup
                { remove: [{ id: '3' }] }, // This should remove the Pending group
            ],
            api
        );

        await new GridRows(api, 'after complex async operations', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-status-Completed
            │ ├─┬ LEAF_GROUP id:row-group-status-Completed-priority-High
            │ │ └── LEAF id:1 name:"Task1" status:"Completed" priority:"High"
            │ └─┬ LEAF_GROUP id:row-group-status-Completed-priority-Medium
            │ · └── LEAF id:4 name:"Task4" status:"Completed" priority:"Medium"
            └─┬ filler id:row-group-status-Blocked
            · ├─┬ LEAF_GROUP id:row-group-status-Blocked-priority-Low
            · │ └── LEAF id:2 name:"Task2" status:"Blocked" priority:"Low"
            · └─┬ LEAF_GROUP id:row-group-status-Blocked-priority-Critical
            · · ├── LEAF id:5 name:"Task5" status:"Blocked" priority:"Critical"
            · · └── LEAF id:6 name:"Task6" status:"Blocked" priority:"Critical"
        `);
    });
});
