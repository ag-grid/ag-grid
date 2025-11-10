import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule, TextFilterModule, TooltipModule } from 'ag-grid-community';
import { CellSelectionModule, FormulaModule, SetFilterModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/** Row numbers refresh on a debounced path (~10ms), so allow a small buffer before asserting the DOM. */
const rowNumberRefreshBufferMs = 25;

describe('formulas sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CellSelectionModule,
            FormulaModule,
            SetFilterModule,
            TextEditorModule,
            TextFilterModule,
            TooltipModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const defaultGridRowsOptions: GridRowsOptions = {
        printHiddenRows: true,
        checkDom: true,
        columns: true,
    };

    test('TC1 Same row references remain correct when sorting without order change', async () => {
        const rowData = [
            { id: '1', A: 10, B: '=A1*2' },
            { id: '2', A: 20, B: '=A2*2' },
            { id: '3', A: 30, B: '=A3*2' },
            { id: '4', A: 40, B: '=A4*2' },
            { id: '5', A: 50, B: '=A5*2' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [
                { field: 'A', sortable: true },
                { field: 'B', sortable: true },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc1', gridOptions);

        let gridRows = new GridRows(api, 'initial', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:20
            ├── LEAF id:2 row-number:"2" A:20 B:40
            ├── LEAF id:3 row-number:"3" A:30 B:60
            ├── LEAF id:4 row-number:"4" A:40 B:80
            └── LEAF id:5 row-number:"5" A:50 B:100
        `);

        api.applyColumnState({
            state: [{ colId: 'B', sort: 'asc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted B asc', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:20
            ├── LEAF id:2 row-number:"2" A:20 B:40
            ├── LEAF id:3 row-number:"3" A:30 B:60
            ├── LEAF id:4 row-number:"4" A:40 B:80
            └── LEAF id:5 row-number:"5" A:50 B:100
        `);
    });

    test('TC2 Mixed cross-row references adjust after sorting', async () => {
        const rowData = [
            { id: '1', A: 5, B: '=A1+A3' },
            { id: '2', A: 10, B: '=A2+A1' },
            { id: '3', A: 15, B: '=A3+A2' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [
                { field: 'A', sortable: true },
                { field: 'B', sortable: true },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc2', gridOptions);

        let gridRows = new GridRows(api, 'initial', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:5 B:20
            ├── LEAF id:2 row-number:"2" A:10 B:15
            └── LEAF id:3 row-number:"3" A:15 B:25
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted A desc', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"1" A:15 B:25
            ├── LEAF id:2 row-number:"2" A:10 B:15
            └── LEAF id:1 row-number:"3" A:5 B:20
        `);
    });

    test('TC3 Absolute references remain anchored after sorting', async () => {
        const rowData = [
            { id: '1', A: 100, B: 1, C: '=A1+B$2' },
            { id: '2', A: 200, B: 2, C: '=A2+B$2' },
            { id: '3', A: 300, B: 3, C: '=A3+B$2' },
            { id: '4', A: 400, B: 4, C: '=A4+B$2' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [{ field: 'A', sortable: true }, { field: 'B' }, { field: 'C', sortable: true }],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc3', gridOptions);

        let gridRows = new GridRows(api, 'initial', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:100 B:1 C:102
            ├── LEAF id:2 row-number:"2" A:200 B:2 C:202
            ├── LEAF id:3 row-number:"3" A:300 B:3 C:302
            └── LEAF id:4 row-number:"4" A:400 B:4 C:402
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted A desc', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 row-number:"1" A:400 B:4 C:402
            ├── LEAF id:3 row-number:"2" A:300 B:3 C:302
            ├── LEAF id:2 row-number:"3" A:200 B:2 C:202
            └── LEAF id:1 row-number:"4" A:100 B:1 C:102
        `);
    });

    test('TC4 Function based formulas recalculate after sorting', async () => {
        const rowData = [
            { id: '1', A: 1, B: '=SUM(A1:A3)' },
            { id: '2', A: 5, B: '=AVERAGE(A2:A4)' },
            { id: '3', A: 3, B: '=SUM(A2:A4)' },
            { id: '4', A: 2, B: '=AVERAGE(A1:A4)' },
            { id: '5', A: 4, B: '=SUM(A1:A5)' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [
                { field: 'A', sortable: true },
                { field: 'B', sortable: true },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc4', gridOptions);

        let gridRows = new GridRows(api, 'initial', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:9
            ├── LEAF id:2 row-number:"2" A:5 B:3.3333333333333335
            ├── LEAF id:3 row-number:"3" A:3 B:10
            ├── LEAF id:4 row-number:"4" A:2 B:2.75
            └── LEAF id:5 row-number:"5" A:4 B:15
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted A desc', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 row-number:"1" A:5 B:3.3333333333333335
            ├── LEAF id:5 row-number:"2" A:4 B:15
            ├── LEAF id:3 row-number:"3" A:3 B:10
            ├── LEAF id:4 row-number:"4" A:2 B:2.75
            └── LEAF id:1 row-number:"5" A:1 B:9
        `);
    });

    test('TC5 Sort recalculates formulas after filtering subset', async () => {
        const rowData = [
            { id: '1', A: 1, B: '=A1+A2' },
            { id: '2', A: 2, B: '=A2+A3' },
            { id: '3', A: 3, B: '=A3+A4' },
            { id: '4', A: 4, B: '=A4+A5' },
            { id: '5', A: 5, B: '=A5+A1' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [
                { field: 'A', filter: 'agNumberColumnFilter', sortable: true },
                { field: 'B', sortable: true },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc5', gridOptions);

        let gridRows = new GridRows(api, 'initial', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:3
            ├── LEAF id:2 row-number:"2" A:2 B:5
            ├── LEAF id:3 row-number:"3" A:3 B:7
            ├── LEAF id:4 row-number:"4" A:4 B:9
            └── LEAF id:5 row-number:"5" A:5 B:6
        `);

        api.setFilterModel({
            A: {
                filterType: 'number',
                type: 'greaterThan',
                filter: 2,
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'filtered A > 2', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"3" A:3 B:7
            ├── LEAF id:4 row-number:"4" A:4 B:9
            └── LEAF id:5 row-number:"5" A:5 B:6
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'filtered and sorted', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:5 row-number:"1" A:5 B:6
            ├── LEAF id:4 row-number:"2" A:4 B:9
            └── LEAF id:3 row-number:"3" A:3 B:7
        `);
    });

    test('Formulas referencing filtered-out rows remain valid after resort', async () => {
        const rowData = [
            { id: '1', category: 'Keep', A: 10, B: '=A1+A5' },
            { id: '2', category: 'Drop', A: 40, B: '=A2+A5' },
            { id: '3', category: 'Keep', A: 30, B: '=A3+A2' },
            { id: '4', category: 'Drop', A: 15, B: '=A4+A1' },
            { id: '5', category: 'Keep', A: 20, B: '=A5+A3' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [
                { field: 'A', sortable: true },
                { field: 'B', sortable: true },
                { field: 'category', filter: 'agSetColumnFilter' },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc6', gridOptions);

        let gridRows = new GridRows(api, 'initial', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:30 category:"Keep"
            ├── LEAF id:2 row-number:"2" A:40 B:60 category:"Drop"
            ├── LEAF id:3 row-number:"3" A:30 B:70 category:"Keep"
            ├── LEAF id:4 row-number:"4" A:15 B:25 category:"Drop"
            └── LEAF id:5 row-number:"5" A:20 B:50 category:"Keep"
        `);

        api.setFilterModel({
            category: {
                filterType: 'set',
                values: ['Keep'],
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'filtered category Keep', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:10 B:30 category:"Keep"
            ├── LEAF id:3 row-number:"3" A:30 B:70 category:"Keep"
            └── LEAF id:5 row-number:"5" A:20 B:50 category:"Keep"
        `);

        api.applyColumnState({
            state: [{ colId: 'B', sort: 'desc', sortIndex: 0 }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);
        gridRows = new GridRows(api, 'filtered keep sorted B desc', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 row-number:"1" A:30 B:70 category:"Keep"
            ├── LEAF id:5 row-number:"3" A:20 B:50 category:"Keep"
            └── LEAF id:1 row-number:"4" A:10 B:30 category:"Keep"
        `);
    });
});
