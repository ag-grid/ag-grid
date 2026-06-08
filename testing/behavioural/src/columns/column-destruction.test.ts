import type { Column, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

interface DestroyTracker {
    destroyCount: Map<string, number>;
    track: (col: Column) => void;
}

/** Patches a column's destroy() to count invocations. Returns a tracker. */
const createDestroyTracker = (): DestroyTracker => {
    const destroyCount = new Map<string, number>();
    return {
        destroyCount,
        track: (col: Column) => {
            const id = col.getColId();
            const original = (col as any).destroy.bind(col);
            (col as any).destroy = () => {
                destroyCount.set(id, (destroyCount.get(id) ?? 0) + 1);
                original();
            };
        },
    };
};

/** Collects every AgColumn reachable from the grid: primary, auto, selection, row-numbers, pivot result, hierarchy. */
const collectAllColumns = (api: GridApi): Column[] => {
    const seen = new Set<Column>();
    const result: Column[] = [];
    const add = (col: Column | null | undefined) => {
        if (col && !seen.has(col)) {
            seen.add(col);
            result.push(col);
        }
    };
    api.getColumns()?.forEach(add);
    api.getAllGridColumns()?.forEach(add);
    api.getPivotResultColumns()?.forEach(add);
    return result;
};

describe('Column destruction', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            RowNumbersModule,
            RowSelectionModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('destroys every column exactly once on grid teardown — primary + auto + selection + rowNumbers', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'country', rowGroup: true },
                { colId: 'sport', rowGroup: true },
                { colId: 'gold' },
                { colId: 'silver' },
            ],
            rowData: [{ country: 'USA', sport: 'Swimming', gold: 3, silver: 1 }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
            rowNumbers: true,
            groupDefaultExpanded: 1,
        });

        const tracker = createDestroyTracker();
        const columnsBeforeDestroy = collectAllColumns(api);
        expect(columnsBeforeDestroy.length).toBeGreaterThan(0);
        for (const col of columnsBeforeDestroy) {
            tracker.track(col);
            expect((col as any).isAlive()).toBe(true);
        }

        await new GridColumns(api, 'cols before primary teardown').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country width:200 rowGroup
            ├── sport width:200 rowGroup
            ├── gold width:200
            └── silver width:200
        `);

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    test('destroys every column exactly once on grid teardown — with column groups', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    headerName: 'Athlete Info',
                    children: [{ colId: 'athlete' }, { colId: 'country', rowGroup: true }],
                },
                {
                    headerName: 'Medals',
                    children: [{ colId: 'gold' }, { colId: 'silver' }, { colId: 'bronze' }],
                },
            ],
            rowData: [{ athlete: 'A', country: 'USA', gold: 1, silver: 0, bronze: 2 }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
            rowNumbers: true,
            groupDefaultExpanded: 1,
        });

        const tracker = createDestroyTracker();
        const columnsBeforeDestroy = collectAllColumns(api);
        for (const col of columnsBeforeDestroy) {
            tracker.track(col);
        }

        await new GridColumns(api, 'cols before group teardown').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "Athlete Info" GROUP
            │ ├── athlete width:200
            │ └── country width:200 rowGroup
            └─┬ "Medals" GROUP
              ├── gold width:200
              ├── silver width:200
              └── bronze width:200
        `);

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    test('destroys every column exactly once on grid teardown — pivot mode', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'country', rowGroup: true },
                { colId: 'year', pivot: true },
                { colId: 'sport' },
                { colId: 'gold', aggFunc: 'sum' },
            ],
            rowData: [
                { country: 'USA', year: 2020, sport: 'Swimming', gold: 3 },
                { country: 'USA', year: 2024, sport: 'Swimming', gold: 5 },
                { country: 'UK', year: 2020, sport: 'Running', gold: 1 },
            ],
            pivotMode: true,
            rowSelection: { mode: 'multiRow', checkboxes: true },
            rowNumbers: true,
        });
        await asyncSetTimeout(0);

        const tracker = createDestroyTracker();
        const columnsBeforeDestroy = collectAllColumns(api);
        // sanity: pivot result columns must be present
        const pivotResult = api.getPivotResultColumns() ?? [];
        expect(pivotResult.length).toBeGreaterThan(0);
        for (const col of columnsBeforeDestroy) {
            tracker.track(col);
        }

        await new GridColumns(api, 'cols before pivot teardown').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ GROUP
              └── pivot_year__gold width:200 columnGroupShow:open
        `);

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    test('toggling pivot mode multiple times then destroying still destroys each surviving column once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'country', rowGroup: true },
                { colId: 'year', pivot: true },
                { colId: 'gold', aggFunc: 'sum' },
            ],
            rowData: [
                { country: 'USA', year: 2020, gold: 3 },
                { country: 'UK', year: 2024, gold: 1 },
            ],
            pivotMode: false,
            rowSelection: { mode: 'multiRow', checkboxes: true },
            rowNumbers: true,
        });

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);
        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);

        const tracker = createDestroyTracker();
        const columnsBeforeDestroy = collectAllColumns(api);
        for (const col of columnsBeforeDestroy) {
            tracker.track(col);
        }

        await new GridColumns(api, 'cols after pivot toggles before teardown').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ GROUP
              └── pivot_year__gold width:200 columnGroupShow:open
        `);

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    test('replacing columnDefs then destroying does not leak old beans and destroys new beans once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a' }, { colId: 'b', rowGroup: true }],
            rowData: [{ a: 1, b: 'x' }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
        });

        const oldColumns = collectAllColumns(api);
        const oldTracker = createDestroyTracker();
        for (const col of oldColumns) {
            oldTracker.track(col);
        }

        await new GridColumns(api, 'cols before columnDefs replace').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── a width:200
            └── b width:200 rowGroup
        `);

        // Full replacement of primary defs. Selection col / auto-group col instances may be
        // reused if their config didn't change — we only assert that displaced beans are
        // destroyed exactly once, not that EVERY old bean is destroyed.
        api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y', rowGroup: true }, { colId: 'z' }]);
        await asyncSetTimeout(0);

        await new GridColumns(api, 'cols after columnDefs replace').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── x width:200
            ├── y width:200 rowGroup
            └── z width:200
        `);

        const survivingIds = new Set(collectAllColumns(api).map((c) => c.getColId()));
        for (const col of oldColumns) {
            const id = col.getColId();
            const expected = survivingIds.has(id) && (col as any).isAlive() ? 0 : 1;
            expect({ id, count: oldTracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: expected });
        }

        const newColumns = collectAllColumns(api);
        const newTracker = createDestroyTracker();
        for (const col of newColumns) {
            newTracker.track(col);
            expect((col as any).isAlive()).toBe(true);
        }

        api.destroy();

        for (const col of newColumns) {
            const id = col.getColId();
            expect({ id, count: newTracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    // VisibleColsService.clear() keeps `prevLastLeftPinned` / `prevFirstRightPinned` refs across
    // refreshes for the role-swap optimisation. If the leaf at the pinned edge is removed AND
    // destroyed between refreshes, the next refresh must not fire events on the dead bean.
    test('removing the left-pinned edge col between refreshes does not fire events on the destroyed bean', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b', pinned: 'left' }, { colId: 'c' }],
        });
        await new GridColumns(
            api,
            `removing the left-pinned edge col between refreshes does not fire events on the  setup`
        ).checkColumns(`
            LEFT
            ├── a width:200
            └── b width:200
            CENTER
            └── c width:200
        `);
        await new GridRows(
            api,
            `removing the left-pinned edge col between refreshes does not fire events on the  setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        await asyncSetTimeout(0);

        const oldEdge = api.getColumn('b')!;
        let eventsOnDead = 0;
        const tap = (oldEdge as any).dispatchColEvent?.bind(oldEdge);
        if (tap) {
            (oldEdge as any).dispatchColEvent = (...args: any[]) => {
                if (!(oldEdge as any).isAlive()) {
                    eventsOnDead++;
                }
                return tap(...args);
            };
        }

        // 'a' takes over the lastLeftPinned role when 'b' is removed → expect the event on 'a'.
        const aLastLeftEvents: any[] = [];
        const colA = api.getColumn('a')!;
        (colA as any).__addEventListener('lastLeftPinnedChanged', (e: any) => aLastLeftEvents.push(e));

        // Remove `b` entirely — should destroy it.
        api.setGridOption('columnDefs', [{ colId: 'a', pinned: 'left' }, { colId: 'c' }]);
        await new GridColumns(
            api,
            `removing the left-pinned edge col between refreshes does not fire events on the  after setGridOption columnDefs`
        ).checkColumns(`
            LEFT
            └── a width:200
            CENTER
            └── c width:200
        `);
        await new GridRows(
            api,
            `removing the left-pinned edge col between refreshes does not fire events on the  after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        await asyncSetTimeout(0);

        expect((oldEdge as any).isAlive()).toBe(false);
        expect(eventsOnDead).toBe(0);
        // 'a' was not previously lastLeftPinned (b was) → flipping to true on 'a' fires the event.
        expect(aLastLeftEvents.length).toBeGreaterThan(0);
    });

    // _destroyColumnTreeUnused: nodes from the previous build that did NOT end up in the new tree
    // are destroyed; survivors carry the new buildToken and stay alive.
    test('reused cols stay alive, dropped cols get destroyed exactly once', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ colId: 'keep1' }, { colId: 'drop1' }, { colId: 'keep2' }],
        });
        await new GridColumns(api, `reused cols stay alive, dropped cols get destroyed exactly once setup`)
            .checkColumns(`
                CENTER
                ├── keep1 width:200
                ├── drop1 width:200
                └── keep2 width:200
            `);
        await new GridRows(api, `reused cols stay alive, dropped cols get destroyed exactly once setup`).check(`
            ROOT id:ROOT_NODE_ID
        `);
        await asyncSetTimeout(0);

        const keep1 = api.getColumn('keep1')!;
        const drop1 = api.getColumn('drop1')!;
        const keep2 = api.getColumn('keep2')!;
        const tracker = createDestroyTracker();
        tracker.track(keep1);
        tracker.track(drop1);
        tracker.track(keep2);

        api.setGridOption('columnDefs', [{ colId: 'keep1' }, { colId: 'keep2' }, { colId: 'new' }]);
        await new GridColumns(
            api,
            `reused cols stay alive, dropped cols get destroyed exactly once after setGridOption columnDefs`
        ).checkColumns(`
            CENTER
            ├── keep1 width:200
            ├── keep2 width:200
            └── new width:200
        `);
        await new GridRows(
            api,
            `reused cols stay alive, dropped cols get destroyed exactly once after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        await asyncSetTimeout(0);

        expect((keep1 as any).isAlive()).toBe(true);
        expect((keep2 as any).isAlive()).toBe(true);
        expect((drop1 as any).isAlive()).toBe(false);
        expect(tracker.destroyCount.get('keep1') ?? 0).toBe(0);
        expect(tracker.destroyCount.get('keep2') ?? 0).toBe(0);
        expect(tracker.destroyCount.get('drop1') ?? 0).toBe(1);
    });

    test('tree data with auto group column destroys cleanly', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'jobTitle' }, { field: 'employmentType' }],
            rowData: [
                { orgHierarchy: ['Erica'], jobTitle: 'CEO', employmentType: 'Permanent' },
                { orgHierarchy: ['Erica', 'Malcolm'], jobTitle: 'VP', employmentType: 'Permanent' },
            ],
            treeData: true,
            getDataPath: (data: any) => data.orgHierarchy,
            autoGroupColumnDef: { headerName: 'Org Hierarchy', cellRendererParams: { suppressCount: true } },
            rowSelection: { mode: 'multiRow', checkboxes: true },
            rowNumbers: true,
        });

        const tracker = createDestroyTracker();
        const columnsBeforeDestroy = collectAllColumns(api);
        for (const col of columnsBeforeDestroy) {
            tracker.track(col);
        }

        await new GridColumns(api, 'cols before treeData teardown').checkColumns(`
            LEFT
            └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            ├── ag-Grid-AutoColumn "Org Hierarchy" width:200
            ├── jobTitle "Job Title" width:200
            └── employmentType "Employment Type" width:200
        `);

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    test('destroys the displaced provided column group when its colGroupDef changes (stable groupId)', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ groupId: 'g', headerName: 'G-A', children: [{ colId: 'a' }, { colId: 'b' }] }],
            rowData: [{ a: 1, b: 2 }],
        });
        const providedGroup = () => (api.getColumn('a') as any).getParent().getProvidedColumnGroup();

        const before = providedGroup();
        expect(before.isAlive()).toBe(true);

        api.setGridOption('columnDefs', [
            { groupId: 'g', headerName: 'G-B', children: [{ colId: 'a' }, { colId: 'b' }] },
        ]);

        const after = providedGroup();
        expect(after).not.toBe(before);
        expect(before.isAlive()).toBe(false);
        expect(after.isAlive()).toBe(true);
        await new GridColumns(api, 'rebuilt group G-B with the same leaves').checkColumns(`
            CENTER
            └─┬ "G-B" GROUP
              ├── a width:200
              └── b width:200
        `);
        await new GridRows(api, 'rows unaffected by the group rebuild').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0
        `);

        // Repeated structural changes must not accumulate live instances — only the current one stays.
        const seen = [before, after];
        for (let i = 0; i < 3; ++i) {
            api.setGridOption('columnDefs', [
                { groupId: 'g', headerName: `G-${i}`, children: [{ colId: 'a' }, { colId: 'b' }] },
            ]);
            seen.push(providedGroup());
        }
        expect(seen.filter((g) => g.isAlive()).length).toBe(1);
    });

    test('hierarchy columns are destroyed when rebuilt or removed', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [{ country: 'USA', date: new Date(2020, 0, 1) }],
        });
        await asyncSetTimeout(0);

        const yearBefore = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        const monthBefore = api.getColumn('ag-Grid-HierarchyColumn-date-month')!;
        expect(yearBefore).not.toBeNull();
        expect(monthBefore).not.toBeNull();
        expect((yearBefore as any).isAlive()).toBe(true);
        expect((monthBefore as any).isAlive()).toBe(true);

        // (1) rebuildColumns: dropping 'month' changes the plan length → all hierarchy cols rebuilt.
        api.setGridOption('columnDefs', [
            { field: 'country' },
            { field: 'date', rowGroup: true, groupHierarchy: ['year'] },
        ]);
        await asyncSetTimeout(0);

        const yearAfter = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-month')).toBeNull();
        expect(yearAfter).not.toBe(yearBefore);
        expect((yearBefore as any).isAlive()).toBe(false);
        expect((monthBefore as any).isAlive()).toBe(false);
        expect((yearAfter as any).isAlive()).toBe(true);

        // (2) clearColumns: removing groupHierarchy entirely drops the remaining hierarchy col.
        api.setGridOption('columnDefs', [{ field: 'country' }, { field: 'date', rowGroup: true }]);
        await asyncSetTimeout(0);

        expect(api.getColumn('ag-Grid-HierarchyColumn-date-year')).toBeNull();
        expect((yearAfter as any).isAlive()).toBe(false);
    });
});

/** Walks `col.originalParent` upwards and returns the wrapper chain (excludes the leaf col).
 *  These are `AgProvidedColumnGroup` instances created by `ColWrapperCache.buildWrapper`. */
const wrapperChainOf = (col: Column): any[] => {
    const chain: any[] = [];
    let parent: any = (col as any).originalParent;
    while (parent) {
        chain.push(parent);
        parent = parent.originalParent;
    }
    return chain;
};

describe('ColWrapperCache lifecycle', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            RowNumbersModule,
            RowSelectionModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('auto col AgColumn instance is preserved across pivot mode toggle (round-trip)', async () => {
        const api = gridsManager.createGrid('preserve-auto-col-pivot', {
            columnDefs: [
                { colId: 'country', rowGroup: true },
                { colId: 'year', pivot: true },
                { colId: 'gold', aggFunc: 'sum' },
            ],
            rowData: [{ country: 'USA', year: 2020, gold: 3 }],
            pivotMode: false,
        });

        const autoColBefore = api.getColumn('ag-Grid-AutoColumn');
        expect(autoColBefore).not.toBeNull();

        await new GridColumns(api, 'cols before pivot round-trip').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country width:200 rowGroup
            ├── year width:200 pivot
            └── gold width:200 aggFunc:sum
        `);

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        await new GridColumns(api, 'cols in pivot mode').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ GROUP
              └── pivot_year__gold width:200 columnGroupShow:open
        `);

        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);
        await new GridColumns(api, 'cols after pivot round-trip').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country width:200 rowGroup
            ├── year width:200 pivot
            └── gold width:200 aggFunc:sum
        `);

        // PR promise: auto col instance survives pivot toggle round-trip.
        const autoColAfter = api.getColumn('ag-Grid-AutoColumn');
        expect(autoColAfter).toBe(autoColBefore);
        expect((autoColAfter as any).isAlive()).toBe(true);
    });

    test('auto col wrapper chain is preserved across refreshes that keep tree depth stable', async () => {
        const api = gridsManager.createGrid('preserve-wrapper-chain', {
            // User column group → tree depth = 1, so the auto col gets wrapped.
            columnDefs: [
                { headerName: 'Medals', children: [{ colId: 'gold' }, { colId: 'silver' }] },
                { colId: 'country', rowGroup: true, hide: true },
            ],
            rowData: [{ country: 'USA', gold: 3, silver: 1 }],
        });

        const autoCol = api.getColumn('ag-Grid-AutoColumn')!;
        const wrappersBefore = wrapperChainOf(autoCol);
        expect(wrappersBefore.length).toBeGreaterThan(0);
        for (const w of wrappersBefore) {
            expect(w.isAlive()).toBe(true);
        }

        await new GridColumns(api, 'cols before visibility toggle').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        // Trigger a refresh that doesn't touch the auto col's (col, depth) pair.
        api.setColumnsVisible(['gold'], false);
        api.setColumnsVisible(['gold'], true);

        await new GridColumns(api, 'cols after visibility toggle').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        const wrappersAfter = wrapperChainOf(autoCol);
        expect(wrappersAfter).toEqual(wrappersBefore);
        for (const w of wrappersAfter) {
            expect(w.isAlive()).toBe(true);
        }
    });

    test('auto col wrapper chain is destroyed and rebuilt when tree depth changes', async () => {
        const api = gridsManager.createGrid('rebuild-wrapper-on-depth-change', {
            // Start with no user groups → depth 0 → no wrappers.
            columnDefs: [{ colId: 'gold' }, { colId: 'country', rowGroup: true, hide: true }],
            rowData: [{ country: 'USA', gold: 3 }],
        });

        const autoCol = api.getColumn('ag-Grid-AutoColumn')!;
        expect(wrapperChainOf(autoCol).length).toBe(0);
        await new GridColumns(api, 'flat: no wrapper chain').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold width:200
        `);

        // Add a user column group → tree depth bumps to 1 → wrappers are created.
        api.setGridOption('columnDefs', [
            { headerName: 'Medals', children: [{ colId: 'gold' }, { colId: 'silver' }] },
            { colId: 'country', rowGroup: true, hide: true },
        ]);
        await asyncSetTimeout(0);
        await new GridColumns(api, 'group added: wrappers created').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        const wrappersAfterAdd = wrapperChainOf(autoCol);
        expect(wrappersAfterAdd.length).toBeGreaterThan(0);
        for (const w of wrappersAfterAdd) {
            expect(w.isAlive()).toBe(true);
        }

        // Removing the user group drops depth back to 0 → old wrappers are destroyed and not replaced.
        api.setGridOption('columnDefs', [{ colId: 'gold' }, { colId: 'country', rowGroup: true, hide: true }]);
        await asyncSetTimeout(0);
        await new GridColumns(api, 'group removed: wrappers destroyed').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold width:200
        `);

        for (const w of wrappersAfterAdd) {
            expect(w.isAlive()).toBe(false);
        }
        expect(wrapperChainOf(autoCol).length).toBe(0);
    });

    test('selection col wrapper chain is destroyed when row selection is disabled', async () => {
        const api = gridsManager.createGrid('destroy-selection-wrappers', {
            columnDefs: [{ headerName: 'Medals', children: [{ colId: 'gold' }, { colId: 'silver' }] }],
            rowData: [{ gold: 3, silver: 1 }],
            rowSelection: { mode: 'multiRow', checkboxes: true },
        });

        const selectionCol = api.getColumn('ag-Grid-SelectionColumn')!;
        expect(selectionCol).not.toBeNull();
        const wrappers = wrapperChainOf(selectionCol);
        expect(wrappers.length).toBeGreaterThan(0);
        for (const w of wrappers) {
            expect(w.isAlive()).toBe(true);
        }

        await new GridColumns(api, 'cols with selection col').checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        // Disable selection → service col is dropped → cache evicts its wrapper chain.
        api.setGridOption('rowSelection', undefined as any);
        await asyncSetTimeout(0);

        await new GridColumns(api, 'cols after selection disabled').checkColumns(`
            CENTER
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        expect(api.getColumn('ag-Grid-SelectionColumn')).toBeNull();
        for (const w of wrappers) {
            expect(w.isAlive()).toBe(false);
        }
    });

    test('many no-op refreshes do not allocate new wrappers for service cols', async () => {
        const api = gridsManager.createGrid('cache-reuse-many-refreshes', {
            columnDefs: [
                { headerName: 'Medals', children: [{ colId: 'gold' }, { colId: 'silver' }] },
                { colId: 'country', rowGroup: true, hide: true },
            ],
            rowData: [{ country: 'USA', gold: 3, silver: 1 }],
        });

        const autoCol = api.getColumn('ag-Grid-AutoColumn')!;
        const wrappersInitial = wrapperChainOf(autoCol);
        expect(wrappersInitial.length).toBeGreaterThan(0);

        await new GridColumns(api, 'cols before refresh storm').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        // Drive 20 visibility-toggle refreshes — each calls `refreshCols`, each hits the cache.
        for (let i = 0; i < 20; ++i) {
            api.setColumnsVisible(['gold'], false);
            api.setColumnsVisible(['gold'], true);
        }

        await new GridColumns(api, 'cols after refresh storm — wrappers stable').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Medals" GROUP
              ├── gold width:200
              └── silver width:200
        `);

        // Same wrapper instances throughout — no leak, no rebuild.
        const wrappersAfter = wrapperChainOf(autoCol);
        expect(wrappersAfter).toEqual(wrappersInitial);
        for (const w of wrappersAfter) {
            expect(w.isAlive()).toBe(true);
        }
    });
});
