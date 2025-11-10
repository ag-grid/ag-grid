import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule, TooltipModule } from 'ag-grid-community';
import { CellSelectionModule, FormulaModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, waitForEvent } from '../test-utils';

describe('ag-grid master detail', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSelectionModule, FormulaModule, TextEditorModule, TooltipModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const basicRowData = [
        { id: '1', name: 'John', A: 10 },
        { id: '2', name: 'Mary', A: 25 },
        { id: '3', name: 'Bob', A: 30 },
        { id: '4', name: 'Alice', A: 45 },
        { id: '5', name: 'Jack', A: 50 },
    ];

    test('TC1 Simple formula result filtering', async () => {
        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData: basicRowData.map((data, i) => ({ ...data, B: '=A' + (i + 1) + '*2' })),
            columnDefs: [{ field: 'A' }, { field: 'B', filter: 'agNumberColumnFilter' }, { field: 'name' }],
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            printHiddenRows: true,
            checkDom: true,
            columns: true,
        };

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID 
            ├── LEAF id:1 row-number:"1" A:10 B:20 name:"John"
            ├── LEAF id:2 row-number:"2" A:25 B:50 name:"Mary"
            ├── LEAF id:3 row-number:"3" A:30 B:60 name:"Bob"
            ├── LEAF id:4 row-number:"4" A:45 B:90 name:"Alice"
            └── LEAF id:5 row-number:"5" A:50 B:100 name:"Jack"
        `);

        api.setFilterModel({ B: { type: 'lessThan', filter: 60 } });
        gridRows = new GridRows(api, 'filter b < 60', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:20 name:"John"
            └── LEAF id:2 row-number:"2" A:25 B:50 name:"Mary"
        `);

        api.setFilterModel({ B: { type: 'greaterThan', filter: 60 } });
        gridRows = new GridRows(api, 'filter b > 60', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 row-number:"4" A:45 B:90 name:"Alice"
            └── LEAF id:5 row-number:"5" A:50 B:100 name:"Jack"
        `);

        api.applyTransaction({ update: [{ id: '1', name: 'John Wick', A: 99, B: '=A1*2' }] });
        gridRows = new GridRows(api, 'filter b < 60 - update John', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:99 B:198 name:"John Wick"
            ├── LEAF id:4 row-number:"4" A:45 B:90 name:"Alice"
            └── LEAF id:5 row-number:"5" A:50 B:100 name:"Jack"
        `);
    });

    test('TC2 Reference to filtered row', async () => {
        const formulaRowData = [
            { id: '1', A: 5, B: '=A1*3' },
            { id: '2', A: 10, B: '=A1+A2' },
            { id: '3', A: 15, B: '=A2+A3' },
            { id: '4', A: 20, B: '=A3+A4' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData: formulaRowData,
            columnDefs: [{ field: 'A', filter: 'agNumberColumnFilter' }, { field: 'B' }],
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('formulaGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            printHiddenRows: true,
            checkDom: true,
            columns: true,
        };

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:5 B:15
            ├── LEAF id:2 row-number:"2" A:10 B:15
            ├── LEAF id:3 row-number:"3" A:15 B:25
            └── LEAF id:4 row-number:"4" A:20 B:35
        `);

        api.setFilterModel({ A: { type: 'greaterThan', filter: 10 } });

        gridRows = new GridRows(api, 'filtered A > 10', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:15 B:25
            └── LEAF id:4 row-number:"4" A:20 B:35
        `);

        api.applyTransaction({ update: [{ id: '2', A: 9 }] });

        gridRows = new GridRows(api, 'filtered A > 10 after hidden update', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:15 B:24
            └── LEAF id:4 row-number:"4" A:20 B:35
        `);
    });

    test('TC3 Circular reference with filtering', async () => {
        const circularRowData = [
            { id: '1', A: '=B2', B: 10 },
            { id: '2', A: '=B3', B: 20 },
            { id: '3', A: '=B1', B: 30 },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData: circularRowData,
            columnDefs: [{ field: 'A' }, { field: 'B', filter: 'agNumberColumnFilter' }],
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('circularGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            printHiddenRows: true,
            checkDom: true,
            columns: true,
        };

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:20 B:10
            ├── LEAF id:2 row-number:"2" A:30 B:20
            └── LEAF id:3 row-number:"3" A:10 B:30
        `);

        api.setFilterModel({ B: { type: 'greaterThan', filter: 15 } });

        gridRows = new GridRows(api, 'filtered B > 15', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 row-number:"2" A:30 B:20
            └── LEAF id:3 row-number:"3" A:10 B:30
        `);
    });

    test('TC4 Range reference across filtered rows', async () => {
        const rangeRowData = [
            { id: '1', A: 1, B: '=SUM(A1:A6)' },
            { id: '2', A: 2, B: '=SUM(A1:A6)' },
            { id: '3', A: 3, B: '=SUM(A1:A6)' },
            { id: '4', A: 4, B: '=SUM(A1:A6)' },
            { id: '5', A: 5, B: '=SUM(A1:A6)' },
            { id: '6', A: 6, B: '=SUM(A1:A6)' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData: rangeRowData,
            columnDefs: [{ field: 'A', filter: 'agNumberColumnFilter' }, { field: 'B' }],
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('rangeGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            printHiddenRows: true,
            checkDom: true,
            columns: true,
        };

        let gridRows = new GridRows(api, 'initial', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:21
            ├── LEAF id:2 row-number:"2" A:2 B:21
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:21
            ├── LEAF id:5 row-number:"5" A:5 B:21
            └── LEAF id:6 row-number:"6" A:6 B:21
        `);

        api.setFilterModel({
            A: {
                filterType: 'number',
                operator: 'AND',
                conditions: [
                    { filterType: 'number', type: 'greaterThan', filter: 2 },
                    { filterType: 'number', type: 'lessThan', filter: 6 },
                ],
            },
        });

        gridRows = new GridRows(api, 'filtered 2 < A < 6', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:21
            └── LEAF id:5 row-number:"5" A:5 B:21
        `);

        api.applyTransaction({
            update: [
                { id: '1', A: 1, B: '=SUM(A1:A6)' },
                { id: '2', A: 2, B: '=SUM(A2:A6)' },
                { id: '3', A: 3, B: '=SUM(A1:A3)+SUM(A4:A6)' },
                { id: '4', A: 4, B: '=SUM(A3:A5)+B2' },
                { id: '5', A: 5, B: '=B4 - A1' },
                { id: '6', A: 6, B: '=B5 - (A2 + A3)' },
            ],
        });

        gridRows = new GridRows(api, 'filtered 2 < A < 6 after range updates', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:32
            └── LEAF id:5 row-number:"5" A:5 B:31
        `);

        api.setFilterModel({});

        gridRows = new GridRows(api, 'filtered 2 < A < 6 after range updates', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:21
            ├── LEAF id:2 row-number:"2" A:2 B:20
            ├── LEAF id:3 row-number:"3" A:3 B:21
            ├── LEAF id:4 row-number:"4" A:4 B:32
            ├── LEAF id:5 row-number:"5" A:5 B:31
            └── LEAF id:6 row-number:"6" A:6 B:26
        `);
    });
});
