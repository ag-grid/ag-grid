import type { ColDef, ColGroupDef } from 'ag-grid-community';
import { ClientSideRowModelModule, TextEditorModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column Model', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, TextEditorModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('column visibility', () => {
        test('hide via colDef hides column from diagram', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a' },
                { colId: 'b', hide: true },
                { colId: 'c' },
                { colId: 'd', hide: true },
                { colId: 'e' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'hidden via colDef').checkColumns(`
                CENTER
                ├── a width:200
                ├── c width:200
                └── e width:200
            `);
        });

        test('toggle visibility via setColumnsVisible API', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'all visible').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Hide columns a and c
            api.setColumnsVisible(['a', 'c'], false);

            await new GridColumns(api, 'a and c hidden').checkColumns(`
                CENTER
                └── b width:200
            `);

            // Show column a back
            api.setColumnsVisible(['a'], true);

            await new GridColumns(api, 'a restored').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);

            // Show all back
            api.setColumnsVisible(['c'], true);

            await new GridColumns(api, 'all restored').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('hide all columns results in empty center', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.setColumnsVisible(['a', 'b'], false);

            await new GridColumns(api, 'all hidden').checkColumns('empty');
        });

        test('hide via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [{ colId: 'b', hide: true }],
            });

            await new GridColumns(api, 'b hidden via state').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });
    });

    describe('column width', () => {
        test('fixed width via colDef', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'narrow', width: 80 },
                { colId: 'default' },
                { colId: 'wide', width: 400 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'fixed widths').checkColumns(`
                CENTER
                ├── narrow width:80
                ├── default width:200
                └── wide width:400
            `);
        });

        test('minWidth constraint clamps to minimum', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', width: 50, minWidth: 100 },
                { colId: 'b', width: 200 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'minWidth clamped').checkColumns(`
                CENTER
                ├── a width:100
                └── b width:200
            `);
        });

        test('maxWidth constraint clamps to maximum', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', width: 500, maxWidth: 300 },
                { colId: 'b', width: 200 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'maxWidth clamped').checkColumns(`
                CENTER
                ├── a width:300
                └── b width:200
            `);
        });

        test('width set via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [
                    { colId: 'a', width: 150 },
                    { colId: 'b', width: 350 },
                ],
            });

            await new GridColumns(api, 'widths via state').checkColumns(`
                CENTER
                ├── a width:150
                └── b width:350
            `);
        });

        test('flex columns', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', flex: 1 },
                { colId: 'b', flex: 2 },
                { colId: 'c', width: 100 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Flex columns distribute the remaining 900px (mock viewport 1000 minus c's 100)
            // between a (flex 1) and b (flex 2), so 300/600.
            await new GridColumns(api, 'flex columns').checkColumns(`
                CENTER
                ├── a width:300 flex:1
                ├── b width:600 flex:2
                └── c width:100
            `);
        });
    });

    describe('column sorting', () => {
        test('single sort ascending via colDef', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', sort: 'asc' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single sort asc').checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                ├── b width:200
                └── c width:200
            `);
        });

        test('single sort descending via colDef', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b', sort: 'desc' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'single sort desc').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200 sort:desc
            `);
        });

        test('multi-sort via colDef', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', sort: 'asc', sortIndex: 0 },
                { colId: 'b' },
                { colId: 'c', sort: 'desc', sortIndex: 1 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'multi-sort').checkColumns(`
                CENTER
                ├── a width:200 sort:asc sortIndex:0
                ├── b width:200
                └── c width:200 sort:desc sortIndex:1
            `);
        });

        test('apply sort via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [
                    { colId: 'b', sort: 'asc', sortIndex: 0 },
                    { colId: 'c', sort: 'desc', sortIndex: 1 },
                ],
            });

            await new GridColumns(api, 'sort via state').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200 sort:asc sortIndex:0
                └── c width:200 sort:desc sortIndex:1
            `);
        });

        test('clear sort via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', sort: 'asc' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'initially sorted').checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                └── b width:200
            `);

            // Clear sort
            api.applyColumnState({
                state: [{ colId: 'a', sort: null }],
            });

            await new GridColumns(api, 'sort cleared').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('change sort direction via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', sort: 'asc' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [{ colId: 'a', sort: 'desc' }],
            });

            await new GridColumns(api, 'sort reversed').checkColumns(`
                CENTER
                ├── a width:200 sort:desc
                └── b width:200
            `);
        });
    });

    describe('column moving', () => {
        test('moveColumns reorders columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'initial order').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                ├── c width:200
                └── d width:200
            `);

            // Move column d to the beginning
            api.moveColumns(['d'], 0);

            await new GridColumns(api, 'd moved to front').checkColumns(`
                CENTER
                ├── d width:200
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('moveColumns moves multiple columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Move c and d to the beginning
            api.moveColumns(['c', 'd'], 0);

            await new GridColumns(api, 'c and d moved to front').checkColumns(`
                CENTER
                ├── c width:200
                ├── d width:200
                ├── a width:200
                └── b width:200
            `);
        });

        test('moveColumnByIndex swaps column position', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Move column at index 0 to index 2
            api.moveColumnByIndex(0, 2);

            await new GridColumns(api, 'a moved to end').checkColumns(`
                CENTER
                ├── b width:200
                ├── c width:200
                └── a width:200
            `);
        });

        test('moveColumns via applyColumnState with column order', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'b' }],
                applyOrder: true,
            });

            await new GridColumns(api, 'reordered via state').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('column pinning', () => {
        test('pin columns via colDef', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'left1', pinned: 'left' },
                { colId: 'left2', pinned: 'left' },
                { colId: 'center1' },
                { colId: 'center2' },
                { colId: 'right1', pinned: 'right' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'pinned via colDef').checkColumns(`
                LEFT
                ├── left1 width:200
                └── left2 width:200
                CENTER
                ├── center1 width:200
                └── center2 width:200
                RIGHT
                └── right1 width:200
            `);
        });

        test('pin via setColumnsPinned API', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Pin a to left, d to right
            api.setColumnsPinned(['a'], 'left');
            api.setColumnsPinned(['d'], 'right');

            await new GridColumns(api, 'pinned via API').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                ├── b width:200
                └── c width:200
                RIGHT
                └── d width:200
            `);
        });

        test('unpin via setColumnsPinned API', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', pinned: 'left' },
                { colId: 'b' },
                { colId: 'c', pinned: 'right' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'initial pinned').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);

            // Unpin both
            api.setColumnsPinned(['a', 'c'], null);

            await new GridColumns(api, 'all unpinned').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('pin via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [
                    { colId: 'a', pinned: 'left' },
                    { colId: 'c', pinned: 'right' },
                ],
            });

            await new GridColumns(api, 'pinned via state').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
                RIGHT
                └── c width:200
            `);
        });

        test('lockPinned does not prevent API-based unpinning (only prevents UI unpinning)', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'locked', pinned: 'left', lockPinned: true },
                { colId: 'unlocked', pinned: 'left' },
                { colId: 'center' },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // lockPinned only prevents unpinning via UI (drag, menu) — API can still unpin
            api.setColumnsPinned(['locked', 'unlocked'], null);

            // Both columns are unpinned because lockPinned doesn't block the API
            await new GridColumns(api, 'both unpinned via API').checkColumns(`
                CENTER
                ├── locked width:200
                ├── unlocked width:200
                └── center width:200
            `);

            // But the colDef still has lockPinned set
            expect(api.getColumn('locked')!.getColDef().lockPinned).toBe(true);
        });
    });

    describe('column state', () => {
        test('getColumnState returns full state', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', width: 150, sort: 'asc', pinned: 'left' },
                { colId: 'b', width: 250 },
                { colId: 'c', hide: true },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });
            await new GridColumns(api, `getColumnState returns full state setup`).checkColumns(`
                LEFT
                └── a width:150 sort:asc
                CENTER
                └── b width:250
            `);
            await new GridRows(api, `getColumnState returns full state setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const state = api.getColumnState();
            expect(state).toHaveLength(3);

            const stateA = state.find((s) => s.colId === 'a');
            expect(stateA).toBeDefined();
            expect(stateA!.width).toBe(150);
            expect(stateA!.sort).toBe('asc');
            expect(stateA!.pinned).toBe('left');

            const stateB = state.find((s) => s.colId === 'b');
            expect(stateB).toBeDefined();
            expect(stateB!.width).toBe(250);
            expect(stateB!.sort).toBeNull();
            expect(stateB!.pinned).toBeNull();

            const stateC = state.find((s) => s.colId === 'c');
            expect(stateC).toBeDefined();
            expect(stateC!.hide).toBe(true);
            await new GridRows(api, `getColumnState returns full state final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('applyColumnState updates multiple properties', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [
                    { colId: 'a', width: 100, sort: 'desc', pinned: 'left' },
                    { colId: 'c', width: 300, pinned: 'right' },
                ],
            });

            await new GridColumns(api, 'multi-property state update').checkColumns(`
                LEFT
                └── a width:100 sort:desc
                CENTER
                └── b width:200
                RIGHT
                └── c width:300
            `);
        });

        test('resetColumnState restores original state', async () => {
            const columnDefs: ColDef[] = [
                { colId: 'a', width: 150 },
                { colId: 'b', width: 250 },
            ];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Modify state
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 300, sort: 'asc', pinned: 'left' },
                    { colId: 'b', hide: true },
                ],
            });

            await new GridColumns(api, 'modified state').checkColumns(`
                LEFT
                └── a width:300 sort:asc
            `);

            // Capture grid-level `columnsReset` event (events are async — flush before asserting).
            const resetEvents: any[] = [];
            api.addEventListener('columnsReset', (e) => resetEvents.push(e));

            // Reset to original
            api.resetColumnState();
            await asyncSetTimeout(0);

            await new GridColumns(api, 'reset state').checkColumns(`
                CENTER
                ├── a width:150
                └── b width:250
            `);

            expect(resetEvents.length).toBeGreaterThan(0);
        });

        test('applyColumnState with applyOrder reorders columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [{ colId: 'b' }, { colId: 'c' }, { colId: 'a' }],
                applyOrder: true,
            });

            await new GridColumns(api, 'reordered state').checkColumns(`
                CENTER
                ├── b width:200
                ├── c width:200
                └── a width:200
            `);
        });

        test('applyColumnState with defaultState resets unspecified columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', sort: 'asc' }, { colId: 'b', sort: 'desc' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Apply state that keeps sort only on c, clearing others via defaultState
            api.applyColumnState({
                state: [{ colId: 'c', sort: 'asc' }],
                defaultState: { sort: null },
            });

            await new GridColumns(api, 'defaultState clears sort').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200 sort:asc
            `);
        });
    });

    describe('runtime columnDefs update', () => {
        test('setGridOption replaces columnDefs', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            await new GridColumns(api, 'initial columns').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);

            // Replace with completely new columns
            api.setGridOption('columnDefs', [
                { colId: 'x', width: 100 },
                { colId: 'y', width: 300 },
            ]);

            await new GridColumns(api, 'replaced columns').checkColumns(`
                CENTER
                ├── x width:100
                └── y width:300
            `);
        });

        test('setGridOption adds new columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Add a new column
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'added column').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
        });

        test('setGridOption removes columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Remove column b
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'c' }]);

            await new GridColumns(api, 'removed column').checkColumns(`
                CENTER
                ├── a width:200
                └── c width:200
            `);
        });

        test('setGridOption preserves column state when colId matches', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Apply some state first
            api.applyColumnState({
                state: [{ colId: 'a', sort: 'asc', pinned: 'left' }],
            });

            // Update columnDefs with same colIds plus a new column
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            // Sort and pinning on 'a' should be preserved
            await new GridColumns(api, 'state preserved').checkColumns(`
                LEFT
                └── a width:200 sort:asc
                CENTER
                ├── b width:200
                └── c width:200
            `);
        });

        test('setGridOption with column groups', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            // Replace with grouped columns
            const newDefs: (ColDef | ColGroupDef)[] = [
                {
                    headerName: 'Group',
                    children: [{ colId: 'x' }, { colId: 'y' }],
                },
                { colId: 'z' },
            ];
            api.setGridOption('columnDefs', newDefs);

            await new GridColumns(api, 'switched to groups').checkColumns(`
                CENTER
                ├─┬ "Group" GROUP
                │ ├── x width:200
                │ └── y width:200
                └── z width:200
            `);
        });
    });

    describe('column defaults', () => {
        test('defaultColDef applies width to all columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                defaultColDef: { width: 120 },
            });

            await new GridColumns(api, 'default width').checkColumns(`
                CENTER
                ├── a width:120
                ├── b width:120
                └── c width:120
            `);
        });

        test('defaultColDef width can be overridden per column', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b', width: 300 }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                defaultColDef: { width: 100 },
            });

            await new GridColumns(api, 'overridden width').checkColumns(`
                CENTER
                ├── a width:100
                ├── b width:300
                └── c width:100
            `);
        });

        test('defaultColDef applies sort to all columns', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', sort: 'asc' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                defaultColDef: { sortable: true },
            });

            // Only column a should have sort applied (sortable just enables the capability)
            await new GridColumns(api, 'default sortable').checkColumns(`
                CENTER
                ├── a width:200 sort:asc
                ├── b width:200
                └── c width:200
            `);
        });

        test('defaultColDef with editable', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b', editable: false }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                defaultColDef: { editable: true },
            });

            // Only a and c should be editable (b overrides)
            await new GridColumns(api, 'default editable').checkColumns(`
                CENTER
                ├── a width:200 editable
                ├── b width:200
                └── c width:200 editable
            `);
        });

        test('defaultColDef with pinned', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b', pinned: false }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                defaultColDef: { pinned: 'left' },
            });

            // a and c should be pinned left, b should be in center
            await new GridColumns(api, 'default pinned').checkColumns(`
                LEFT
                ├── a width:200
                └── c width:200
                CENTER
                └── b width:200
            `);
        });

        test('defaultColDef with headerName has no effect (headerName is per-column)', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a', headerName: 'Alpha' }, { colId: 'b' }];

            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                defaultColDef: { headerName: 'Default' },
            });

            // a has explicit headerName, b inherits from defaultColDef
            await new GridColumns(api, 'default headerName').checkColumns(`
                CENTER
                ├── a "Alpha" width:200
                └── b "Default" width:200
            `);
        });
    });

    describe('combined operations', () => {
        test('pin + sort + width via applyColumnState', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            api.applyColumnState({
                state: [
                    { colId: 'a', pinned: 'left', width: 100 },
                    { colId: 'b', sort: 'asc', width: 150 },
                    { colId: 'c', pinned: 'right', sort: 'desc', width: 250 },
                ],
            });

            await new GridColumns(api, 'combined state').checkColumns(`
                LEFT
                └── a width:100
                CENTER
                └── b width:150 sort:asc
                RIGHT
                └── c width:250 sort:desc
            `);
        });

        test('move then pin changes layout', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Move c to front
            api.moveColumns(['c'], 0);

            // Pin the moved column
            api.setColumnsPinned(['c'], 'left');

            await new GridColumns(api, 'moved then pinned').checkColumns(`
                LEFT
                └── c width:200
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('sequential state updates accumulate correctly', async () => {
            const columnDefs: ColDef[] = [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }];

            const api = gridsManager.createGrid('myGrid', { columnDefs });

            // Step 1: Sort a
            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

            // Step 2: Pin b
            api.setColumnsPinned(['b'], 'right');

            // Step 3: Hide c
            api.setColumnsVisible(['c'], false);

            await new GridColumns(api, 'accumulated state').checkColumns(`
                CENTER
                └── a width:200 sort:asc
                RIGHT
                └── b width:200
            `);
        });
    });
});
