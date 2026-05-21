/**
 * Tests that column beans are destroyed exactly once when the grid is torn down,
 * and that intermediate rebuilds (pivot toggles, columnDefs replacement) don't leak.
 *
 * Design B ownership: ColumnModel.destroy() is the single owner of all column beans
 * at teardown — it walks colsTree once and destroys everything (leaves, source-tree
 * groups, and balanceTreeForAutoCols wrappers). Leaf services (auto/sel/rn/pivot)
 * still own mid-life destruction in their createColumns paths, but defer teardown
 * destruction to ColumnModel to prevent double-destroy.
 */
import type { Column, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

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

    test('destroys every column exactly once on grid teardown — primary + auto + selection + rowNumbers', () => {
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

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
    });

    test('destroys every column exactly once on grid teardown — with column groups', () => {
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

        // Full replacement of primary defs. Selection col / auto-group col instances may be
        // reused if their config didn't change — we only assert that displaced beans are
        // destroyed exactly once, not that EVERY old bean is destroyed.
        api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y', rowGroup: true }, { colId: 'z' }]);
        await asyncSetTimeout(0);

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

    test('tree data with auto group column destroys cleanly', () => {
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

        api.destroy();

        for (const col of columnsBeforeDestroy) {
            const id = col.getColId();
            expect({ id, count: tracker.destroyCount.get(id) ?? 0 }).toEqual({ id, count: 1 });
            expect((col as any).isAlive()).toBe(false);
        }
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

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);

        // PR promise: auto col instance survives pivot toggle round-trip.
        const autoColAfter = api.getColumn('ag-Grid-AutoColumn');
        expect(autoColAfter).toBe(autoColBefore);
        expect((autoColAfter as any).isAlive()).toBe(true);
    });

    test('auto col wrapper chain is preserved across refreshes that keep tree depth stable', () => {
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

        // Trigger a refresh that doesn't touch the auto col's (col, depth) pair.
        api.setColumnsVisible(['gold'], false);
        api.setColumnsVisible(['gold'], true);

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

        // Add a user column group → tree depth bumps to 1 → wrappers are created.
        api.setGridOption('columnDefs', [
            { headerName: 'Medals', children: [{ colId: 'gold' }, { colId: 'silver' }] },
            { colId: 'country', rowGroup: true, hide: true },
        ]);
        await asyncSetTimeout(0);

        const wrappersAfterAdd = wrapperChainOf(autoCol);
        expect(wrappersAfterAdd.length).toBeGreaterThan(0);
        for (const w of wrappersAfterAdd) {
            expect(w.isAlive()).toBe(true);
        }

        // Removing the user group drops depth back to 0 → old wrappers are destroyed and not replaced.
        api.setGridOption('columnDefs', [{ colId: 'gold' }, { colId: 'country', rowGroup: true, hide: true }]);
        await asyncSetTimeout(0);

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

        // Disable selection → service col is dropped → cache evicts its wrapper chain.
        api.setGridOption('rowSelection', undefined as any);
        await asyncSetTimeout(0);

        expect(api.getColumn('ag-Grid-SelectionColumn')).toBeNull();
        for (const w of wrappers) {
            expect(w.isAlive()).toBe(false);
        }
    });

    test('many no-op refreshes do not allocate new wrappers for service cols', () => {
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

        // Drive 20 visibility-toggle refreshes — each calls `refreshCols`, each hits the cache.
        for (let i = 0; i < 20; ++i) {
            api.setColumnsVisible(['gold'], false);
            api.setColumnsVisible(['gold'], true);
        }

        // Same wrapper instances throughout — no leak, no rebuild.
        const wrappersAfter = wrapperChainOf(autoCol);
        expect(wrappersAfter).toEqual(wrappersInitial);
        for (const w of wrappersAfter) {
            expect(w.isAlive()).toBe(true);
        }
    });
});
