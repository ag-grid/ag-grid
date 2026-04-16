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

describe('ag-grid tree filter sort', () => {
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
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        await new GridRows(api, 'filter 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        setRowDataChecked(api, [
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '5', name: 'A. Church', orgHierarchy: ['A', 'B', 'E'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
        ]);

        await new GridRows(api, 'filter 1 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"A. Church"
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Grace Hopper' } });

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'filter 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · · └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
        `);

        setRowDataChecked(api, [
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Grace Hopper', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C', 'J'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E', 'W'] },
            { id: '6', name: 'unknown', orgHierarchy: ['A', 'C', 'K'] },
        ]);

        await new GridRows(api, 'filter 2 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Grace Hopper"
            · · ├── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · · └─┬ E filler id:row-group-0-A-1-B-2-E ag-Grid-AutoColumn:"E"
            · · · └── W LEAF id:5 ag-Grid-AutoColumn:"W" name:"Grace Hopper"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Donald Knuth' } });

        await new GridRows(api, 'filter 3 rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Grace Hopper"
            · · └── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'filter 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · · └── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'Kurt Gödel' } });

        await new GridRows(api, 'filter 4').check(`
            ROOT id:ROOT_NODE_ID
        `);

        setRowDataChecked(api, [
            { id: '1', name: 'Kurt Gödel', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
        ]);

        await new GridRows(api, 'filter 4 rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"Kurt Gödel"
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        api.setFilterModel({});

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'no filter').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            · │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            └── name "Name" width:200
        `);
    });

    test('tree with sort', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
            { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            { id: '3', value: 15, x: 1, orgHierarchy: ['A', 'C'] },
            { id: '4', value: 13, x: 1, orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', value: 11, x: 0, orgHierarchy: ['A', 'B', 'E'] },
            { id: '6', value: 10, x: 0, orgHierarchy: ['A', 'F', 'G'] },
            { id: '7', value: 16, x: 1, orgHierarchy: ['A', 'F', 'H'] },
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
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:1
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · · ├── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
            · · └── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'asc' }],
        });

        await new GridRows(api, 'sort value asc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · │ ├── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
            · │ └── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · · ├── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
            · · └── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:1
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '7', value: 16, x: 1, orgHierarchy: ['A', 'F', 'H'] },
                { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
                { id: '6', value: 10, x: 0, orgHierarchy: ['A', 'F', 'G'] },
                { id: '3', value: 15, x: 1, orgHierarchy: ['A', 'C'] },
                { id: '5', value: 11, x: 0, orgHierarchy: ['A', 'B', 'e'] },
                { id: '4', value: 13, x: 1, orgHierarchy: ['A', 'B', 'd'] },
                { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            ])
        );

        await new GridRows(api, 'sort value asc rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · │ ├── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
            · │ └── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · · ├── e LEAF id:5 ag-Grid-AutoColumn:"e" value:11 x:0
            · · └── d LEAF id:4 ag-Grid-AutoColumn:"d" value:13 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'value', sort: 'desc' }],
        });

        await new GridRows(api, 'sort value desc  rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── d LEAF id:4 ag-Grid-AutoColumn:"d" value:13 x:1
            · │ └── e LEAF id:5 ag-Grid-AutoColumn:"e" value:11 x:0
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · · ├── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · · └── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'sort value desc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:1
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · · ├── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · · └── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
        `);

        api.applyColumnState({
            state: [
                { colId: 'value', sort: null },
                { colId: 'x', sort: 'asc' },
            ],
        });

        await new GridRows(api, 'sort x asc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · │ ├── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
            · │ └── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
            · │ └── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:1
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'desc' }],
        });

        await new GridRows(api, 'sort x desc').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:1
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:1
            · └─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · · ├── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · · └── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '7', value: 16, x: 1, orgHierarchy: ['A', 'F', 'H'] },
                { id: '1', value: 12, x: 1, orgHierarchy: ['A'] },
                { id: '6', value: 10, x: 1, orgHierarchy: ['A', 'F', 'G'] },
                { id: '3', value: 15, x: 0, orgHierarchy: ['A', 'C'] },
                { id: '5', value: 11, x: 1, orgHierarchy: ['A', 'B', 'E'] },
                { id: '4', value: 13, x: 0, orgHierarchy: ['A', 'B', 'D'] },
                { id: '2', value: 17, x: 1, orgHierarchy: ['A', 'B'] },
            ])
        );

        await new GridRows(api, 'sort x desc rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ ├── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:1
            · │ └── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:0
            · ├── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:0
            · └─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · · ├── H LEAF id:7 ag-Grid-AutoColumn:"H" value:16 x:1
            · · └── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:1
        `);

        api.setFilterModel({ x: { type: 'equals', filter: 0 } });

        await new GridRows(api, 'sort x desc, filter x===0, rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ └── D LEAF id:4 ag-Grid-AutoColumn:"D" value:13 x:0
            · └── C LEAF id:3 ag-Grid-AutoColumn:"C" value:15 x:0
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'sort x desc, filter x===0, rowData 3').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
            · └─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · · └── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
        `);

        api.applyColumnState({
            state: [{ colId: 'x', sort: 'asc' }],
        });

        await new GridRows(api, 'sort x desc, filter x===0').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" value:12 x:1
            · ├─┬ F filler id:row-group-0-A-1-F ag-Grid-AutoColumn:"F"
            · │ └── G LEAF id:6 ag-Grid-AutoColumn:"G" value:10 x:0
            · └─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" value:17 x:1
            · · └── E LEAF id:5 ag-Grid-AutoColumn:"E" value:11 x:0
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            ├── value "Value" width:200
            └── x "X" width:200 sort:asc filter
        `);
    });

    test('delta sorting keeps tree data with data paths ordered after updates', async () => {
        const rowData = [
            { id: 'home', value: 15, orgHierarchy: ['Home'] },
            { id: 'garden', value: 12, orgHierarchy: ['Home', 'Garden'] },
            { id: 'kitchen', value: 25, orgHierarchy: ['Home', 'Kitchen'] },
            { id: 'bathroom', value: 8, orgHierarchy: ['Home', 'Bathroom'] },
            { id: 'electronics', value: 30, orgHierarchy: ['Electronics'] },
            { id: 'phones', value: 5, orgHierarchy: ['Electronics', 'Phones'] },
            { id: 'laptops', value: 40, orgHierarchy: ['Electronics', 'Laptops'] },
            { id: 'tablets', value: 20, orgHierarchy: ['Electronics', 'Tablets'] },
            { id: 'cameras', value: 33, orgHierarchy: ['Electronics', 'Cameras'] },
            { id: 'tvs', value: 45, orgHierarchy: ['Electronics', 'TVs'] },
            { id: 'headphones', value: 15, orgHierarchy: ['Electronics', 'Headphones'] },
            { id: 'furniture', value: 18, orgHierarchy: ['Furniture'] },
            { id: 'chairs', value: 10, orgHierarchy: ['Furniture', 'Chairs'] },
            { id: 'tables', value: 35, orgHierarchy: ['Furniture', 'Tables'] },
            { id: 'sofas', value: 22, orgHierarchy: ['Furniture', 'Sofas'] },
            { id: 'clothing', value: 14, orgHierarchy: ['Clothing'] },
            { id: 'shirts', value: 6, orgHierarchy: ['Clothing', 'Shirts'] },
            { id: 'pants', value: 28, orgHierarchy: ['Clothing', 'Pants'] },
            { id: 'jackets', value: 16, orgHierarchy: ['Clothing', 'Jackets'] },
            { id: 'shoes', value: 32, orgHierarchy: ['Clothing', 'Shoes'] },
            { id: 'hats', value: 9, orgHierarchy: ['Clothing', 'Hats'] },
            { id: 'socks', value: 4, orgHierarchy: ['Clothing', 'Socks'] },
            { id: 'books', value: 22, orgHierarchy: ['Books'] },
            { id: 'fiction', value: 11, orgHierarchy: ['Books', 'Fiction'] },
            { id: 'nonfiction', value: 38, orgHierarchy: ['Books', 'Nonfiction'] },
            { id: 'magazines', value: 19, orgHierarchy: ['Books', 'Magazines'] },
            { id: 'comics', value: 13, orgHierarchy: ['Books', 'Comics'] },
            { id: 'textbooks', value: 42, orgHierarchy: ['Books', 'Textbooks'] },
            { id: 'cookbooks', value: 24, orgHierarchy: ['Books', 'Cookbooks'] },
        ];

        const rowById = Object.fromEntries(rowData.map((row) => [row.id, row])) as Record<
            string,
            (typeof rowData)[number]
        >;

        const api = gridsManager.createGrid('treeDataDeltaSort', {
            columnDefs: [{ field: 'value' }],
            autoGroupColumnDef: { headerName: 'Hierarchy', cellRendererParams: { suppressCount: true } },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            treeData: true,
            deltaSort: true,
            getDataPath: (data) => data.orgHierarchy,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'tree data delta sort initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Clothing GROUP id:clothing ag-Grid-AutoColumn:"Clothing" value:14
            │ ├── Socks LEAF id:socks ag-Grid-AutoColumn:"Socks" value:4
            │ ├── Shirts LEAF id:shirts ag-Grid-AutoColumn:"Shirts" value:6
            │ ├── Hats LEAF id:hats ag-Grid-AutoColumn:"Hats" value:9
            │ ├── Jackets LEAF id:jackets ag-Grid-AutoColumn:"Jackets" value:16
            │ ├── Pants LEAF id:pants ag-Grid-AutoColumn:"Pants" value:28
            │ └── Shoes LEAF id:shoes ag-Grid-AutoColumn:"Shoes" value:32
            ├─┬ Home GROUP id:home ag-Grid-AutoColumn:"Home" value:15
            │ ├── Bathroom LEAF id:bathroom ag-Grid-AutoColumn:"Bathroom" value:8
            │ ├── Garden LEAF id:garden ag-Grid-AutoColumn:"Garden" value:12
            │ └── Kitchen LEAF id:kitchen ag-Grid-AutoColumn:"Kitchen" value:25
            ├─┬ Furniture GROUP id:furniture ag-Grid-AutoColumn:"Furniture" value:18
            │ ├── Chairs LEAF id:chairs ag-Grid-AutoColumn:"Chairs" value:10
            │ ├── Sofas LEAF id:sofas ag-Grid-AutoColumn:"Sofas" value:22
            │ └── Tables LEAF id:tables ag-Grid-AutoColumn:"Tables" value:35
            ├─┬ Books GROUP id:books ag-Grid-AutoColumn:"Books" value:22
            │ ├── Fiction LEAF id:fiction ag-Grid-AutoColumn:"Fiction" value:11
            │ ├── Comics LEAF id:comics ag-Grid-AutoColumn:"Comics" value:13
            │ ├── Magazines LEAF id:magazines ag-Grid-AutoColumn:"Magazines" value:19
            │ ├── Cookbooks LEAF id:cookbooks ag-Grid-AutoColumn:"Cookbooks" value:24
            │ ├── Nonfiction LEAF id:nonfiction ag-Grid-AutoColumn:"Nonfiction" value:38
            │ └── Textbooks LEAF id:textbooks ag-Grid-AutoColumn:"Textbooks" value:42
            └─┬ Electronics GROUP id:electronics ag-Grid-AutoColumn:"Electronics" value:30
            · ├── Phones LEAF id:phones ag-Grid-AutoColumn:"Phones" value:5
            · ├── Headphones LEAF id:headphones ag-Grid-AutoColumn:"Headphones" value:15
            · ├── Tablets LEAF id:tablets ag-Grid-AutoColumn:"Tablets" value:20
            · ├── Cameras LEAF id:cameras ag-Grid-AutoColumn:"Cameras" value:33
            · ├── Laptops LEAF id:laptops ag-Grid-AutoColumn:"Laptops" value:40
            · └── TVs LEAF id:tvs ag-Grid-AutoColumn:"TVs" value:45
        `);

        const updateRow = (id: string, value: number) => ({ ...rowById[id], value });

        applyTransactionChecked(api, {
            update: [
                updateRow('electronics', 5),
                updateRow('phones', 60),
                updateRow('kitchen', 1),
                updateRow('books', 3),
                updateRow('nonfiction', 2),
            ],
        });

        await new GridRows(api, 'tree data delta sort updated').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ Books GROUP id:books ag-Grid-AutoColumn:"Books" value:3
            │ ├── Nonfiction LEAF id:nonfiction ag-Grid-AutoColumn:"Nonfiction" value:2
            │ ├── Fiction LEAF id:fiction ag-Grid-AutoColumn:"Fiction" value:11
            │ ├── Comics LEAF id:comics ag-Grid-AutoColumn:"Comics" value:13
            │ ├── Magazines LEAF id:magazines ag-Grid-AutoColumn:"Magazines" value:19
            │ ├── Cookbooks LEAF id:cookbooks ag-Grid-AutoColumn:"Cookbooks" value:24
            │ └── Textbooks LEAF id:textbooks ag-Grid-AutoColumn:"Textbooks" value:42
            ├─┬ Electronics GROUP id:electronics ag-Grid-AutoColumn:"Electronics" value:5
            │ ├── Headphones LEAF id:headphones ag-Grid-AutoColumn:"Headphones" value:15
            │ ├── Tablets LEAF id:tablets ag-Grid-AutoColumn:"Tablets" value:20
            │ ├── Cameras LEAF id:cameras ag-Grid-AutoColumn:"Cameras" value:33
            │ ├── Laptops LEAF id:laptops ag-Grid-AutoColumn:"Laptops" value:40
            │ ├── TVs LEAF id:tvs ag-Grid-AutoColumn:"TVs" value:45
            │ └── Phones LEAF id:phones ag-Grid-AutoColumn:"Phones" value:60
            ├─┬ Clothing GROUP id:clothing ag-Grid-AutoColumn:"Clothing" value:14
            │ ├── Socks LEAF id:socks ag-Grid-AutoColumn:"Socks" value:4
            │ ├── Shirts LEAF id:shirts ag-Grid-AutoColumn:"Shirts" value:6
            │ ├── Hats LEAF id:hats ag-Grid-AutoColumn:"Hats" value:9
            │ ├── Jackets LEAF id:jackets ag-Grid-AutoColumn:"Jackets" value:16
            │ ├── Pants LEAF id:pants ag-Grid-AutoColumn:"Pants" value:28
            │ └── Shoes LEAF id:shoes ag-Grid-AutoColumn:"Shoes" value:32
            ├─┬ Home GROUP id:home ag-Grid-AutoColumn:"Home" value:15
            │ ├── Kitchen LEAF id:kitchen ag-Grid-AutoColumn:"Kitchen" value:1
            │ ├── Bathroom LEAF id:bathroom ag-Grid-AutoColumn:"Bathroom" value:8
            │ └── Garden LEAF id:garden ag-Grid-AutoColumn:"Garden" value:12
            └─┬ Furniture GROUP id:furniture ag-Grid-AutoColumn:"Furniture" value:18
            · ├── Chairs LEAF id:chairs ag-Grid-AutoColumn:"Chairs" value:10
            · ├── Sofas LEAF id:sofas ag-Grid-AutoColumn:"Sofas" value:22
            · └── Tables LEAF id:tables ag-Grid-AutoColumn:"Tables" value:35
        `);
    });
});
