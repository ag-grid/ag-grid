import { CellStyleModule, ClientSideRowModelModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    cachedJSONObjects,
    setRowDataChecked,
} from '../../../test-utils';

describe('ag-grid parentId tree data parentId filter sort', () => {
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

        setRowDataChecked(api, [
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

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'filter 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · · └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
        `);

        setRowDataChecked(api, [
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

        setRowDataChecked(api, rowData);

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

        setRowDataChecked(api, [
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

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'no filter').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:E ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            └── name "Name" width:200
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

        setRowDataChecked(api, rowData);

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
                { id: 'A', value: 12, x: 1 },
                { id: 'B', value: 17, x: 1, parentId: 'A' },
                { id: 'D', value: 13, x: 1, parentId: 'B' },
                { id: 'E', value: 11, x: 0, parentId: 'B' },
                { id: 'C', value: 15, x: 1, parentId: 'A' },
                { id: 'F', value: 10, x: 1 },
                { id: 'G', value: 16, x: 0, parentId: 'F' },
                { id: 'H', value: 10, x: 1, parentId: 'F' },
            ])
        );

        await new GridRows(api, 'sort x desc rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" value:12 x:1
            │ ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B" value:17 x:1
            │ │ ├── D LEAF id:D ag-Grid-AutoColumn:"D" value:13 x:1
            │ │ └── E LEAF id:E ag-Grid-AutoColumn:"E" value:11 x:0
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" value:15 x:1
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

        setRowDataChecked(api, rowData);

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

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            ├── value "Value" width:200
            └── x "X" width:200 sort:asc filter
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

        applyTransactionChecked(api, {
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

        applyTransactionChecked(api, {
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

        applyTransactionChecked(api, {
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

        applyTransactionChecked(api, {
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

        applyTransactionChecked(api, {
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

    test('delta sorting reorders parentId tree data after partial updates', async () => {
        const rowData = [
            { id: 'north', label: 'North', value: 30 },
            { id: 'north-west', parentId: 'north', label: 'North West', value: 25 },
            { id: 'north-east', parentId: 'north', label: 'North East', value: 35 },
            { id: 'north-central', parentId: 'north', label: 'North Central', value: 18 },
            { id: 'north-upper', parentId: 'north', label: 'North Upper', value: 42 },
            { id: 'north-lower', parentId: 'north', label: 'North Lower', value: 22 },
            { id: 'north-mid', parentId: 'north', label: 'North Mid', value: 28 },
            { id: 'south', label: 'South', value: 10 },
            { id: 'south-east', parentId: 'south', label: 'South East', value: 5 },
            { id: 'south-west', parentId: 'south', label: 'South West', value: 15 },
            { id: 'south-central', parentId: 'south', label: 'South Central', value: 8 },
            { id: 'south-upper', parentId: 'south', label: 'South Upper', value: 20 },
            { id: 'south-lower', parentId: 'south', label: 'South Lower', value: 12 },
            { id: 'south-mid', parentId: 'south', label: 'South Mid', value: 18 },
            { id: 'east', label: 'East', value: 22 },
            { id: 'east-north', parentId: 'east', label: 'East North', value: 12 },
            { id: 'east-south', parentId: 'east', label: 'East South', value: 28 },
            { id: 'east-central', parentId: 'east', label: 'East Central', value: 20 },
            { id: 'east-upper', parentId: 'east', label: 'East Upper', value: 32 },
            { id: 'east-lower', parentId: 'east', label: 'East Lower', value: 16 },
            { id: 'east-mid', parentId: 'east', label: 'East Mid', value: 24 },
            { id: 'west', label: 'West', value: 28 },
            { id: 'west-north', parentId: 'west', label: 'West North', value: 32 },
            { id: 'west-south', parentId: 'west', label: 'West South', value: 24 },
            { id: 'west-central', parentId: 'west', label: 'West Central', value: 38 },
            { id: 'central', label: 'Central', value: 16 },
            { id: 'central-north', parentId: 'central', label: 'Central North', value: 14 },
            { id: 'central-south', parentId: 'central', label: 'Central South', value: 26 },
            { id: 'central-mid', parentId: 'central', label: 'Central Mid', value: 19 },
        ];

        const rowById = Object.fromEntries(rowData.map((row) => [row.id, row])) as Record<
            string,
            (typeof rowData)[number]
        >;

        const api = gridsManager.createGrid('parentIdDeltaSort', {
            columnDefs: [{ field: 'value' }],
            autoGroupColumnDef: { headerName: 'Region', cellRendererParams: { suppressCount: true } },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            treeData: true,
            deltaSort: true,
            treeDataParentIdField: 'parentId',
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'parentId tree data initial order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ south GROUP id:south ag-Grid-AutoColumn:"south" value:10
            │ ├── south-east LEAF id:south-east ag-Grid-AutoColumn:"south-east" value:5
            │ ├── south-central LEAF id:south-central ag-Grid-AutoColumn:"south-central" value:8
            │ ├── south-lower LEAF id:south-lower ag-Grid-AutoColumn:"south-lower" value:12
            │ ├── south-west LEAF id:south-west ag-Grid-AutoColumn:"south-west" value:15
            │ ├── south-mid LEAF id:south-mid ag-Grid-AutoColumn:"south-mid" value:18
            │ └── south-upper LEAF id:south-upper ag-Grid-AutoColumn:"south-upper" value:20
            ├─┬ central GROUP id:central ag-Grid-AutoColumn:"central" value:16
            │ ├── central-north LEAF id:central-north ag-Grid-AutoColumn:"central-north" value:14
            │ ├── central-mid LEAF id:central-mid ag-Grid-AutoColumn:"central-mid" value:19
            │ └── central-south LEAF id:central-south ag-Grid-AutoColumn:"central-south" value:26
            ├─┬ east GROUP id:east ag-Grid-AutoColumn:"east" value:22
            │ ├── east-north LEAF id:east-north ag-Grid-AutoColumn:"east-north" value:12
            │ ├── east-lower LEAF id:east-lower ag-Grid-AutoColumn:"east-lower" value:16
            │ ├── east-central LEAF id:east-central ag-Grid-AutoColumn:"east-central" value:20
            │ ├── east-mid LEAF id:east-mid ag-Grid-AutoColumn:"east-mid" value:24
            │ ├── east-south LEAF id:east-south ag-Grid-AutoColumn:"east-south" value:28
            │ └── east-upper LEAF id:east-upper ag-Grid-AutoColumn:"east-upper" value:32
            ├─┬ west GROUP id:west ag-Grid-AutoColumn:"west" value:28
            │ ├── west-south LEAF id:west-south ag-Grid-AutoColumn:"west-south" value:24
            │ ├── west-north LEAF id:west-north ag-Grid-AutoColumn:"west-north" value:32
            │ └── west-central LEAF id:west-central ag-Grid-AutoColumn:"west-central" value:38
            └─┬ north GROUP id:north ag-Grid-AutoColumn:"north" value:30
            · ├── north-central LEAF id:north-central ag-Grid-AutoColumn:"north-central" value:18
            · ├── north-lower LEAF id:north-lower ag-Grid-AutoColumn:"north-lower" value:22
            · ├── north-west LEAF id:north-west ag-Grid-AutoColumn:"north-west" value:25
            · ├── north-mid LEAF id:north-mid ag-Grid-AutoColumn:"north-mid" value:28
            · ├── north-east LEAF id:north-east ag-Grid-AutoColumn:"north-east" value:35
            · └── north-upper LEAF id:north-upper ag-Grid-AutoColumn:"north-upper" value:42
        `);

        const updateRow = (id: string, value: number) => ({ ...rowById[id], value });

        applyTransactionChecked(api, {
            update: [
                updateRow('south', 40),
                updateRow('south-east', 45),
                updateRow('north-east', 1),
                updateRow('east', 6),
                updateRow('east-south', 2),
            ],
        });

        await new GridRows(api, 'parentId tree data updated order').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ east GROUP id:east ag-Grid-AutoColumn:"east" value:6
            │ ├── east-south LEAF id:east-south ag-Grid-AutoColumn:"east-south" value:2
            │ ├── east-north LEAF id:east-north ag-Grid-AutoColumn:"east-north" value:12
            │ ├── east-lower LEAF id:east-lower ag-Grid-AutoColumn:"east-lower" value:16
            │ ├── east-central LEAF id:east-central ag-Grid-AutoColumn:"east-central" value:20
            │ ├── east-mid LEAF id:east-mid ag-Grid-AutoColumn:"east-mid" value:24
            │ └── east-upper LEAF id:east-upper ag-Grid-AutoColumn:"east-upper" value:32
            ├─┬ central GROUP id:central ag-Grid-AutoColumn:"central" value:16
            │ ├── central-north LEAF id:central-north ag-Grid-AutoColumn:"central-north" value:14
            │ ├── central-mid LEAF id:central-mid ag-Grid-AutoColumn:"central-mid" value:19
            │ └── central-south LEAF id:central-south ag-Grid-AutoColumn:"central-south" value:26
            ├─┬ west GROUP id:west ag-Grid-AutoColumn:"west" value:28
            │ ├── west-south LEAF id:west-south ag-Grid-AutoColumn:"west-south" value:24
            │ ├── west-north LEAF id:west-north ag-Grid-AutoColumn:"west-north" value:32
            │ └── west-central LEAF id:west-central ag-Grid-AutoColumn:"west-central" value:38
            ├─┬ north GROUP id:north ag-Grid-AutoColumn:"north" value:30
            │ ├── north-east LEAF id:north-east ag-Grid-AutoColumn:"north-east" value:1
            │ ├── north-central LEAF id:north-central ag-Grid-AutoColumn:"north-central" value:18
            │ ├── north-lower LEAF id:north-lower ag-Grid-AutoColumn:"north-lower" value:22
            │ ├── north-west LEAF id:north-west ag-Grid-AutoColumn:"north-west" value:25
            │ ├── north-mid LEAF id:north-mid ag-Grid-AutoColumn:"north-mid" value:28
            │ └── north-upper LEAF id:north-upper ag-Grid-AutoColumn:"north-upper" value:42
            └─┬ south GROUP id:south ag-Grid-AutoColumn:"south" value:40
            · ├── south-central LEAF id:south-central ag-Grid-AutoColumn:"south-central" value:8
            · ├── south-lower LEAF id:south-lower ag-Grid-AutoColumn:"south-lower" value:12
            · ├── south-west LEAF id:south-west ag-Grid-AutoColumn:"south-west" value:15
            · ├── south-mid LEAF id:south-mid ag-Grid-AutoColumn:"south-mid" value:18
            · ├── south-upper LEAF id:south-upper ag-Grid-AutoColumn:"south-upper" value:20
            · └── south-east LEAF id:south-east ag-Grid-AutoColumn:"south-east" value:45
        `);
    });
});
