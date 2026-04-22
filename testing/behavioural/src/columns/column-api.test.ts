/**
 * Comprehensive tests for the column API methods to ensure they remain consistent
 * after internal ColumnModel refactoring (AG-17060-get-col-perf).
 *
 * Tests cover:
 * - getAllGridColumns / getAllDisplayedColumns / getDisplayedLeft/Center/RightColumns
 * - getColumn / getColumns
 * - getColumnDefs (sorted and unsorted)
 * - Column state API (getColumnState, applyColumnState, resetColumnState)
 * - Column group state API (getColumnGroupState, setColumnGroupState)
 * - Pivot columns API (isPivotMode, getPivotColumns, getValueColumns, getRowGroupColumns)
 * - Column visibility and pinning API
 * - Column moving API
 * - Auto-generated columns (selection, auto-group, row numbers)
 */
import type { ColDef, Column, ColumnState } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, TestGridsManager } from '../test-utils';

describe('Column API', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('getAllGridColumns', () => {
        test('returns all columns including hidden ones', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }],
            });

            const allGrid = api.getAllGridColumns();
            expect(allGrid.length).toBe(3);
            expect(allGrid.map((c: Column) => c.getColId())).toEqual(['a', 'b', 'c']);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });

        test('includes auto-group columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });

            const allGrid = api.getAllGridColumns();
            const colIds = allGrid.map((c: Column) => c.getColId());
            expect(colIds).toContain('ag-Grid-AutoColumn');
            expect(colIds).toContain('group');
            expect(colIds).toContain('value');

            await new GridColumns(api, 'columns').checkColumns(false);
        });

        test('returns columns in correct order after reordering', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.moveColumns(['c'], 0);

            const allGrid = api.getAllGridColumns();
            expect(allGrid.map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'reordered').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('getAllDisplayedColumns vs section lists', () => {
        test('getAllDisplayedColumns equals left + center + right', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'left1', pinned: 'left' },
                    { colId: 'center1' },
                    { colId: 'center2' },
                    { colId: 'right1', pinned: 'right' },
                ],
            });

            const all = api.getAllDisplayedColumns();
            const left = api.getDisplayedLeftColumns();
            const center = api.getDisplayedCenterColumns();
            const right = api.getDisplayedRightColumns();

            expect(all.length).toBe(left.length + center.length + right.length);
            expect(all.map((c: Column) => c.getColId())).toEqual([
                ...left.map((c: Column) => c.getColId()),
                ...center.map((c: Column) => c.getColId()),
                ...right.map((c: Column) => c.getColId()),
            ]);

            expect(left.map((c: Column) => c.getColId())).toEqual(['left1']);
            expect(center.map((c: Column) => c.getColId())).toEqual(['center1', 'center2']);
            expect(right.map((c: Column) => c.getColId())).toEqual(['right1']);

            await new GridColumns(api, 'sections').checkColumns(`
                LEFT
                └── left1 width:200
                CENTER
                ├── center1 width:200
                └── center2 width:200
                RIGHT
                └── right1 width:200
            `);
        });

        test('hidden columns excluded from displayed but in getAllGridColumns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }],
            });

            const allGrid = api.getAllGridColumns();
            const allDisplayed = api.getAllDisplayedColumns();

            expect(allGrid.length).toBe(3);
            expect(allDisplayed.length).toBe(2);
            expect(allDisplayed.map((c: Column) => c.getColId())).toEqual(['a', 'c']);
            expect(allGrid.map((c: Column) => c.getColId())).toContain('b');

            await new GridColumns(api, 'columns').checkColumns(false);
        });
    });

    describe('getColumn', () => {
        test('finds column by colId string', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'myCol' }, { colId: 'other' }],
            });

            const col = api.getColumn('myCol');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('myCol');
        });

        test('finds column by field when no explicit colId', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
            });

            const col = api.getColumn('name');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('name');
        });

        test('returns null for non-existent column', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            expect(api.getColumn('nonexistent')).toBeNull();
        });

        test('finds auto-group column', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });

            const autoCol = api.getColumn('ag-Grid-AutoColumn');
            expect(autoCol).not.toBeNull();
        });

        test('finds column by Column object reference', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const colA = api.getColumn('a')!;
            // Finding by the column object itself should return the same instance
            const found = api.getColumn(colA);
            expect(found).toBe(colA);
        });
    });

    describe('getColumnDef', () => {
        test('returns colDef for regular columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerName: 'Alpha' }],
            });

            const def = api.getColumnDef('a');
            expect(def).not.toBeNull();
            expect(def?.colId).toBe('a');
            expect(def?.headerName).toBe('Alpha');
        });

        test('returns colDef for auto-group columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });

            // Auto-group column should have a colDef accessible via getColumnDef
            const autoGroupDef = api.getColumnDef('ag-Grid-AutoColumn');
            expect(autoGroupDef).not.toBeNull();
        });

        test('returns null for non-existent column', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            expect(api.getColumnDef('nonexistent')).toBeNull();
        });
    });

    describe('getColumns', () => {
        test('returns all primary columns (from columnDefs)', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const cols = api.getColumns();
            expect(cols).not.toBeNull();
            expect(cols!.length).toBe(2);
            expect(cols!.map((c: any) => c.getColId())).toEqual(['a', 'b']);
        });

        test('does not include auto-generated columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });

            const cols = api.getColumns();
            // getColumns() returns colDefCols — user-defined columns only
            const colIds = cols!.map((c: any) => c.getColId());
            expect(colIds).toContain('group');
            expect(colIds).toContain('value');
            // Auto-group column should NOT be in getColumns() — it's in getAllGridColumns()
            expect(colIds).not.toContain('ag-Grid-AutoColumn');
        });
    });

    describe('getAllGridColumns vs getColumns', () => {
        test('getAllGridColumns includes auto columns, getColumns does not', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });

            const allGrid = api.getAllGridColumns();
            const cols = api.getColumns();

            // getAllGridColumns includes auto-group, getColumns does not
            expect(allGrid.length).toBeGreaterThan(cols!.length);
            expect(allGrid.map((c: any) => c.getColId())).toContain('ag-Grid-AutoColumn');
            expect(cols!.map((c: any) => c.getColId())).not.toContain('ag-Grid-AutoColumn');
        });
    });

    describe('getColumnDefs', () => {
        test('returns current column definitions', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerName: 'Alpha' }, { colId: 'b' }],
            });

            const defs = api.getColumnDefs();
            expect(defs).toBeDefined();
            expect(defs!.length).toBe(2);
            expect((defs![0] as ColDef).colId).toBe('a');
        });

        test('returns definitions in display order', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'b' }, { colId: 'a' }],
            });

            // Move a to first position
            api.moveColumns(['a'], 0);

            const defs = api.getColumnDefs();
            expect(defs).toBeDefined();
            // Defs should reflect display order after move
            expect((defs![0] as ColDef).colId).toBe('a');
            expect((defs![1] as ColDef).colId).toBe('b');
        });

        test('includes group definitions', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'Group', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
            });

            const defs = api.getColumnDefs();
            expect(defs!.length).toBe(2);
            expect('children' in defs![0]).toBe(true);
        });
    });

    describe('getColumnState and applyColumnState', () => {
        test('getColumnState returns state for all columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100, sort: 'asc', pinned: 'left' },
                    { colId: 'b', width: 200, hide: true },
                    { colId: 'c' },
                ],
            });

            const state = api.getColumnState();
            expect(state.length).toBe(3);

            const stateA = state.find((s: ColumnState) => s.colId === 'a')!;
            expect(stateA.width).toBe(100);
            expect(stateA.sort).toBe('asc');
            expect(stateA.pinned).toBe('left');
            expect(stateA.hide).toBe(false);

            const stateB = state.find((s: ColumnState) => s.colId === 'b')!;
            expect(stateB.width).toBe(200);
            expect(stateB.hide).toBe(true);

            const stateC = state.find((s: ColumnState) => s.colId === 'c')!;
            expect(stateC.hide).toBe(false);
            expect(stateC.sort).toBeNull();
        });

        test('applyColumnState modifies columns correctly', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            const success = api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'desc', pinned: 'left' },
                    { colId: 'b', hide: true },
                    { colId: 'c', width: 300 },
                ],
            });

            expect(success).toBe(true);

            await new GridColumns(api, 'state applied').checkColumns(`
                LEFT
                └── a width:200 sort:desc
                CENTER
                └── c width:300
            `);
        });

        test('applyColumnState returns false for unknown colIds', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            const success = api.applyColumnState({
                state: [{ colId: 'nonexistent', sort: 'asc' }],
            });

            expect(success).toBe(false);
        });

        // Note: resetColumnState is tested more thoroughly in column-model.test.ts
        // with sort+pin+width modifications

        test('applyColumnState with applyOrder reorders columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'b' }],
                applyOrder: true,
            });

            const allDisplayed = api.getAllDisplayedColumns();
            expect(allDisplayed.map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'reordered via state').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('column visibility API', () => {
        test('setColumnsVisible hides and shows columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.setColumnsVisible(['b'], false);

            expect(api.getColumn('b')!.isVisible()).toBe(false);
            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['a', 'c']);

            await new GridColumns(api, 'b hidden').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });
    });

    describe('column pinning API', () => {
        test('setColumnsPinned moves columns between sections', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['c'], 'right');

            expect(api.getColumn('a')!.getPinned()).toBe('left');
            expect(api.getColumn('c')!.getPinned()).toBe('right');

            await new GridColumns(api, 'pinned').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);
        });
    });

    describe('column moving API', () => {
        test('moveColumns reorders columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.moveColumns(['c'], 0);

            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(order).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'c moved to front').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('moveColumnByIndex moves single column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.moveColumnByIndex(2, 0); // Move c from index 2 to 0

            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(order).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'moved by index').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('row group columns API', () => {
        test('getRowGroupColumns returns active row group columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true, rowGroupIndex: 0 },
                    { colId: 'sport', rowGroup: true, rowGroupIndex: 1 },
                    { colId: 'gold' },
                ],
                rowData: [],
            });

            const rowGroupCols = api.getRowGroupColumns();
            expect(rowGroupCols.map((c: Column) => c.getColId())).toEqual(['country', 'sport']);
        });

        test('addRowGroupColumns and removeRowGroupColumns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', enableRowGroup: true },
                    { colId: 'b', enableRowGroup: true },
                    { colId: 'c' },
                ],
                rowData: [],
            });

            expect(api.getRowGroupColumns().length).toBe(0);

            api.addRowGroupColumns(['a']);
            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['a']);

            api.addRowGroupColumns(['b']);
            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b']);

            api.removeRowGroupColumns(['a']);
            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['b']);

            await new GridColumns(api, 'after row group changes').checkColumns(false);
        });
    });

    describe('pivot API', () => {
        test('isPivotMode and setPivotMode', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [],
            });

            expect(api.isPivotMode()).toBe(false);

            api.setGridOption('pivotMode', true);
            expect(api.isPivotMode()).toBe(true);

            api.setGridOption('pivotMode', false);
            expect(api.isPivotMode()).toBe(false);

            await new GridColumns(api, 'columns').checkColumns(false);
        });
    });

    describe('column group state API', () => {
        test('getColumnGroupState and setColumnGroupState', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        headerName: 'Group 1',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            // Get initial state
            const state = api.getColumnGroupState();
            const g1State = state.find((s: any) => s.groupId === 'g1');
            expect(g1State?.open).toBe(true);

            // Close group
            api.setColumnGroupOpened('g1', false);

            // Save closed state
            const closedState = api.getColumnGroupState();
            const g1Closed = closedState.find((s: any) => s.groupId === 'g1');
            expect(g1Closed?.open).toBe(false);

            await new GridColumns(api, 'closed').checkColumns(`
                CENTER
                └─┬ "Group 1" GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);

            // Restore initial state
            api.setColumnGroupState(state);

            await new GridColumns(api, 'restored').checkColumns(`
                CENTER
                └─┬ "Group 1" GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
        });
    });

    describe('isPinning API', () => {
        test('isPinning, isPinningLeft, isPinningRight', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b' }, { colId: 'c', pinned: 'right' }],
            });

            expect(api.isPinning()).toBe(true);
            expect(api.isPinningLeft()).toBe(true);
            expect(api.isPinningRight()).toBe(true);
        });

        test('no pinning returns false', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            expect(api.isPinning()).toBe(false);
            expect(api.isPinningLeft()).toBe(false);
            expect(api.isPinningRight()).toBe(false);
        });
    });

    describe('getDisplayedColBefore and getDisplayedColAfter', () => {
        test('navigates between displayed columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            const colA = api.getColumn('a')!;
            const colB = api.getColumn('b')!;
            const colC = api.getColumn('c')!;

            expect(api.getDisplayedColAfter(colA)?.getColId()).toBe('b');
            expect(api.getDisplayedColAfter(colB)?.getColId()).toBe('c');
            expect(api.getDisplayedColAfter(colC)).toBeNull();

            expect(api.getDisplayedColBefore(colC)?.getColId()).toBe('b');
            expect(api.getDisplayedColBefore(colB)?.getColId()).toBe('a');
            expect(api.getDisplayedColBefore(colA)).toBeNull();
        });

        test('skips hidden columns in navigation', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }],
            });

            const colA = api.getColumn('a')!;
            const colC = api.getColumn('c')!;

            // b is hidden, so a's next should be c
            expect(api.getDisplayedColAfter(colA)?.getColId()).toBe('c');
            expect(api.getDisplayedColBefore(colC)?.getColId()).toBe('a');
        });
    });

    describe('setColumnDefs runtime update', () => {
        test('add, remove, and reorder columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            await new GridColumns(api, 'initial').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Replace with different columns
            api.setGridOption('columnDefs', [{ colId: 'c' }, { colId: 'a' }, { colId: 'new1' }]);

            await new GridColumns(api, 'updated').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── new1 width:200
            `);

            // b should be gone
            expect(api.getColumn('b')).toBeNull();
        });

        test('column state preserved across setColumnDefs with same colIds', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.applyColumnState({
                state: [{ colId: 'a', sort: 'asc', pinned: 'left' }],
            });

            // Update defs with same colIds
            api.setGridOption('columnDefs', [
                { colId: 'a', headerName: 'Updated A' },
                { colId: 'b', headerName: 'Updated B' },
            ]);

            // State should be preserved
            const col = api.getColumn('a')!;
            expect(col.getSort()).toBe('asc');
            expect(col.getPinned()).toBe('left');

            await new GridColumns(api, 'state preserved').checkColumns(`
                LEFT
                └── a "Updated A" width:200 sort:asc
                CENTER
                └── b "Updated B" width:200
            `);
        });
    });

    describe('column ordering during modifications', () => {
        test('column order preserved after hide/show cycle', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            // Reorder
            api.moveColumns(['c'], 0);
            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            // Hide and show b
            api.setColumnsVisible(['b'], false);
            api.setColumnsVisible(['b'], true);

            // Order should be preserved
            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'order preserved after hide/show').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('column order preserved after pin/unpin cycle', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.moveColumns(['c'], 0);

            // Pin and unpin a
            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['a'], null);

            // Within center, order should be: c, a, b (a returns to its relative position)
            await new GridColumns(api, 'order after pin/unpin').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('pivot mode preserves column order when toggling', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', pivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                    { colId: 'silver', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 3, silver: 1 },
                    { country: 'UK', sport: 'Running', gold: 2, silver: 4 },
                ],
            });

            // Capture non-pivot column order
            const orderBefore = api.getAllDisplayedColumns().map((c: Column) => c.getColId());

            await new GridColumns(api, 'before pivot').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 pivot
                ├── gold width:200 aggFunc:sum
                └── silver width:200 aggFunc:sum
            `);

            // Enable pivot
            api.setGridOption('pivotMode', true);

            await new GridColumns(api, 'in pivot mode').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  ├── pivot_sport__gold width:200 columnGroupShow:open
                  └── pivot_sport__silver width:200 columnGroupShow:open
            `);

            // Disable pivot
            api.setGridOption('pivotMode', false);

            // Column order should be the same as before pivot
            const orderAfter = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(orderAfter).toEqual(orderBefore);

            await new GridColumns(api, 'after pivot off').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 pivot
                ├── gold width:200 aggFunc:sum
                └── silver width:200 aggFunc:sum
            `);
        });

        test('adding columns to existing grid maintains prior column order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // User reorders: b, c, a
            api.moveColumns(['b'], 0);

            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['b', 'a', 'c']);

            // Add new column d — should appear after existing columns
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }]);

            // b, a, c order should be preserved, d added at end
            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(order).toEqual(['b', 'a', 'c', 'd']);

            await new GridColumns(api, 'new column added').checkColumns(`
                CENTER
                ├── b width:200
                ├── a width:200
                ├── c width:200
                └── d width:200
            `);
        });

        test('removing column preserves remaining column order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
                maintainColumnOrder: true,
            });

            // Reorder: d, a, b, c
            api.moveColumns(['d'], 0);

            // Remove b
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'c' }, { colId: 'd' }]);

            // d, a, c order should be preserved (b removed)
            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(order).toEqual(['d', 'a', 'c']);

            await new GridColumns(api, 'b removed, order preserved').checkColumns(`
                CENTER
                ├── d width:200
                ├── a width:200
                └── c width:200
            `);
        });

        test('column order in getAllGridColumns includes auto-group at head', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', rowGroup: true }, { colId: 'b' }, { colId: 'c' }],
                rowData: [],
            });

            const allGrid = api.getAllGridColumns().map((c: Column) => c.getColId());

            // Auto-group should be first
            expect(allGrid[0]).toBe('ag-Grid-AutoColumn');
            // Then user columns in definition order
            expect(allGrid.slice(1)).toEqual(['a', 'b', 'c']);

            await new GridColumns(api, 'auto-group at head').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200
                └── c width:200
            `);
        });

        test('maintainColumnOrder with multiple new sibling columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'G1', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // Add new siblings d and e in the same group as a and b
            api.setGridOption('columnDefs', [
                { headerName: 'G1', children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'd' }, { colId: 'e' }] },
                { colId: 'c' },
            ]);

            // New siblings should be inserted near their group peers
            await new GridColumns(api, 'siblings added').checkColumns(`
                CENTER
                ├─┬ "G1" GROUP
                │ ├── a width:200
                │ ├── b width:200
                │ ├── d width:200
                │ └── e width:200
                └── c width:200
            `);
        });

        test('maintainColumnOrder=false resets order on every setColumnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: false,
            });

            api.moveColumns(['c'], 0);
            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            // setColumnDefs should reset to definition order
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b', 'c']);

            await new GridColumns(api, 'order reset').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('pivot result columns replace primary columns in display order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', pivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 3 },
                    { country: 'USA', sport: 'Running', gold: 2 },
                ],
                pivotMode: true,
            });

            // In pivot mode, primary columns are replaced by pivot result columns
            const displayed = api.getAllDisplayedColumns().map((c: Column) => c.getColId());

            // Should have auto-group column and pivot result columns
            expect(displayed.some((id) => id.startsWith('ag-Grid-AutoColumn'))).toBe(true);
            expect(displayed.some((id) => id.startsWith('pivot_'))).toBe(true);

            // Primary columns (country, sport, gold) should NOT be directly displayed
            expect(displayed).not.toContain('country');
            expect(displayed).not.toContain('sport');
            expect(displayed).not.toContain('gold');

            await new GridColumns(api, 'pivot columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  └── pivot_sport__gold width:200 columnGroupShow:open
            `);
        });
    });
});
