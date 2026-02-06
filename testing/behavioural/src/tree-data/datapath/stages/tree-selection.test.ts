import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridActions } from '../../../selection/utils';
import { GridRows, TestGridsManager, assertSelectedRowElementsById, cachedJSONObjects } from '../../../test-utils';

describe('ag-grid tree selection', () => {
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

    test('tree selection and update', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
            { id: '6', name: 'Linus Torvalds', orgHierarchy: ['A', 'C', 'F'] },
            { id: '7', name: 'Brian Kernighan', orgHierarchy: ['A', 'C', 'G'] },
            { id: '8', name: 'Claude Elwood Shannon', orgHierarchy: ['A', 'C', 'H', 'I'] },
            { id: '9', name: 'E. Dijkstra', orgHierarchy: ['J'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        api.setNodesSelected({
            nodes: [
                api.getRowNode('1')!,
                api.getRowNode('3')!,
                api.getRowNode('4')!,
                api.getRowNode('row-group-0-A-1-C-2-H')!,
                api.getRowNode('9')!,
            ],
            newValue: true,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP selected id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            │ ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            │ │ ├── D LEAF selected id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            │ │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            │ └─┬ C GROUP selected id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
            │ · ├── F LEAF id:6 ag-Grid-AutoColumn:"F" name:"Linus Torvalds"
            │ · ├── G LEAF id:7 ag-Grid-AutoColumn:"G" name:"Brian Kernighan"
            │ · └─┬ H filler selected id:row-group-0-A-1-C-2-H ag-Grid-AutoColumn:"H"
            │ · · └── I LEAF id:8 ag-Grid-AutoColumn:"I" name:"Claude Elwood Shannon"
            └── J LEAF selected id:9 ag-Grid-AutoColumn:"J" name:"E. Dijkstra"
        `);

        api.setNodesSelected({
            nodes: [api.getRowNode('8')!],
            newValue: true,
        });

        await new GridRows(api, 'select 8').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP selected id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            │ ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            │ │ ├── D LEAF selected id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            │ │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            │ └─┬ C GROUP selected id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
            │ · ├── F LEAF id:6 ag-Grid-AutoColumn:"F" name:"Linus Torvalds"
            │ · ├── G LEAF id:7 ag-Grid-AutoColumn:"G" name:"Brian Kernighan"
            │ · └─┬ H filler selected id:row-group-0-A-1-C-2-H ag-Grid-AutoColumn:"H"
            │ · · └── I LEAF selected id:8 ag-Grid-AutoColumn:"I" name:"Claude Elwood Shannon"
            └── J LEAF selected id:9 ag-Grid-AutoColumn:"J" name:"E. Dijkstra"
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '6', name: 'Linus Torvalds', orgHierarchy: ['A', 'Y', 'F'] },
                { id: '7', name: 'Brian Kernighan', orgHierarchy: ['A', 'X', 'G'] },
                { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
                { id: '3', name: 'A. Church', orgHierarchy: ['A', 'X'] },
                { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
                { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'Y', 'E'] },
                { id: '9', name: 'E. Dijkstra', orgHierarchy: ['J'] },
            ])
        );

        await new GridRows(api, 'rowData 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP selected id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            │ ├─┬ Y filler id:row-group-0-A-1-Y ag-Grid-AutoColumn:"Y"
            │ │ ├── F LEAF id:6 ag-Grid-AutoColumn:"F" name:"Linus Torvalds"
            │ │ └── E LEAF id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            │ ├── B LEAF id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            │ └─┬ X GROUP selected id:3 ag-Grid-AutoColumn:"X" name:"A. Church"
            │ · └── G LEAF id:7 ag-Grid-AutoColumn:"G" name:"Brian Kernighan"
            └── J LEAF selected id:9 ag-Grid-AutoColumn:"J" name:"E. Dijkstra"
        `);

        api.setFilterModel({ name: { type: 'equals', filter: 'A. Church' } });

        await new GridRows(api, 'filtered').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP selected id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            · └─┬ X GROUP selected id:3 ag-Grid-AutoColumn:"X" name:"A. Church"
            · · └── G LEAF id:7 ag-Grid-AutoColumn:"G" name:"Brian Kernighan"
        `);
    });

    test('parent with unselectable children is selectable when groupSelects: "descendants" and isRowSelectable: true for parent', () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
            { id: '6', name: 'Linus Torvalds', orgHierarchy: ['A', 'C', 'F'] },
            { id: '7', name: 'Brian Kernighan', orgHierarchy: ['A', 'C', 'G'] },
            { id: '8', name: 'Claude Elwood Shannon', orgHierarchy: ['A', 'C', 'H', 'I'] },
            { id: '9', name: 'E. Dijkstra', orgHierarchy: ['J'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                isRowSelectable: (node) => ['1', '2', '9'].includes(node.id!),
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const actions = new GridActions(api, '#myGrid');

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById(['2'], api);
        expect(api.getRowNode('2')?.selectable).toBe(true);

        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            groupSelects: 'descendants',
            isRowSelectable: (node) => ['1', '9'].includes(node.id!),
        });

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById([], api);
        expect(api.getRowNode('2')?.selectable).toBe(false);
    });

    test('parent with unselectable children is selectable when groupSelects: "filteredDescendants" and isRowSelectable: true for parent', () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] },
            { id: '6', name: 'Linus Torvalds', orgHierarchy: ['A', 'C', 'F'] },
            { id: '7', name: 'Brian Kernighan', orgHierarchy: ['A', 'C', 'G'] },
            { id: '8', name: 'Claude Elwood Shannon', orgHierarchy: ['A', 'C', 'H', 'I'] },
            { id: '9', name: 'E. Dijkstra', orgHierarchy: ['J'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'filteredDescendants',
                isRowSelectable: (node) => ['1', '2', '9'].includes(node.id!),
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const actions = new GridActions(api, '#myGrid');

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById(['2'], api);
        expect(api.getRowNode('2')?.selectable).toBe(true);

        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            groupSelects: 'filteredDescendants',
            isRowSelectable: (node) => ['1', '9'].includes(node.id!),
        });

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById([], api);
        expect(api.getRowNode('2')?.selectable).toBe(false);
    });
});
