import type { Column, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { AggregationModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/**
 * Event coverage for every public entry point of the cols services (rowGroup / pivot / value).
 * Locks the redesign's invariant: each logical mutation dispatches its grid `columnXChanged` event
 * exactly once (a batch of changes collapses to one), with the changed columns as payload; and the
 * per-column event fires immediately on the affected column.
 */
describe('Cols service events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule, AggregationModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const baseOptions = (): GridOptions => ({
        columnDefs: [
            { colId: 'a', field: 'a', enableRowGroup: true, enableValue: true, enablePivot: true },
            { colId: 'b', field: 'b', enableRowGroup: true, enableValue: true, enablePivot: true },
            { colId: 'c', field: 'c', enableRowGroup: true, enableValue: true, enablePivot: true },
            { colId: 'd', field: 'd' },
        ],
        rowData: [{ a: 'x', b: 'p', c: 1, d: 2 }],
    });

    /** Subscribe to a grid event, returning the captured events array. */
    function capture(api: GridApi, eventName: any): any[] {
        const events: any[] = [];
        api.addEventListener(eventName, (e: any) => events.push(e));
        return events;
    }

    const ids = (cols: Column[] | null | undefined): string[] => (cols ?? []).map((c) => c.getColId());

    describe('rowGroup', () => {
        test('setRowGroupColumns fires columnRowGroupChanged once with the new cols', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const events = capture(api, 'columnRowGroupChanged');

            api.setRowGroupColumns(['a', 'b']);
            await asyncSetTimeout(0);

            expect(events.length).toBe(1);
            expect(ids(events[0].columns)).toEqual(['a', 'b']);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });

        test('setRowGroupColumns with the identical set fires no event (no spurious refresh/dispatch)', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            api.setRowGroupColumns(['a', 'b']);
            await asyncSetTimeout(0);
            const events = capture(api, 'columnRowGroupChanged');

            api.setRowGroupColumns(['a', 'b']); // identical membership + order → no-op
            await asyncSetTimeout(0);

            expect(events.length).toBe(0);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });

        test('addRowGroupColumns then removeRowGroupColumns fire one event each', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const events = capture(api, 'columnRowGroupChanged');

            api.addRowGroupColumns(['a']);
            await asyncSetTimeout(0);
            expect(events.length).toBe(1);
            expect(ids(events[0].columns)).toContain('a');

            api.removeRowGroupColumns(['a']);
            await asyncSetTimeout(0);
            expect(events.length).toBe(2);
            expect(ids(events[1].columns)).toContain('a');
            expect(api.getRowGroupColumns().length).toBe(0);
        });

        test('moveRowGroupColumn fires columnRowGroupChanged once, reporting the moved column', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            api.setRowGroupColumns(['a', 'b']);
            await asyncSetTimeout(0);
            const events = capture(api, 'columnRowGroupChanged');

            api.moveRowGroupColumn(0, 1);
            await asyncSetTimeout(0);

            expect(events.length).toBe(1);
            expect(ids(events[0].columns)).toEqual(['a']);
            expect(events[0].column?.getColId()).toBe('a');
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['b', 'a']);
        });

        test('the per-column columnRowGroupChanged event fires immediately on the affected column', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const colA = api.getColumn('a')!;
            const colEvents: any[] = [];
            colA.addEventListener('columnRowGroupChanged', (e: any) => colEvents.push(e));

            api.addRowGroupColumns(['a']);

            // Per-column events are immediate (not batched) — assert before any tick.
            expect(colEvents.length).toBe(1);
        });
    });

    describe('value', () => {
        test('setValueColumns fires columnValueChanged once', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const events = capture(api, 'columnValueChanged');

            api.setValueColumns(['a', 'b']);
            await asyncSetTimeout(0);

            expect(events.length).toBe(1);
            expect(ids(events[0].columns)).toEqual(['a', 'b']);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });

        test('setColumnAggFunc activates a value col and fires columnValueChanged once', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const events = capture(api, 'columnValueChanged');

            api.setColumnAggFunc('c', 'sum');
            await asyncSetTimeout(0);

            expect(events.length).toBe(1);
            expect(ids(events[0].columns)).toEqual(['c']);
            expect(api.getColumn('c')!.getAggFunc()).toBe('sum');
        });
    });

    describe('pivot', () => {
        test('setPivotColumns fires columnPivotChanged once', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const events = capture(api, 'columnPivotChanged');

            api.setPivotColumns(['a', 'b']);
            await asyncSetTimeout(0);

            expect(events.length).toBe(1);
            expect(ids(events[0].columns)).toEqual(['a', 'b']);
            expect(api.getPivotColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });
    });

    describe('applyColumnState (batched diff dispatch)', () => {
        test('a multi-col rowGroup change collapses to one columnRowGroupChanged', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const events = capture(api, 'columnRowGroupChanged');

            api.applyColumnState({
                state: [
                    { colId: 'a', rowGroupIndex: 0 },
                    { colId: 'b', rowGroupIndex: 1 },
                ],
            });
            await asyncSetTimeout(0);

            expect(events.length).toBe(1);
            expect(ids(events[0].columns).sort()).toEqual(['a', 'b']);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['a', 'b']);
        });

        test('rowGroup + value + pivot changes in one applyColumnState fire one event per role', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const rowGroup = capture(api, 'columnRowGroupChanged');
            const value = capture(api, 'columnValueChanged');
            const pivot = capture(api, 'columnPivotChanged');

            api.applyColumnState({
                state: [
                    { colId: 'a', rowGroupIndex: 0 },
                    { colId: 'b', aggFunc: 'sum' },
                    { colId: 'c', pivotIndex: 0 },
                ],
            });
            await asyncSetTimeout(0);

            expect(rowGroup.length).toBe(1);
            expect(value.length).toBe(1);
            expect(pivot.length).toBe(1);
            expect(ids(rowGroup[0].columns)).toContain('a');
            expect(ids(value[0].columns)).toContain('b');
            expect(ids(pivot[0].columns)).toContain('c');
        });
    });

    // Mutating columns from within a column-change listener re-enters the flush pipeline. The guarantee we
    // verify is robustness: the change applies to state, with no hang / infinite loop / corruption. (Nested
    // event *delivery* timing is governed by the async event service, so we don't assert event counts here.)
    describe('re-entrancy (mutating inside a column-change listener)', () => {
        test('adding a value column inside a columnRowGroupChanged listener applies cleanly', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);

            let reentered = false;
            api.addEventListener('columnRowGroupChanged', () => {
                if (!reentered) {
                    reentered = true;
                    api.addValueColumns(['c']); // re-enter the pipeline mid-dispatch
                }
            });

            api.addRowGroupColumns(['a']);
            await asyncSetTimeout(0);

            expect(reentered).toBe(true);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['a']);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['c']);
        });

        test('moveColumn inside a columnRowGroupChanged listener reorders cleanly', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            api.setRowGroupColumns(['a', 'b']);
            await asyncSetTimeout(0);

            let moved = false;
            api.addEventListener('columnRowGroupChanged', () => {
                if (!moved) {
                    moved = true;
                    api.moveRowGroupColumn(0, 1); // order-only (no-refresh) re-entrant change
                }
            });

            api.addRowGroupColumns(['c']);
            await asyncSetTimeout(0);

            expect(moved).toBe(true);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['b', 'a', 'c']);
        });
    });

    // Legacy `columnEverythingChanged` (unused by AG Grid, kept for external listeners): a direct role
    // membership change raises it once; order-only/width changes don't; a colDef rebuild isn't doubled.
    describe('columnEverythingChanged legacy event', () => {
        test('a direct row-group membership change raises it exactly once per change (never doubled)', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const everything = capture(api, 'columnEverythingChanged');

            api.addRowGroupColumns(['a']);
            await asyncSetTimeout(0);
            expect(everything.length).toBe(1);

            api.setRowGroupColumns(['a', 'b']);
            await asyncSetTimeout(0);
            expect(everything.length).toBe(2);
        });

        test('order-only and width changes do not raise it', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            api.setRowGroupColumns(['a', 'b']);
            await asyncSetTimeout(0);
            const everything = capture(api, 'columnEverythingChanged');

            api.moveColumns(['d'], 0);
            api.moveRowGroupColumn(0, 1);
            api.setColumnWidths([{ key: 'd', newWidth: 123 }]);
            await asyncSetTimeout(0);
            expect(everything.length).toBe(0);
        });

        test('a colDef rebuild raises it exactly once (a staged role flush must not double it)', async () => {
            const api = gridsManager.createGrid('g', baseOptions());
            await asyncSetTimeout(0);
            const everything = capture(api, 'columnEverythingChanged');

            api.setGridOption('columnDefs', [
                { colId: 'a', field: 'a', rowGroup: true },
                { colId: 'b', field: 'b' },
            ]);
            await asyncSetTimeout(0);
            expect(everything.length).toBe(1);
        });
    });
});
