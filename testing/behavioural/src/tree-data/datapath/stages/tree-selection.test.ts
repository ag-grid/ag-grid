import { ClientSideRowModelModule, RowSelectionModule, TextFilterModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridActions } from '../../../selection/utils';
import {
    GridColumns,
    GridRows,
    TestGridsManager,
    assertElementDisplayed,
    assertSelectedRowElementsById,
    cachedJSONObjects,
} from '../../../test-utils';

describe('ag-grid tree selection', () => {
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

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            └── name "Name" width:200 filter
        `);
    });

    // Consistent with row grouping: with groupSelects: 'descendants', a group is selectable only if it
    // has a selectable descendant. isRowSelectable returning true for the group itself does not make it
    // selectable when none of its descendants are selectable.
    test('group selectability follows selectable descendants when groupSelects: "descendants"', async () => {
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
                // groups '1' (A) and '2' (B) are listed but none of their leaf descendants are
                isRowSelectable: (node) => ['1', '2', '9'].includes(node.id!),
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const actions = new GridActions(api, '#myGrid');

        // groups have no selectable descendant, so they are not selectable; only leaf '9' is
        expect(api.getRowNode('1')?.selectable).toBe(false);
        expect(api.getRowNode('2')?.selectable).toBe(false);
        expect(api.getRowNode('9')?.selectable).toBe(true);

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById([], api);

        actions.toggleCheckboxById('9');
        assertSelectedRowElementsById(['9'], api);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Hierarchy" width:200
            └── name "Name" width:200
        `);
    });

    // The flip side: a group with a selectable descendant is itself selectable, so selecting it
    // cascades down to the selectable descendants (consistent with row grouping).
    test('group is selectable via a selectable descendant when groupSelects: "descendants"', async () => {
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
                // only leaf '4' (D) is selectable
                isRowSelectable: (node) => node.id === '4',
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const actions = new GridActions(api, '#myGrid');

        // D's ancestors (A, B) are selectable via the descendant; C (no selectable descendant) is not
        expect(api.getRowNode('4')?.selectable).toBe(true);
        expect(api.getRowNode('2')?.selectable).toBe(true);
        expect(api.getRowNode('1')?.selectable).toBe(true);
        expect(api.getRowNode('3')?.selectable).toBe(false);

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById(['1', '2', '4'], api);
    });

    // Changing isRowSelectable at runtime must recompute group/filler selectability from the NEW leaf
    // state, not the stale pre-change values, when groupSelects: 'descendants'.
    test('runtime isRowSelectable change recomputes group selectability with groupSelects: "descendants"', async () => {
        const rowData = cachedJSONObjects.array([
            { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] },
            { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] },
            { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] },
            { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] },
            { id: '6', name: 'Linus Torvalds', orgHierarchy: ['A', 'C', 'F'] },
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
                // only leaf '4' (D, under B) is selectable
                isRowSelectable: (node) => node.id === '4',
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        // D selectable -> ancestors A, B selectable; C (with leaf F) not
        expect(api.getRowNode('2')?.selectable).toBe(true);
        expect(api.getRowNode('3')?.selectable).toBe(false);

        // flip the selectable leaf from D (under B) to F (under C)
        api.setGridOption('rowSelection', {
            mode: 'multiRow',
            groupSelects: 'descendants',
            isRowSelectable: (node) => node.id === '6',
        });

        await new GridRows(api, 'after runtime isRowSelectable change').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            │ ├─┬ B GROUP 🚫 id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            │ │ └── D LEAF 🚫 id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            │ └─┬ C GROUP id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
            │ · └── F LEAF id:6 ag-Grid-AutoColumn:"F" name:"Linus Torvalds"
            └── J LEAF 🚫 id:9 ag-Grid-AutoColumn:"J" name:"E. Dijkstra"
        `);

        // B lost its selectable descendant, C gained one
        expect(api.getRowNode('2')?.selectable).toBe(false);
        expect(api.getRowNode('3')?.selectable).toBe(true);
        expect(api.getRowNode('4')?.selectable).toBe(false);
        expect(api.getRowNode('6')?.selectable).toBe(true);

        // clearing isRowSelectable must reset every node (groups and leaves) back to selectable
        api.setGridOption('rowSelection', { mode: 'multiRow', groupSelects: 'descendants' });

        for (const id of ['1', '2', '3', '4', '6', '9']) {
            expect(api.getRowNode(id)?.selectable).toBe(true);
        }
    });

    const SELECTABLE_TREE = [
        { id: '1', name: 'John Von Neumann', orgHierarchy: ['A'] }, // group with data
        { id: '2', name: 'Alan Turing', orgHierarchy: ['A', 'B'] }, // group with data
        { id: '3', name: 'A. Church', orgHierarchy: ['A', 'C'] }, // group with data
        { id: '4', name: 'Donald Knuth', orgHierarchy: ['A', 'B', 'D'] }, // leaf
        { id: '6', name: 'Linus Torvalds', orgHierarchy: ['A', 'C', 'F'] }, // leaf
        { id: '9', name: 'E. Dijkstra', orgHierarchy: ['J'] }, // leaf
    ];

    // isRowSelectable is a user callback, so it must run once per node and only on the fully-formed node
    // (never on the half-formed leaf phase of a node that becomes a group). groupSelects:'self' applies it
    // to every node, so it is the cleanest exact-count check.
    test('isRowSelectable is invoked exactly once per node, on the fully-formed node (groupSelects: "self")', async () => {
        const counts: Record<string, number> = {};
        const groupAtCall: Record<string, boolean> = {};

        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'self',
                isRowSelectable: (node) => {
                    const id = node.id!;
                    counts[id] = (counts[id] ?? 0) + 1;
                    groupAtCall[id] = !!node.group;
                    return true;
                },
            },
            groupDefaultExpanded: -1,
            rowData: cachedJSONObjects.array(SELECTABLE_TREE),
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        // every node exactly once
        expect(counts).toEqual({ '1': 1, '2': 1, '3': 1, '4': 1, '6': 1, '9': 1 });
        // groups-with-data were fully formed (group===true) when the callback ran, not in the leaf phase
        expect(groupAtCall).toEqual({ '1': true, '2': true, '3': true, '4': false, '6': false, '9': false });
    });

    // Every mutation invokes isRowSelectable at most once per affected node — never double. Refresh-driven
    // changes (transactions) are owned by the grouping pass; a standalone setData (no refresh) computes inline.
    test('isRowSelectable runs at most once per node across mutations (groupSelects: "self")', async () => {
        const counts: Record<string, number> = {};
        const reset = () => {
            for (const k of Object.keys(counts)) {
                delete counts[k];
            }
        };
        const assertNoDouble = () => {
            for (const id of Object.keys(counts)) {
                expect(counts[id]).toBe(1);
            }
        };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'self',
                isRowSelectable: (node) => {
                    const id = node.id!;
                    counts[id] = (counts[id] ?? 0) + 1;
                    return true;
                },
            },
            groupDefaultExpanded: -1,
            rowData: cachedJSONObjects.array(SELECTABLE_TREE),
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });
        assertNoDouble();

        reset();
        api.applyTransaction({ add: [{ id: '5', name: 'Grace Hopper', orgHierarchy: ['A', 'B', 'E'] }] });
        expect(counts['5']).toBe(1); // new leaf computed once, on the fully-formed node
        assertNoDouble();

        reset();
        api.applyTransaction({ update: [{ id: '4', name: 'Donald E. Knuth', orgHierarchy: ['A', 'B', 'D'] }] });
        expect(counts['4']).toBe(1); // updated node computed exactly once (was twice before: listener + pass)
        assertNoDouble();

        reset();
        api.getRowNode('4')!.setData({ id: '4', name: 'Don Knuth', orgHierarchy: ['A', 'B', 'D'] });
        expect(counts['4']).toBe(1); // standalone setData: no refresh, so computed inline, once
        assertNoDouble();
    });

    // A transaction that changes one leaf must not re-invoke isRowSelectable on its unchanged siblings —
    // only changed leaves are recomputed; the rest keep their cached selectable.
    test.each(['descendants', 'self'] as const)(
        'transaction update recomputes only the changed leaf, not unchanged siblings (groupSelects: "%s")',
        async (groupSelects) => {
            const counts: Record<string, number> = {};
            const rowData = cachedJSONObjects.array([
                { id: '1', value: 0, orgHierarchy: ['A'] },
                { id: '2', value: 0, orgHierarchy: ['A', 'B'] },
                { id: '4', value: 0, orgHierarchy: ['A', 'B', 'D'] }, // leaf under B
                { id: '5', value: 0, orgHierarchy: ['A', 'B', 'E'] }, // sibling leaf under B
            ]);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'value' }],
                autoGroupColumnDef: { headerName: 'Hierarchy' },
                treeData: true,
                animateRows: false,
                rowSelection: {
                    mode: 'multiRow',
                    groupSelects,
                    isRowSelectable: (node) => {
                        const id = node.id!;
                        counts[id] = (counts[id] ?? 0) + 1;
                        return true;
                    },
                },
                groupDefaultExpanded: -1,
                rowData,
                getRowId: (params) => params.data.id,
                getDataPath: (data: any) => data.orgHierarchy,
            });

            for (const id of Object.keys(counts)) {
                delete counts[id];
            }
            api.applyTransaction({ update: [{ id: '4', value: 1, orgHierarchy: ['A', 'B', 'D'] }] });

            expect(counts['4']).toBe(1); // the changed leaf is recomputed
            expect(counts['5'] ?? 0).toBe(0); // its unchanged sibling is not
        }
    );

    // Under groupSelects:'descendants' a group's selectable is a pure rollup of its descendants, so the
    // callback is never invoked on group nodes — only on leaves, exactly once.
    test('isRowSelectable is invoked only on leaves (never groups) with groupSelects: "descendants"', async () => {
        const counts: Record<string, number> = {};

        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'descendants',
                isRowSelectable: (node) => {
                    const id = node.id!;
                    counts[id] = (counts[id] ?? 0) + 1;
                    return true;
                },
            },
            groupDefaultExpanded: -1,
            rowData: cachedJSONObjects.array(SELECTABLE_TREE),
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        // only leaves 4, 6, 9 — groups 1, 2, 3 are rolled up, never passed to the callback
        expect(counts).toEqual({ '4': 1, '6': 1, '9': 1 });
    });

    // Same rule under groupSelects: 'filteredDescendants'. The 🚫 markers in the snapshot show which
    // rows are not selectable: groups with no selectable descendant are not selectable themselves.
    test('group selectability follows selectable descendants when groupSelects: "filteredDescendants"', async () => {
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
                // only leaf '4' (D) is selectable, so its ancestors A and B become selectable too
                isRowSelectable: (node) => node.id === '4',
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, 'filteredDescendants selectable state').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:1 ag-Grid-AutoColumn:"A" name:"John Von Neumann"
            │ ├─┬ B GROUP id:2 ag-Grid-AutoColumn:"B" name:"Alan Turing"
            │ │ ├── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"Donald Knuth"
            │ │ └── E LEAF 🚫 id:5 ag-Grid-AutoColumn:"E" name:"Grace Hopper"
            │ └─┬ C GROUP 🚫 id:3 ag-Grid-AutoColumn:"C" name:"A. Church"
            │ · ├── F LEAF 🚫 id:6 ag-Grid-AutoColumn:"F" name:"Linus Torvalds"
            │ · ├── G LEAF 🚫 id:7 ag-Grid-AutoColumn:"G" name:"Brian Kernighan"
            │ · └─┬ H filler 🚫 id:row-group-0-A-1-C-2-H ag-Grid-AutoColumn:"H"
            │ · · └── I LEAF 🚫 id:8 ag-Grid-AutoColumn:"I" name:"Claude Elwood Shannon"
            └── J LEAF 🚫 id:9 ag-Grid-AutoColumn:"J" name:"E. Dijkstra"
        `);

        const actions = new GridActions(api, '#myGrid');

        actions.toggleCheckboxById('2');
        assertSelectedRowElementsById(['1', '2', '4'], api);
        expect(api.getRowNode('3')?.selectable).toBe(false);
    });

    // Filler nodes (auto-created for missing intermediate paths) have no data, so isRowSelectable must
    // be applied to them too; otherwise they default to selectable and show a checkbox on every row.
    test('isRowSelectable applies to filler nodes with groupSelects: "self"', async () => {
        // 'A' and 'A>C' have no data row of their own — they are auto-created filler nodes.
        const rowData = cachedJSONObjects.array([
            { id: '2', name: 'B', orgHierarchy: ['A', 'B'] },
            { id: '4', name: 'D', orgHierarchy: ['A', 'C', 'D'] },
            { id: '5', name: 'J', orgHierarchy: ['J'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: {
                mode: 'multiRow',
                groupSelects: 'self',
                hideDisabledCheckboxes: true,
                isRowSelectable: (node) => node.data != null,
            },
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        await new GridRows(api, 'filler nodes not selectable').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler 🚫 id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├── B LEAF id:2 ag-Grid-AutoColumn:"B" name:"B"
            │ └─┬ C filler 🚫 id:row-group-0-A-1-C ag-Grid-AutoColumn:"C"
            │ · └── D LEAF id:4 ag-Grid-AutoColumn:"D" name:"D"
            └── J LEAF id:5 ag-Grid-AutoColumn:"J" name:"J"
        `);

        const actions = new GridActions(api, '#myGrid');

        // hideDisabledCheckboxes hides the checkbox on the non-selectable filler rows only
        const expectations: { id: string; displayed: boolean }[] = [
            { id: 'row-group-0-A', displayed: false },
            { id: '2', displayed: true },
            { id: 'row-group-0-A-1-C', displayed: false },
            { id: '4', displayed: true },
            { id: '5', displayed: true },
        ];
        for (const { id, displayed } of expectations) {
            expect(assertElementDisplayed(actions.getCheckboxById(id)!)).toBe(displayed);
        }
    });

    // A real leaf can be detached from the tree (treeParent=null → hideRow) without being destroyed when
    // two rows collide on the same path. The orphaned, still-alive node must drop out of the selection.
    test('selected leaf dropped from selection when orphaned by a duplicate path', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: { mode: 'multiRow' },
            groupDefaultExpanded: -1,
            rowData: cachedJSONObjects.array([
                { id: 'a', name: 'Alpha', orgHierarchy: ['X'] },
                { id: 'b', name: 'Beta', orgHierarchy: ['Y'] },
            ]),
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const beta = api.getRowNode('b')!;
        api.setNodesSelected({ nodes: [beta], newValue: true });
        expect(api.getSelectedNodes().map((n) => n.id)).toEqual(['b']);

        // 'b' now collides with 'a' on path ['X']; as the duplicate it is detached (orphaned), not destroyed
        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: 'a', name: 'Alpha', orgHierarchy: ['X'] },
                { id: 'b', name: 'Beta', orgHierarchy: ['X'] },
            ])
        );

        expect(consoleWarnSpy).toHaveBeenCalled(); // duplicate path warning #186
        consoleWarnSpy.mockRestore();

        expect(beta.destroyed).toBe(false); // alive, just detached from the displayed tree
        expect(api.getSelectedNodes()).toEqual([]); // orphaned node dropped from selection
        await new GridRows(api, 'orphaned duplicate dropped from selection').check(`
            ROOT id:ROOT_NODE_ID
            └── X LEAF id:a ag-Grid-AutoColumn:"X" name:"Alpha"
        `);
    });

    // A node whose tree key changes fires a data-change event; its selectable state must be recomputed so an
    // isRowSelectable that depends on the key deselects a row that is no longer selectable.
    test('recomputes selectable for a node whose tree key changes', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'name' }],
            autoGroupColumnDef: { headerName: 'Hierarchy' },
            treeData: true,
            animateRows: false,
            rowSelection: { mode: 'multiRow', isRowSelectable: (node) => node.key !== 'X' },
            groupDefaultExpanded: -1,
            rowData: cachedJSONObjects.array([
                { id: '1', name: 'n1', orgHierarchy: ['A'] },
                { id: '2', name: 'n2', orgHierarchy: ['A', 'B'] },
                { id: '3', name: 'n3', orgHierarchy: ['A', 'C'] },
            ]),
            getRowId: (params) => params.data.id,
            getDataPath: (data: any) => data.orgHierarchy,
        });

        const node3 = api.getRowNode('3')!;
        expect(node3.key).toBe('C');
        expect(node3.selectable).toBe(true);

        api.setNodesSelected({ nodes: [node3], newValue: true });
        expect(node3.isSelected()).toBe(true);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', name: 'n1', orgHierarchy: ['A'] },
                { id: '2', name: 'n2', orgHierarchy: ['A', 'B'] },
                { id: '3', name: 'n3', orgHierarchy: ['A', 'X'] },
            ])
        );

        const renamed = api.getRowNode('3')!;
        expect(renamed.key).toBe('X');
        expect(renamed.selectable).toBe(false);
        expect(renamed.isSelected()).toBe(false);
        expect(api.getSelectedNodes()).toEqual([]);
    });
});
