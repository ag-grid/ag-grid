import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid parentId tree data parentId filter sort', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
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
            { id: 'A', name: 'John Von Neumann' },
            { id: 'B', name: 'Alan Turing', parentId: 'A' },
            { id: 'C', name: 'A. Church', parentId: 'A' },
            { id: 'D', name: 'Donald Knuth', parentId: 'B' },
            { id: 'E', name: 'Grace Hopper', parentId: 'B' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        await new GridRows(api, 'filter 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        api.setGridOption('rowData', [
            { id: 'A', name: 'John Von Neumann' },
            { id: 'B', name: 'Alan Turing', parentId: 'A' },
            { id: 'C', name: 'A. Church', parentId: 'B' },
            { id: 'D', name: 'A. Church', parentId: 'A' },
            { id: 'E', name: 'Donald Knuth', parentId: 'B' },
        ]);

        await new GridRows(api, 'filter 1 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ └── C LEAF id:C ag-Grid-AutoColumn:"C" name:"A. Church"
            · └── D LEAF id:D ag-Grid-AutoColumn:"D" name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Grace Hopper' } });

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'filter 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · · └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
        `);

        api.setGridOption('rowData', [
            { id: 'A', name: 'John Von Neumann' },
            { id: 'B', name: 'Grace Hopper', parentId: 'A' },
            { id: 'C', name: 'A. Church', parentId: 'B' },
            { id: 'D', name: 'Donald Knuth', parentId: 'C' },
            { id: 'E', name: 'Grace Hopper' },
            { id: 'F', name: 'unknown', parentId: 'C' },
            { id: 'G', name: 'unknown2', parentId: 'F' },
        ]);

        await new GridRows(api, 'filter 2 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            │ └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Grace Hopper"
            │ · └─┬ C GROUP id:C ag-Grid-AutoColumn:"C" name:"A. Church"
            │ · · ├── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            │ · · └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" name:"unknown"
            │ · · · └── G LEAF id:G ag-Grid-AutoColumn:"G" name:"unknown2"
            └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Donald Knuth' } });

        await new GridRows(api, 'filter 3 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Grace Hopper"
            · · └─┬ C GROUP id:C ag-Grid-AutoColumn:"C" name:"A. Church"
            · · · └── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
        `);

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'filter 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · · └── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Kurt Gödel' } });

        await new GridRows(api, 'filter 4').check(`
            ROOT id:ROOT_NODE_ID
        `);

        api.setGridOption('rowData', [
            { id: 'A', name: 'Kurt Gödel' },
            { id: 'B', name: 'Alan Turing', parentId: 'A' },
            { id: 'C', name: 'A. Church', parentId: 'A' },
            { id: 'D', name: 'Donald Knuth', parentId: 'B' },
            { id: 'E', name: 'Grace Hopper', parentId: 'B' },
        ]);

        await new GridRows(api, 'filter 4 rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"Kurt Gödel"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        api.setFilterModel({});

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'no filter').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" name:"A. Church"
        `);
    });

    test('tree with sort', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'A', value: 12, x: 1 },
            { id: 'B', value: 17, x: 1, parentId: 'A' },
            { id: 'C', value: 15, x: 1, parentId: 'A' },
            { id: 'D', value: 13, x: 1, parentId: 'B' },
            { id: 'E', value: 11, x: 0, parentId: 'B' },
            { id: 'F', value: 10, x: 0 },
            { id: 'G', value: 16, x: 1, parentId: 'F' },
            { id: 'H', value: 10, x: 0, parentId: 'F' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'value', sortable: true, type: 'numericColumn', filter: 'agNumberColumnFilter' },
                { field: 'x', sortable: true, type: 'numericColumn', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
            │ │ └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            · ├── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            · └── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'asc' }],
        });

        await new GridRows(api, 'sort value asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            │ ├── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
            │ └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            · ├── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            · · ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            · · └── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: 'A', value: 12, x: 1 },
                { id: 'B', value: 17, x: 1, parentId: 'A' },
                { id: 'C', value: 15, x: 1, parentId: 'A' },
                { id: 'D', value: 13, x: 0, parentId: 'B' },
                { id: 'E', value: 11, x: 1, parentId: 'B' },
                { id: 'F', value: 10, x: 0 },
                { id: 'G', value: 16, x: 1, parentId: 'F' },
                { id: 'H', value: 1, x: 0, parentId: 'B' },
            ])
        );

        await new GridRows(api, 'sort value asc rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            │ └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            · ├── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            · · ├── H LEAF id:H ag-Grid-AutoColumn:"H" value:1 x:0
            · · ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:1
            · · └── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'desc' }],
        });

        await new GridRows(api, 'sort value desc  rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:0
            │ │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:1
            │ │ └── H LEAF id:H ag-Grid-AutoColumn:"H" value:1 x:0
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            · └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
        `);

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'sort value desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
            │ │ └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            · ├── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            · └── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
        `);

        api.applyColumnState({
            state: [
                { colId: 'value', sort: null },
                { colId: 'x', sort: 'asc' },
            ],
        });

        await new GridRows(api, 'sort x asc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            │ ├── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
            │ └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            · │ └── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'desc' }],
        });

        await new GridRows(api, 'sort x desc').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
            │ │ └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            · ├── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            · └── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: 'H', value: 10, x: 1, parentId: 'F' },
                { id: 'A', value: 12, x: 1 },
                { id: 'D', value: 13, x: 1, parentId: 'B' },
                { id: 'C', value: 15, x: 1, parentId: 'A' },
                { id: 'B', value: 17, x: 1, parentId: 'A' },
                { id: 'F', value: 10, x: 1 },
                { id: 'G', value: 16, x: 0, parentId: 'F' },
                { id: 'E', value: 11, x: 0, parentId: 'B' },
            ])
        );

        await new GridRows(api, 'sort x desc rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ ├── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
            │ └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ · ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
            │ · └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:1
            · ├── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:1
            · └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:0
        `);

        api.setFilterModel({ x: { type: 'equals', filter: 0 } });

        await new GridRows(api, 'sort x desc, filter x===0, rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ · └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:1
            · └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:0
        `);

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'sort x desc, filter x===0, rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ · └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            · ├── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            · └── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'asc' }],
        });

        await new GridRows(api, 'sort x desc, filter x===0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ F GROUP id:F ag-Grid-AutoColumn:"F" value:10 x:0
            │ ├── H LEAF id:H ag-Grid-AutoColumn:"H" value:10 x:0
            │ └── G LEAF id:G ag-Grid-AutoColumn:"G" value:16 x:1
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            · · └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
        `);
    });

    test('swapping with transactions and sort', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'Y', value: 1 },
            { id: 'X', value: 2 },
            { id: 'J', value: 9, parentId: 'X' },
            { id: 'K', value: 11, parentId: 'J' },
            { id: 'L', value: 9, parentId: 'J' },
            { id: 'M', value: 10, parentId: 'L' },
            { id: 'N', value: 10, parentId: 'L' },
            { id: 'A', value: 1, parentId: 'Y' },
            { id: 'B', value: 5, parentId: 'A' },
            { id: 'C', value: 4, parentId: 'A' },
            { id: 'D', value: 3, parentId: 'B' },
            { id: 'E', value: 2, parentId: 'B' },
            { id: 'F', value: 1, parentId: 'B' },
            { id: 'G', value: 7, parentId: 'B' },
            { id: 'H', value: 7, parentId: 'G' },
            { id: 'I', value: 8, parentId: 'G' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    colId: 'value',
                    field: 'value',
                    sortable: true,
                    type: 'numericColumn',
                    filter: 'agNumberColumnFilter',
                    sort: 'desc',
                },
                { colId: 'n', field: 'value', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            alwaysAggregateAtRootLevel: true,
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID n:56
            ├─┬ X GROUP id:X ag-Grid-AutoColumn:"X" value:2 n:31
            │ └─┬ J GROUP id:J ag-Grid-AutoColumn:"J" value:9 n:31
            │ · ├── K LEAF id:K ag-Grid-AutoColumn:"K" value:11 n:11
            │ · └─┬ L GROUP id:L ag-Grid-AutoColumn:"L" value:9 n:20
            │ · · ├── M LEAF id:M ag-Grid-AutoColumn:"M" value:10 n:10
            │ · · └── N LEAF id:N ag-Grid-AutoColumn:"N" value:10 n:10
            └─┬ Y GROUP id:Y ag-Grid-AutoColumn:"Y" value:1 n:25
            · └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:1 n:25
            · · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:5 n:21
            · · │ ├─┬ G GROUP id:G ag-Grid-AutoColumn:"G" value:7 n:15
            · · │ │ ├── I LEAF id:I ag-Grid-AutoColumn:"I" value:8 n:8
            · · │ │ └── H LEAF id:H ag-Grid-AutoColumn:"H" value:7 n:7
            · · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:3 n:3
            · · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:2 n:2
            · · │ └── F LEAF id:F ag-Grid-AutoColumn:"F" value:1 n:1
            · · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:4 n:4
        `);

        api.applyTransaction({
            update: [
                { ...rowData.find((x) => x.id === 'L'), parentId: 'A' },
                { ...rowData.find((x) => x.id === 'G'), parentId: 'J' },
            ],
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID n:56
            ├─┬ X GROUP id:X ag-Grid-AutoColumn:"X" value:2 n:26
            │ └─┬ J GROUP id:J ag-Grid-AutoColumn:"J" value:9 n:26
            │ · ├── K LEAF id:K ag-Grid-AutoColumn:"K" value:11 n:11
            │ · └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" value:7 n:15
            │ · · ├── I LEAF id:I ag-Grid-AutoColumn:"I" value:8 n:8
            │ · · └── H LEAF id:H ag-Grid-AutoColumn:"H" value:7 n:7
            └─┬ Y GROUP id:Y ag-Grid-AutoColumn:"Y" value:1 n:30
            · └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:1 n:30
            · · ├─┬ L GROUP id:L ag-Grid-AutoColumn:"L" value:9 n:20
            · · │ ├── M LEAF id:M ag-Grid-AutoColumn:"M" value:10 n:10
            · · │ └── N LEAF id:N ag-Grid-AutoColumn:"N" value:10 n:10
            · · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:5 n:6
            · · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:3 n:3
            · · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:2 n:2
            · · │ └── F LEAF id:F ag-Grid-AutoColumn:"F" value:1 n:1
            · · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:4 n:4
        `);

        api.applyTransaction({
            update: [
                { ...rowData.find((x) => x.id === 'D'), value: 40 },
                { ...rowData.find((x) => x.id === 'E'), value: 41 },
            ],
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID n:132
            ├─┬ X GROUP id:X ag-Grid-AutoColumn:"X" value:2 n:26
            │ └─┬ J GROUP id:J ag-Grid-AutoColumn:"J" value:9 n:26
            │ · ├── K LEAF id:K ag-Grid-AutoColumn:"K" value:11 n:11
            │ · └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" value:7 n:15
            │ · · ├── I LEAF id:I ag-Grid-AutoColumn:"I" value:8 n:8
            │ · · └── H LEAF id:H ag-Grid-AutoColumn:"H" value:7 n:7
            └─┬ Y GROUP id:Y ag-Grid-AutoColumn:"Y" value:1 n:106
            · └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:1 n:106
            · · ├─┬ L GROUP id:L ag-Grid-AutoColumn:"L" value:9 n:20
            · · │ ├── M LEAF id:M ag-Grid-AutoColumn:"M" value:10 n:10
            · · │ └── N LEAF id:N ag-Grid-AutoColumn:"N" value:10 n:10
            · · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:5 n:82
            · · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:41 n:41
            · · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:40 n:40
            · · │ └── F LEAF id:F ag-Grid-AutoColumn:"F" value:1 n:1
            · · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:4 n:4
        `);

        api.applyTransaction({
            update: [{ ...rowData.find((x) => x.id === 'H'), parentId: 'X' }],
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID n:132
            ├─┬ X GROUP id:X ag-Grid-AutoColumn:"X" value:2 n:26
            │ ├─┬ J GROUP id:J ag-Grid-AutoColumn:"J" value:9 n:19
            │ │ ├── K LEAF id:K ag-Grid-AutoColumn:"K" value:11 n:11
            │ │ └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" value:7 n:8
            │ │ · └── I LEAF id:I ag-Grid-AutoColumn:"I" value:8 n:8
            │ └── H LEAF id:H ag-Grid-AutoColumn:"H" value:7 n:7
            └─┬ Y GROUP id:Y ag-Grid-AutoColumn:"Y" value:1 n:106
            · └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:1 n:106
            · · ├─┬ L GROUP id:L ag-Grid-AutoColumn:"L" value:9 n:20
            · · │ ├── M LEAF id:M ag-Grid-AutoColumn:"M" value:10 n:10
            · · │ └── N LEAF id:N ag-Grid-AutoColumn:"N" value:10 n:10
            · · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:5 n:82
            · · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:41 n:41
            · · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:40 n:40
            · · │ └── F LEAF id:F ag-Grid-AutoColumn:"F" value:1 n:1
            · · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:4 n:4
        `);

        api.applyTransaction({
            update: [{ ...rowData.find((x) => x.id === 'X'), parentId: 'B' }],
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID n:132
            └─┬ Y GROUP id:Y ag-Grid-AutoColumn:"Y" value:1 n:132
            · └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:1 n:132
            · · ├─┬ L GROUP id:L ag-Grid-AutoColumn:"L" value:9 n:20
            · · │ ├── M LEAF id:M ag-Grid-AutoColumn:"M" value:10 n:10
            · · │ └── N LEAF id:N ag-Grid-AutoColumn:"N" value:10 n:10
            · · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:5 n:108
            · · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:41 n:41
            · · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:40 n:40
            · · │ ├─┬ X GROUP id:X ag-Grid-AutoColumn:"X" value:2 n:26
            · · │ │ ├─┬ J GROUP id:J ag-Grid-AutoColumn:"J" value:9 n:19
            · · │ │ │ ├── K LEAF id:K ag-Grid-AutoColumn:"K" value:11 n:11
            · · │ │ │ └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" value:7 n:8
            · · │ │ │ · └── I LEAF id:I ag-Grid-AutoColumn:"I" value:8 n:8
            · · │ │ └── H LEAF id:H ag-Grid-AutoColumn:"H" value:7 n:7
            · · │ └── F LEAF id:F ag-Grid-AutoColumn:"F" value:1 n:1
            · · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:4 n:4
        `);

        api.applyTransaction({
            update: [{ ...rowData.find((x) => x.id === 'D'), value: 200 }],
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID n:292
            └─┬ Y GROUP id:Y ag-Grid-AutoColumn:"Y" value:1 n:292
            · └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:1 n:292
            · · ├─┬ L GROUP id:L ag-Grid-AutoColumn:"L" value:9 n:20
            · · │ ├── M LEAF id:M ag-Grid-AutoColumn:"M" value:10 n:10
            · · │ └── N LEAF id:N ag-Grid-AutoColumn:"N" value:10 n:10
            · · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:5 n:268
            · · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:200 n:200
            · · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E" value:41 n:41
            · · │ ├─┬ X GROUP id:X ag-Grid-AutoColumn:"X" value:2 n:26
            · · │ │ ├─┬ J GROUP id:J ag-Grid-AutoColumn:"J" value:9 n:19
            · · │ │ │ ├── K LEAF id:K ag-Grid-AutoColumn:"K" value:11 n:11
            · · │ │ │ └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" value:7 n:8
            · · │ │ │ · └── I LEAF id:I ag-Grid-AutoColumn:"I" value:8 n:8
            · · │ │ └── H LEAF id:H ag-Grid-AutoColumn:"H" value:7 n:7
            · · │ └── F LEAF id:F ag-Grid-AutoColumn:"F" value:1 n:1
            · · └── C LEAF id:C ag-Grid-AutoColumn:"C" value:4 n:4
        `);
    });
});
