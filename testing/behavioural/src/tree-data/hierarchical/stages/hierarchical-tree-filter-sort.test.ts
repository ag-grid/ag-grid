import { CellStyleModule, ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, cachedJSONObjects, setRowDataChecked } from '../../../test-utils';

describe('ag-grid hierarchical tree filter sort', () => {
    const gridsManager = new TestGridsManager({
        modules: [CellStyleModule, TextFilterModule, NumberFilterModule, ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree with custom filter', async () => {
        const rowData = [
            {
                id: '1',
                k: 'A',
                name: 'John Von Neumann',
                children: [
                    {
                        id: '2',
                        k: 'B',
                        name: 'Alan Turing',
                        children: [
                            { id: '4', k: 'D', name: 'Donald Knuth' },
                            { id: '5', k: 'E', name: 'Grace Hopper' },
                        ],
                    },
                    { id: '3', k: 'C', name: 'A. Church' },
                ],
            },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'k' }, { field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        await new GridRows(api, 'filter 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
        `);

        setRowDataChecked(api, [
            {
                id: '1',
                k: 'A',
                name: 'John Von Neumann',
                children: [
                    {
                        id: '2',
                        k: 'B',
                        name: 'Alan Turing',
                        children: [{ id: '5', k: 'E', name: 'A. Church' }],
                    },
                    { id: '3', k: 'C', name: 'A. Church' },
                    { id: '4', k: 'D', name: 'Donald Knuth' },
                ],
            },
        ]);

        await new GridRows(api, 'filter 1 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"A. Church"
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Grace Hopper' } });

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'filter 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            · · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
        `);

        setRowDataChecked(api, [
            {
                id: '1',
                k: 'A',
                name: 'John Von Neumann',
                children: [
                    {
                        id: '2',
                        k: 'B',
                        name: 'Grace Hopper',
                        children: [
                            { id: '4', k: 'D', name: 'Donald Knuth' },
                            { id: '5', k: 'E', children: [{ id: 'W', k: 'W', name: 'Grace Hopper' }] },
                        ],
                    },
                    {
                        id: '3',
                        k: 'C',
                        name: 'A. Church',
                        children: [{ id: 'J', k: 'J', name: 'A. Church' }],
                    },
                    { id: '6', k: 'K', name: 'unknown' },
                ],
            },
        ]);

        await new GridRows(api, 'filter 2 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Grace Hopper"
            · · ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
            · · └─┬ 5 GROUP id:5 ag-Grid-AutoColumn:"5" k:"E"
            · · · └── W LEAF id:W ag-Grid-AutoColumn:"W" k:"W" name:"Grace Hopper"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Donald Knuth' } });

        await new GridRows(api, 'filter 3 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Grace Hopper"
            · · └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'filter 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            · · └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Kurt Gödel' } });

        await new GridRows(api, 'filter 4').check(`
            ROOT id:ROOT_NODE_ID
        `);

        setRowDataChecked(api, [
            {
                id: '1',
                k: 'A',
                name: 'Kurt Gödel',
                children: [
                    {
                        id: '2',
                        k: 'B',
                        name: 'Alan Turing',
                        children: [
                            { id: '4', k: 'D', name: 'Donald Knuth' },
                            { id: '5', k: 'E', name: 'Grace Hopper' },
                        ],
                    },
                    { id: '3', k: 'C', name: 'A. Church' },
                ],
            },
        ]);

        await new GridRows(api, 'filter 4 rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"Kurt Gödel"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
        `);

        api.setFilterModel({});

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'no filter').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            ├── k "K" width:200
            └── name "Name" width:200
        `);
    });

    test('tree with sort', async () => {
        const rowData = cachedJSONObjects.array([
            {
                id: '1',
                k: 'A',
                value: 12,
                x: 1,
                children: [
                    {
                        id: '2',
                        k: 'B',
                        value: 17,
                        x: 1,
                        children: [
                            { id: '4', k: 'D', value: 13, x: 1 },
                            { id: '5', k: 'E', value: 11, x: 0 },
                        ],
                    },
                    { id: '3', k: 'C', value: 15, x: 1 },
                    {
                        id: '6',
                        k: 'F',
                        children: [
                            { id: '8', k: 'G', value: 10, x: 0 },
                            { id: '7', k: 'H', value: 16, x: 1 },
                        ],
                    },
                ],
            },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'k' },
                { field: 'value', sortable: true, type: 'numericColumn', filter: 'agNumberColumnFilter' },
                { field: 'x', sortable: true, type: 'numericColumn', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:1
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
            · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · · ├── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
            · · └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'asc' }],
        });

        await new GridRows(api, 'sort value asc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · │ ├── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
            · │ └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · · ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
            · · └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:1
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                {
                    id: '1',
                    k: 'A',
                    value: 12,
                    x: 1,
                    children: [
                        {
                            id: '6',
                            k: 'F',
                            value: 10,
                            x: 0,
                            children: [
                                { id: '8', k: 'G', value: 10, x: 0 },
                                { id: '7', k: 'H', value: 16, x: 1 },
                            ],
                        },
                        { id: '3', k: 'C', value: 15, x: 1 },
                        {
                            id: '2',
                            k: 'B',
                            value: 17,
                            x: 1,
                            children: [
                                { id: '5', k: 'e', value: 11, x: 0 },
                                { id: '4', k: 'd', value: 13, x: 1 },
                            ],
                        },
                    ],
                },
            ])
        );

        await new GridRows(api, 'sort value asc rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F" value:10 x:0
            · │ ├── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
            · │ └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · · ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"e" value:11 x:0
            · · └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"d" value:13 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'desc' }],
        });

        await new GridRows(api, 'sort value desc  rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"d" value:13 x:1
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"e" value:11 x:0
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
            · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F" value:10 x:0
            · · ├── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'sort value desc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:1
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
            · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · · ├── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
        `);

        api.applyColumnState({
            state: [
                { colId: 'value', sort: null },
                { colId: 'x', sort: 'asc' },
            ],
        });

        await new GridRows(api, 'sort x asc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · │ ├── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
            · │ └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
            · │ └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:1
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'desc' }],
        });

        await new GridRows(api, 'sort x desc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:1
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:1
            · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · · ├── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                {
                    id: '1',
                    k: 'A',
                    value: 12,
                    x: 1,
                    children: [
                        {
                            id: '6',
                            k: 'F',
                            children: [
                                { id: '7', k: 'H', value: 16, x: 1 },
                                { id: '8', k: 'G', value: 10, x: 1 },
                            ],
                        },
                        { id: '3', k: 'C', value: 15, x: 0 },
                        {
                            id: '2',
                            k: 'B',
                            value: 17,
                            x: 1,
                            children: [
                                { id: '5', k: 'E', value: 11, x: 1 },
                                { id: '4', k: 'D', value: 13, x: 0 },
                            ],
                        },
                    ],
                },
            ])
        );

        await new GridRows(api, 'sort x desc rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:1
            · │ └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:0
            · ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:0
            · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · · ├── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"H" value:16 x:1
            · · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:1
        `);

        api.setFilterModel({ x: { type: 'equals', filter: 0 } });

        await new GridRows(api, 'sort x desc, filter x===0, rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" k:"D" value:13 x:0
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" k:"C" value:15 x:0
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'sort x desc, filter x===0, rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
            · └─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'asc' }],
        });

        await new GridRows(api, 'sort x desc, filter x===0').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" k:"A" value:12 x:1
            · ├─┬ 6 GROUP id:6 ag-Grid-AutoColumn:"6" k:"F"
            · │ └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"G" value:10 x:0
            · └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" value:17 x:1
            · · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" value:11 x:0
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            ├── k "K" width:200
            ├── value "Value" width:200
            └── x "X" width:200 sort:asc filter
        `);
    });

    test('delta sorting keeps hierarchical tree data stable after targeted updates', async () => {
        type HierarchyNode = {
            id: string;
            label: string;
            value: number;
            children?: HierarchyNode[];
        };

        cachedJSONObjects.clear();

        const baseRowData: HierarchyNode[] = cachedJSONObjects.array([
            {
                id: 'alpha',
                label: 'Alpha',
                value: 40,
                children: [
                    { id: 'alpha-design', label: 'Alpha Design', value: 35 },
                    { id: 'alpha-build', label: 'Alpha Build', value: 20 },
                    { id: 'alpha-test', label: 'Alpha Test', value: 50 },
                    { id: 'alpha-deploy', label: 'Alpha Deploy', value: 28 },
                    { id: 'alpha-monitor', label: 'Alpha Monitor', value: 12 },
                    { id: 'alpha-maintain', label: 'Alpha Maintain', value: 42 },
                ],
            },
            {
                id: 'beta',
                label: 'Beta',
                value: 15,
                children: [
                    { id: 'beta-design', label: 'Beta Design', value: 5 },
                    { id: 'beta-build', label: 'Beta Build', value: 18 },
                    { id: 'beta-test', label: 'Beta Test', value: 12 },
                    { id: 'beta-deploy', label: 'Beta Deploy', value: 22 },
                    { id: 'beta-monitor', label: 'Beta Monitor', value: 8 },
                    { id: 'beta-maintain', label: 'Beta Maintain', value: 16 },
                ],
            },
            {
                id: 'gamma',
                label: 'Gamma',
                value: 25,
                children: [
                    { id: 'gamma-design', label: 'Gamma Design', value: 8 },
                    { id: 'gamma-build', label: 'Gamma Build', value: 30 },
                    { id: 'gamma-test', label: 'Gamma Test', value: 22 },
                    { id: 'gamma-deploy', label: 'Gamma Deploy', value: 35 },
                    { id: 'gamma-monitor', label: 'Gamma Monitor', value: 15 },
                    { id: 'gamma-maintain', label: 'Gamma Maintain', value: 25 },
                ],
            },
            {
                id: 'delta',
                label: 'Delta',
                value: 32,
                children: [
                    { id: 'delta-design', label: 'Delta Design', value: 28 },
                    { id: 'delta-build', label: 'Delta Build', value: 45 },
                    { id: 'delta-test', label: 'Delta Test', value: 15 },
                ],
            },
            {
                id: 'epsilon',
                label: 'Epsilon',
                value: 38,
                children: [
                    { id: 'epsilon-design', label: 'Epsilon Design', value: 42 },
                    { id: 'epsilon-build', label: 'Epsilon Build', value: 25 },
                    { id: 'epsilon-test', label: 'Epsilon Test', value: 55 },
                ],
            },
        ]);

        const updatedRowData: HierarchyNode[] = cachedJSONObjects.array([
            {
                id: 'alpha',
                label: 'Alpha',
                value: 5,
                children: [
                    { id: 'alpha-design', label: 'Alpha Design', value: 35 },
                    { id: 'alpha-build', label: 'Alpha Build', value: 12 },
                    { id: 'alpha-test', label: 'Alpha Test', value: 50 },
                    { id: 'alpha-deploy', label: 'Alpha Deploy', value: 28 },
                    { id: 'alpha-monitor', label: 'Alpha Monitor', value: 10 },
                    { id: 'alpha-maintain', label: 'Alpha Maintain', value: 42 },
                ],
            },
            {
                id: 'beta',
                label: 'Beta',
                value: 15,
                children: [
                    { id: 'beta-design', label: 'Beta Design', value: 5 },
                    { id: 'beta-build', label: 'Beta Build', value: 1 },
                    { id: 'beta-test', label: 'Beta Test', value: 12 },
                    { id: 'beta-deploy', label: 'Beta Deploy', value: 22 },
                    { id: 'beta-monitor', label: 'Beta Monitor', value: 8 },
                    { id: 'beta-maintain', label: 'Beta Maintain', value: 16 },
                ],
            },
            {
                id: 'gamma',
                label: 'Gamma',
                value: 25,
                children: [
                    { id: 'gamma-design', label: 'Gamma Design', value: 8 },
                    { id: 'gamma-build', label: 'Gamma Build', value: 30 },
                    { id: 'gamma-test', label: 'Gamma Test', value: 22 },
                    { id: 'gamma-deploy', label: 'Gamma Deploy', value: 35 },
                    { id: 'gamma-monitor', label: 'Gamma Monitor', value: 15 },
                    { id: 'gamma-maintain', label: 'Gamma Maintain', value: 25 },
                ],
            },
            {
                id: 'delta',
                label: 'Delta',
                value: 32,
                children: [
                    { id: 'delta-design', label: 'Delta Design', value: 28 },
                    { id: 'delta-build', label: 'Delta Build', value: 45 },
                    { id: 'delta-test', label: 'Delta Test', value: 15 },
                ],
            },
            {
                id: 'epsilon',
                label: 'Epsilon',
                value: 38,
                children: [
                    { id: 'epsilon-design', label: 'Epsilon Design', value: 42 },
                    { id: 'epsilon-build', label: 'Epsilon Build', value: 25 },
                    { id: 'epsilon-test', label: 'Epsilon Test', value: 55 },
                ],
            },
        ]);

        const api = gridsManager.createGrid('hierarchicalDeltaSort', {
            columnDefs: [{ field: 'value' }],
            autoGroupColumnDef: { headerName: 'Hierarchy', cellRendererParams: { suppressCount: true } },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: baseRowData,
            treeData: true,
            deltaSort: true,
            treeDataChildrenField: 'children',
            getRowId: ({ data }) => data.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'hierarchical tree data initial order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ beta GROUP id:beta ag-Grid-AutoColumn:"beta" value:15
            │ ├── beta-design LEAF id:beta-design ag-Grid-AutoColumn:"beta-design" value:5
            │ ├── beta-monitor LEAF id:beta-monitor ag-Grid-AutoColumn:"beta-monitor" value:8
            │ ├── beta-test LEAF id:beta-test ag-Grid-AutoColumn:"beta-test" value:12
            │ ├── beta-maintain LEAF id:beta-maintain ag-Grid-AutoColumn:"beta-maintain" value:16
            │ ├── beta-build LEAF id:beta-build ag-Grid-AutoColumn:"beta-build" value:18
            │ └── beta-deploy LEAF id:beta-deploy ag-Grid-AutoColumn:"beta-deploy" value:22
            ├─┬ gamma GROUP id:gamma ag-Grid-AutoColumn:"gamma" value:25
            │ ├── gamma-design LEAF id:gamma-design ag-Grid-AutoColumn:"gamma-design" value:8
            │ ├── gamma-monitor LEAF id:gamma-monitor ag-Grid-AutoColumn:"gamma-monitor" value:15
            │ ├── gamma-test LEAF id:gamma-test ag-Grid-AutoColumn:"gamma-test" value:22
            │ ├── gamma-maintain LEAF id:gamma-maintain ag-Grid-AutoColumn:"gamma-maintain" value:25
            │ ├── gamma-build LEAF id:gamma-build ag-Grid-AutoColumn:"gamma-build" value:30
            │ └── gamma-deploy LEAF id:gamma-deploy ag-Grid-AutoColumn:"gamma-deploy" value:35
            ├─┬ delta GROUP id:delta ag-Grid-AutoColumn:"delta" value:32
            │ ├── delta-test LEAF id:delta-test ag-Grid-AutoColumn:"delta-test" value:15
            │ ├── delta-design LEAF id:delta-design ag-Grid-AutoColumn:"delta-design" value:28
            │ └── delta-build LEAF id:delta-build ag-Grid-AutoColumn:"delta-build" value:45
            ├─┬ epsilon GROUP id:epsilon ag-Grid-AutoColumn:"epsilon" value:38
            │ ├── epsilon-build LEAF id:epsilon-build ag-Grid-AutoColumn:"epsilon-build" value:25
            │ ├── epsilon-design LEAF id:epsilon-design ag-Grid-AutoColumn:"epsilon-design" value:42
            │ └── epsilon-test LEAF id:epsilon-test ag-Grid-AutoColumn:"epsilon-test" value:55
            └─┬ alpha GROUP id:alpha ag-Grid-AutoColumn:"alpha" value:40
            · ├── alpha-monitor LEAF id:alpha-monitor ag-Grid-AutoColumn:"alpha-monitor" value:12
            · ├── alpha-build LEAF id:alpha-build ag-Grid-AutoColumn:"alpha-build" value:20
            · ├── alpha-deploy LEAF id:alpha-deploy ag-Grid-AutoColumn:"alpha-deploy" value:28
            · ├── alpha-design LEAF id:alpha-design ag-Grid-AutoColumn:"alpha-design" value:35
            · ├── alpha-maintain LEAF id:alpha-maintain ag-Grid-AutoColumn:"alpha-maintain" value:42
            · └── alpha-test LEAF id:alpha-test ag-Grid-AutoColumn:"alpha-test" value:50
        `);

        api.setGridOption('rowData', updatedRowData);

        await new GridRows(api, 'hierarchical tree data updated order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ alpha GROUP id:alpha ag-Grid-AutoColumn:"alpha" value:5
            │ ├── alpha-monitor LEAF id:alpha-monitor ag-Grid-AutoColumn:"alpha-monitor" value:10
            │ ├── alpha-build LEAF id:alpha-build ag-Grid-AutoColumn:"alpha-build" value:12
            │ ├── alpha-deploy LEAF id:alpha-deploy ag-Grid-AutoColumn:"alpha-deploy" value:28
            │ ├── alpha-design LEAF id:alpha-design ag-Grid-AutoColumn:"alpha-design" value:35
            │ ├── alpha-maintain LEAF id:alpha-maintain ag-Grid-AutoColumn:"alpha-maintain" value:42
            │ └── alpha-test LEAF id:alpha-test ag-Grid-AutoColumn:"alpha-test" value:50
            ├─┬ beta GROUP id:beta ag-Grid-AutoColumn:"beta" value:15
            │ ├── beta-build LEAF id:beta-build ag-Grid-AutoColumn:"beta-build" value:1
            │ ├── beta-design LEAF id:beta-design ag-Grid-AutoColumn:"beta-design" value:5
            │ ├── beta-monitor LEAF id:beta-monitor ag-Grid-AutoColumn:"beta-monitor" value:8
            │ ├── beta-test LEAF id:beta-test ag-Grid-AutoColumn:"beta-test" value:12
            │ ├── beta-maintain LEAF id:beta-maintain ag-Grid-AutoColumn:"beta-maintain" value:16
            │ └── beta-deploy LEAF id:beta-deploy ag-Grid-AutoColumn:"beta-deploy" value:22
            ├─┬ gamma GROUP id:gamma ag-Grid-AutoColumn:"gamma" value:25
            │ ├── gamma-design LEAF id:gamma-design ag-Grid-AutoColumn:"gamma-design" value:8
            │ ├── gamma-monitor LEAF id:gamma-monitor ag-Grid-AutoColumn:"gamma-monitor" value:15
            │ ├── gamma-test LEAF id:gamma-test ag-Grid-AutoColumn:"gamma-test" value:22
            │ ├── gamma-maintain LEAF id:gamma-maintain ag-Grid-AutoColumn:"gamma-maintain" value:25
            │ ├── gamma-build LEAF id:gamma-build ag-Grid-AutoColumn:"gamma-build" value:30
            │ └── gamma-deploy LEAF id:gamma-deploy ag-Grid-AutoColumn:"gamma-deploy" value:35
            ├─┬ delta GROUP id:delta ag-Grid-AutoColumn:"delta" value:32
            │ ├── delta-test LEAF id:delta-test ag-Grid-AutoColumn:"delta-test" value:15
            │ ├── delta-design LEAF id:delta-design ag-Grid-AutoColumn:"delta-design" value:28
            │ └── delta-build LEAF id:delta-build ag-Grid-AutoColumn:"delta-build" value:45
            └─┬ epsilon GROUP id:epsilon ag-Grid-AutoColumn:"epsilon" value:38
            · ├── epsilon-build LEAF id:epsilon-build ag-Grid-AutoColumn:"epsilon-build" value:25
            · ├── epsilon-design LEAF id:epsilon-design ag-Grid-AutoColumn:"epsilon-design" value:42
            · └── epsilon-test LEAF id:epsilon-test ag-Grid-AutoColumn:"epsilon-test" value:55
        `);
    });
});
