import type { ColDef, Column, ColumnState } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
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

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });
    });

    describe('getColumn', () => {
        test('finds column by colId string', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'myCol' }, { colId: 'other' }],
            });
            await new GridColumns(api, `finds column by colId string setup`).checkColumns(`
                CENTER
                ├── myCol width:200
                └── other width:200
            `);
            await new GridRows(api, `finds column by colId string setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn('myCol');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('myCol');
            await new GridRows(api, `finds column by colId string final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('finds column by field when no explicit colId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name' }, { field: 'age' }],
            });
            await new GridColumns(api, `finds column by field when no explicit colId setup`).checkColumns(`
                CENTER
                ├── name "Name" width:200
                └── age "Age" width:200
            `);
            await new GridRows(api, `finds column by field when no explicit colId setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const col = api.getColumn('name');
            expect(col).not.toBeNull();
            expect(col!.getColId()).toBe('name');
            await new GridRows(api, `finds column by field when no explicit colId final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns null for non-existent column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });
            await new GridColumns(api, `returns null for non-existent column setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `returns null for non-existent column setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumn('nonexistent')).toBeNull();
            await new GridRows(api, `returns null for non-existent column final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('finds auto-group column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });
            await new GridColumns(api, `finds auto-group column setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
            await new GridRows(api, `finds auto-group column setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const autoCol = api.getColumn('ag-Grid-AutoColumn');
            expect(autoCol).not.toBeNull();
            await new GridRows(api, `finds auto-group column final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('finds column by Column object reference', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `finds column by Column object reference setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `finds column by Column object reference setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const colA = api.getColumn('a')!;
            // Finding by the column object itself should return the same instance
            const found = api.getColumn(colA);
            expect(found).toBe(colA);
            await new GridRows(api, `finds column by Column object reference final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getColumnDef', () => {
        test('returns colDef for regular columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerName: 'Alpha' }],
            });
            await new GridColumns(api, `returns colDef for regular columns setup`).checkColumns(`
                CENTER
                └── a "Alpha" width:200
            `);
            await new GridRows(api, `returns colDef for regular columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const def = api.getColumnDef('a');
            expect(def).not.toBeNull();
            expect(def?.colId).toBe('a');
            expect(def?.headerName).toBe('Alpha');
            await new GridRows(api, `returns colDef for regular columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns colDef for auto-group columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });
            await new GridColumns(api, `returns colDef for auto-group columns setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
            await new GridRows(api, `returns colDef for auto-group columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Auto-group column should have a colDef accessible via getColumnDef
            const autoGroupDef = api.getColumnDef('ag-Grid-AutoColumn');
            expect(autoGroupDef).not.toBeNull();
            await new GridRows(api, `returns colDef for auto-group columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns null for non-existent column', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });
            await new GridColumns(api, `returns null for non-existent column setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `returns null for non-existent column setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getColumnDef('nonexistent')).toBeNull();
            await new GridRows(api, `returns null for non-existent column final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getColumns', () => {
        test('returns all primary columns (from columnDefs)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `returns all primary columns (from columnDefs) setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `returns all primary columns (from columnDefs) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const cols = api.getColumns();
            expect(cols).not.toBeNull();
            expect(cols!.length).toBe(2);
            expect(cols!.map((c: any) => c.getColId())).toEqual(['a', 'b']);
            await new GridRows(api, `returns all primary columns (from columnDefs) final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('no column-mutation callback fires synchronously during initial grid creation', () => {
            const fired: string[] = [];
            const cb = (name: string) => () => fired.push(name);
            const api = gridsManager.createGrid('readiness', {
                columnDefs: [
                    { field: 'a', rowGroup: true, hide: true },
                    { field: 'b', pivot: true },
                    { field: 'c', aggFunc: 'sum' },
                    { field: 'd' },
                ],
                rowData: [{ a: 'x', b: 'p', c: 1, d: 2 }],
                pivotMode: true,
                onColumnRowGroupChanged: cb('columnRowGroupChanged'),
                onColumnPivotChanged: cb('columnPivotChanged'),
                onColumnValueChanged: cb('columnValueChanged'),
                onColumnVisible: cb('columnVisible'),
                onNewColumnsLoaded: cb('newColumnsLoaded'),
                onDisplayedColumnsChanged: cb('displayedColumnsChanged'),
            });
            expect(fired).toEqual([]);
            expect(api.getColumns()).not.toBeNull();
        });

        test('does not include auto-generated columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });
            await new GridColumns(api, `does not include auto-generated columns setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── group width:200 rowGroup
                └── value width:200
            `);
            await new GridRows(api, `does not include auto-generated columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const cols = api.getColumns();
            // getColumns() returns colDefCols — user-defined columns only
            const colIds = cols!.map((c: any) => c.getColId());
            expect(colIds).toContain('group');
            expect(colIds).toContain('value');
            // Auto-group column should NOT be in getColumns() — it's in getAllGridColumns()
            expect(colIds).not.toContain('ag-Grid-AutoColumn');
            await new GridRows(api, `does not include auto-generated columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getAllGridColumns vs getColumns', () => {
        test('getAllGridColumns includes auto columns, getColumns does not', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'group', rowGroup: true }, { colId: 'value' }],
                rowData: [],
            });
            await new GridColumns(api, `getAllGridColumns includes auto columns, getColumns does not setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── group width:200 rowGroup
                    └── value width:200
                `);
            await new GridRows(api, `getAllGridColumns includes auto columns, getColumns does not setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const allGrid = api.getAllGridColumns();
            const cols = api.getColumns();

            // getAllGridColumns includes auto-group, getColumns does not
            expect(allGrid.length).toBeGreaterThan(cols!.length);
            expect(allGrid.map((c: any) => c.getColId())).toContain('ag-Grid-AutoColumn');
            expect(cols!.map((c: any) => c.getColId())).not.toContain('ag-Grid-AutoColumn');
            await new GridRows(api, `getAllGridColumns includes auto columns, getColumns does not final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });
    });

    describe('getColumnDefs', () => {
        test('returns current column definitions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', headerName: 'Alpha' }, { colId: 'b' }],
            });
            await new GridColumns(api, `returns current column definitions setup`).checkColumns(`
                CENTER
                ├── a "Alpha" width:200
                └── b width:200
            `);
            await new GridRows(api, `returns current column definitions setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs();
            expect(defs).toBeDefined();
            expect(defs!.length).toBe(2);
            expect((defs![0] as ColDef).colId).toBe('a');
            await new GridRows(api, `returns current column definitions final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns definitions in display order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'b' }, { colId: 'a' }],
            });
            await new GridColumns(api, `returns definitions in display order setup`).checkColumns(`
                CENTER
                ├── b width:200
                └── a width:200
            `);
            await new GridRows(api, `returns definitions in display order setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Move a to first position
            api.moveColumns(['a'], 0);
            await new GridColumns(api, `returns definitions in display order after moveColumns`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);

            const defs = api.getColumnDefs();
            expect(defs).toBeDefined();
            // Defs should reflect display order after move
            expect((defs![0] as ColDef).colId).toBe('a');
            expect((defs![1] as ColDef).colId).toBe('b');
        });

        test('includes group definitions', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'Group', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
            });
            await new GridColumns(api, `includes group definitions setup`).checkColumns(`
                CENTER
                ├─┬ "Group" GROUP
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);
            await new GridRows(api, `includes group definitions setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const defs = api.getColumnDefs();
            expect(defs!.length).toBe(2);
            expect('children' in defs![0]).toBe(true);
            await new GridRows(api, `includes group definitions final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('reports rowGroupIndex/pivotIndex in active order, tracking reorders', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            const indexById = (prop: 'rowGroupIndex' | 'pivotIndex') =>
                Object.fromEntries(api.getColumnDefs()!.map((d) => [(d as ColDef).colId, (d as ColDef)[prop]]));

            // Activate row groups in a non-colDef order: c=0, a=1, b=2.
            api.applyColumnState({
                state: [
                    { colId: 'c', rowGroupIndex: 0 },
                    { colId: 'a', rowGroupIndex: 1 },
                    { colId: 'b', rowGroupIndex: 2 },
                ],
            });
            expect(indexById('rowGroupIndex')).toEqual({ a: 1, b: 2, c: 0 });

            // Reorder the active group columns and confirm getColumnDefs tracks the restamp.
            api.moveRowGroupColumn(0, 2); // c (level 0) moves to the end → a=0, b=1, c=2
            expect(indexById('rowGroupIndex')).toEqual({ a: 0, b: 1, c: 2 });

            // Same for pivot, also non-colDef order.
            api.applyColumnState({
                state: [
                    { colId: 'a', rowGroup: false, pivotIndex: 1 },
                    { colId: 'b', rowGroup: false, pivotIndex: 0 },
                    { colId: 'c', rowGroup: false },
                ],
            });
            expect(indexById('pivotIndex')).toEqual({ a: 1, b: 0, c: null });
        });
    });

    describe('getColumnState and applyColumnState', () => {
        test('getColumnState returns state for all columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', width: 100, sort: 'asc', pinned: 'left' },
                    { colId: 'b', width: 200, hide: true },
                    { colId: 'c' },
                ],
            });
            await new GridColumns(api, `getColumnState returns state for all columns setup`).checkColumns(`
                LEFT
                └── a width:100 sort:asc
                CENTER
                └── c width:200
            `);
            await new GridRows(api, `getColumnState returns state for all columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

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
            await new GridRows(api, `getColumnState returns state for all columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
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

        test('applyColumnState returns false for unknown colIds', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });
            await new GridColumns(api, `applyColumnState returns false for unknown colIds setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `applyColumnState returns false for unknown colIds setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const success = api.applyColumnState({
                state: [{ colId: 'nonexistent', sort: 'asc' }],
            });

            expect(success).toBe(false);
            await new GridRows(api, `applyColumnState returns false for unknown colIds final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
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
            await asyncSetTimeout(0);

            // Grid-level `columnVisible` + `displayedColumnsChanged` + col-level `visibleChanged`.
            const visibleEvents: any[] = [];
            const displayedEvents: any[] = [];
            const colVisibleEvents: any[] = [];
            api.addEventListener('columnVisible', (e) => visibleEvents.push(e));
            api.addEventListener('displayedColumnsChanged', (e) => displayedEvents.push(e));
            (api.getColumn('b') as any).__addEventListener('visibleChanged', (e: any) => colVisibleEvents.push(e));

            api.setColumnsVisible(['b'], false);
            await asyncSetTimeout(0);

            expect(api.getColumn('b')!.isVisible()).toBe(false);
            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual(['a', 'c']);

            await new GridColumns(api, 'b hidden').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);

            expect(visibleEvents.length).toBeGreaterThan(0);
            expect(visibleEvents[0].visible).toBe(false);
            expect(visibleEvents[0].columns?.map((c: Column) => c.getColId())).toContain('b');
            expect(displayedEvents.length).toBeGreaterThan(0);
            expect(colVisibleEvents.length).toBeGreaterThan(0);
        });
    });

    describe('column pinning API', () => {
        test('setColumnsPinned moves columns between sections', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await asyncSetTimeout(0);

            // Grid-level `columnPinned` event with payload + col-level lastLeft/firstRight events.
            const pinnedEvents: any[] = [];
            const aLastLeftEvents: any[] = [];
            const cFirstRightEvents: any[] = [];
            api.addEventListener('columnPinned', (e) => pinnedEvents.push(e));
            (api.getColumn('a') as any).__addEventListener('lastLeftPinnedChanged', (e: any) =>
                aLastLeftEvents.push(e)
            );
            (api.getColumn('c') as any).__addEventListener('firstRightPinnedChanged', (e: any) =>
                cFirstRightEvents.push(e)
            );

            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['c'], 'right');
            await asyncSetTimeout(0);

            expect(api.getColumn('a')!.getPinned()).toBe('left');
            expect(api.getColumn('c')!.getPinned()).toBe('right');
            // 'a' becomes the only left-pinned (and thus lastLeftPinned). 'c' becomes the only
            // right-pinned (and thus firstRightPinned).
            expect(aLastLeftEvents.length).toBeGreaterThan(0);
            expect(cFirstRightEvents.length).toBeGreaterThan(0);

            await new GridColumns(api, 'pinned').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);

            expect(pinnedEvents.length).toBeGreaterThanOrEqual(2);
            expect(pinnedEvents[0].pinned).toBe('left');
            expect(pinnedEvents[1].pinned).toBe('right');
        });
    });

    describe('column moving API', () => {
        test('moveColumns reorders columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await asyncSetTimeout(0);

            // Grid-level `columnMoved` + col-level `leftChanged` (col 'b' shifts position).
            const movedEvents: any[] = [];
            const colBLeftEvents: any[] = [];
            api.addEventListener('columnMoved', (e) => movedEvents.push(e));
            (api.getColumn('b') as any).__addEventListener('leftChanged', (e: any) => colBLeftEvents.push(e));

            api.moveColumns(['c'], 0);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(order).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'c moved to front').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);

            expect(movedEvents.length).toBeGreaterThan(0);
            expect(colBLeftEvents.length).toBeGreaterThan(0);
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
        test('getRowGroupColumns returns active row group columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true, rowGroupIndex: 0 },
                    { colId: 'sport', rowGroup: true, rowGroupIndex: 1 },
                    { colId: 'gold' },
                ],
                rowData: [],
            });
            await new GridColumns(api, `getRowGroupColumns returns active row group columns setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup rowGroupIndex:0
                ├── sport width:200 rowGroup rowGroupIndex:1
                └── gold width:200
            `);
            await new GridRows(api, `getRowGroupColumns returns active row group columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const rowGroupCols = api.getRowGroupColumns();
            expect(rowGroupCols.map((c: Column) => c.getColId())).toEqual(['country', 'sport']);
            await new GridRows(api, `getRowGroupColumns returns active row group columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
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

            // Capture grid-level `columnRowGroupChanged` events and their payloads.
            await asyncSetTimeout(0);
            const rowGroupEvents: any[] = [];
            api.addEventListener('columnRowGroupChanged', (e) => rowGroupEvents.push(e));

            api.addRowGroupColumns(['a']);
            await asyncSetTimeout(0);
            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['a']);
            expect(rowGroupEvents.length).toBeGreaterThan(0);
            const evt1 = rowGroupEvents[rowGroupEvents.length - 1];
            expect(evt1.columns?.map((c: Column) => c.getColId())).toContain('a');

            api.addRowGroupColumns(['b']);
            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b']);

            api.removeRowGroupColumns(['a']);
            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['b']);

            await new GridColumns(api, 'after row group changes').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200
                └── c width:200
            `);
        });
    });

    describe('pivot API', () => {
        test('isPivotMode and setPivotMode', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowData: [],
            });

            expect(api.isPivotMode()).toBe(false);
            await asyncSetTimeout(0);

            // Capture grid-level `columnPivotModeChanged` event.
            const pivotModeEvents: any[] = [];
            api.addEventListener('columnPivotModeChanged', (e) => pivotModeEvents.push(e));

            api.setGridOption('pivotMode', true);
            await asyncSetTimeout(0);
            expect(api.isPivotMode()).toBe(true);
            expect(pivotModeEvents.length).toBeGreaterThan(0);

            api.setGridOption('pivotMode', false);
            await asyncSetTimeout(0);
            expect(api.isPivotMode()).toBe(false);
            expect(pivotModeEvents.length).toBeGreaterThan(1);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        // A primary column group is parked (not displayed) while pivoting. `getProvidedColumnGroup`
        // returns the definition and must still resolve it by id (mirroring `getColumn` for parked
        // primary columns); `getColumnGroup` returns the displayed instance, which is gone while pivoting.
        test('getProvidedColumnGroup resolves a parked primary group while pivoting', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { groupId: 'locationGroup', children: [{ field: 'country' }, { field: 'athlete' }] },
                    { field: 'sport', pivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', athlete: 'Phelps', sport: 'Swimming', gold: 2 },
                    { country: 'Russia', athlete: 'Ivanov', sport: 'Gymnastics', gold: 3 },
                ],
            });
            await asyncSetTimeout(0);

            // Normal mode: both the provided definition and the displayed instance resolve.
            expect(api.getProvidedColumnGroup('locationGroup')?.getGroupId()).toBe('locationGroup');
            expect(api.getColumnGroup('locationGroup')).not.toBeNull();

            api.setGridOption('pivotMode', true);
            await asyncSetTimeout(0);
            // Pivot is active (result columns generated), so the primary group is parked.
            expect((api.getPivotResultColumns() ?? []).length).toBeGreaterThan(0);

            // Provided group still resolves via the parked-primary fallback; displayed instance is gone.
            expect(api.getProvidedColumnGroup('locationGroup')?.getGroupId()).toBe('locationGroup');
            expect(api.getColumnGroup('locationGroup')).toBeNull();

            // Unknown ids are null in both APIs.
            expect(api.getProvidedColumnGroup('does-not-exist')).toBeNull();
            expect(api.getColumnGroup('does-not-exist')).toBeNull();
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

        test('setColumnGroupState with empty state array is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });
            await new GridColumns(api, `setColumnGroupState with empty state array is a no-op setup`).checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
            await new GridRows(api, `setColumnGroupState with empty state array is a no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const before = api.getColumnGroupState();
            api.setColumnGroupState([]);
            await new GridColumns(
                api,
                `setColumnGroupState with empty state array is a no-op after setColumnGroupState`
            ).checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
            expect(api.getColumnGroupState()).toEqual(before);
        });

        test('setColumnGroupOpened on grid without groups is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `setColumnGroupOpened on grid without groups is a no-op setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `setColumnGroupOpened on grid without groups is a no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // No groups exist → groupsById.size === 0 → early return.
            api.setColumnGroupOpened('nonexistent', true);
            await new GridColumns(
                api,
                `setColumnGroupOpened on grid without groups is a no-op after setColumnGroupOpened`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            expect(api.getColumnGroupState()).toEqual([]);
        });

        test('setColumnGroupState with unknown groupId is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'real',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });
            await new GridColumns(api, `setColumnGroupState with unknown groupId is a no-op setup`).checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
            await new GridRows(api, `setColumnGroupState with unknown groupId is a no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const before = api.getColumnGroupState();
            api.setColumnGroupState([{ groupId: 'unknown', open: false }]);
            await new GridColumns(api, `setColumnGroupState with unknown groupId is a no-op after setColumnGroupState`)
                .checkColumns(`
                    CENTER
                    └─┬ GROUP open
                      ├── a width:200
                      └── b width:200 columnGroupShow:open
                `);
            expect(api.getColumnGroupState()).toEqual(before);
        });

        test('setColumnGroupOpened with matching current state is a no-op (no visible change)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });
            await new GridColumns(
                api,
                `setColumnGroupOpened with matching current state is a no-op (no visible change) setup`
            ).checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
            await new GridRows(
                api,
                `setColumnGroupOpened with matching current state is a no-op (no visible change) setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const before = api.getColumnGroupState();
            // Already open → `group.expanded === open` → state-loop continue branch.
            api.setColumnGroupOpened('g', true);
            await new GridColumns(
                api,
                `setColumnGroupOpened with matching current state is a no-op (no visible change) after setColumnGroupOpened`
            ).checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
            expect(api.getColumnGroupState()).toEqual(before);
        });

        test('resetColumnGroupState restores openByDefault values', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        openByDefault: true,
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                    {
                        groupId: 'g2',
                        openByDefault: false,
                        children: [{ colId: 'c' }, { colId: 'd', columnGroupShow: 'open' }],
                    },
                ],
            });

            // Flip both groups so the reset has work to do.
            api.setColumnGroupOpened('g1', false);
            api.setColumnGroupOpened('g2', true);

            await new GridColumns(api, 'flipped').checkColumns(`
                CENTER
                ├─┬ GROUP closed
                │ ├── a width:200
                │ └── b width:200 columnGroupShow:open hidden
                └─┬ GROUP open
                  ├── c width:200
                  └── d width:200 columnGroupShow:open
            `);

            api.resetColumnGroupState();

            const state = api.getColumnGroupState();
            expect(state.find((s) => s.groupId === 'g1')?.open).toBe(true);
            expect(state.find((s) => s.groupId === 'g2')?.open).toBe(false);

            await new GridColumns(api, 'after reset').checkColumns(`
                CENTER
                ├─┬ GROUP open
                │ ├── a width:200
                │ └── b width:200 columnGroupShow:open
                └─┬ GROUP closed
                  ├── c width:200
                  └── d width:200 columnGroupShow:open hidden
            `);
        });
    });

    describe('isPinning API', () => {
        test('isPinning, isPinningLeft, isPinningRight', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b' }, { colId: 'c', pinned: 'right' }],
            });
            await new GridColumns(api, `isPinning, isPinningLeft, isPinningRight setup`).checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);
            await new GridRows(api, `isPinning, isPinningLeft, isPinningRight setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.isPinning()).toBe(true);
            expect(api.isPinningLeft()).toBe(true);
            expect(api.isPinningRight()).toBe(true);
            await new GridRows(api, `isPinning, isPinningLeft, isPinningRight final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('no pinning returns false', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `no pinning returns false setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `no pinning returns false setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.isPinning()).toBe(false);
            expect(api.isPinningLeft()).toBe(false);
            expect(api.isPinningRight()).toBe(false);
            await new GridRows(api, `no pinning returns false final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getDisplayedColBefore and getDisplayedColAfter', () => {
        test('navigates between displayed columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `navigates between displayed columns setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `navigates between displayed columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const colA = api.getColumn('a')!;
            const colB = api.getColumn('b')!;
            const colC = api.getColumn('c')!;

            expect(api.getDisplayedColAfter(colA)?.getColId()).toBe('b');
            expect(api.getDisplayedColAfter(colB)?.getColId()).toBe('c');
            expect(api.getDisplayedColAfter(colC)).toBeNull();

            expect(api.getDisplayedColBefore(colC)?.getColId()).toBe('b');
            expect(api.getDisplayedColBefore(colB)?.getColId()).toBe('a');
            expect(api.getDisplayedColBefore(colA)).toBeNull();
            await new GridRows(api, `navigates between displayed columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('skips hidden columns in navigation', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b', hide: true }, { colId: 'c' }],
            });
            await new GridColumns(api, `skips hidden columns in navigation setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
            await new GridRows(api, `skips hidden columns in navigation setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const colA = api.getColumn('a')!;
            const colC = api.getColumn('c')!;

            // b is hidden, so a's next should be c
            expect(api.getDisplayedColAfter(colA)?.getColId()).toBe('c');
            expect(api.getDisplayedColBefore(colC)?.getColId()).toBe('a');
            await new GridRows(api, `skips hidden columns in navigation final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
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

        test('getColumnDefs reflects a primary-column move made before entering pivot mode', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', pivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                    { colId: 'a' },
                    { colId: 'b' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swimming', gold: 3 },
                    { country: 'UK', sport: 'Running', gold: 2 },
                ],
            });

            api.moveColumns(['b'], 0);

            api.setGridOption('pivotMode', true);
            expect(api.getPivotResultColumns()?.length).toBeGreaterThan(0); // primaries now parked

            const inPivot = api.getColumnDefs()!.map((d) => (d as ColDef).colId);
            expect(inPivot).toEqual(['b', 'country', 'sport', 'gold', 'a']);

            api.setGridOption('pivotMode', false);
            const afterPivot = api.getColumnDefs()!.map((d) => (d as ColDef).colId);
            expect(afterPivot).toEqual(['b', 'country', 'sport', 'gold', 'a']);
            expect(api.getAllDisplayedColumns().map((c: Column) => c.getColId())).toEqual([
                'b',
                'ag-Grid-AutoColumn',
                'country',
                'sport',
                'gold',
                'a',
            ]);
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
