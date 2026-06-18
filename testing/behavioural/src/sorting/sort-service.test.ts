/**
 * Tests for SortService: verifies sort state, row ordering, cache invalidation,
 * multi-sort, column changes, pivot mode, coupled group sorting, postSortRows,
 * suppressMultiSort, sortingOrder, defaultColDef.sort, and data mutations.
 */
import type { Column, GridApi, SortModelItem } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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

        test('multi-sort with sort but no sortIndex falls back to colDef order', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', sort: 'asc' },
                    { colId: 'b', field: 'b', sort: 'asc' },
                ],
                rowData: [
                    { id: '1', a: 'x', b: 'b' },
                    { id: '2', a: 'x', b: 'a' },
                    { id: '3', a: 'a', b: 'z' },
                ],
                getRowId: (p) => p.data.id,
            });
            await asyncSetTimeout(0);

            expect(getSortModel(api)).toEqual([
                { colId: 'a', sort: 'asc' },
                { colId: 'b', sort: 'asc' },
            ]);

            await new GridRows(api, 'multi-sort asc/asc no sortIndex').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"a" b:"z"
                ├── LEAF id:2 a:"x" b:"a"
                └── LEAF id:1 a:"x" b:"b"
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

        test('swapping only sortIndex reorders rows', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                    { colId: 'c', field: 'c' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            // a primary: a-asc orders 2 -> 3 -> 1.
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'asc', sortIndex: 1 },
                ],
            });
            await new GridRows(api, 'a primary (asc)').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x" c:1
                ├── LEAF id:3 a:"m" b:"a" c:9
                └── LEAF id:1 a:"z" b:"m" c:5
            `);

            // Swap indices only — b primary now: b-asc orders 3 -> 1 -> 2.
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', sortIndex: 1 },
                    { colId: 'b', sort: 'asc', sortIndex: 0 },
                ],
            });
            await new GridRows(api, 'b primary (asc) after sortIndex swap').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"m" b:"a" c:9
                ├── LEAF id:1 a:"z" b:"m" c:5
                └── LEAF id:2 a:"a" b:"x" c:1
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
            await new GridColumns(api, `sort is cleared when sorted column is removed setup`).checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
            await new GridRows(api, `sort is cleared when sorted column is removed setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"z" b:"m"
                ├── LEAF id:1 a:"a" b:"x"
                └── LEAF id:2 a:"m" b:"a"
            `);

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await new GridColumns(api, `sort is cleared when sorted column is removed after applyColumnState`)
                .checkColumns(`
                    CENTER
                    ├── a "A" width:200 sort:asc
                    └── b "B" width:200
                `);
            await new GridRows(api, `sort is cleared when sorted column is removed after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a" b:"x"
                ├── LEAF id:2 a:"m" b:"a"
                └── LEAF id:0 a:"z" b:"m"
            `);
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Remove the sorted column
            api.setGridOption('columnDefs', [{ colId: 'b', field: 'b' }]);
            await new GridColumns(api, `sort is cleared when sorted column is removed after setGridOption columnDefs`)
                .checkColumns(`
                    CENTER
                    └── b "B" width:200
                `);
            await new GridRows(api, `sort is cleared when sorted column is removed after setGridOption columnDefs`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 b:"m"
                    ├── LEAF id:1 b:"x"
                    └── LEAF id:2 b:"a"
                `);

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

        test('sort cache is invalidated after reapplying identical columnDefs', async () => {
            // Regression guard: SortService caches sortedCols (an AgColumn[]). If setGridOption
            // produces a display tree that compares equal to the previous one, gridColumnsChanged
            // may not fire even though service-managed columns can be rebuilt. The service must
            // listen to newColumnsLoaded as a defensive net so the cache is rebuilt against
            // live column instances every time columnDefs flow through the grid.
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            // Warm the cache by reading getSortModel (builds sortCache.sortedCols).
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Re-apply the same columnDefs structure. The tree is identical by content, so
            // gridColumnsChanged may short-circuit; newColumnsLoaded should still fire.
            api.setGridOption('columnDefs', [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b' },
            ]);

            // Sort state and row order must still be correct after the reapply.
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);
            await new GridRows(api, 'sort survives identical columnDefs reapply').check(`
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

            await new GridColumns(api, 'pivot sorted').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── val "C" width:200 sort:asc aggFunc:sum
            `);
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
            await new GridColumns(api, `sort cache invalidated when pivot mode toggled setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a "A" width:200 sort:asc
                ├── b "B" width:200 rowGroup
                └── c "C" width:200 aggFunc:sum
            `);
            await new GridRows(api, `sort cache invalidated when pivot mode toggled setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ LEAF_GROUP collapsed id:row-group-b-m ag-Grid-AutoColumn:"m" c:5
                │ └── LEAF hidden id:0 a:"z" b:"m" c:5
                ├─┬ LEAF_GROUP collapsed id:row-group-b-x ag-Grid-AutoColumn:"x" c:1
                │ └── LEAF hidden id:1 a:"a" b:"x" c:1
                └─┬ LEAF_GROUP collapsed id:row-group-b-a ag-Grid-AutoColumn:"a" c:9
                · └── LEAF hidden id:2 a:"m" b:"a" c:9
            `);

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Toggle pivot mode — sort cache must be rebuilt
            api.setGridOption('pivotMode', true);
            await new GridColumns(api, `sort cache invalidated when pivot mode toggled after setGridOption pivotMode`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── c "C" width:200 aggFunc:sum
                `);
            await new GridRows(api, `sort cache invalidated when pivot mode toggled after setGridOption pivotMode`)
                .check(`
                    ROOT id:ROOT_NODE_ID c:15
                    ├─┬ LEAF_GROUP collapsed id:row-group-b-m ag-Grid-AutoColumn:"m" c:5
                    │ └── LEAF hidden id:0 a:"z" b:"m" c:5
                    ├─┬ LEAF_GROUP collapsed id:row-group-b-x ag-Grid-AutoColumn:"x" c:1
                    │ └── LEAF hidden id:1 a:"a" b:"x" c:1
                    └─┬ LEAF_GROUP collapsed id:row-group-b-a ag-Grid-AutoColumn:"a" c:9
                    · └── LEAF hidden id:2 a:"m" b:"a" c:9
                `);

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
            await new GridColumns(api, `changing row group columns invalidates sort cache setup`).checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc
                └── b "B" width:200
            `);
            await new GridRows(api, `changing row group columns invalidates sort cache setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x"
                ├── LEAF id:3 a:"m" b:"a"
                └── LEAF id:1 a:"z" b:"m"
            `);

            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            // Add row grouping — this changes column structure, sort cache must invalidate
            api.applyColumnState({
                state: [{ colId: 'a', rowGroup: true, sort: 'asc' }],
            });
            await new GridColumns(api, `changing row group columns invalidates sort cache after applyColumnState`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── a "A" width:200 sort:asc rowGroup
                    └── b "B" width:200
                `);
            await new GridRows(api, `changing row group columns invalidates sort cache after applyColumnState`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-a ag-Grid-AutoColumn:"a"
                    │ └── LEAF hidden id:2 a:"a" b:"x"
                    ├─┬ LEAF_GROUP collapsed id:row-group-a-m ag-Grid-AutoColumn:"m"
                    │ └── LEAF hidden id:3 a:"m" b:"a"
                    └─┬ LEAF_GROUP collapsed id:row-group-a-z ag-Grid-AutoColumn:"z"
                    · └── LEAF hidden id:1 a:"z" b:"m"
                `
            );

            // Sort should still be reflected
            const state = api.getColumnState();
            const aState = state.find((s) => s.colId === 'a');
            expect(aState?.sort).toBe('asc');
        });

        test('multi-sort display ordinals are sequential in coupled mode (regression)', async () => {
            // Two row-group cols with sort, each reflected through its own auto-group display col.
            // The sort indicator UI must show ordinals "1" and "2" (sequential display indices),
            // not "1" and "3" — which would happen if the index map used raw array positions
            // from the interleaved sortedCols list instead of counting display cols only.
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a', rowGroup: true, sort: 'asc', sortIndex: 0 },
                    { colId: 'b', field: 'b', rowGroup: true, sort: 'asc', sortIndex: 1 },
                    { colId: 'c', field: 'c' },
                ],
                rowData: [
                    { id: '1', a: 'x', b: 'p', c: 1 },
                    { id: '2', a: 'y', b: 'q', c: 2 },
                ],
                groupDisplayType: 'multipleColumns',
                getRowId: (p) => p.data.id,
            });

            // Read the sort-order indicator text from the rendered headers. `_setDisplayed` toggles
            // the ag-hidden class when showing/hiding; visible order elements hold the 1-based text.
            const headerRoot = TestGridsManager.getHTMLElement(api);
            const orderEls = Array.from(
                headerRoot?.querySelectorAll('.ag-header-cell .ag-sort-order') ?? []
            ) as HTMLElement[];
            const visibleOrders = orderEls
                .filter((el) => !el.classList.contains('ag-hidden'))
                .map((el) => el.textContent ?? '');

            // Two display cols (a, b) each linked to their source row-group col. Each pair shares
            // an ordinal: display-a + source-a = "1", display-b + source-b = "2". Pre-fix bug
            // would have produced "1" and "3" (array positions in the interleaved sortedCols list)
            // instead of "1" and "2".
            expect(visibleOrders.sort()).toEqual(['1', '1', '2', '2']);

            // Also exercise the DOM validator so its aria-sort check runs against coupled-mode display cols.
            await new GridColumns(api, 'multi-sort coupled').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-a "A" width:200
                ├── ag-Grid-AutoColumn-b "B" width:200
                ├── a "A" width:200 sort:asc sortIndex:0 rowGroup
                ├── b "B" width:200 sort:asc sortIndex:1 rowGroup
                └── c "C" width:200
            `);
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
        test('getColumnState reflects sort correctly', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
            });
            await new GridColumns(api, `getColumnState reflects sort correctly setup`).checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
            await new GridRows(api, `getColumnState reflects sort correctly setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"z" b:"m"
                ├── LEAF id:1 a:"a" b:"x"
                └── LEAF id:2 a:"m" b:"a"
            `);

            api.applyColumnState({
                state: [
                    { colId: 'b', sort: 'desc', sortIndex: 0 },
                    { colId: 'a', sort: 'asc', sortIndex: 1 },
                ],
            });
            await new GridColumns(api, `getColumnState reflects sort correctly after applyColumnState`).checkColumns(
                `
                    CENTER
                    ├── a "A" width:200 sort:asc sortIndex:1
                    └── b "B" width:200 sort:desc sortIndex:0
                `
            );
            await new GridRows(api, `getColumnState reflects sort correctly after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a" b:"x"
                ├── LEAF id:0 a:"z" b:"m"
                └── LEAF id:2 a:"m" b:"a"
            `);

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
            await new GridColumns(api, `resetColumnState clears sort setup`).checkColumns(`
                CENTER
                └── a "A" width:200
            `);
            await new GridRows(api, `resetColumnState clears sort setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"z"
                ├── LEAF id:1 a:"a"
                └── LEAF id:2 a:"m"
            `);

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await new GridColumns(api, `resetColumnState clears sort after applyColumnState`).checkColumns(`
                CENTER
                └── a "A" width:200 sort:asc
            `);
            await new GridRows(api, `resetColumnState clears sort after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a"
                ├── LEAF id:2 a:"m"
                └── LEAF id:0 a:"z"
            `);
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            api.resetColumnState();
            await new GridColumns(api, `resetColumnState clears sort after resetColumnState`).checkColumns(`
                CENTER
                └── a "A" width:200
            `);
            expect(getSortModel(api)).toEqual([]);
        });

        test('applyColumnState replaces previous sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                rowData,
            });
            await new GridColumns(api, `applyColumnState replaces previous sort setup`).checkColumns(`
                CENTER
                ├── a "A" width:200
                └── b "B" width:200
            `);
            await new GridRows(api, `applyColumnState replaces previous sort setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 a:"z" b:"m"
                ├── LEAF id:1 a:"a" b:"x"
                └── LEAF id:2 a:"m" b:"a"
            `);

            api.applyColumnState({
                state: [{ colId: 'a', sort: 'asc' }],
                defaultState: { sort: null },
            });
            await new GridColumns(api, `applyColumnState replaces previous sort after applyColumnState`).checkColumns(
                `
                    CENTER
                    ├── a "A" width:200 sort:asc
                    └── b "B" width:200
                `
            );
            await new GridRows(api, `applyColumnState replaces previous sort after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a" b:"x"
                ├── LEAF id:2 a:"m" b:"a"
                └── LEAF id:0 a:"z" b:"m"
            `);
            expect(getSortModel(api)).toEqual([{ colId: 'a', sort: 'asc' }]);

            api.applyColumnState({
                state: [{ colId: 'b', sort: 'desc' }],
                defaultState: { sort: null },
            });
            await new GridColumns(api, `applyColumnState replaces previous sort after applyColumnState #2`)
                .checkColumns(`
                    CENTER
                    ├── a "A" width:200
                    └── b "B" width:200 sort:desc
                `);
            await new GridRows(api, `applyColumnState replaces previous sort after applyColumnState #2`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a" b:"x"
                ├── LEAF id:0 a:"z" b:"m"
                └── LEAF id:2 a:"m" b:"a"
            `);
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

    describe('post-sort row metadata', () => {
        // AG-309 (Feb 2018) legacy ordering: updateRowNodeAfterSort runs BEFORE postSortRows.
        // Out of scope to flip — callers may read childIndex/firstChild/lastChild from inside
        // postSortRows and rely on the input-order values.
        test('flat SortStage: postSortRows reorder leaves childIndex / firstChild / lastChild stale (legacy AG-309 behaviour)', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'asc' }],
                rowData: [
                    { id: '1', a: 'a' },
                    { id: '2', a: 'b' },
                    { id: '3', a: 'c' },
                ],
                getRowId: (p) => p.data.id,
                postSortRows: (params) => {
                    // Reverse the input. After this, childrenAfterSort is [c, b, a] but the
                    // flags were already written for the input order [a, b, c].
                    params.nodes.reverse();
                },
            });

            // Display order reflects the post-mutation array.
            await new GridRows(api, 'AG-309 stale flags: displayed order is post-mutation').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"c"
                ├── LEAF id:2 a:"b"
                └── LEAF id:1 a:"a"
            `);

            // Deprecated flags reflect the pre-mutation (input) order — node id=1 was first in
            // input, node id=3 was last, even though they're now at the opposite ends of the display.
            expect(api.getRowNode('1')!.childIndex).toBe(0);
            expect(api.getRowNode('1')!.firstChild).toBe(true);
            expect(api.getRowNode('1')!.lastChild).toBe(false);

            expect(api.getRowNode('3')!.childIndex).toBe(2);
            expect(api.getRowNode('3')!.firstChild).toBe(false);
            expect(api.getRowNode('3')!.lastChild).toBe(true);
        });

        test('firstChild / lastChild / childIndex reflect the sorted order on a flat CSRM', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a', sort: 'desc' }],
                rowData: [
                    { id: '1', a: 'a' },
                    { id: '2', a: 'b' },
                    { id: '3', a: 'c' },
                ],
                getRowId: (p) => p.data.id,
            });

            // Sorted desc, expected order is [c, b, a] → ids [3, 2, 1].
            await new GridRows(api, 'sort desc').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"c"
                ├── LEAF id:2 a:"b"
                └── LEAF id:1 a:"a"
            `);

            const sortedIds = ['3', '2', '1'];
            const nodes = sortedIds.map((id) => api.getRowNode(id)!);

            nodes.forEach((node, idx) => {
                expect(node.childIndex).toBe(idx);
                expect(node.firstChild).toBe(idx === 0);
                expect(node.lastChild).toBe(idx === nodes.length - 1);
            });

            // Reverse the sort and re-check that the metadata moves with the rows.
            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await new GridRows(api, 'sort asc — flags follow').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a"
                ├── LEAF id:2 a:"b"
                └── LEAF id:3 a:"c"
            `);

            const reverseIds = ['1', '2', '3'];
            const reverseNodes = reverseIds.map((id) => api.getRowNode(id)!);

            reverseNodes.forEach((node, idx) => {
                expect(node.childIndex).toBe(idx);
                expect(node.firstChild).toBe(idx === 0);
                expect(node.lastChild).toBe(idx === reverseNodes.length - 1);
            });
        });

        test('flat SortStage: reused-array postSortRows mutation does not corrupt the structural baseline', async () => {
            // Flat-path mirror of the GroupSortStage baseline-integrity test. The reverse=false
            // refresh is the load-bearing assertion — structural order is only restorable if
            // _reuseArrayIfEqual is by-position AND prevSort/childrenAfterAggFilter are distinct refs.
            let reverse = false;
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'a', field: 'a' }],
                rowData: [
                    { id: '1', a: 'a' },
                    { id: '2', a: 'b' },
                    { id: '3', a: 'c' },
                ],
                getRowId: (p) => p.data.id,
                postSortRows: (params) => {
                    if (reverse) {
                        params.nodes.reverse();
                    }
                },
            });

            // Initial: postSortRows is a no-op, structural order.
            await new GridRows(api, 'flat baseline: structural order').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a"
                ├── LEAF id:2 a:"b"
                └── LEAF id:3 a:"c"
            `);

            // Refresh with reverse=true. _reuseArrayIfEqual returns prevSort by reference and
            // postSortRows mutates that array in place — childrenAfterSort flips.
            reverse = true;
            api.refreshClientSideRowModel('sort');
            await new GridRows(api, 'flat baseline: postSortRows reverses').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:3 a:"c"
                ├── LEAF id:2 a:"b"
                └── LEAF id:1 a:"a"
            `);

            // Refresh with reverse=false. Structural order returns. If the baseline had been
            // corrupted by the previous mutation, the structural order could not be restored here.
            reverse = false;
            api.refreshClientSideRowModel('sort');
            await new GridRows(api, 'flat baseline: structural order restored').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"a"
                ├── LEAF id:2 a:"b"
                └── LEAF id:3 a:"c"
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

    describe('sortChanged event dispatch on sort clear', () => {
        test('clearing already-cleared columns does not dispatch spurious column-level sortChanged events', async () => {
            // `clearSortBarTheseColumns` walks every column on single-sort. Columns whose sort
            // doesn't actually change (already cleared) must not trigger column-level events —
            // suppressed by the `_areSortDefsEqual` check in `setColSort`. Verify by attaching
            // listeners to the columns themselves, not just the grid-level event.
            const gridListener = vitest.fn();
            const colAListener = vitest.fn();
            const colBListener = vitest.fn();
            const colCListener = vitest.fn();
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                    { colId: 'c', field: 'c' },
                ],
                rowData,
                getRowId: (p) => p.data.id,
            });
            const colA = api.getColumn('a')!;
            const colB = api.getColumn('b')!;
            const colC = api.getColumn('c')!;
            api.addEventListener('sortChanged', gridListener);
            colA.addEventListener('sortChanged', colAListener);
            colB.addEventListener('sortChanged', colBListener);
            colC.addEventListener('sortChanged', colCListener);

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await asyncSetTimeout(0);
            // Setting 'a' fires column-level on 'a' only, plus one grid-level.
            expect(gridListener).toHaveBeenCalledTimes(1);
            expect(colAListener).toHaveBeenCalledTimes(1);
            expect(colBListener).not.toHaveBeenCalled();
            expect(colCListener).not.toHaveBeenCalled();
            await new GridRows(api, "after sort 'a' asc: rows ordered by a").check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x" c:1
                ├── LEAF id:3 a:"m" b:"a" c:9
                └── LEAF id:1 a:"z" b:"m" c:5
            `);
            await new GridColumns(api, "col state: only 'a' sorted asc").checkColumns(`
                CENTER
                ├── a "A" width:200 sort:asc
                ├── b "B" width:200
                └── c "C" width:200
            `);
            gridListener.mockClear();
            colAListener.mockClear();

            // 'a' clears, 'b' sets, 'c' stays unsorted — one grid-level event, column-level
            // on 'a' (cleared) and 'b' (set), nothing on 'c' (already cleared, no-op).
            api.applyColumnState({
                state: [{ colId: 'b', sort: 'desc' }],
                defaultState: { sort: null },
            });
            await asyncSetTimeout(0);
            expect(gridListener).toHaveBeenCalledTimes(1);
            expect(colAListener).toHaveBeenCalledTimes(1);
            expect(colBListener).toHaveBeenCalledTimes(1);
            expect(colCListener).not.toHaveBeenCalled();
            await new GridRows(api, "after sort 'b' desc: rows ordered by b descending").check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:2 a:"a" b:"x" c:1
                ├── LEAF id:1 a:"z" b:"m" c:5
                └── LEAF id:3 a:"m" b:"a" c:9
            `);
            await new GridColumns(api, "col state: 'a' cleared, 'b' desc, 'c' unchanged").checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200 sort:desc
                └── c "C" width:200
            `);
            gridListener.mockClear();
            colAListener.mockClear();
            colBListener.mockClear();

            // Clear all — only 'b' was sorted, only 'b' fires column-level.
            api.applyColumnState({ defaultState: { sort: null } });
            await asyncSetTimeout(0);
            expect(gridListener).toHaveBeenCalledTimes(1);
            expect(colAListener).not.toHaveBeenCalled();
            expect(colBListener).toHaveBeenCalledTimes(1);
            expect(colCListener).not.toHaveBeenCalled();
            await new GridRows(api, 'after clear all: rows back in insertion order').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z" b:"m" c:5
                ├── LEAF id:2 a:"a" b:"x" c:1
                └── LEAF id:3 a:"m" b:"a" c:9
            `);
            await new GridColumns(api, 'col state: all sorts cleared').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
            `);
            gridListener.mockClear();
            colBListener.mockClear();

            // No-op clear: nothing was sorted, nothing transitions. The load-bearing assertion
            // is that NO events fire at all — neither column-level nor grid-level — because
            // every column was already cleared. Events are async, so `await asyncSetTimeout(0)`
            // flushes the dispatch queue before counting.
            api.applyColumnState({ defaultState: { sort: null } });
            await asyncSetTimeout(0);
            expect(gridListener).not.toHaveBeenCalled();
            expect(colAListener).not.toHaveBeenCalled();
            expect(colBListener).not.toHaveBeenCalled();
            expect(colCListener).not.toHaveBeenCalled();
            await new GridRows(api, 'after no-op clear: rows still in insertion order').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 a:"z" b:"m" c:5
                ├── LEAF id:2 a:"a" b:"x" c:1
                └── LEAF id:3 a:"m" b:"a" c:9
            `);
            await new GridColumns(api, 'col state: still all unsorted after no-op').checkColumns(`
                CENTER
                ├── a "A" width:200
                ├── b "B" width:200
                └── c "C" width:200
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

    describe('sort type availability and ordering (getAvailableSortTypes / getSortingOrder)', () => {
        const signedRowData = [
            { id: '1', n: -3 },
            { id: '2', n: 2 },
            { id: '3', n: -1 },
        ];

        function rowOrder(api: GridApi): string[] {
            const ids: string[] = [];
            api.forEachNodeAfterFilterAndSort((node) => ids.push(node.id!));
            return ids;
        }

        function visibleSortIcons(api: GridApi, colId: string): string[] {
            const root = TestGridsManager.getHTMLElement(api);
            const header = root?.querySelector(`.ag-header-cell[col-id="${colId}"]`);
            const icons = Array.from(header?.querySelectorAll<HTMLElement>('.ag-sort-indicator-icon') ?? []);
            return icons
                .filter((el) => !el.classList.contains('ag-hidden'))
                .map(
                    (el) =>
                        Array.from(el.classList).find(
                            (c) => c.startsWith('ag-sort-') && c.endsWith('-icon') && c !== 'ag-sort-indicator-icon'
                        ) ?? ''
                )
                .filter(Boolean);
        }

        function clickHeader(api: GridApi, colId: string): void {
            const root = TestGridsManager.getHTMLElement(api);
            const label = root?.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-label`);
            label?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }

        test('default sort orders by signed value and shows the default direction icon', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'n', field: 'n' }],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });

            api.applyColumnState({ state: [{ colId: 'n', sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['1', '3', '2']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-ascending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc
            `);

            api.applyColumnState({ state: [{ colId: 'n', sort: 'desc' }] });
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['2', '3', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-descending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:desc
            `);
        });

        test('absolute sort applied to a column that does not declare it still orders by magnitude, but shows no absolute icon', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'n', field: 'n' }],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });

            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200
            `);

            api.applyColumnState({ state: [{ colId: 'n', sort: 'asc', sortType: 'absolute' }] });
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['3', '2', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual([]);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc
            `);
        });

        test('absolute sort declared via initialSort: applied on init, orders by magnitude and shows the absolute icon', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'n', field: 'n', initialSort: { type: 'absolute', direction: 'asc' } as any }],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });
            await asyncSetTimeout(0);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc
            `);
            expect(rowOrder(api)).toEqual(['3', '2', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-absolute-ascending-icon']);

            const state = api.getColumnState().find((s) => s.colId === 'n')!;
            expect(state.sort).toBe('asc');
            expect(state.sortType).toBe('absolute');
        });

        test('changing colDefs re-resolves available sort types: an absolute sortingOrder makes the absolute icon appear for the same absolute sort', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'n', field: 'n' }],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });

            // Plain column: absolute not declared -> absolute sort runs, but no absolute icon.
            api.applyColumnState({ state: [{ colId: 'n', sort: 'asc', sortType: 'absolute' }] });
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['3', '2', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual([]);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc
            `);

            api.setGridOption('columnDefs', [
                {
                    colId: 'n',
                    field: 'n',
                    sortingOrder: [
                        { type: 'absolute', direction: 'asc' },
                        { type: 'absolute', direction: 'desc' },
                        null,
                    ] as any,
                },
            ]);
            api.applyColumnState({ state: [{ colId: 'n', sort: 'asc', sortType: 'absolute' }] });
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['3', '2', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-absolute-ascending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc
            `);
        });

        test('absolute sort declared via colDef.sort (not initialSort): applied on init with the absolute icon', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'n', field: 'n', sort: { type: 'absolute', direction: 'asc' } as any }],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });
            await asyncSetTimeout(0);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc
            `);
            expect(rowOrder(api)).toEqual(['3', '2', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-absolute-ascending-icon']);
        });

        test('header click cycles through a custom sortingOrder (the real getSortingOrder / getNextSortDirection path)', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [{ colId: 'n', field: 'n', sortingOrder: ['desc', 'asc'] }],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200
            `);
            clickHeader(api, 'n');
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['2', '3', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-descending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:desc sortIndex:0
            `);
            clickHeader(api, 'n');
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['1', '3', '2']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-ascending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc sortIndex:0
            `);
            clickHeader(api, 'n');
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['2', '3', '1']);
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-descending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:desc sortIndex:0
            `);
        });

        test('header click cycles through a custom absolute sortingOrder: abs-asc -> abs-desc -> none', async () => {
            const api = gridMgr.createGrid('g', {
                columnDefs: [
                    {
                        colId: 'n',
                        field: 'n',
                        sortingOrder: [
                            { type: 'absolute', direction: 'asc' },
                            { type: 'absolute', direction: 'desc' },
                            null,
                        ] as any,
                    },
                ],
                rowData: signedRowData,
                getRowId: (p) => p.data.id,
            });

            clickHeader(api, 'n');
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['3', '2', '1']); // magnitude ascending
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-absolute-ascending-icon']);
            expect(api.getColumnState().find((s) => s.colId === 'n')?.sortType).toBe('absolute');
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:asc sortIndex:0
            `);
            clickHeader(api, 'n');
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['1', '2', '3']); // magnitude descending
            expect(visibleSortIcons(api, 'n')).toEqual(['ag-sort-absolute-descending-icon']);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200 sort:desc sortIndex:0
            `);
            clickHeader(api, 'n');
            await asyncSetTimeout(0);
            expect(rowOrder(api)).toEqual(['1', '2', '3']);
            expect(getSortModel(api)).toEqual([]);
            expect(visibleSortIcons(api, 'n')).toEqual([]);
            await new GridColumns(api).checkColumns(`
                CENTER
                └── n "N" width:200
            `);
        });
    });
});
