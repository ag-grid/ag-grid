import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects, setRowDataChecked } from '../../../test-utils';

describe('ag-grid tree filter sort', () => {
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
    });
});
