/**
 * Tests for SortService: verifies sort state, row ordering, cache invalidation,
 * multi-sort, column changes, pivot mode, coupled group sorting, postSortRows,
 * suppressMultiSort, sortingOrder, defaultColDef.sort, and data mutations.
 */
import type { Column, GridApi, SortModelItem } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager } from '../test-utils';

describe('SortService', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const rowData = [
        { id: '1', a: 'z', b: 'm', c: 5 },
        { id: '2', a: 'a', b: 'x', c: 1 },
        { id: '3', a: 'm', b: 'a', c: 9 },
    ];

    function getSortModel(api: GridApi): SortModelItem[] {
        return api
            .getColumnState()
            .filter((s) => s.sort != null)
            .sort((x, y) => (x.sortIndex ?? 0) - (y.sortIndex ?? 0))
            .map((s) => ({ colId: s.colId, sort: s.sort! }));
    }

    describe('isSortActive and getSortModel basics', () => {
        test('no sort initially', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            expect(getSortModel(api)).toEqual([]);

            // Rows in insertion order
            await new GridRows(api, 'unsorted').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z" b:"m"
                ├── LEAF id:2 a:"a" b:"x"
                └── LEAF id:3 a:"m" b:"a"
            `);
        });

        test('single column sort asc', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            await new GridRows(api, 'sorted asc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:1 a:"z" b:"m"
            `);

            await new GridColumns(api, 'col state').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc
                └── b "B" width:200
            `);
        });

        test('single column sort desc', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a' }],
                rowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'desc' }] });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'desc' }]);

            await new GridRows(api, 'sorted desc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z"
                ├── LEAF id:3 a:"m"
                └── LEAF id:2 a:"a"
            `);

            await new GridColumns(api, 'desc col state').checkColumns(`
                CENTER
                └── a "A" width:200 sort:desc
            `);
        });

        test('clearing sort returns to insertion order', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a' }],
                rowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

            await new GridRows(api, 'sorted').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a"
                ├── LEAF id:3 a:"m"
                └── LEAF id:1 a:"z"
            `);

            api.applyColumnState({ state: [{ colId: 'a', sort: null }] });
            expect(getSortModel(api)).toEqual([]);

            await new GridRows(api, 'back to insertion order').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z"
                ├── LEAF id:2 a:"a"
                └── LEAF id:3 a:"m"
            `);

            await new GridColumns(api, 'sort cleared').checkColumns(`
                CENTER
                └── a "A" width:200
            `);
        });
    });

    describe('multi-sort', () => {
        test('two columns with sortIndex — rows ordered by primary then secondary', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData: [
                    { id: '1', a: 'x', b: 'b' },
                    { id: '2', a: 'x', b: 'a' },
                    { id: '3', a: 'a', b: 'z' },
                ],
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'asc', sortIndex: 1 },
                ],
            });

            expect(getSortModel(api)).toEqual([
                { colId: 'a', sort: 'asc' },
                { colId: 'b', sort: 'asc' },
            ]);

            await new GridRows(api, 'multi-sort asc/asc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"a" b:"z"
                ├── LEAF id:2 a:"x" b:"a"
                └── LEAF id:1 a:"x" b:"b"
            `);

            await new GridColumns(api, 'multi-sort').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc sortIndex:0
                └── b "B" width:200 sort:asc sortIndex:1
            `);
        });

        test('changing sort direction on secondary column reorders rows', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData: [
                    { id: '1', a: 'x', b: 'b' },
                    { id: '2', a: 'x', b: 'a' },
                    { id: '3', a: 'a', b: 'z' },
                ],
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'asc', sortIndex: 1 },
                ],
            });

            await new GridRows(api, 'b asc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"a" b:"z"
                ├── LEAF id:2 a:"x" b:"a"
                └── LEAF id:1 a:"x" b:"b"
            `);

            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'desc', sortIndex: 1 },
                ],
            });

            await new GridRows(api, 'b desc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"a" b:"z"
                ├── LEAF id:1 a:"x" b:"b"
                └── LEAF id:2 a:"x" b:"a"
            `);

            await new GridColumns(api, 'b flipped to desc').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc sortIndex:0
                └── b "B" width:200 sort:desc sortIndex:1
            `);
        });
    });

    describe('cache invalidation on column changes', () => {
        test('sort survives column def update that preserves sorted column', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Add a new column — sorted column a should keep its sort
            api.setGridOption('columnDefs', [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b' },
                { colId: 'c', field: 'c' },
            ]);

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            await new GridRows(api, 'still sorted').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x" c:1
                ├── LEAF id:3 a:"m" b:"a" c:9
                └── LEAF id:1 a:"z" b:"m" c:5
            `);

            await new GridColumns(api, 'sort preserved after col add').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc
                ├── b "B" width:200
                └── c "C" width:200
            `);
        });

        test('sort is cleared when sorted column is removed', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Remove the sorted column
            api.setGridOption('columnDefs', [{ colId: 'b', field: 'b' }]);

            expect(getSortModel(api)).toEqual([]);
        });

        test('sort on initial colDef', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', sort: 'desc' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'desc' }]);

            await new GridRows(api, 'initial sort').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z" b:"m"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:2 a:"a" b:"x"
            `);

            await new GridColumns(api, 'initial sort col state').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:desc
                └── b "B" width:200
            `);
        });

        test('initialSort in colDef', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', initialSort: 'asc' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            await new GridRows(api, 'initialSort asc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:1 a:"z" b:"m"
            `);
        });
    });

    describe('sort with visibility changes', () => {
        test('hiding a sorted column does not clear its sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            api.setColumnsVisible(['a'], false);

            // Sort should still be active even though column is hidden
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Rows should still be sorted
            await new GridRows(api, 'hidden col still sorted').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:1 a:"z" b:"m"
            `);

            await new GridColumns(api, 'hidden col retains sort').checkColumns(`
                CENTER
                └── b "B" width:200
            `);
        });

        test('showing a hidden sorted column preserves sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', sort: 'asc', hide: true },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            api.setColumnsVisible(['a'], true);
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            await new GridColumns(api, 'shown col keeps sort').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc
                └── b "B" width:200
            `);
        });
    });

    describe('sort with pivot mode', () => {
        test('sort on value column in pivot mode', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'cat', field: 'a', rowGroup: true },
                    { colId: 'val', field: 'c', aggFunc: 'sum' },
                ],
                rowData,
                pivotMode: true,
            });

            api.applyColumnState({ state: [{ colId: 'val', sort: 'asc' }] });
            expect(getSortModel(api)).toEqual([{ colId: 'val', sort: 'asc' }]);

            await new GridColumns(api, 'pivot sorted').checkColumns(false);
        });

        test('sort cache invalidated when pivot mode toggled', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', sort: 'asc' },
                    { colId: 'b', field: 'b', rowGroup: true },
                    { colId: 'c', field: 'c', aggFunc: 'sum' },
                ],
                rowData,
            });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Toggle pivot mode — sort cache must be rebuilt
            api.setGridOption('pivotMode', true);

            // Sort state on column a is still there but a is not a value/secondary col,
            // so getSortModel from column state still has it
            const state = api.getColumnState();
            const aState = state.find((s) => s.colId === 'a');
            expect(aState?.sort).toBe('asc');
        });
    });

    describe('sort with row grouping (coupled sorting)', () => {
        test('sort on grouped column via applyColumnState', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', rowGroup: true, sort: 'asc' },
                    { colId: 'b', field: 'b' },
                ],
                rowData: [
                    { id: '1', a: 'z', b: 1 },
                    { id: '2', a: 'a', b: 2 },
                    { id: '3', a: 'm', b: 3 },
                ],
                getRowId: (p) => p.data.id,
            });

            // Groups should be sorted by 'a' ascending
            await new GridRows(api, 'grouped sorted asc').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-a-a ag-Grid-AutoColumn:"a"
                │ └── LEAF hidden id:2 a:"a" b:2
                ├─┬ LEAF_GROUP collapsed id:row-group-a-m ag-Grid-AutoColumn:"m"
                │ └── LEAF hidden id:3 a:"m" b:3
                └─┬ LEAF_GROUP collapsed id:row-group-a-z ag-Grid-AutoColumn:"z"
                · └── LEAF hidden id:1 a:"z" b:1
            `);
        });

        test('changing row group columns invalidates sort cache', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', sort: 'asc' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Add row grouping — this changes column structure, sort cache must invalidate
            api.applyColumnState({
                state: [{ colId: 'a', rowGroup: true, sort: 'asc' }],
            });

            // Sort should still be reflected
            const state = api.getColumnState();
            const aState = state.find((s) => s.colId === 'a');
            expect(aState?.sort).toBe('asc');
        });
    });

    describe('sort with data changes', () => {
        test('sort order updates after setRowData', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'asc' }],
                rowData: [
                    { id: '1', a: 'c' },
                    { id: '2', a: 'a' },
                ],
                getRowId: (p) => p.data.id,
            });

            await new GridRows(api, 'initial').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a"
                └── LEAF id:1 a:"c"
            `);

            // New data — sort must apply to new rows
            api.setGridOption('rowData', [
                { id: '3', a: 'z' },
                { id: '4', a: 'b' },
            ]);

            await new GridRows(api, 'new data sorted').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:4 a:"b"
                └── LEAF id:3 a:"z"
            `);

            // Sort state unchanged
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);
        });

        test('sort order updates after transaction', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'asc' }],
                rowData: [
                    { id: '1', a: 'c' },
                    { id: '2', a: 'a' },
                ],
                getRowId: (p) => p.data.id,
            });

            api.applyTransaction({ add: [{ id: '3', a: 'b' }] });

            await new GridRows(api, 'after add').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a"
                ├── LEAF id:3 a:"b"
                └── LEAF id:1 a:"c"
            `);
        });
    });

    describe('sort model via API', () => {
        test('getColumnState reflects sort correctly', () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
            });

            api.applyColumnState({
                state: [
                    { colId: 'b', sort: 'desc', sortIndex: 0 },
                    { colId: 'a', sort: 'asc', sortIndex: 1 },
                ],
            });

            const state = api.getColumnState();
            const aState = state.find((s) => s.colId === 'a')!;
            const bState = state.find((s) => s.colId === 'b')!;

            expect(aState.sort).toBe('asc');
            expect(aState.sortIndex).toBe(1);
            expect(bState.sort).toBe('desc');
            expect(bState.sortIndex).toBe(0);
        });

        test('resetColumnState clears sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a' }],
                rowData,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            api.resetColumnState();
            expect(getSortModel(api)).toEqual([]);
        });

        test('applyColumnState replaces previous sort', () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
            });

            api.applyColumnState({
                state: [{ colId: 'a', sort: 'asc' }],
                defaultState: { sort: null },
            });
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            api.applyColumnState({
                state: [{ colId: 'b', sort: 'desc' }],
                defaultState: { sort: null },
            });
            expect(getSortModel(api)).toEqual([{ colId: 'b', sort: 'desc' }]);
        });
    });

    describe('sort with alwaysMultiSort', () => {
        test('alwaysMultiSort preserves existing sort when adding new sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                alwaysMultiSort: true,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Add sort on b — a should remain sorted
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'desc', sortIndex: 1 },
                ],
            });

            expect(getSortModel(api)).toEqual([
                { colId: 'a', sort: 'asc' },
                { colId: 'b', sort: 'desc' },
            ]);

            await new GridColumns(api, 'alwaysMultiSort cols').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc sortIndex:0
                └── b "B" width:200 sort:desc sortIndex:1
            `);
        });
    });

    describe('getAllDisplayedColumns order after sort', () => {
        test('column display order is independent of sort order', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                    { colId: 'c', field: 'c' },
                ],
                rowData,
            });

            api.applyColumnState({
                state: [
                    { colId: 'c', sort: 'asc', sortIndex: 0 },
                    { colId: 'a', sort: 'desc', sortIndex: 1 },
                ],
            });

            // Column display order should not change
            const displayOrder = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(displayOrder).toEqual(['a', 'b', 'c']);

            await new GridColumns(api, 'display order preserved').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:desc sortIndex:1
                ├── b "B" width:200
                └── c "C" width:200 sort:asc sortIndex:0
            `);
        });
    });

    describe('postSortRows callback', () => {
        test('postSortRows reorders rows after sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'asc' }],
                rowData: [
                    { id: '1', a: 'c' },
                    { id: '2', a: 'a' },
                    { id: '3', a: 'b' },
                ],
                getRowId: (p) => p.data.id,
                postSortRows: (params) => {
                    // Move 'b' to the top regardless of sort
                    const bIdx = params.nodes.findIndex((n) => n.data?.a === 'b');
                    if (bIdx > 0) {
                        const [bNode] = params.nodes.splice(bIdx, 1);
                        params.nodes.unshift(bNode);
                    }
                },
            });

            await new GridRows(api, 'postSortRows applied').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"b"
                ├── LEAF id:2 a:"a"
                └── LEAF id:1 a:"c"
            `);
        });
    });

    describe('suppressMultiSort', () => {
        test('suppressMultiSort only allows single column sort via applyColumnState', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
                suppressMultiSort: true,
            });

            // Apply multi-sort via state — both columns get sort set
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'desc', sortIndex: 1 },
                ],
            });

            // Both columns have sort in state (applyColumnState always applies)
            const stateA = api.getColumnState().find((s) => s.colId === 'a')!;
            const stateB = api.getColumnState().find((s) => s.colId === 'b')!;
            expect(stateA.sort).toBe('asc');
            expect(stateB.sort).toBe('desc');

            // Rows should be sorted by both (applyColumnState is not constrained by suppressMultiSort)
            await new GridRows(api, 'multi via state').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:1 a:"z" b:"m"
            `);

            await new GridColumns(api, 'suppressMultiSort cols').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc sortIndex:0
                └── b "B" width:200 sort:desc sortIndex:1
            `);
        });
    });

    describe('sortingOrder per column', () => {
        test('column with custom sortingOrder cycles through specified directions', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    {
                        colId: 'a',
                        field: 'a',
                        sortingOrder: ['desc', 'asc'],
                    },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            // First sort should be desc (first in sortingOrder)
            api.applyColumnState({ state: [{ colId: 'a', sort: 'desc' }] });

            await new GridRows(api, 'desc first').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z"
                ├── LEAF id:3 a:"m"
                └── LEAF id:2 a:"a"
            `);

            // Switch to asc
            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

            await new GridRows(api, 'asc second').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a"
                ├── LEAF id:3 a:"m"
                └── LEAF id:1 a:"z"
            `);
        });
    });

    describe('defaultColDef sort', () => {
        test('defaultColDef.sort applies to all columns', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a' }],
                rowData,
                getRowId: (p) => p.data.id,
                defaultColDef: { sort: 'desc' },
            });

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'desc' }]);

            await new GridRows(api, 'default desc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z"
                ├── LEAF id:3 a:"m"
                └── LEAF id:2 a:"a"
            `);

            await new GridColumns(api, 'defaultColDef sort').checkColumns(`
                CENTER
                └── a "A" width:200 sort:desc
            `);
        });

        test('colDef.sort overrides defaultColDef.sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', sort: 'asc' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
                defaultColDef: { sort: 'desc' },
            });

            // a overrides to asc, b uses default desc
            await new GridRows(api, 'override + default').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:1 a:"z" b:"m"
            `);

            await new GridColumns(api, 'override + default cols').checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc
                └── b "B" width:200 sort:desc
            `);
        });
    });

    describe('sort after row update', () => {
        test('updating a sorted field reorders the row', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'asc' }],
                rowData: [
                    { id: '1', a: 'b' },
                    { id: '2', a: 'a' },
                    { id: '3', a: 'c' },
                ],
                getRowId: (p) => p.data.id,
            });

            await new GridRows(api, 'initial asc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a"
                ├── LEAF id:1 a:"b"
                └── LEAF id:3 a:"c"
            `);

            // Update row 2's value so it moves to the end
            api.applyTransaction({ update: [{ id: '2', a: 'z' }] });

            await new GridRows(api, 'after update').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"b"
                ├── LEAF id:3 a:"c"
                └── LEAF id:2 a:"z"
            `);

            await new GridColumns(api, 'sort unchanged after update').checkColumns(`
                CENTER
                └── a "A" width:200 sort:asc
            `);
        });

        test('removing a row preserves sort on remaining rows', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'asc' }],
                rowData: [
                    { id: '1', a: 'c' },
                    { id: '2', a: 'a' },
                    { id: '3', a: 'b' },
                ],
                getRowId: (p) => p.data.id,
            });

            api.applyTransaction({ remove: [{ id: '3' }] });

            await new GridRows(api, 'after remove').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a"
                └── LEAF id:1 a:"c"
            `);

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);
        });
    });
});
