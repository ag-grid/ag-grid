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
