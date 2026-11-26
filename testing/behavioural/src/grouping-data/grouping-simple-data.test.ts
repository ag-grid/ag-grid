import { waitFor } from '@testing-library/dom';
import type { RowSnapshot } from 'ag-test-utils';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
    cachedJSONObjects,
    getRowsSnapshot,
    setRowDataChecked,
} from 'ag-test-utils';

import type { ColDef, GridOptions, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

describe('ag-grid grouping simple data', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, RowSelectionModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('rowData updated by row id together with a column default keeps the groups and their order, in either key order', async () => {
        const rowData = [
            { id: '4', g: 'z', a: 3 },
            { id: '5', g: 'x', a: 4 },
        ];
        const defaultColDef = { width: 150 };

        for (const options of [
            { rowData, defaultColDef },
            { defaultColDef, rowData },
        ]) {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }, { field: 'g', rowGroup: true }, { field: 'a' }],
                rowData: [
                    { id: '5', g: 'x', a: 1 },
                    { id: '4', g: 'z', a: 2 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(0);

            const groupsBefore: IRowNode[] = [];
            api.forEachNode((node) => node.group && groupsBefore.push(node));

            api.updateGridOptions(options);

            const groupsAfter: IRowNode[] = [];
            const rows: (string | undefined)[] = [];
            api.forEachNode((node) => {
                rows.push(node.group ? `G:${node.key}` : node.id);
                if (node.group) {
                    groupsAfter.push(node);
                }
            });
            expect({
                rows,
                sameGroups: groupsAfter.map((node, i) => node === groupsBefore[i]),
                data: { 5: api.getRowNode('5')?.data.a, 4: api.getRowNode('4')?.data.a },
                widths: api.getAllGridColumns().map((col) => col.getActualWidth()),
            }).toEqual({
                rows: ['G:x', '5', 'G:z', '4'],
                sameGroups: [true, true],
                data: { 5: 4, 4: 3 },
                widths: [150, 150, 150, 150],
            });

            gridsManager.reset();
        }
    });

    test('rowData updated by row id tells its selection changes once, alone or together with a column default, in either key order', async () => {
        const results: { keyOrder: string; sources: string[]; selected: (string | undefined)[] }[] = [];
        const newRows = () => [
            { id: '2', a: 'y', b: 'q', d: 30 },
            { id: '0', a: 'x', b: 'p', d: 100 },
            { id: '7', a: 'z', b: 'p', d: 70 },
        ];
        const defaultColDef = { width: 99 };

        for (const [keyOrder, update] of [
            ['rowData alone', { rowData: newRows() }],
            ['rowData first', { rowData: newRows(), defaultColDef }],
            ['defaultColDef first', { defaultColDef, rowData: newRows() }],
        ] as const) {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a', rowGroup: true },
                    { colId: 'b', field: 'b' },
                    { colId: 'd', field: 'd', aggFunc: 'sum' },
                ],
                rowData: [
                    { id: '0', a: 'x', b: 'p', d: 1 },
                    { id: '1', a: 'x', b: 'q', d: 2 },
                    { id: '2', a: 'y', b: 'q', d: 30 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
                rowSelection: { mode: 'multiRow', isRowSelectable: (node) => (node.data?.d ?? 0) < 50 },
            });
            await asyncSetTimeout(0);

            api.setNodesSelected({ nodes: [api.getRowNode('1')!, api.getRowNode('0')!], newValue: true });
            await asyncSetTimeout(0);

            const sources: string[] = [];
            api.addEventListener('selectionChanged', (event) => sources.push(event.source));

            api.updateGridOptions(update);
            await asyncSetTimeout(0);

            results.push({ keyOrder, sources, selected: api.getSelectedNodes().map((node) => node.id) });

            gridsManager.reset();
        }

        expect(results).toEqual([
            { keyOrder: 'rowData alone', sources: ['rowDataChanged'], selected: [] },
            { keyOrder: 'rowData first', sources: ['rowDataChanged'], selected: [] },
            { keyOrder: 'defaultColDef first', sources: ['rowDataChanged'], selected: [] },
        ]);
    });

    test('rowData updated by row id together with a new group key regroups every row, in either key order', async () => {
        const columnDefs: ColDef[] = [{ field: 'id' }, { field: 'g', rowGroup: true }, { field: 'a', aggFunc: 'sum' }];
        const newColumnDefs: ColDef[] = [
            { field: 'id' },
            { field: 'g', rowGroup: true, keyCreator: (params) => String(params.value).toUpperCase() },
            { field: 'a', aggFunc: 'sum' },
        ];

        for (const keyOrder of ['rowData first', 'columnDefs first']) {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [
                    { id: '5', g: 'x', a: 1 },
                    { id: '4', g: 'z', a: 2 },
                    { id: '3', g: 'x', a: 10 },
                ],
                getRowId: (params) => params.data.id,
                groupDefaultExpanded: -1,
            });
            await asyncSetTimeout(0);

            const row4 = api.getRowNode('4')?.data;
            const row3 = api.getRowNode('3')?.data;
            const newRows = [row4, { id: '5', g: 'x', a: 4 }, row3];

            api.updateGridOptions(
                keyOrder === 'rowData first'
                    ? { rowData: newRows, columnDefs: newColumnDefs }
                    : { columnDefs: newColumnDefs, rowData: newRows }
            );

            const rows: (string | undefined)[] = [];
            api.forEachNode((node) => {
                rows.push(node.group ? `G:${node.key}=${node.aggData?.a}` : node.id);
            });
            expect({ keyOrder, rows }).toEqual({
                keyOrder,
                rows: ['G:Z=2', '4', 'G:X=14', '5', '3'],
            });

            gridsManager.reset();
        }
    });

    test('a new valueFormatter on an object or date group column regroups the rows under the keys it formats', async () => {
        const groupKeys = (api: ReturnType<typeof gridsManager.createGrid>) => {
            const keys: (string | null)[] = [];
            api.forEachNode((node) => {
                if (node.group) {
                    keys.push(node.key);
                }
            });
            return keys;
        };
        const objectDefs = (prefix: string): ColDef[] => [
            { field: 'id' },
            { field: 'g', rowGroup: true, cellDataType: 'object', valueFormatter: (p) => prefix + p.value?.n },
        ];
        const objects = gridsManager.createGrid('objects', {
            columnDefs: objectDefs(''),
            rowData: [
                { id: 1, g: { n: 'x' } },
                { id: 2, g: { n: 'z' } },
                { id: 3, g: { n: 'x' } },
            ],
        });
        await asyncSetTimeout(0);
        objects.setGridOption('columnDefs', objectDefs('V'));
        await asyncSetTimeout(0);
        const objectKeys = groupKeys(objects);

        const dateDefs = (formatted: boolean): ColDef[] => [
            { field: 'id' },
            {
                field: 'g',
                rowGroup: true,
                cellDataType: 'date',
                ...(formatted ? { valueFormatter: (p) => 'Y' + p.value?.getFullYear() } : {}),
            },
        ];
        const dates = gridsManager.createGrid('dates', {
            columnDefs: dateDefs(false),
            rowData: [
                { id: 1, g: new Date(2020, 0, 1) },
                { id: 2, g: new Date(2021, 0, 1) },
            ],
        });
        await asyncSetTimeout(0);
        dates.setGridOption('columnDefs', dateDefs(true));
        await asyncSetTimeout(0);

        expect({ objectKeys, dateKeys: groupKeys(dates) }).toEqual({
            objectKeys: ['Vx', 'Vz'],
            dateKeys: ['Y2020', 'Y2021'],
        });
    });

    test('with groupAllowUnbalanced, rowData updated by row id together with a new group key keeps a group own rows before its child groups', async () => {
        const columnDefs: ColDef[] = [
            { field: 'id' },
            { field: 'g', rowGroup: true },
            { field: 'h', rowGroup: true },
            { field: 'a', aggFunc: 'sum' },
        ];
        const newColumnDefs: ColDef[] = [
            { field: 'id' },
            { field: 'g', rowGroup: true, keyCreator: (params) => String(params.value) },
            { field: 'h', rowGroup: true },
            { field: 'a', aggFunc: 'sum' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [
                { id: 1, g: 'x', h: 'p', a: 1 },
                { id: 2, g: 'x', h: null, a: 2 },
                { id: 3, g: 'x', h: 'q', a: 3 },
                { id: 4, g: 'z', h: null, a: 4 },
            ],
            getRowId: (params) => String(params.data.id),
            groupAllowUnbalanced: true,
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(0);

        const readOrder = () => {
            const order: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => {
                order.push(node.group ? `G${node.level}:${node.key}` : `${node.level}:${node.id}`);
            });
            return order;
        };
        expect(readOrder()).toEqual(['G0:x', '1:2', 'G1:p', '2:1', 'G1:q', '2:3', 'G0:z', '1:4']);

        api.updateGridOptions({
            rowData: [
                { id: 3, g: 'x', h: 'q', a: 30 },
                { id: 2, g: 'x', h: null, a: 20 },
                { id: 1, g: 'x', h: 'p', a: 10 },
                { id: 4, g: 'z', h: null, a: 40 },
            ],
            columnDefs: newColumnDefs,
        });

        expect(readOrder()).toEqual(['G0:x', '1:2', 'G1:q', '2:3', 'G1:p', '2:1', 'G0:z', '1:4']);
    });

    test('simple grouping rows snapshot', async () => {
        const rowData = [
            { country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
            { country: 'Ireland', year: '2000', sport: 'Soccer', athlete: 'Ada Lovelace' },
            { country: 'Ireland', year: '2001', sport: 'Football', athlete: 'Alan Turing' },
            { country: 'Italy', year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
            { country: 'Italy', year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            groupDefaultExpanded: -1,
            rowData,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ │ ├── LEAF id:0 country:"Ireland" year:"2000" athlete:"John Von Neumann"
            │ │ └── LEAF id:1 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001 ag-Grid-AutoColumn:"2001"
            │ · └── LEAF id:2 country:"Ireland" year:"2001" athlete:"Alan Turing"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:"2000"
            · │ └── LEAF id:3 country:"Italy" year:"2000" athlete:"Donald Knuth"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:"2001"
            · · └── LEAF id:4 country:"Italy" year:"2001" athlete:"Marvin Minsky"
        `);

        const rows = gridRows.rowNodes;
        expect(rows.length).toBe(11);

        const rowsSnapshot = getRowsSnapshot(rows);

        expect(rows[0].data).toBeUndefined();
        expect(rows[1].data).toBeUndefined();
        expect(rows[2].data).toBe(rowData[0]);
        expect(rows[3].data).toBe(rowData[1]);
        expect(rows[4].data).toBeUndefined();
        expect(rows[5].data).toBe(rowData[2]);
        expect(rows[6].data).toBeUndefined();
        expect(rows[7].data).toBeUndefined();
        expect(rows[8].data).toBe(rowData[3]);
        expect(rows[9].data).toBeUndefined();
        expect(rows[10].data).toBe(rowData[4]);

        const expectedRowsSnapshots: RowSnapshot[] = [
            {
                allChildrenCount: 3,
                allLeafChildren: [null, null, null],
                childrenAfterFilter: ['2000', '2001'],
                childrenAfterGroup: ['2000', '2001'],
                childrenAfterSort: ['2000', '2001'],
                detail: undefined,
                displayed: true,
                expanded: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'Ireland' },
                id: 'row-group-country-Ireland',
                key: 'Ireland',
                leafGroup: false,
                level: 0,
                master: false,
                parentKey: null,
                rowGroupIndex: 0,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 0,
                rowIndex: 0,
            },
            {
                allChildrenCount: 2,
                allLeafChildren: [null, null],
                childrenAfterFilter: [null, null],
                childrenAfterGroup: [null, null],
                childrenAfterSort: [null, null],
                detail: undefined,
                displayed: true,
                expanded: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2000' },
                id: 'row-group-country-Ireland-year-2000',
                key: '2000',
                leafGroup: true,
                level: 1,
                master: false,
                parentKey: 'Ireland',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 1,
            },
            {
                allChildrenCount: null,
                allLeafChildren: null,
                childrenAfterFilter: null,
                childrenAfterGroup: null,
                childrenAfterSort: null,
                detail: undefined,
                displayed: true,
                expanded: false,
                footer: undefined,
                group: false,
                groupData: null,
                id: '0',
                key: null,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2000',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 2,
            },
            {
                allChildrenCount: null,
                allLeafChildren: null,
                childrenAfterFilter: null,
                childrenAfterGroup: null,
                childrenAfterSort: null,
                detail: undefined,
                displayed: true,
                expanded: false,
                footer: undefined,
                group: false,
                groupData: null,
                id: '1',
                key: null,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2000',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 3,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: [null],
                childrenAfterFilter: [null],
                childrenAfterGroup: [null],
                childrenAfterSort: [null],
                detail: undefined,
                displayed: true,
                expanded: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2001' },
                id: 'row-group-country-Ireland-year-2001',
                key: '2001',
                leafGroup: true,
                level: 1,
                master: false,
                parentKey: 'Ireland',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 4,
            },
            {
                allChildrenCount: null,
                allLeafChildren: null,
                childrenAfterFilter: null,
                childrenAfterGroup: null,
                childrenAfterSort: null,
                detail: undefined,
                displayed: true,
                expanded: false,
                footer: undefined,
                group: false,
                groupData: null,
                id: '2',
                key: null,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2001',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 5,
            },
            {
                allChildrenCount: 2,
                allLeafChildren: [null, null],
                childrenAfterFilter: ['2000', '2001'],
                childrenAfterGroup: ['2000', '2001'],
                childrenAfterSort: ['2000', '2001'],
                detail: undefined,
                displayed: true,
                expanded: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': 'Italy' },
                id: 'row-group-country-Italy',
                key: 'Italy',
                leafGroup: false,
                level: 0,
                master: false,
                parentKey: null,
                rowGroupIndex: 0,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 0,
                rowIndex: 6,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: [null],
                childrenAfterFilter: [null],
                childrenAfterGroup: [null],
                childrenAfterSort: [null],
                detail: undefined,
                displayed: true,
                expanded: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2000' },
                id: 'row-group-country-Italy-year-2000',
                key: '2000',
                leafGroup: true,
                level: 1,
                master: false,
                parentKey: 'Italy',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 7,
            },
            {
                allChildrenCount: null,
                allLeafChildren: null,
                childrenAfterFilter: null,
                childrenAfterGroup: null,
                childrenAfterSort: null,
                detail: undefined,
                displayed: true,
                expanded: false,
                footer: undefined,
                group: false,
                groupData: null,
                id: '3',
                key: null,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2000',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 8,
            },
            {
                allChildrenCount: 1,
                allLeafChildren: [null],
                childrenAfterFilter: [null],
                childrenAfterGroup: [null],
                childrenAfterSort: [null],
                detail: undefined,
                displayed: true,
                expanded: true,
                footer: undefined,
                group: true,
                groupData: { 'ag-Grid-AutoColumn': '2001' },
                id: 'row-group-country-Italy-year-2001',
                key: '2001',
                leafGroup: true,
                level: 1,
                master: false,
                parentKey: 'Italy',
                rowGroupIndex: 1,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 1,
                rowIndex: 9,
            },
            {
                allChildrenCount: null,
                allLeafChildren: null,
                childrenAfterFilter: null,
                childrenAfterGroup: null,
                childrenAfterSort: null,
                detail: undefined,
                displayed: true,
                expanded: false,
                footer: undefined,
                group: false,
                groupData: null,
                id: '4',
                key: null,
                leafGroup: undefined,
                level: 2,
                master: false,
                parentKey: '2001',
                rowGroupIndex: undefined,
                rowPinned: undefined,
                selectable: true,
                siblingKey: undefined,
                uiLevel: 2,
                rowIndex: 10,
            },
        ];

        expect(rowsSnapshot).toMatchObject(expectedRowsSnapshots);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── athlete "Athlete" width:200
        `);
    });

    test('can change an entire group without row id', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'name' },
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
            ],
            groupDefaultExpanded: -1,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        setRowDataChecked(api, [
            { id: '0', country: 'Ireland', year: 2000, name: 'John Von Neumann' },
            { id: '1', country: 'Ireland', year: 2000, name: 'Ada Lovelace' },
            { id: '2', country: 'Ireland', year: 2001, name: 'Alan Turing' },
            { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
            { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
        ]);

        let gridRows = new GridRows(api, 'first');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Ireland" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Ireland" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001 ag-Grid-AutoColumn:2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Ireland" year:2001
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);

        setRowDataChecked(api, [
            { id: '0', country: 'Germany', year: 2000, name: 'John Von Neumann' },
            { id: '1', country: 'Germany', year: 2000, name: 'Ada Lovelace' },
            { id: '2', country: 'Germany', year: 2001, name: 'Alan Turing' },
            { id: '3', country: 'Italy', year: 2000, name: 'Donald Knuth' },
            { id: '4', country: 'Italy', year: 2001, name: 'Marvin Minsky' },
        ]);

        gridRows = new GridRows(api, 'update 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-year-2000 ag-Grid-AutoColumn:2000
            │ │ ├── LEAF id:0 name:"John Von Neumann" country:"Germany" year:2000
            │ │ └── LEAF id:1 name:"Ada Lovelace" country:"Germany" year:2000
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-year-2001 ag-Grid-AutoColumn:2001
            │ · └── LEAF id:2 name:"Alan Turing" country:"Germany" year:2001
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:2000
            · │ └── LEAF id:3 name:"Donald Knuth" country:"Italy" year:2000
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:2001
            · · └── LEAF id:4 name:"Marvin Minsky" country:"Italy" year:2001
        `);
    });

    test('initializing columns after rowData with grouping module registered', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '2', value: 2, x: 20 },
            { id: '3', value: 3, x: 30 },
        ]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1
            ├── LEAF id:2 value:2
            └── LEAF id:3 value:3
        `);

        api.setGridOption('columnDefs', [{ field: 'value' }, { field: 'x' }]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(2);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1 x:10
            ├── LEAF id:2 value:2 x:20
            └── LEAF id:3 value:3 x:30
        `);

        setRowDataChecked(api, [
            { id: '1', value: 1, x: 10 },
            { id: '4', value: 4, x: 40 },
        ]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(2);
        expect(modelUpdated).toBe(3);

        api.setGridOption('columnDefs', [{ field: 'x' }, { field: 'value' }]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(2);
        expect(modelUpdated).toBe(4);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:10 value:1
            └── LEAF id:4 x:40 value:4
        `);
    });

    test('initializing columns after rowData with simple grouping', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        setRowDataChecked(api, [
            { id: '0', country: 'Ireland', year: '2000', sport: 'Sailing', athlete: 'John Von Neumann' },
            { id: '1', country: 'Ireland', year: '2000', sport: 'Soccer', athlete: 'Ada Lovelace' },
            { id: '2', country: 'Ireland', year: '2001', sport: 'Football', athlete: 'Alan Turing' },
            { id: '3', country: 'Italy', year: '2000', sport: 'Soccer', athlete: 'Donald Knuth' },
            { id: '4', country: 'Italy', year: '2001', sport: 'Football', athlete: 'Marvin Minsky' },
        ]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty').check('empty');

        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', rowGroup: true, hide: true },
            { field: 'athlete' },
        ]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ │ ├── LEAF id:0 country:"Ireland" year:"2000" athlete:"John Von Neumann"
            │ │ └── LEAF id:1 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2001 ag-Grid-AutoColumn:"2001"
            │ · └── LEAF id:2 country:"Ireland" year:"2001" athlete:"Alan Turing"
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2000 ag-Grid-AutoColumn:"2000"
            · │ └── LEAF id:3 country:"Italy" year:"2000" athlete:"Donald Knuth"
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2001 ag-Grid-AutoColumn:"2001"
            · · └── LEAF id:4 country:"Italy" year:"2001" athlete:"Marvin Minsky"
        `);
    });

    test('updateGridOptions simultaneously updates rowData and grouping columns', async () => {
        const rowData0 = [
            { id: '0', country: 'France', year: '2000', athlete: 'Noether' },
            { id: '1', country: 'France', year: '2001', athlete: 'Germain' },
        ];

        const columns0: ColDef[] = [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country' },
            { colId: 'year', field: 'year' },
        ];

        const rowData1 = [
            { id: '0', country: 'Ireland', year: '2000', athlete: 'John Von Neumann' },
            { id: '1', country: 'France', year: '2001', athlete: 'Germain' },
            { id: '2', country: 'Italy', year: '2000', athlete: 'Donald Knuth' },
        ];

        const columns1: ColDef[] = [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country', rowGroup: true },
            { colId: 'year', field: 'year' },
        ];

        const rowData2 = [
            { id: '0', country: 'Ireland', year: '2000', athlete: 'John Von Neumann' },
            { id: '1', country: 'France', year: '2001', athlete: 'Germain' },
            { id: '2', country: 'France', year: '2003', athlete: 'Donald Knuth' },
        ];

        const columns2: ColDef[] = [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country', rowGroup: true },
            { colId: 'year', field: 'year', rowGroup: true },
        ];

        const api = gridsManager.createGrid('update-options', {
            animateRows: false,
            getRowId: (params) => params.data.id,
            groupDefaultExpanded: -1,
        });

        api.updateGridOptions({
            rowData: cachedJSONObjects.array(rowData0),
            columnDefs: cachedJSONObjects.array(columns0),
        });

        let gridRows = new GridRows(api, 'update rowData + grouping');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Noether" country:"France" year:"2000"
            └── LEAF id:1 athlete:"Germain" country:"France" year:"2001"
        `);

        api.updateGridOptions({
            rowData: cachedJSONObjects.array(rowData1),
            columnDefs: cachedJSONObjects.array(columns1),
        });

        gridRows = new GridRows(api, 'update rowData + grouping 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └── LEAF id:0 athlete:"John Von Neumann" country:"Ireland" year:"2000"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └── LEAF id:1 athlete:"Germain" country:"France" year:"2001"
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · └── LEAF id:2 athlete:"Donald Knuth" country:"Italy" year:"2000"
        `);

        api.updateGridOptions({
            rowData: cachedJSONObjects.array(rowData2),
            columnDefs: cachedJSONObjects.array(columns2),
        });

        gridRows = new GridRows(api, 'update rowData + grouping 2');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ · └── LEAF id:0 athlete:"John Von Neumann" country:"Ireland" year:"2000"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├─┬ LEAF_GROUP id:row-group-country-France-year-2001 ag-Grid-AutoColumn:"2001"
            · │ └── LEAF id:1 athlete:"Germain" country:"France" year:"2001"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2003 ag-Grid-AutoColumn:"2003"
            · · └── LEAF id:2 athlete:"Donald Knuth" country:"France" year:"2003"
        `);
    });

    test('initializing columns after initializing with a transaction with grouping module registered', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        applyTransactionChecked(api, {
            add: [
                { id: '1', value: 0 },
                { id: '2', value: 2 },
            ],
        });

        applyTransactionChecked(api, {
            update: [{ id: '1', value: 1 }],
            add: [{ id: '3', value: 3 }],
        });

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'data').check('empty');

        api.setGridOption('columnDefs', [{ field: 'value' }, { field: 'value' }]);

        // One macrotask after the mutation: the window in which a further, unwanted
        // rowDataUpdated/modelUpdated would arrive.
        await asyncSetTimeout(0);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 value:1 value_1:1
            ├── LEAF id:2 value:2 value_1:2
            └── LEAF id:3 value:3 value_1:3
        `);
    });

    test('changing group columns updates the row groups', async () => {
        const rowData = [
            { id: 'A', x: 'a', z: 1, group: 'Group1' },
            { id: 'B', x: 'a-b', z: 2, group: 'Group1' },
            { id: 'C', x: 'c', z: 3, group: 'Group2' },
            { id: 'D', x: 'c-d', z: 4, group: 'Group2' },
            { id: 'E', x: 'e', z: 5, group: 'Group3' },
            { id: 'F', x: 'e-f', z: 6, group: 'Group3' },
            { id: 'G', x: 'e-f-g', z: 7, group: 'Group3' },
            { id: 'H', x: 'e-f-g-h', z: 8, group: 'Group3' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'group', rowGroup: true, hide: true }, { field: 'x' }, { field: 'z' }],
            animateRows: false,
            groupDefaultExpanded: -1,
            autoGroupColumnDef: { headerName: 'Group' },
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'x1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Group1 ag-Grid-AutoColumn:"Group1"
            │ ├── LEAF id:A group:"Group1" x:"a" z:1
            │ └── LEAF id:B group:"Group1" x:"a-b" z:2
            ├─┬ LEAF_GROUP id:row-group-group-Group2 ag-Grid-AutoColumn:"Group2"
            │ ├── LEAF id:C group:"Group2" x:"c" z:3
            │ └── LEAF id:D group:"Group2" x:"c-d" z:4
            └─┬ LEAF_GROUP id:row-group-group-Group3 ag-Grid-AutoColumn:"Group3"
            · ├── LEAF id:E group:"Group3" x:"e" z:5
            · ├── LEAF id:F group:"Group3" x:"e-f" z:6
            · ├── LEAF id:G group:"Group3" x:"e-f-g" z:7
            · └── LEAF id:H group:"Group3" x:"e-f-g-h" z:8
        `);

        api.updateGridOptions({
            autoGroupColumnDef: { headerName: 'Group', field: 'group' },
        });

        await new GridRows(api, 'x2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Group1 ag-Grid-AutoColumn:"Group1"
            │ ├── LEAF id:A ag-Grid-AutoColumn:"Group1" group:"Group1" x:"a" z:1
            │ └── LEAF id:B ag-Grid-AutoColumn:"Group1" group:"Group1" x:"a-b" z:2
            ├─┬ LEAF_GROUP id:row-group-group-Group2 ag-Grid-AutoColumn:"Group2"
            │ ├── LEAF id:C ag-Grid-AutoColumn:"Group2" group:"Group2" x:"c" z:3
            │ └── LEAF id:D ag-Grid-AutoColumn:"Group2" group:"Group2" x:"c-d" z:4
            └─┬ LEAF_GROUP id:row-group-group-Group3 ag-Grid-AutoColumn:"Group3"
            · ├── LEAF id:E ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e" z:5
            · ├── LEAF id:F ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e-f" z:6
            · ├── LEAF id:G ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e-f-g" z:7
            · └── LEAF id:H ag-Grid-AutoColumn:"Group3" group:"Group3" x:"e-f-g-h" z:8
        `);

        api.setGridOption('autoGroupColumnDef', { headerName: 'Group', field: 'z' });

        await new GridRows(api, 'x3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-group-Group1 ag-Grid-AutoColumn:"Group1"
            │ ├── LEAF id:A ag-Grid-AutoColumn:1 group:"Group1" x:"a" z:1
            │ └── LEAF id:B ag-Grid-AutoColumn:2 group:"Group1" x:"a-b" z:2
            ├─┬ LEAF_GROUP id:row-group-group-Group2 ag-Grid-AutoColumn:"Group2"
            │ ├── LEAF id:C ag-Grid-AutoColumn:3 group:"Group2" x:"c" z:3
            │ └── LEAF id:D ag-Grid-AutoColumn:4 group:"Group2" x:"c-d" z:4
            └─┬ LEAF_GROUP id:row-group-group-Group3 ag-Grid-AutoColumn:"Group3"
            · ├── LEAF id:E ag-Grid-AutoColumn:5 group:"Group3" x:"e" z:5
            · ├── LEAF id:F ag-Grid-AutoColumn:6 group:"Group3" x:"e-f" z:6
            · ├── LEAF id:G ag-Grid-AutoColumn:7 group:"Group3" x:"e-f-g" z:7
            · └── LEAF id:H ag-Grid-AutoColumn:8 group:"Group3" x:"e-f-g-h" z:8
        `);
    });

    test('blank group rows and footers display blank labels', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowData: [
                { id: '0', country: '', year: '2000', athlete: 'No Country 1' },
                { id: '1', country: '', year: '2001', athlete: 'No Country 2' },
                { id: '2', country: 'Ireland', year: '2000', athlete: 'Ada Lovelace' },
            ],
        };

        const api = gridsManager.createGrid('blank-groups', gridOptions);
        const gridRows = new GridRows(api, 'blank groups');

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"2000"
            │ │ ├── LEAF id:2 country:"Ireland" year:"2000" athlete:"Ada Lovelace"
            │ │ └─ footer id:rowGroupFooter_row-group-country-Ireland-year-2000 ag-Grid-AutoColumn:"Total 2000"
            │ └─ footer id:rowGroupFooter_row-group-country-Ireland ag-Grid-AutoColumn:"Total Ireland"
            └─┬ filler id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
            · ├─┬ LEAF_GROUP id:row-group-country--year-2000 ag-Grid-AutoColumn:"2000"
            · │ ├── LEAF id:0 country:"" year:"2000" athlete:"No Country 1"
            · │ └─ footer id:rowGroupFooter_row-group-country--year-2000 ag-Grid-AutoColumn:"Total 2000"
            · ├─┬ LEAF_GROUP id:row-group-country--year-2001 ag-Grid-AutoColumn:"2001"
            · │ ├── LEAF id:1 country:"" year:"2001" athlete:"No Country 2"
            · │ └─ footer id:rowGroupFooter_row-group-country--year-2001 ag-Grid-AutoColumn:"Total 2001"
            · └─ footer id:rowGroupFooter_row-group-country- ag-Grid-AutoColumn:"Total (Blanks)"
        `);
    });

    // A cell formatter has no say over the group heading, so an empty answer from one does not suppress it.
    // The substitution is keyed on the group being blank, not on the formatter answering nothing.
    test('a blank group is labelled even when refData or a formatter yields an empty string', async () => {
        const api = gridsManager.createGrid('blank-groups-formatted', {
            columnDefs: [
                { field: 'ref', rowGroup: true, hide: true, refData: { ie: 'Ireland' } },
                {
                    field: 'fmt',
                    rowGroup: true,
                    hide: true,
                    valueFormatter: ({ value }) => (value === 'y' ? 'Yes' : ''),
                },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Group' },
            groupDefaultExpanded: -1,
            groupTotalRow: 'bottom',
            rowData: [
                { id: '0', ref: 'ie', fmt: 'y', athlete: 'Ada Lovelace' },
                { id: '1', ref: null, fmt: null, athlete: 'No Ref' },
                { id: '2', ref: '', fmt: '', athlete: 'Empty Ref' },
                // `n` is a real key the formatter empties, so its heading stays empty rather than (Blanks).
                { id: '3', ref: 'ie', fmt: 'n', athlete: 'Hidden Fmt' },
            ],
        });

        await new GridRows(api, 'formatted blank groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-ref-ie ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-ref-ie-fmt-y ag-Grid-AutoColumn:"Yes"
            │ │ ├── LEAF id:0 ref:"Ireland" fmt:"Yes" athlete:"Ada Lovelace"
            │ │ └─ footer id:rowGroupFooter_row-group-ref-ie-fmt-y ag-Grid-AutoColumn:"Total Yes"
            │ ├─┬ LEAF_GROUP id:row-group-ref-ie-fmt-n ag-Grid-AutoColumn:""
            │ │ ├── LEAF id:3 ref:"Ireland" fmt:"" athlete:"Hidden Fmt"
            │ │ └─ footer id:rowGroupFooter_row-group-ref-ie-fmt-n ag-Grid-AutoColumn:"Total "
            │ └─ footer id:rowGroupFooter_row-group-ref-ie ag-Grid-AutoColumn:"Total Ireland"
            └─┬ filler id:row-group-ref- ag-Grid-AutoColumn:"(Blanks)"
            · ├─┬ LEAF_GROUP id:row-group-ref--fmt- ag-Grid-AutoColumn:"(Blanks)"
            · │ ├── LEAF id:1 ref:null fmt:null athlete:"No Ref"
            · │ ├── LEAF id:2 ref:"" fmt:"" athlete:"Empty Ref"
            · │ └─ footer id:rowGroupFooter_row-group-ref--fmt- ag-Grid-AutoColumn:"Total (Blanks)"
            · └─ footer id:rowGroupFooter_row-group-ref- ag-Grid-AutoColumn:"Total (Blanks)"
        `);
    });

    test('deep group hierarchy', async () => {
        // Create a deep hierarchy: Level1 -> Level2 -> Level3 -> Level4 -> Level5
        const rowData = [
            { id: '1', l1: 'A', l2: 'A1', l3: 'A1a', l4: 'A1a1', l5: 'A1a1i', name: 'Deep Item 1' },
            { id: '2', l1: 'A', l2: 'A1', l3: 'A1a', l4: 'A1a1', l5: 'A1a1ii', name: 'Deep Item 2' },
            { id: '3', l1: 'A', l2: 'A1', l3: 'A1b', l4: 'A1b1', l5: 'A1b1i', name: 'Deep Item 3' },
            { id: '4', l1: 'B', l2: 'B1', l3: 'B1a', l4: 'B1a1', l5: 'B1a1i', name: 'Deep Item 4' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'l1', rowGroup: true, hide: true },
                { field: 'l2', rowGroup: true, hide: true },
                { field: 'l3', rowGroup: true, hide: true },
                { field: 'l4', rowGroup: true, hide: true },
                { field: 'l5', rowGroup: true, hide: true },
                { field: 'name' },
            ],
            autoGroupColumnDef: { headerName: 'Deep Hierarchy' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'deep hierarchy').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-l1-A ag-Grid-AutoColumn:"A"
            │ └─┬ filler id:row-group-l1-A-l2-A1 ag-Grid-AutoColumn:"A1"
            │ · ├─┬ filler id:row-group-l1-A-l2-A1-l3-A1a ag-Grid-AutoColumn:"A1a"
            │ · │ └─┬ filler id:row-group-l1-A-l2-A1-l3-A1a-l4-A1a1 ag-Grid-AutoColumn:"A1a1"
            │ · │ · ├─┬ LEAF_GROUP id:row-group-l1-A-l2-A1-l3-A1a-l4-A1a1-l5-A1a1i ag-Grid-AutoColumn:"A1a1i"
            │ · │ · │ └── LEAF id:1 l1:"A" l2:"A1" l3:"A1a" l4:"A1a1" l5:"A1a1i" name:"Deep Item 1"
            │ · │ · └─┬ LEAF_GROUP id:row-group-l1-A-l2-A1-l3-A1a-l4-A1a1-l5-A1a1ii ag-Grid-AutoColumn:"A1a1ii"
            │ · │ · · └── LEAF id:2 l1:"A" l2:"A1" l3:"A1a" l4:"A1a1" l5:"A1a1ii" name:"Deep Item 2"
            │ · └─┬ filler id:row-group-l1-A-l2-A1-l3-A1b ag-Grid-AutoColumn:"A1b"
            │ · · └─┬ filler id:row-group-l1-A-l2-A1-l3-A1b-l4-A1b1 ag-Grid-AutoColumn:"A1b1"
            │ · · · └─┬ LEAF_GROUP id:row-group-l1-A-l2-A1-l3-A1b-l4-A1b1-l5-A1b1i ag-Grid-AutoColumn:"A1b1i"
            │ · · · · └── LEAF id:3 l1:"A" l2:"A1" l3:"A1b" l4:"A1b1" l5:"A1b1i" name:"Deep Item 3"
            └─┬ filler id:row-group-l1-B ag-Grid-AutoColumn:"B"
            · └─┬ filler id:row-group-l1-B-l2-B1 ag-Grid-AutoColumn:"B1"
            · · └─┬ filler id:row-group-l1-B-l2-B1-l3-B1a ag-Grid-AutoColumn:"B1a"
            · · · └─┬ filler id:row-group-l1-B-l2-B1-l3-B1a-l4-B1a1 ag-Grid-AutoColumn:"B1a1"
            · · · · └─┬ LEAF_GROUP id:row-group-l1-B-l2-B1-l3-B1a-l4-B1a1-l5-B1a1i ag-Grid-AutoColumn:"B1a1i"
            · · · · · └── LEAF id:4 l1:"B" l2:"B1" l3:"B1a" l4:"B1a1" l5:"B1a1i" name:"Deep Item 4"
        `);
    });

    test('setRowData without getRowId destroys group filler nodes silently', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'name' }, { field: 'country', rowGroup: true, hide: true }],
            groupDefaultExpanded: -1,
            rowData: [
                { name: 'Alice', country: 'IE' },
                { name: 'Bob', country: 'IT' },
            ],
            animateRows: false,
        };
        const api = gridsManager.createGrid('myGrid', gridOptions);
        await new GridColumns(api, `setRowData without getRowId destroys group filler nodes silently setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
        await new GridRows(api, `setRowData without getRowId destroys group filler nodes silently setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-IE ag-Grid-AutoColumn:"IE"
            │ └── LEAF id:0 name:"Alice" country:"IE"
            └─┬ LEAF_GROUP id:row-group-country-IT ag-Grid-AutoColumn:"IT"
            · └── LEAF id:1 name:"Bob" country:"IT"
        `);
        // One macrotask so any deferred model work has settled before this synchronous read.
        await asyncSetTimeout(0);

        const fillers: IRowNode[] = [];
        api.forEachNode((n) => {
            if (n.group) {
                fillers.push(n);
            }
        });
        await new GridRows(api, `setRowData without getRowId destroys group filler nodes silently after forEachNode`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-IE ag-Grid-AutoColumn:"IE"
                │ └── LEAF id:0 name:"Alice" country:"IE"
                └─┬ LEAF_GROUP id:row-group-country-IT ag-Grid-AutoColumn:"IT"
                · └── LEAF id:1 name:"Bob" country:"IT"
            `);
        expect(fillers.length).toBeGreaterThan(0);

        let topChangedCount = 0;
        let rowIndexChangedCount = 0;
        let displayedChangedCount = 0;
        for (const f of fillers) {
            f.addEventListener('topChanged', () => {
                ++topChangedCount;
            });
            f.addEventListener('rowIndexChanged', () => {
                ++rowIndexChangedCount;
            });
            f.addEventListener('displayedChanged', () => {
                ++displayedChangedCount;
            });
        }

        setRowDataChecked(api, [
            { name: 'Alice', country: 'IE' },
            { name: 'Bob', country: 'IT' },
        ]);
        // One macrotask after the mutation: the window in which the position events asserted
        // below as never-fired would arrive.
        await asyncSetTimeout(0);

        for (const f of fillers) {
            expect(f.destroyed).toBe(true);
            expect(f.rowTop).toBeNull();
            expect(f.rowIndex).toBeNull();
            expect(f.displayed).toBe(false);
        }
        expect(topChangedCount).toBe(0);
        expect(rowIndexChangedCount).toBe(0);
        expect(displayedChangedCount).toBe(0);
    });

    test('removing all rows in a group fires position events on the dying filler', async () => {
        // Contract: incremental group teardown (e.g. transaction removes all rows in a group)
        // must still fire position events on the dying filler so the renderer can detach its RowCtrl.
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'name' }, { field: 'country', rowGroup: true, hide: true }],
            groupDefaultExpanded: -1,
            rowData: [
                { name: 'Alice', country: 'IE' },
                { name: 'Bob', country: 'IT' },
            ],
            getRowId: ({ data }) => data.name,
            animateRows: false,
        };
        const api = gridsManager.createGrid('myGrid', gridOptions);
        await new GridColumns(api, `removing all rows in a group fires position events on the dying filler setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── name "Name" width:200
            `);
        await new GridRows(api, `removing all rows in a group fires position events on the dying filler setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP id:row-group-country-IE ag-Grid-AutoColumn:"IE"
                │ └── LEAF id:Alice name:"Alice" country:"IE"
                └─┬ LEAF_GROUP id:row-group-country-IT ag-Grid-AutoColumn:"IT"
                · └── LEAF id:Bob name:"Bob" country:"IT"
            `
        );
        // One macrotask so any deferred model work has settled before this synchronous read.
        await asyncSetTimeout(0);

        const itFiller = api.getRowNode('row-group-country-IT');
        expect(itFiller).toBeTruthy();

        let topChangedCount = 0;
        let rowIndexChangedCount = 0;
        itFiller!.addEventListener('topChanged', () => {
            ++topChangedCount;
        });
        itFiller!.addEventListener('rowIndexChanged', () => {
            ++rowIndexChangedCount;
        });

        api.applyTransaction({ remove: [{ name: 'Bob' }] });
        await new GridRows(
            api,
            `removing all rows in a group fires position events on the dying filler after applyTransaction`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-IE ag-Grid-AutoColumn:"IE"
            · └── LEAF id:Alice name:"Alice" country:"IE"
        `);
        // The filler was alive before the transaction, so this cannot pass before the removal lands.
        await waitFor(() => expect(itFiller!.destroyed).toBe(true));

        expect(topChangedCount).toBeGreaterThan(0);
        expect(rowIndexChangedCount).toBeGreaterThan(0);
    });
});
