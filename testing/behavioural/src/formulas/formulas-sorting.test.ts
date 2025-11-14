import type { GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule, TextFilterModule, TooltipModule } from 'ag-grid-community';
import { CellSelectionModule, FormulaModule, SetFilterModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

/** Row numbers refresh on a debounced path (~10ms), so allow a small buffer before asserting the DOM. */
const rowNumberRefreshBufferMs = 25;

describe('ag-grid formulas sorting', () => {
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

    test('Sorting and filtering still work when formulas are disabled', async () => {
        const rowData = [
            { id: '1', A: 1, B: 'alpha' },
            { id: '2', A: 3, B: 'bravo' },
            { id: '3', A: 2, B: 'charlie' },
            { id: '4', A: 5, B: 'delta' },
            { id: '5', A: 4, B: 'echo' },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: false,
            rowNumbers: true,
            rowData,
            columnDefs: [
                { field: 'A', sortable: true, filter: 'agNumberColumnFilter' },
                { field: 'B', sortable: true },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-no-formulas', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        let gridRows = new GridRows(api, 'initial no formulas', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:1 B:"alpha"
            ├── LEAF id:2 row-number:"2" A:3 B:"bravo"
            ├── LEAF id:3 row-number:"3" A:2 B:"charlie"
            ├── LEAF id:4 row-number:"4" A:5 B:"delta"
            └── LEAF id:5 row-number:"5" A:4 B:"echo"
        `);

        api.setFilterModel({
            A: {
                filterType: 'number',
                type: 'greaterThan',
                filter: 2,
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'filter A > 2 no formulas', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 row-number:"1" A:3 B:"bravo"
            ├── LEAF id:4 row-number:"2" A:5 B:"delta"
            └── LEAF id:5 row-number:"3" A:4 B:"echo"
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'filter A > 2 sort desc no formulas', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 row-number:"1" A:5 B:"delta"
            ├── LEAF id:5 row-number:"2" A:4 B:"echo"
            └── LEAF id:2 row-number:"3" A:3 B:"bravo"
        `);
    });

    test('TC1 Same row references remain correct when sorting without order change', async () => {
        const rowData = [
            { id: '1', A: 10, B: '=REF(COLUMN("A"),ROW("1"))*2' },
            { id: '2', A: 20, B: '=REF(COLUMN("A"),ROW("2"))*2' },
            { id: '3', A: 30, B: '=REF(COLUMN("A"),ROW("3"))*2' },
            { id: '4', A: 40, B: '=REF(COLUMN("A"),ROW("4"))*2' },
            { id: '5', A: 50, B: '=REF(COLUMN("A"),ROW("5"))*2' },
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
            { id: '1', A: 5, B: '=REF(COLUMN("A"),ROW("1"))+REF(COLUMN("A"),ROW("3"))' },
            { id: '2', A: 10, B: '=REF(COLUMN("A"),ROW("2"))+REF(COLUMN("A"),ROW("1"))' },
            { id: '3', A: 15, B: '=REF(COLUMN("A"),ROW("3"))+REF(COLUMN("A"),ROW("2"))' },
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
            { id: '1', A: 100, B: 1, C: '=REF(COLUMN("A"),ROW("1"))+REF(COLUMN("B"),ROW("2",true))' },
            { id: '2', A: 200, B: 2, C: '=REF(COLUMN("A"),ROW("2"))+REF(COLUMN("B"),ROW("2",true))' },
            { id: '3', A: 300, B: 3, C: '=REF(COLUMN("A"),ROW("3"))+REF(COLUMN("B"),ROW("2",true))' },
            { id: '4', A: 400, B: 4, C: '=REF(COLUMN("A"),ROW("4"))+REF(COLUMN("B"),ROW("2",true))' },
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
            ├── LEAF id:4 row-number:"1" A:400 B:4 C:403
            ├── LEAF id:3 row-number:"2" A:300 B:3 C:303
            ├── LEAF id:2 row-number:"3" A:200 B:2 C:203
            └── LEAF id:1 row-number:"4" A:100 B:1 C:103
        `);
    });

    test('TC4 Function based formulas recalculate after sorting', async () => {
        const rowData = [
            { id: '1', A: 1, B: '=SUM(REF(COLUMN("A"),ROW("1"),COLUMN("A"),ROW("3")))' },
            { id: '2', A: 5, B: '=AVERAGE(REF(COLUMN("A"),ROW("2"),COLUMN("A"),ROW("4")))' },
            { id: '3', A: 3, B: '=SUM(REF(COLUMN("A"),ROW("2"),COLUMN("A"),ROW("4")))' },
            { id: '4', A: 2, B: '=AVERAGE(REF(COLUMN("A"),ROW("1"),COLUMN("A"),ROW("4")))' },
            { id: '5', A: 4, B: '=SUM(REF(COLUMN("A"),ROW("1"),COLUMN("A"),ROW("5")))' },
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
            ├── LEAF id:2 row-number:"1" A:5 B:3.5
            ├── LEAF id:5 row-number:"2" A:4 B:10
            ├── LEAF id:3 row-number:"3" A:3 B:14
            ├── LEAF id:4 row-number:"4" A:2 B:1.5
            └── LEAF id:1 row-number:"5" A:1 B:6
        `);
    });

    test('TC5 Sort recalculates formulas after filtering subset', async () => {
        const rowData = [
            { id: '1', A: 1, B: '=REF(COLUMN("A"),ROW("1"))+REF(COLUMN("A"),ROW("2"))' },
            { id: '2', A: 2, B: '=REF(COLUMN("A"),ROW("2"))+REF(COLUMN("A"),ROW("3"))' },
            { id: '3', A: 3, B: '=REF(COLUMN("A"),ROW("3"))+REF(COLUMN("A"),ROW("4"))' },
            { id: '4', A: 4, B: '=REF(COLUMN("A"),ROW("4"))+REF(COLUMN("A"),ROW("5"))' },
            { id: '5', A: 5, B: '=REF(COLUMN("A"),ROW("5"))+REF(COLUMN("A"),ROW("1"))' },
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

    test('Absolute and relative references remain stable through ascending and descending sorts', async () => {
        const rowData = [
            { id: '1', A: 100 },
            {
                id: '2',
                A: 10,
                B: '=REF(COLUMN("A"),ROW("1"))',
                C: '=REF(COLUMN("A"),ROW("1",true))',
                D: '=REF(COLUMN("A",true),ROW("1"))',
                E: '=REF(COLUMN("A",true),ROW("1",true))',
            },
            { id: '3', A: 50 },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowData,
            columnDefs: [
                { field: 'A', colId: 'A', sortable: true },
                { field: 'B' },
                { field: 'C' },
                { field: 'D' },
                { field: 'E' },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc6', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: true,
        };

        let gridRows = new GridRows(api, 'initial order', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:100
            ├── LEAF id:2 row-number:"2" A:10 B:100 C:100 D:100 E:100
            └── LEAF id:3 row-number:"3" A:50
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'asc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted A asc', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 row-number:"1" A:10 B:100 C:10 D:100 E:10
            ├── LEAF id:3 row-number:"2" A:50
            └── LEAF id:1 row-number:"3" A:100
        `);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'desc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted A desc', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 row-number:"1" A:100
            ├── LEAF id:3 row-number:"2" A:50
            └── LEAF id:2 row-number:"3" A:10 B:100 C:100 D:100 E:100
        `);
    });

    test('Model refresh preserves relative references after sorting and filtering', async () => {
        const rowData = [
            { id: 'base', A: 40 },
            {
                id: 'relative',
                A: 5,
                B: '=REF(COLUMN("A"),ROW("base"))',
                C: '=REF(COLUMN("A"),ROW("1",true))',
                D: '=REF(COLUMN("A",true),ROW("base"))',
                E: '=REF(COLUMN("A",true),ROW("1",true))',
            },
            { id: 'mid', A: 60 },
            { id: 'high', A: 80 },
            { id: 'top', A: 100 },
        ];

        const gridOptions: GridOptions = {
            enableFormulas: true,
            rowNumbers: true,
            rowData,
            columnDefs: [
                { field: 'A', sortable: true, filter: 'agNumberColumnFilter' },
                { field: 'B' },
                { field: 'C' },
                { field: 'D' },
                { field: 'E' },
            ],
            getRowId: (params) => params.data?.id,
        };

        const api = gridsManager.createGrid('sorting-tc7', gridOptions);

        await asyncSetTimeout(rowNumberRefreshBufferMs);

        const gridRowsOptions: GridRowsOptions = {
            ...defaultGridRowsOptions,
            ignoreUndefinedCells: true,
            columns: true,
        };

        const assertRelativeValues = (afterSort: boolean) => {
            const rowNode = api.getRowNode('relative');
            expect(rowNode).toBeDefined();
            const getValue = (colId: string) => api.getCellValue<number>({ rowNode: rowNode!, colKey: colId });
            expect(getValue('B')).toBe(40);
            expect(getValue('C')).toBe(afterSort ? 5 : 40);
            expect(getValue('D')).toBe(40);
            expect(getValue('E')).toBe(afterSort ? 5 : 40);
        };

        let gridRows = new GridRows(api, 'initial order', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:base row-number:"1" A:40
            ├── LEAF id:relative row-number:"2" A:5 B:40 C:40 D:40 E:40
            ├── LEAF id:mid row-number:"3" A:60
            ├── LEAF id:high row-number:"4" A:80
            └── LEAF id:top row-number:"5" A:100
        `);
        assertRelativeValues(false);

        api.applyColumnState({
            state: [{ colId: 'A', sort: 'asc' }],
            defaultState: { sort: null },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted A asc', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:relative row-number:"1" A:5 B:40 C:5 D:40 E:5
            ├── LEAF id:base row-number:"2" A:40
            ├── LEAF id:mid row-number:"3" A:60
            ├── LEAF id:high row-number:"4" A:80
            └── LEAF id:top row-number:"5" A:100
        `);
        assertRelativeValues(true);

        api.setFilterModel({
            A: {
                filterType: 'number',
                type: 'lessThan',
                filter: 90,
            },
        });
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'sorted asc filtered A < 90', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:relative row-number:"1" A:5 B:40 C:5 D:40 E:5
            ├── LEAF id:base row-number:"2" A:40
            ├── LEAF id:mid row-number:"3" A:60
            └── LEAF id:high row-number:"4" A:80
        `);
        assertRelativeValues(true);

        api.refreshClientSideRowModel('everything');
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after refreshModel everything', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:relative row-number:"1" A:5 B:40 C:5 D:40 E:5
            ├── LEAF id:base row-number:"2" A:40
            ├── LEAF id:mid row-number:"3" A:60
            └── LEAF id:high row-number:"4" A:80
        `);
        assertRelativeValues(true);

        api.refreshClientSideRowModel('sort');
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after refreshModel sort', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:relative row-number:"1" A:5 B:40 C:5 D:40 E:5
            ├── LEAF id:base row-number:"2" A:40
            ├── LEAF id:mid row-number:"3" A:60
            └── LEAF id:high row-number:"4" A:80
        `);
        assertRelativeValues(true);

        api.refreshClientSideRowModel('filter');
        await asyncSetTimeout(rowNumberRefreshBufferMs);

        gridRows = new GridRows(api, 'after refreshModel filter', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:relative row-number:"1" A:5 B:40 C:5 D:40 E:5
            ├── LEAF id:base row-number:"2" A:40
            ├── LEAF id:mid row-number:"3" A:60
            └── LEAF id:high row-number:"4" A:80
        `);
        assertRelativeValues(true);
    });

    test('Formulas referencing filtered-out rows remain valid after resort', async () => {
        const rowData = [
            { id: '1', category: 'Keep', A: 10, B: '=REF(COLUMN("A"),ROW("1"))+REF(COLUMN("A"),ROW("5"))' },
            { id: '2', category: 'Drop', A: 40, B: '=REF(COLUMN("A"),ROW("2"))+REF(COLUMN("A"),ROW("5"))' },
            { id: '3', category: 'Keep', A: 30, B: '=REF(COLUMN("A"),ROW("3"))+REF(COLUMN("A"),ROW("2"))' },
            { id: '4', category: 'Drop', A: 15, B: '=REF(COLUMN("A"),ROW("4"))+REF(COLUMN("A"),ROW("1"))' },
            { id: '5', category: 'Keep', A: 20, B: '=REF(COLUMN("A"),ROW("5"))+REF(COLUMN("A"),ROW("3"))' },
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
