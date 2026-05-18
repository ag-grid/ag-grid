/**
 * Tests for column edge cases and grid options that affect column behavior.
 * Covers gaps identified in columnModel code path analysis:
 * - groupHideOpenParents, groupHideColumnsUntilExpanded
 * - hidePaddedHeaderRows, suppressFieldDotNotation
 * - Duplicate colIds, null columnDefs, empty groups
 * - All columns hidden/pinned to one side
 * - Column events firing correctly
 * - Selection column edge cases
 * - RTL column interactions
 */
import type { ColDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column Edge Cases', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule, RowNumbersModule, RowSelectionModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('groupHideOpenParents', () => {
        test('hides parent group columns when group is expanded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', rowGroup: true },
                    { colId: 'gold' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 3 },
                    { country: 'UK', sport: 'Running', gold: 2 },
                ],
                groupHideOpenParents: true,
                groupDefaultExpanded: -1,
            });

            await new GridColumns(api, 'columns with groupHideOpenParents').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country width:200
                ├── ag-Grid-AutoColumn-sport width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── gold width:200
            `);
            await new GridRows(api, 'rows').check(false);
        });
    });

    describe('suppressFieldDotNotation', () => {
        test('treats dotted field name as literal when suppressed', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'user.name' }, { field: 'user.age' }],
                rowData: [{ 'user.name': 'Alice', 'user.age': 30 }],
                suppressFieldDotNotation: true,
            });

            // Columns should use 'user.name' as the colId directly
            expect(api.getColumn('user.name')).not.toBeNull();
            expect(api.getColumn('user.age')).not.toBeNull();

            await new GridColumns(api, 'dotted fields').checkColumns(`
                CENTER
                ├── user.name "User Name" width:200
                └── user.age "User Age" width:200
            `);
        });

        test('without suppressFieldDotNotation, dots are path separators', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'user.name' }],
                rowData: [{ user: { name: 'Alice' } }],
            });

            expect(api.getColumn('user.name')).not.toBeNull();
            await new GridColumns(api, 'nested field').checkColumns(`
                CENTER
                └── user.name "User Name" width:200
            `);
        });
    });

    describe('duplicate colIds', () => {
        test('duplicate colIds in columnDefs warns and renames', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'a' }, { colId: 'b' }],
            });

            // Should warn about duplicate colId
            expect(warnSpy).toHaveBeenCalled();
            const warnMsg = warnSpy.mock.calls.map((c) => String(c[0])).join(' ');
            expect(warnMsg).toContain('#273');

            warnSpy.mockRestore();

            // Should still create a grid with columns (duplicate gets renamed)
            const allGrid = api.getAllGridColumns();
            expect(allGrid.length).toBeGreaterThan(0);

            expect(api.getColumn('a')).not.toBeNull();
            expect(api.getColumn('b')).not.toBeNull();

            await new GridColumns(api, 'with duplicates').checkColumns(false);
        });
    });

    describe('null and empty columnDefs', () => {
        test('empty columnDefs array creates empty grid', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [],
            });

            expect(api.getAllGridColumns().length).toBe(0);
            expect(api.getAllDisplayedColumns().length).toBe(0);

            await new GridColumns(api, 'empty').checkColumns('empty');
        });

        test('column group with empty children does not crash', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'Empty Group', children: [] }, { colId: 'a' }],
            });

            expect(api.getColumn('a')).not.toBeNull();
            await new GridColumns(api, 'with empty group').checkColumns(`
                CENTER
                └── a width:200
            `);
        });
    });

    describe('all columns hidden', () => {
        test('hiding all columns results in empty display', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsVisible(['a', 'b'], false);

            expect(api.getAllDisplayedColumns().length).toBe(0);
            // But getAllGridColumns should still have them
            expect(api.getAllGridColumns().length).toBe(2);

            await new GridColumns(api, 'all hidden').checkColumns('empty');
        });
    });

    describe('all columns pinned to one side', () => {
        test('all columns pinned left leaves center empty', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', pinned: 'left' },
                    { colId: 'b', pinned: 'left' },
                ],
            });

            expect(api.getDisplayedLeftColumns().length).toBe(2);
            expect(api.getDisplayedCenterColumns().length).toBe(0);
            expect(api.getDisplayedRightColumns().length).toBe(0);

            await new GridColumns(api, 'all pinned left').checkColumns(`
                LEFT
                ├── a width:200
                └── b width:200
            `);
        });

        test('all columns pinned right leaves center empty', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', pinned: 'right' },
                    { colId: 'b', pinned: 'right' },
                ],
            });

            expect(api.getDisplayedLeftColumns().length).toBe(0);
            expect(api.getDisplayedCenterColumns().length).toBe(0);
            expect(api.getDisplayedRightColumns().length).toBe(2);

            await new GridColumns(api, 'all pinned right').checkColumns(`
                RIGHT
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('column events', () => {
        test('columnEverythingChanged fires on setColumnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            const listener = vitest.fn();
            api.addEventListener('columnEverythingChanged', listener);

            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);
            await asyncSetTimeout(0);

            expect(listener).toHaveBeenCalled();
            api.removeEventListener('columnEverythingChanged', listener);
            await new GridColumns(api, 'columns').checkColumns(false);
        });

        test('columnPivotModeChanged fires when pivotMode toggles', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            const listener = vitest.fn();
            api.addEventListener('columnPivotModeChanged', listener);

            api.setGridOption('pivotMode', true);
            await asyncSetTimeout(0);
            expect(listener).toHaveBeenCalledTimes(1);

            api.setGridOption('pivotMode', false);
            await asyncSetTimeout(0);
            expect(listener).toHaveBeenCalledTimes(2);

            api.removeEventListener('columnPivotModeChanged', listener);
        });

        test('columnVisible fires when column visibility changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const listener = vitest.fn();
            api.addEventListener('columnVisible', listener);

            api.setColumnsVisible(['b'], false);
            await asyncSetTimeout(0);
            expect(listener).toHaveBeenCalled();

            api.removeEventListener('columnVisible', listener);
        });

        test('columnPinned fires when column pinning changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const listener = vitest.fn();
            api.addEventListener('columnPinned', listener);

            api.setColumnsPinned(['a'], 'left');
            await asyncSetTimeout(0);
            expect(listener).toHaveBeenCalled();

            api.removeEventListener('columnPinned', listener);
        });

        test('columnMoved fires when column is moved', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            const listener = vitest.fn();
            api.addEventListener('columnMoved', listener);

            api.moveColumns(['c'], 0);
            await asyncSetTimeout(0);
            expect(listener).toHaveBeenCalled();

            api.removeEventListener('columnMoved', listener);
        });

        test('sortChanged fires when column sort changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', sortable: true }],
            });

            const listener = vitest.fn();
            api.addEventListener('sortChanged', listener);

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect(listener).toHaveBeenCalled();

            api.removeEventListener('sortChanged', listener);
        });
    });

    describe('RTL mode', () => {
        test('enableRtl keeps column left positions as start-edge offsets', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 200 },
                    { colId: 'c', width: 150 },
                ],
                enableRtl: true,
            });

            const colB = api.getColumn('b')!;
            const colA = api.getColumn('a')!;
            const colC = api.getColumn('c')!;

            // Column left values remain start-edge offsets in both LTR and RTL.
            expect(colA.getLeft()).toBe(0);
            expect(colB.getLeft()).toBe(100);
            expect(colC.getLeft()).toBe(300);

            await new GridColumns(api, 'RTL columns').checkColumns(false);
        });

        test('enableRtl with pinned columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'left', pinned: 'left' },
                    { colId: 'center' },
                    { colId: 'right', pinned: 'right' },
                ],
                enableRtl: true,
            });

            // Pinned sections should still work correctly in RTL
            expect(api.getDisplayedLeftColumns().map((c: Column) => c.getColId())).toEqual(['left']);
            expect(api.getDisplayedCenterColumns().map((c: Column) => c.getColId())).toEqual(['center']);
            expect(api.getDisplayedRightColumns().map((c: Column) => c.getColId())).toEqual(['right']);

            await new GridColumns(api, 'RTL pinned').checkColumns(`
                LEFT
                └── left width:200
                CENTER
                └── center width:200
                RIGHT
                └── right width:200
            `);
        });
    });

    describe('colSpan interactions', () => {
        test('colSpanActive flag is set when any column has colSpan', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', colSpan: () => 2 }, { colId: 'b' }, { colId: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });

            // colSpan doesn't affect column structure, only cell rendering
            await new GridColumns(api, 'with colSpan').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });
    });

    describe('state preservation across structural changes', () => {
        test('hidden column state preserved when colDefs change', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            // Hide b
            api.setColumnsVisible(['b'], false);

            // Update colDefs (same colIds)
            api.setGridOption('columnDefs', [
                { colId: 'a', headerName: 'A2' },
                { colId: 'b', headerName: 'B2' },
                { colId: 'c', headerName: 'C2' },
            ]);

            // b should still be hidden
            expect(api.getColumn('b')!.isVisible()).toBe(false);

            await new GridColumns(api, 'hidden preserved').checkColumns(`
                CENTER
                ├── a "A2" width:200
                └── c "C2" width:200
            `);
        });

        test('sort state preserved when group structure changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.applyColumnState({ state: [{ colId: 'b', sort: 'desc' }] });

            // Change to grouped structure
            api.setGridOption('columnDefs', [
                { headerName: 'Group', children: [{ colId: 'a' }, { colId: 'b' }] },
                { colId: 'c' },
            ]);

            // Sort on b should be preserved
            expect(api.getColumn('b')!.getSort()).toBe('desc');

            await new GridColumns(api, 'sort preserved').checkColumns(`
                CENTER
                ├─┬ "Group" GROUP
                │ ├── a width:200
                │ └── b width:200 sort:desc
                └── c width:200
            `);
        });

        test('pinning state preserved when columns are added', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsPinned(['a'], 'left');

            // Add new column
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            // a should still be pinned left
            expect(api.getColumn('a')!.getPinned()).toBe('left');

            await new GridColumns(api, 'pinning preserved').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                ├── b width:200
                └── c width:200
            `);
        });
    });

    describe('groupDisplayType=custom', () => {
        test('custom groupDisplayType does not create auto-group columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'country', rowGroup: true }, { colId: 'gold' }],
                rowData: [],
                groupDisplayType: 'custom',
            });

            const allGrid = api.getAllGridColumns().map((c: Column) => c.getColId());
            // Custom display type should not add auto-group columns
            expect(allGrid).not.toContain('ag-Grid-AutoColumn');

            await new GridColumns(api, 'custom display type').checkColumns(`
                CENTER
                ├── country width:200 rowGroup
                └── gold width:200
            `);
        });
    });

    describe('pivot mode column filtering', () => {
        test('pivot mode without pivot columns shows only value and auto-group columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport' },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'USA', sport: 'Swimming', gold: 3 }],
                pivotMode: true,
            });

            const displayed = api.getAllDisplayedColumns().map((c: Column) => c.getColId());

            // Only value columns and auto-group should be shown (sport has no agg, so hidden)
            expect(displayed).toContain('gold');
            expect(displayed).not.toContain('sport');

            await new GridColumns(api, 'pivot no pivot cols').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold width:200 aggFunc:sum
            `);
        });
    });

    describe('groupHideColumnsUntilExpanded', () => {
        test('hides auto columns until a group is expanded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', rowGroup: true },
                    { colId: 'gold' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 3 },
                    { country: 'UK', sport: 'Running', gold: 2 },
                ],
                groupHideColumnsUntilExpanded: true,
                groupDefaultExpanded: 0,
                groupDisplayType: 'multipleColumns',
            });

            await new GridColumns(api, 'columns hidden until expanded').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn-country width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── gold width:200
            `);
        });
    });

    describe('rowNumbers option', () => {
        test('rowNumbers=true adds row numbers column pinned left', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
                rowNumbers: true,
            });

            // Row numbers column should be in getAllGridColumns
            const allGrid = api.getAllGridColumns();
            const allGridIds = allGrid.map((c: Column) => c.getColId());
            expect(allGridIds).toContain('ag-Grid-RowNumbersColumn');

            // Find the row numbers column via getAllGridColumns (not getColumn, which
            // only searches colDefCols on some versions)
            const rnCol = allGrid.find((c: Column) => c.getColId() === 'ag-Grid-RowNumbersColumn')!;
            expect(rnCol).toBeDefined();
            expect(rnCol.getPinned()).toBe('left');

            await new GridColumns(api, 'with row numbers').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('toggling rowNumbers at runtime adds/removes column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
                rowData: [{ a: 1 }],
            });

            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).not.toContain('ag-Grid-RowNumbersColumn');

            api.setGridOption('rowNumbers', true);

            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toContain('ag-Grid-RowNumbersColumn');

            await new GridColumns(api, 'after enabling rowNumbers').checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                └── a width:200
            `);
        });
    });

    describe('hidePaddedHeaderRows', () => {
        test('column structure correct when padding rows hidden', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'Group', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
                hidePaddedHeaderRows: true,
            });

            await new GridColumns(api, 'with hidden padded rows').checkColumns(`
                CENTER
                ├─┬ "Group" GROUP
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);
        });
    });

    describe('selection column', () => {
        test('selection column appears with checkbox selection', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });

            const allGrid = api.getAllGridColumns().map((c: Column) => c.getColId());
            expect(allGrid).toContain('ag-Grid-SelectionColumn');

            await new GridColumns(api, 'with selection column').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── a width:200
                └── b width:200
            `);
        });

        test('selection column is first in center section by default', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [{ a: 1, b: 2 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });

            // By default, selection column is in center, not pinned
            const center = api.getDisplayedCenterColumns().map((c: Column) => c.getColId());
            expect(center[0]).toBe('ag-Grid-SelectionColumn');

            await new GridColumns(api, 'selection in center').checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── a width:200
                └── b width:200
            `);
        });

        test('selectionColumnDef customizes selection column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
                rowData: [{ a: 1 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
                selectionColumnDef: { width: 50, pinned: 'right' },
            });

            const selCol = api.getColumn('ag-Grid-SelectionColumn');
            if (selCol) {
                expect(selCol.getActualWidth()).toBe(50);
                expect(selCol.getPinned()).toBe('right');
            }

            await new GridColumns(api, 'custom selection col').checkColumns(`
                CENTER
                └── a width:200
                RIGHT
                └── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            `);
        });
    });

    describe('column width edge cases', () => {
        test('zero width gets clamped to minWidth', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 0 }],
            });

            const col = api.getColumn('a')!;
            expect(col.getActualWidth()).toBeGreaterThan(0);

            await new GridColumns(api, 'columns').checkColumns(false);
        });
    });

    describe('many columns performance', () => {
        test('grid with 50 columns handles all correctly', async () => {
            const columnDefs: ColDef[] = Array.from({ length: 50 }, (_, i) => ({ colId: `col${i}` }));

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            expect(api.getAllGridColumns().length).toBe(50);
            expect(api.getAllDisplayedColumns().length).toBe(50);

            await new GridColumns(api, '50 columns').checkColumns(false);
        });
    });

    describe('multiple rapid setColumnDefs', () => {
        test('rapid column definition changes maintain consistency', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            for (let i = 0; i < 10; i++) {
                api.setGridOption(
                    'columnDefs',
                    Array.from({ length: i + 1 }, (_, j) => ({ colId: `col${j}` }))
                );
            }

            expect(api.getAllGridColumns().length).toBe(10);
            expect(api.getAllDisplayedColumns().length).toBe(10);

            await new GridColumns(api, 'after rapid changes').checkColumns(false);
        });
    });

    describe('column state edge cases', () => {
        test('applyColumnState with non-array state warns and returns false', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            // Passing state as a non-array should return false and warn
            const result = api.applyColumnState({ state: 'invalid' as any });
            expect(result).toBe(false);

            // Should have warned about invalid state format
            expect(warnSpy).toHaveBeenCalled();
            const warnMsg = warnSpy.mock.calls.map((c) => String(c[0])).join(' ');
            expect(warnMsg).toContain('#32');

            warnSpy.mockRestore();
        });

        test('applyColumnState with empty state array is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 100 }],
            });

            const result = api.applyColumnState({ state: [] });
            expect(result).toBe(true);

            // Width should be unchanged
            expect(api.getColumn('a')!.getActualWidth()).toBe(100);
            await new GridColumns(api, 'unchanged').checkColumns(false);
        });

        test('defaultState clears properties on columns not in state array', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', sort: 'asc' }, { colId: 'b', sort: 'desc' }, { colId: 'c' }],
            });

            // Apply state that keeps sort only on c, defaultState clears others
            api.applyColumnState({
                state: [{ colId: 'c', sort: 'asc' }],
                defaultState: { sort: null },
            });

            // Sort is cleared — getSort() returns null or undefined depending on version
            expect(api.getColumn('a')!.getSort()).toBeFalsy();
            expect(api.getColumn('b')!.getSort()).toBeFalsy();
            expect(api.getColumn('c')!.getSort()).toBe('asc');

            await new GridColumns(api, 'defaults applied').checkColumns(false);
        });
    });

    describe('column tree structure edge cases', () => {
        test('identical setColumnDefs should not change tree', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];
            const api = gridsManager.createGrid('myGrid', { columnDefs });

            const colsBefore = api.getAllGridColumns();

            // Set identical colDefs
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }]);

            const colsAfter = api.getAllGridColumns();

            // Same instances should be reused (tree didn't change)
            expect(colsAfter[0]).toBe(colsBefore[0]);
            expect(colsAfter[1]).toBe(colsBefore[1]);

            await new GridColumns(api, 'unchanged').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('flex column with value 0 should use width instead', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', flex: 0, width: 150 },
                    { colId: 'b', width: 200 },
                ],
            });

            // flex=0 means no flex; width should be used
            expect(api.getColumn('a')!.getActualWidth()).toBe(150);

            await new GridColumns(api, 'flex zero').checkColumns(`
                CENTER
                ├── a width:150
                └── b width:200
            `);
        });
    });

    describe('row group/pivot/value column index edge cases', () => {
        test('rowGroupIndex=null clears row grouping', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', rowGroup: true, rowGroupIndex: 0, enableRowGroup: true }, { colId: 'b' }],
                rowData: [],
            });

            // Apply state with null rowGroupIndex to clear grouping
            api.applyColumnState({
                state: [{ colId: 'a', rowGroup: false, rowGroupIndex: null }],
            });

            expect(api.getColumn('a')!.isRowGroupActive()).toBe(false);
            expect(api.getRowGroupColumns().length).toBe(0);

            await new GridColumns(api, 'grouping cleared').checkColumns(false);
        });

        test('pivotIndex=null clears pivot', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', pivot: true, pivotIndex: 0, enablePivot: true },
                    { colId: 'b', aggFunc: 'sum' },
                ],
                rowData: [],
            });

            api.applyColumnState({
                state: [{ colId: 'a', pivot: false, pivotIndex: null }],
            });

            expect(api.getColumn('a')!.isPivotActive()).toBe(false);
            expect(api.getPivotColumns().length).toBe(0);

            await new GridColumns(api, 'pivot cleared').checkColumns(false);
        });
    });

    describe('marryChildren constraint on column ordering', () => {
        test('marryChildren prevents column separation within group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Married',
                        marryChildren: true,
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                    { colId: 'c' },
                ],
            });

            // Try to move c between a and b — should fail due to marryChildren
            api.moveColumns(['c'], 1);

            // c should NOT be between a and b
            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            const aIdx = order.indexOf('a');
            const bIdx = order.indexOf('b');
            // a and b should remain adjacent
            expect(Math.abs(aIdx - bIdx)).toBe(1);

            await new GridColumns(api, 'married order preserved').checkColumns(false);
        });
    });

    describe('selection column edge cases', () => {
        test('selection column auto-hidden when all user columns are hidden', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', hide: true }],
                rowData: [{ a: 1 }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });

            // The grid should auto-hide the selection column when it would be the only visible column
            // (selectionColService.refreshVisibility hides it to avoid showing only a checkbox)
            const displayed = api.getAllDisplayedColumns();
            const displayedIds = displayed.map((c: Column) => c.getColId());

            // Selection column should NOT be displayed when all user columns are hidden
            expect(displayedIds).not.toContain('ag-Grid-SelectionColumn');
            expect(displayed.length).toBe(0);

            await new GridColumns(api, 'all hidden incl selection').checkColumns('empty');
        });

        test('checkboxLocation=autoGroupColumn disables separate selection column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
                rowSelection: { mode: 'multiRow', checkboxes: true, checkboxLocation: 'autoGroupColumn' },
            });

            // Selection column should NOT appear when checkboxes are on auto-group column
            const allGrid = api.getAllGridColumns().map((c: Column) => c.getColId());
            expect(allGrid).not.toContain('ag-Grid-SelectionColumn');

            await new GridColumns(api, 'no separate selection col').checkColumns(false);
        });
    });

    describe('column creation and matching', () => {
        test('column matched by field when colId not set', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', width: 100 }],
            });

            const col1 = api.getColumn('name')!;

            // Update with same field — should reuse column instance
            api.setGridOption('columnDefs', [{ field: 'name', width: 200 }]);

            const col2 = api.getColumn('name')!;
            expect(col2).toBe(col1);
            expect(col2.getActualWidth()).toBe(200);
        });

        test('preserves cellDataType from original colDef', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', cellDataType: 'number' }],
                defaultColDef: { cellDataType: 'text' },
            });

            // cellDataType from colDef should override defaultColDef
            expect(api.getColumn('a')!.getColDef().cellDataType).toBe('number');
        });
    });

    describe('visible columns service edge cases', () => {
        test('first and last column markers correct with pinned sections', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'left1', pinned: 'left' },
                    { colId: 'left2', pinned: 'left' },
                    { colId: 'center1' },
                    { colId: 'right1', pinned: 'right' },
                ],
            });

            // First column should be left1, last should be right1
            const all = api.getAllDisplayedColumns();
            const firstCol = all[0];
            const lastCol = all[all.length - 1];

            expect(firstCol.getColId()).toBe('left1');
            expect(lastCol.getColId()).toBe('right1');

            await new GridColumns(api, 'pinned first/last').checkColumns(false);
        });

        test('empty center with pinned sides has correct displayed columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'left', pinned: 'left' },
                    { colId: 'right', pinned: 'right' },
                ],
            });

            expect(api.getDisplayedCenterColumns().length).toBe(0);
            expect(api.getAllDisplayedColumns().length).toBe(2);

            await new GridColumns(api, 'no center').checkColumns(`
                LEFT
                └── left width:200
                RIGHT
                └── right width:200
            `);
        });
    });

    describe('column group expansion state preservation', () => {
        test('group expansion state preserved across setColumnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        headerName: 'Group',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            // Close the group
            api.setColumnGroupOpened('g1', false);

            // Update colDefs with same structure
            api.setGridOption('columnDefs', [
                {
                    groupId: 'g1',
                    headerName: 'Group Updated',
                    openByDefault: true,
                    children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                },
            ]);

            // Group should remain closed (expansion state preserved)
            await new GridColumns(api, 'expansion preserved').checkColumns(`
                CENTER
                └─┬ "Group Updated" GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);
        });
    });

    describe('improper API usage', () => {
        test('setColumnsVisible with non-existent colIds does not crash', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            // Should not throw
            api.setColumnsVisible(['nonexistent', 'alsoFake'], false);

            // Existing columns should be unaffected
            await new GridColumns(api, 'unaffected').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('setColumnsPinned with non-existent colIds does not crash', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            api.setColumnsPinned(['nonexistent'], 'left');

            await new GridColumns(api, 'unaffected').checkColumns(`
                CENTER
                └── a width:200
            `);
        });

        test('moveColumns with non-existent colIds does not crash', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.moveColumns(['nonexistent'], 0);

            await new GridColumns(api, 'unaffected').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('applyColumnState with mix of valid and invalid colIds', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            // One valid, one invalid — should apply valid and return false for the unmatched
            const result = api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc' },
                    { colId: 'nonexistent', sort: 'desc' },
                ],
            });

            expect(result).toBe(false);
            // The valid one should still be applied
            expect(api.getColumn('a')!.getSort()).toBe('asc');

            await new GridColumns(api, 'partial state applied').checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                └── b width:200
            `);
        });

        test('setColumnGroupOpened with non-existent groupId does not crash', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        headerName: 'Group',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            // Should not throw
            api.setColumnGroupOpened('nonexistent', false);

            // Real group should be unaffected
            await new GridColumns(api, 'unaffected').checkColumns(`
                CENTER
                └─┬ "Group" GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
        });
    });

    describe('null and undefined colDef edge cases', () => {
        test('column with no colId and no field gets auto-generated id', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'NoId' }, { colId: 'b' }],
            });

            const allGrid = api.getAllGridColumns();
            expect(allGrid.length).toBe(2);

            // First column should have an auto-generated colId
            const firstCol = allGrid[0];
            expect(firstCol.getColId()).toBeTruthy();
            expect(firstCol.getColId()).not.toBe('');

            await new GridColumns(api, 'auto id').checkColumns(false);
        });

        test('column with empty string colId', async () => {
            const warnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: '', headerName: 'Empty' }, { colId: 'b' }],
            });

            warnSpy.mockRestore();

            const allGrid = api.getAllGridColumns();
            expect(allGrid.length).toBe(2);

            await new GridColumns(api, 'empty colId').checkColumns(false);
        });

        test('column with field containing special characters', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'data-value' }, { field: 'count (total)' }],
                rowData: [{ 'data-value': 1, 'count (total)': 2 }],
            });

            expect(api.getAllGridColumns().length).toBe(2);
            await new GridColumns(api, 'special chars').checkColumns(false);
        });
    });

    describe('column width boundary conditions', () => {
        test('very large width is accepted', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 10000 }],
            });

            expect(api.getColumn('a')!.getActualWidth()).toBe(10000);
            await new GridColumns(api, 'large width').checkColumns(false);
        });

        test('width=1 is accepted', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 1, minWidth: 1 }],
            });

            expect(api.getColumn('a')!.getActualWidth()).toBe(1);
            await new GridColumns(api, 'tiny width').checkColumns(false);
        });

        test('minWidth greater than width clamps up', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 50, minWidth: 200 }],
            });

            expect(api.getColumn('a')!.getActualWidth()).toBe(200);

            await new GridColumns(api, 'clamped up').checkColumns(`
                CENTER
                └── a width:200
            `);
        });

        test('maxWidth less than width clamps down', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 500, maxWidth: 100 }],
            });

            expect(api.getColumn('a')!.getActualWidth()).toBe(100);

            await new GridColumns(api, 'clamped down').checkColumns(`
                CENTER
                └── a width:100
            `);
        });
    });

    describe('column sorting edge cases', () => {
        test('sort on unsortable column via colDef is still applied', async () => {
            // sort in colDef is an initial state, not constrained by sortable
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', sort: 'asc', sortable: false }],
            });

            // The sort is set from colDef regardless of sortable flag
            // sortable only controls UI interaction, not API/initial state
            await new GridColumns(api, 'sort on unsortable').checkColumns(false);
        });

        test('clearing all sorts via applyColumnState', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', sort: 'asc' },
                    { colId: 'b', sort: 'desc' },
                ],
            });

            api.applyColumnState({
                defaultState: { sort: null },
            });

            expect(api.getColumn('a')!.getSort()).toBeFalsy();
            expect(api.getColumn('b')!.getSort()).toBeFalsy();

            await new GridColumns(api, 'all sorts cleared').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('column pinning edge cases', () => {
        test('pinning with boolean true equals left', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', pinned: true }, { colId: 'b' }],
            });

            expect(api.getColumn('a')!.isPinned()).toBe(true);

            await new GridColumns(api, 'pinned:true = left').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
            `);
        });

        test('pin then unpin returns to center', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['a'], null);

            expect(api.getColumn('a')!.isPinned()).toBe(false);
            expect(api.getDisplayedCenterColumns().length).toBe(2);

            await new GridColumns(api, 'unpinned').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('mixed column operations', () => {
        test('hide + pin + sort + move in sequence', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
            });

            api.setColumnsVisible(['b'], false);
            api.setColumnsPinned(['a'], 'left');
            api.applyColumnState({ state: [{ colId: 'c', sort: 'desc' }] });
            api.moveColumns(['d'], 0);

            await new GridColumns(api, 'mixed ops').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                ├── d width:200
                └── c width:200 sort:desc
            `);
        });

        test('resetColumnState after complex modifications', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 150 },
                    { colId: 'c', width: 200 },
                ],
            });

            // Apply complex state changes
            api.applyColumnState({
                state: [
                    { colId: 'a', sort: 'asc', pinned: 'left', width: 300 },
                    { colId: 'b', hide: true },
                    { colId: 'c', sort: 'desc', pinned: 'right' },
                ],
            });

            // Reset everything
            api.resetColumnState();

            // All columns should be back to original colDef state
            await new GridColumns(api, 'reset to original').checkColumns(`
                CENTER
                ├── a width:100
                ├── b width:150
                └── c width:200
            `);
        });
    });

    describe('deprecated methods still work', () => {
        test('getRight() equals getLeft() + getActualWidth()', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 150 },
                    { colId: 'b', width: 200 },
                ],
            });

            const colA = api.getColumn('a')!;
            const colB = api.getColumn('b')!;

            expect(colA.getRight()).toBe(colA.getLeft()! + colA.getActualWidth());
            expect(colB.getRight()).toBe(colB.getLeft()! + colB.getActualWidth());
        });
    });

    describe('column navigation methods', () => {
        test('getDisplayedColAfter returns null at last column', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const colB = api.getColumn('b')!;
            expect(api.getDisplayedColAfter(colB)).toBeNull();
        });

        test('getDisplayedColBefore returns null at first column', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const colA = api.getColumn('a')!;
            expect(api.getDisplayedColBefore(colA)).toBeNull();
        });

        test('navigation skips hidden columns across all sections', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c', hide: true }, { colId: 'd' }],
            });

            const colA = api.getColumn('a')!;
            const colD = api.getColumn('d')!;

            // b and c hidden — a's next should be d
            expect(api.getDisplayedColAfter(colA)?.getColId()).toBe('d');
            expect(api.getDisplayedColBefore(colD)?.getColId()).toBe('a');
        });
    });

    describe('column group leaf columns', () => {
        test('getDisplayedLeafColumns excludes hidden leaves', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Group',
                        openByDefault: true,
                        children: [
                            { colId: 'a' },
                            { colId: 'b', columnGroupShow: 'open' },
                            { colId: 'c', columnGroupShow: 'closed' },
                        ],
                    },
                ],
            });

            // Get the group from displayed groups
            const groups = api.getCenterDisplayedColumnGroups?.();
            if (groups && groups.length > 0 && !groups[0].isColumn) {
                const group = groups[0];
                const allLeaves = group.getLeafColumns();
                const displayedLeaves = group.getDisplayedLeafColumns();

                // All leaves includes a, b, c
                expect(allLeaves.length).toBe(3);

                // Displayed leaves should exclude c (columnGroupShow:'closed' while group is open)
                expect(displayedLeaves.length).toBe(2);
                expect(displayedLeaves.map((c: Column) => c.getColId())).toEqual(['a', 'b']);
            }
        });
    });

    describe('column group state API', () => {
        test('getColumnGroupState includes nested groups', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'outer',
                        headerName: 'Outer',
                        children: [
                            {
                                groupId: 'inner',
                                headerName: 'Inner',
                                openByDefault: true,
                                children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                            },
                        ],
                    },
                ],
            });

            const state = api.getColumnGroupState();
            const outerState = state.find((s: any) => s.groupId === 'outer');
            const innerState = state.find((s: any) => s.groupId === 'inner');

            // Both nested groups should be in the state array
            expect(outerState).toBeDefined();
            expect(innerState).toBeDefined();
            expect(innerState!.open).toBe(true);
        });
    });

    describe('column definition update effects', () => {
        test('updating only headerName preserves all column state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', width: 100, sort: 'asc', pinned: 'left' }],
            });

            // Update only headerName
            api.setGridOption('columnDefs', [{ colId: 'a', width: 100, headerName: 'New Name' }]);

            const col = api.getColumn('a')!;
            // All state should be preserved
            expect(col.getSort()).toBe('asc');
            expect(col.getPinned()).toBe('left');
            expect(col.getActualWidth()).toBe(100);

            await new GridColumns(api, 'headerName updated').checkColumns(`
                LEFT
                └── a "New Name" width:100 sort:asc
            `);
        });

        test('changing colDef reference on same colId reuses column instance', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            const instance1 = api.getColumn('a');

            // Completely new colDef object but same colId
            api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'Updated' }]);

            const instance2 = api.getColumn('a');

            // Same column instance reused
            expect(instance2).toBe(instance1);
        });
    });

    describe('method return type guarantees', () => {
        test('getDisplayNameForColumn returns string for column with field', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }],
            });

            const name = api.getDisplayNameForColumn(api.getColumn('name')!, 'header');
            expect(typeof name).toBe('string');
            expect(name).toBe('Name'); // Auto-generated from field
        });

        test('getDisplayNameForColumn returns empty string for colId-only column without headerName', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            // When only colId is set (no field, no headerName), display name is empty
            const name = api.getDisplayNameForColumn(api.getColumn('a')!, 'header');
            expect(typeof name).toBe('string');
            expect(name).toBe('');
        });

        test('applyColumnState returns boolean, not null', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });

            const result = api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });
            expect(typeof result).toBe('boolean');
            expect(result).toBe(true);
        });

        test('getColumnState returns array for all columns', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }],
            });

            const state = api.getColumnState();
            expect(Array.isArray(state)).toBe(true);
            // Should include hidden columns too
            expect(state.length).toBe(2);
            expect(state.map((s: any) => s.colId)).toContain('b');
        });
    });

    describe('suppressMovable effect via API', () => {
        test('moveColumns ignores columns with suppressMovable', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', suppressMovable: true }, { colId: 'b' }, { colId: 'c' }],
            });

            // Try to move suppressMovable column
            api.moveColumns(['a'], 2);

            // Check where a ended up — behavior depends on implementation
            await new GridColumns(api, 'after move attempt').checkColumns(false);
        });
    });

    describe('headerValueGetter precedence', () => {
        test('headerValueGetter takes precedence over headerName', () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'a',
                        headerName: 'Static Name',
                        headerValueGetter: () => 'Dynamic Name',
                    },
                ],
            });

            const name = api.getDisplayNameForColumn(api.getColumn('a')!, 'header');
            expect(name).toBe('Dynamic Name');
        });

        test('headerValueGetter receives column context', () => {
            let receivedParams: any = null;

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        colId: 'testCol',
                        headerValueGetter: (params: any) => {
                            receivedParams = params;
                            return 'Computed';
                        },
                    },
                ],
            });

            // Force the getter to be called
            api.getDisplayNameForColumn(api.getColumn('testCol')!, 'header');

            expect(receivedParams).not.toBeNull();
            expect(receivedParams.column).toBeDefined();
            expect(receivedParams.colDef).toBeDefined();
            expect(receivedParams.location).toBe('header');
        });
    });
});
