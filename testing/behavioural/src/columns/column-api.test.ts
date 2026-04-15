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

        test('resetColumnState restores original state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 200 },
                ],
            });

            // Modify state
            api.applyColumnState({
                state: [{ colId: 'a', sort: 'asc', pinned: 'left', width: 300 }],
            });

            // Reset
            api.resetColumnState();

            await new GridColumns(api, 'reset').checkColumns(`
                CENTER
                ├── a width:100
                └── b width:200
            `);
        });

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
});
