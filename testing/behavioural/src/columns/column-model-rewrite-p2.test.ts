import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Regression coverage for edge cases surfaced while reviewing the column-model rewrite (AG-17366).
 * Each block locks one invariant that a future change could quietly break.
 */
describe('column-model rewrite edge cases', () => {
    const pivotGridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    afterEach(() => {
        pivotGridsManager.reset();
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    const defColIds = (defs: (ColDef | any)[] | undefined): string[] => (defs ?? []).map((d) => d.colId ?? d.field);
    const liveColIds = (api: GridApi): string[] => (api.getColumns() ?? []).map((c) => c.getColId());

    // P2-3: a primary column added while pivoting must keep its colDef position in getColumnDefs,
    // not jump to the front because its colsListIndex was never stamped (defaulted to 0).
    test('getColumnDefs reports a column added during pivot in colDef order', async () => {
        const options: GridOptions = {
            columnDefs: [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b', enablePivot: true, pivot: true },
                { colId: 'c', field: 'c', enableValue: true, aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: [{ a: 'x', b: 'y', c: 1 }],
        };
        const api = pivotGridsManager.createGrid('g', options);
        await asyncSetTimeout(0);

        // Insert 'd' between 'b' and 'c' while still in pivot mode.
        api.setGridOption('columnDefs', [
            { colId: 'a', field: 'a' },
            { colId: 'b', field: 'b', enablePivot: true, pivot: true },
            { colId: 'd', field: 'd' },
            { colId: 'c', field: 'c', enableValue: true, aggFunc: 'sum' },
        ]);
        await asyncSetTimeout(0);

        expect(defColIds(api.getColumnDefs())).toEqual(['a', 'b', 'd', 'c']);
    });

    // A pivot build must not reuse a user (primary) column whose colId collides with a generated pivot
    // colId — reuse is scoped to the same build kind (primary vs pivot result), not just colKind 'user'.
    test('pivot build does not reuse a user column that shares a generated pivot colId', async () => {
        // The colliding colId is expected to raise warning #273 (colId suffixed) — capture and assert it.
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = pivotGridsManager.createGrid('g', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'total', aggFunc: 'sum' },
                // colId deliberately collides with the generated pivot result colId for b='x'.
                { colId: 'pivot_b_x_total', field: 'extra' },
            ],
            rowData: [
                { country: 'US', b: 'x', total: 5, extra: 'E' },
                { country: 'US', b: 'y', total: 3, extra: 'F' },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(0);

        // The user column keeps its colId; the colliding pivot result column is suffixed — neither is the other.
        const userCol = api.getColumn('pivot_b_x_total');
        expect(userCol?.getColDef().field).toBe('extra');
        const pivotResult = api.getPivotResultColumns() ?? [];
        expect(pivotResult).not.toContain(userCol);
        expect(pivotResult.some((c) => c.getColId() === 'pivot_b_x_total_1')).toBe(true);

        // Verify the suffixing warning was actually raised (not silently swallowed).
        expect(warnSpy.mock.calls.some((args) => String(args[0]).includes('warning #273'))).toBe(true);
    });

    // P2-2: colId is imperative for REUSE — a column with a colId is never reused by field. Changing a
    // colId therefore produces a NEW column with the new colId (whether via a fresh colDef object or by
    // mutating the colId on a retained colDef reference). Lookup by field is unaffected (still supported).
    test('changing a colId produces a new column with the new colId (fresh object)', async () => {
        const api = gridsManager.createGrid('g', {
            columnDefs: [
                { colId: 'a', field: 'a' },
                { colId: 'b', field: 'b' },
            ],
            rowData: [{ a: 'x', b: 'y' }],
        });
        await asyncSetTimeout(0);
        expect(liveColIds(api)).toEqual(['a', 'b']);

        api.setGridOption('columnDefs', [
            { colId: 'a', field: 'a' },
            { colId: 'bRenamed', field: 'b' },
        ]);
        await asyncSetTimeout(0);

        expect(liveColIds(api)).toEqual(['a', 'bRenamed']);
        // Lookup by field is still supported, so the still-present field 'b' resolves the renamed column.
        expect(api.getColumn('bRenamed')?.getColId()).toBe('bRenamed');
        expect(api.getColumn('b')?.getColId()).toBe('bRenamed');
    });

    test('changing the colId on a retained colDef reference produces a new column with the new colId', async () => {
        // Same object reference reused across builds, but its colId is mutated — colId is imperative for
        // reuse, so this becomes a new column rather than silently keeping the old colId via colDef-ref reuse.
        const sharedDef: ColDef = { colId: 'b', field: 'b' };
        const api = gridsManager.createGrid('g', {
            columnDefs: [{ colId: 'a', field: 'a' }, sharedDef],
            rowData: [{ a: 'x', b: 'y' }],
        });
        await asyncSetTimeout(0);
        expect(liveColIds(api)).toEqual(['a', 'b']);

        sharedDef.colId = 'bRenamed';
        api.setGridOption('columnDefs', [{ colId: 'a', field: 'a' }, sharedDef]);
        await asyncSetTimeout(0);

        expect(liveColIds(api)).toEqual(['a', 'bRenamed']);
    });

    test('a new colId matching another column’s field does not reuse that column by field', async () => {
        // Old column has an explicit colId 'x' and field 'b'. A new def with colId 'b' must NOT be reused
        // from the old column just because 'b' is its field — colId is imperative for reuse.
        const api = gridsManager.createGrid('g', {
            columnDefs: [{ colId: 'x', field: 'b' }],
            rowData: [{ b: 'y' }],
        });
        await asyncSetTimeout(0);
        expect(liveColIds(api)).toEqual(['x']);

        api.setGridOption('columnDefs', [{ colId: 'b', field: 'b' }]);
        await asyncSetTimeout(0);

        // Reused-by-field would have kept colId 'x'; correct behaviour is the new colId 'b'.
        expect(liveColIds(api)).toEqual(['b']);
    });

    // P2-7: seating a hierarchy column's generated virtuals incrementally (addPivotColumns) must match the
    // bulk path (colDef `pivot: true`) — the same column structure either way.
    test('incrementally pivoting a hierarchy column seats its virtuals identically to the bulk path', async () => {
        const rowData = [
            { country: 'USA', date: new Date(2000, 9, 15), total: 5 },
            { country: 'USA', date: new Date(2001, 5, 20), total: 3 },
        ];
        const baseDefs = (pivot: boolean): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'date', enablePivot: true, pivot, groupHierarchy: ['year', 'month'] } as ColDef,
            { field: 'total', aggFunc: 'sum' },
        ];

        const bulkApi = pivotGridsManager.createGrid('bulk', { columnDefs: baseDefs(true), rowData, pivotMode: true });
        await asyncSetTimeout(0);

        const incApi = pivotGridsManager.createGrid('inc', { columnDefs: baseDefs(false), rowData, pivotMode: true });
        await asyncSetTimeout(0);
        incApi.addPivotColumns(['date']);
        await asyncSetTimeout(0);

        expect(liveColIds(incApi)).toEqual(liveColIds(bulkApi));
    });

    // reapplyDefs path: a refresh that keeps the hierarchy colIds unchanged refreshes the generated
    // virtual cols in place (reuses the same instances) rather than rebuilding them.
    test('refreshing with unchanged hierarchy colIds reuses the hierarchy column instances', async () => {
        const rowData = [
            { country: 'USA', date: new Date(2000, 9, 15), total: 5 },
            { country: 'USA', date: new Date(2001, 5, 20), total: 3 },
        ];
        const defs = (extra: boolean): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'date', enablePivot: true, pivot: true, groupHierarchy: ['year', 'month'] } as ColDef,
            { field: 'total', aggFunc: 'sum' },
            ...(extra ? [{ field: 'extra' } as ColDef] : []),
        ];

        const api = pivotGridsManager.createGrid('g', { columnDefs: defs(false), rowData, pivotMode: true });
        await asyncSetTimeout(0);

        const yearBefore = api.getColumn('ag-Grid-HierarchyColumn-date-year');
        const monthBefore = api.getColumn('ag-Grid-HierarchyColumn-date-month');
        expect(yearBefore).toBeTruthy();
        expect(monthBefore).toBeTruthy();

        // Adding an unrelated column leaves the date col's hierarchy colIds unchanged → reapplyDefs in place.
        api.setGridOption('columnDefs', defs(true));
        await asyncSetTimeout(0);

        expect(api.getColumn('ag-Grid-HierarchyColumn-date-year')).toBe(yearBefore);
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-month')).toBe(monthBefore);
    });

    test('a column WITHOUT an explicit colId is reused by field across a colDef-object change', async () => {
        // Field-keyed cols (auto-derived colId === field) must still reuse by field when the colDef ref changes.
        const api = gridsManager.createGrid('g', {
            columnDefs: [{ field: 'a' }, { field: 'b', width: 100 }],
            rowData: [{ a: 'x', b: 'y' }],
        });
        await asyncSetTimeout(0);
        const bBefore = api.getColumn('b');
        expect(bBefore?.getColId()).toBe('b');

        // Fresh objects (new refs), field stable, width changed → same column instance, picks up the new width.
        api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b', width: 250 }]);
        await asyncSetTimeout(0);

        expect(api.getColumn('b')).toBe(bBefore);
        expect(api.getColumn('b')?.getActualWidth()).toBe(250);
    });
});
