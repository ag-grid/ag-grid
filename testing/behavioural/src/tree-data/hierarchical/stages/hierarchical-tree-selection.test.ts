import { ClientSideRowModelModule, RowSelectionModule, TextFilterModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridActions } from '../../../selection/utils';
import { GridColumns, GridRows, TestGridsManager, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid hierarchical tree selection', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, RowSelectionModule, ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        vitest.useRealTimers();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('tree selection and update', async () => {
        const rowData = cachedJSONObjects.array([
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
                    {
                        id: '3',
                        k: 'C',
                        name: 'A. Church',
                        children: [
                            { id: '6', k: 'F', name: 'Linus Torvalds' },
                            { id: '7', k: 'G', name: 'Brian Kernighan' },
                            {
                                id: 'h',
                                k: 'H',
                                children: [
                                    {
                                        id: '8',
                                        k: 'I',
                                        name: 'Claude Elwood Shannon',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            { id: '9', k: 'J', name: 'E. Dijkstra' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'k' }, { field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        api.setNodesSelected({
            nodes: [
                api.getRowNode('1')!,
                api.getRowNode('3')!,
                api.getRowNode('4')!,
                api.getRowNode('h')!,
                api.getRowNode('9')!,
            ],
            newValue: true,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP selected id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            │ ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            │ │ ├── 4 LEAF selected id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
            │ │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
            │ └─┬ 3 GROUP selected id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
            │ · ├── 6 LEAF id:6 ag-Grid-AutoColumn:"6" k:"F" name:"Linus Torvalds"
            │ · ├── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"G" name:"Brian Kernighan"
            │ · └─┬ h GROUP selected id:h ag-Grid-AutoColumn:"h" k:"H"
            │ · · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" k:"I" name:"Claude Elwood Shannon"
            └── 9 LEAF selected id:9 ag-Grid-AutoColumn:"9" k:"J" name:"E. Dijkstra"
        `);

        api.setNodesSelected({
            nodes: [api.getRowNode('8')!],
            newValue: true,
        });

        await new GridRows(api, 'select 8').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP selected id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            │ ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            │ │ ├── 4 LEAF selected id:4 ag-Grid-AutoColumn:"4" k:"D" name:"Donald Knuth"
            │ │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
            │ └─┬ 3 GROUP selected id:3 ag-Grid-AutoColumn:"3" k:"C" name:"A. Church"
            │ · ├── 6 LEAF id:6 ag-Grid-AutoColumn:"6" k:"F" name:"Linus Torvalds"
            │ · ├── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"G" name:"Brian Kernighan"
            │ · └─┬ h GROUP selected id:h ag-Grid-AutoColumn:"h" k:"H"
            │ · · └── 8 LEAF selected id:8 ag-Grid-AutoColumn:"8" k:"I" name:"Claude Elwood Shannon"
            └── 9 LEAF selected id:9 ag-Grid-AutoColumn:"9" k:"J" name:"E. Dijkstra"
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                {
                    id: '1',
                    k: 'A',
                    name: 'John Von Neumann',
                    children: [
                        {
                            id: 'y',
                            k: 'Y',
                            children: [
                                { id: '6', k: 'F', name: 'Linus Torvalds' },
                                { id: '5', k: 'E', name: 'Grace Hopper' },
                            ],
                        },
                        {
                            id: '2',
                            k: 'B',
                            name: 'Alan Turing',
                        },
                        {
                            id: '3',
                            k: 'X',
                            name: 'A. Church',
                            children: [{ id: '7', k: 'G', name: 'Brian Kernighan' }],
                        },
                    ],
                },
                { id: '9', k: 'J', name: 'E. Dijkstra' },
            ])
        );

        await new GridRows(api, 'rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP selected id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            │ ├─┬ y GROUP id:y ag-Grid-AutoColumn:"y" k:"Y"
            │ │ ├── 6 LEAF id:6 ag-Grid-AutoColumn:"6" k:"F" name:"Linus Torvalds"
            │ │ └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" k:"E" name:"Grace Hopper"
            │ ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2" k:"B" name:"Alan Turing"
            │ └─┬ 3 GROUP selected id:3 ag-Grid-AutoColumn:"3" k:"X" name:"A. Church"
            │ · └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"G" name:"Brian Kernighan"
            └── 9 LEAF selected id:9 ag-Grid-AutoColumn:"9" k:"J" name:"E. Dijkstra"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        await new GridRows(api, 'filtered').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ 1 GROUP selected id:1 ag-Grid-AutoColumn:"1" k:"A" name:"John Von Neumann"
            · └─┬ 3 GROUP selected id:3 ag-Grid-AutoColumn:"3" k:"X" name:"A. Church"
            · · └── 7 LEAF id:7 ag-Grid-AutoColumn:"7" k:"G" name:"Brian Kernighan"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            ├── k "K" width:200
            └── name "Name" width:200 filter
        `);
    });

    test('SHIFT-click does not select hidden descendants of collapsed tree nodes', async () => {
        const rowData = cachedJSONObjects.array([
            {
                id: 'A',
                name: 'Root',
                children: [
                    {
                        id: 'B',
                        name: 'Node B',
                        children: [
                            { id: 'D', name: 'Leaf D' },
                            { id: 'E', name: 'Leaf E' },
                        ],
                    },
                    {
                        id: 'C',
                        name: 'Node C',
                        children: [
                            { id: 'F', name: 'Leaf F' },
                            { id: 'G', name: 'Leaf G' },
                        ],
                    },
                ],
            },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            rowSelection: { mode: 'multiRow', enableClickSelection: true, checkboxes: false, headerCheckbox: false },
            groupDefaultExpanded: 1,
            rowData,
            getRowId: (params) => params.data.id,
        });

        // Displayed rows: Root (idx 0), Node B (idx 1, collapsed), Node C (idx 2, collapsed)
        // Leaf nodes D, E, F, G are hidden inside their collapsed parents
        const actions = new GridActions(api);
        actions.clickRowByIndex(1); // click Node B
        actions.clickRowByIndex(2, { shiftKey: true }); // shift-click Node C

        await new GridRows(api, 'after shift-click').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A" name:"Root"
            · ├─┬ B GROUP selected collapsed id:B ag-Grid-AutoColumn:"B" name:"Node B"
            · │ ├── D LEAF hidden id:D ag-Grid-AutoColumn:"D" name:"Leaf D"
            · │ └── E LEAF hidden id:E ag-Grid-AutoColumn:"E" name:"Leaf E"
            · └─┬ C GROUP selected collapsed id:C ag-Grid-AutoColumn:"C" name:"Node C"
            · · ├── F LEAF hidden id:F ag-Grid-AutoColumn:"F" name:"Leaf F"
            · · └── G LEAF hidden id:G ag-Grid-AutoColumn:"G" name:"Leaf G"
        `);
    });
});
