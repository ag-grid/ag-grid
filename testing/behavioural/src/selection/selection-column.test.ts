import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';

import { GridActions } from './utils';

describe('Row Selection Grid Options', () => {
    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { sport: 'football' },
        { sport: 'rugby' },
        { sport: 'tennis' },
        { sport: 'cricket' },
        { sport: 'golf' },
        { sport: 'swimming' },
        { sport: 'rowing' },
    ];

    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function createGrid(gridOptions: GridOptions): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions);
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    const gridMgr = new TestGridsManager({
        modules: [RowSelectionModule, ClientSideRowModelModule],
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('Right-locked selection column renders working row and header checkboxes', async () => {
        const [api, actions] = createGrid({
            columnDefs: [{ field: 'sport' }, { field: 'year' }],
            rowData: [
                { sport: 'football', year: 2024 },
                { sport: 'rugby', year: 2025 },
            ],
            rowSelection: { mode: 'multiRow' },
            selectionColumnDef: { lockPosition: 'right' },
        });

        expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual([
            'sport',
            'year',
            'ag-Grid-SelectionColumn',
        ]);
        await waitFor(() => expect(actions.getCheckboxByIndex(0)).not.toBeNull());
        actions.toggleCheckboxByIndex(0);
        expect(api.getSelectedRows()).toEqual([{ sport: 'football', year: 2024 }]);

        actions.toggleHeaderCheckboxByIndex(0);
        expect(api.getSelectedRows()).toHaveLength(2);
        actions.toggleHeaderCheckboxByIndex(0);
        expect(api.getSelectedRows()).toHaveLength(0);

        await new GridColumns(api, 'right-locked selection column').checkColumns('skip-snapshot');
    });

    test('Multiple sorting works with selection column', async () => {
        const [api, actions] = createGrid({
            columnDefs,
            rowData,
            rowSelection: {
                mode: 'multiRow',
            },
            selectionColumnDef: {
                sortable: true,
                pinned: 'left',
            },
        });

        actions.selectRowsByIndex([3, 4, 5], false);

        api.applyColumnState({
            state: [
                { colId: 'ag-Grid-SelectionColumn', sort: 'asc', sortIndex: 0 },
                { colId: 'sport', sort: 'asc', sortIndex: 1 },
            ],
            defaultState: { sort: null },
        });

        await new GridRows(api).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 sport:"football"
            ├── LEAF id:6 sport:"rowing"
            ├── LEAF id:1 sport:"rugby"
            ├── LEAF id:2 sport:"tennis"
            ├── LEAF selected id:3 sport:"cricket"
            ├── LEAF selected id:4 sport:"golf"
            └── LEAF selected id:5 sport:"swimming"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            LEFT
            └── ag-Grid-SelectionColumn width:50 sort:asc sortIndex:0 !resizable suppressMovable lockPosition:left
            CENTER
            └── sport "Sport" width:200 sort:asc sortIndex:1
        `);
    });

    test('Selection column width and pinning is updated when `selectionColDef` changes', async () => {
        const [api] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
            selectionColumnDef: {},
        });

        expect(api.isPinning()).toBe(false);

        const col = api.getColumn('ag-Grid-SelectionColumn');

        api.setGridOption('selectionColumnDef', {
            pinned: 'right',
            width: 200,
        });

        expect(api.isPinning()).toBe(true);
        expect(api.isPinningRight()).toBe(true);
        expect(col?.isPinnedRight()).toBe(true);
        expect(col?.getActualWidth()).toBe(200);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── sport "Sport" width:200
            RIGHT
            └── ag-Grid-SelectionColumn width:200 !resizable !sortable suppressMovable lockPosition:left
        `);
    });

    test('a selectionColumnDef update keeps the flex, pin and sort it leaves out, and null clears them', () => {
        const [api] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
            selectionColumnDef: { resizable: true, flex: 1 },
        });
        const col = api.getColumn('ag-Grid-SelectionColumn')!;
        const flexedWidth = col.getActualWidth();

        api.setGridOption('selectionColumnDef', { resizable: true });
        expect(col.getFlex()).toBe(1);
        expect(col.getActualWidth()).toBe(flexedWidth);
        api.setGridOption('selectionColumnDef', { resizable: true, width: 70 });
        expect(col.getFlex()).toBe(1);
        expect(col.getActualWidth()).toBe(flexedWidth);
        api.setGridOption('selectionColumnDef', { resizable: true, flex: null });
        expect(col.getFlex()).toBeNull();
        expect(col.getActualWidth()).toBe(flexedWidth);

        api.setGridOption('selectionColumnDef', { resizable: true, flex: 1, width: 70 });
        expect(col.getFlex()).toBe(1);
        api.setGridOption('selectionColumnDef', { resizable: true, flex: null, width: 70 });
        expect(col.getFlex()).toBeNull();
        expect(col.getActualWidth()).toBe(70);
        api.setGridOption('selectionColumnDef', { resizable: true, flex: 1 });
        api.setGridOption('selectionColumnDef', { resizable: true, flex: 0, width: 100 });
        expect(col.getFlex()).toBeNull();
        expect(col.getActualWidth()).toBe(100);

        api.setGridOption('selectionColumnDef', { resizable: true, pinned: 'right' });
        expect(col.getPinned()).toBe('right');
        api.setGridOption('selectionColumnDef', { resizable: true });
        expect(col.getPinned()).toBe('right');
        api.setGridOption('selectionColumnDef', { resizable: true, pinned: null });
        expect(col.getPinned()).toBeNull();

        api.setGridOption('selectionColumnDef', { resizable: true, sortable: true, sort: 'asc' });
        expect(col.getSort()).toBe('asc');
        api.applyColumnState({ state: [{ colId: col.getColId(), sort: 'desc' }] });
        api.setGridOption('selectionColumnDef', { resizable: true, sortable: true });
        expect(col.getSort()).toBe('desc');
        api.setGridOption('selectionColumnDef', { resizable: true, sortable: true, sort: null });
        expect(col.getSort()).toBeNull();
    });

    test('a selectionColumnDef width applies on every update setting it, within its bounds; one left out keeps the width', () => {
        const [api] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
            selectionColumnDef: { resizable: true, width: 70 },
        });
        const col = api.getColumn('ag-Grid-SelectionColumn')!;

        api.setColumnWidths([{ key: col, newWidth: 90 }], true, 'uiColumnResized');
        api.setGridOption('selectionColumnDef', { resizable: true });
        expect(col.getActualWidth()).toBe(90);

        api.setGridOption('selectionColumnDef', { resizable: true, width: 70 });
        expect(col.getActualWidth()).toBe(70);
        api.setColumnWidths([{ key: col, newWidth: 90 }], true, 'uiColumnResized');
        api.setGridOption('selectionColumnDef', { resizable: true, width: 70, headerTooltip: 'Select' });
        expect(col.getActualWidth()).toBe(70);

        api.setGridOption('selectionColumnDef', { resizable: true, width: 40, minWidth: 60 });
        expect(col.getActualWidth()).toBe(60);
        api.setGridOption('selectionColumnDef', { resizable: true, width: 40, minWidth: 30 });
        expect(col.getActualWidth()).toBe(40);
        api.setGridOption('selectionColumnDef', { resizable: true, width: 70, maxWidth: 50 });
        expect(col.getActualWidth()).toBe(50);
        api.setGridOption('selectionColumnDef', { resizable: true, width: 70 });
        expect(col.getActualWidth()).toBe(70);

        api.setGridOption('selectionColumnDef', { resizable: true, flex: 1 });
        api.setColumnWidths([{ key: col, newWidth: 120 }], true, 'uiColumnResized');
        api.setGridOption('selectionColumnDef', { resizable: true, width: 70 });
        expect(col.getActualWidth()).toBe(70);
    });

    test('selectionColumnDef initial values apply only when the column is created', () => {
        const [api] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
            selectionColumnDef: { sortable: true, initialWidth: 80, initialPinned: 'left', initialSort: 'asc' },
        });
        const col = api.getColumn('ag-Grid-SelectionColumn')!;

        expect(col.getActualWidth()).toBe(80);
        expect(col.getPinned()).toBe('left');
        expect(col.getSort()).toBe('asc');

        api.applyColumnState({ state: [{ colId: col.getColId(), sort: null }] });
        api.setGridOption('selectionColumnDef', {
            sortable: true,
            initialWidth: 80,
            initialPinned: 'left',
            initialSort: 'asc',
            headerTooltip: 'Select',
        });
        expect(col.getSort()).toBeNull();
    });

    test('setting an equal selectionColumnDef again changes nothing', async () => {
        const [api] = createGrid({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow' },
            selectionColumnDef: { resizable: true, width: 60, pinned: 'left' },
        });
        const col = api.getColumn('ag-Grid-SelectionColumn')!;
        api.setColumnWidths([{ key: col, newWidth: 80 }], true, 'uiColumnResized');
        api.applyColumnState({ state: [{ colId: col.getColId(), pinned: 'right' }] });
        await asyncSetTimeout(0);
        const events: string[] = [];
        for (const type of ['columnResized', 'columnPinned', 'displayedColumnsChanged'] as const) {
            api.addEventListener(type, () => events.push(type));
        }

        api.setGridOption('selectionColumnDef', { resizable: true, width: 60, pinned: 'left' });
        await asyncSetTimeout(0);

        expect(events).toEqual([]);
        expect(col.getPinned()).toBe('right');
        expect(col.getActualWidth()).toBe(80);
    });
});
