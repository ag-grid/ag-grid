/**
 * Continuous `fitCellContents` auto-sizing: `autoSizeStrategy.continuous`, the width-ownership rules that
 * decide which columns it may touch, and the `shouldAutoSizeColumns` callback. Kept apart from
 * `column-autosize.test.ts` because the surface is the continuous strategy rather than the one-shot
 * auto-size API, and because vitest parallelises across files rather than within one.
 *
 * happy-dom measures the fixed-position autosize dummy container as 0 px, so a measured column lands on
 * `autoSizePadding` (20) clamped up to its own `minWidth`. Every column here therefore carries an explicit
 * `minWidth` distinct from its starting width, which makes "was this column re-sized?" a plain assertion:
 * the width becomes `minWidth` if it was eligible, and is left alone if it was not.
 *
 * A column that must NOT move has nothing to poll for, so those assertions wait on an eligible column
 * moving first — proof the sizing pass actually ran — and only then assert the protected width.
 */
import { waitFor } from '@testing-library/dom';
import { DragEventDispatcher, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { AutoSizeColumnsTriggerParams, GridApi, GridOptions } from 'ag-grid-community';
import { AlignedGridsModule, ClientSideRowModelModule, ColumnAutoSizeModule } from 'ag-grid-community';

/** The width every eligible column lands on once measured: `minWidth` beats the 20px happy-dom measurement. */
const MEASURED_WIDTH = 120;
const START_WIDTH = 300;

describe('Continuous Column Autosize', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnAutoSizeModule, AlignedGridsModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const widthOf = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    /**
     * Lets a continuous re-size scheduled by the preceding statement run, so that "no re-size happened" is
     * asserted after the frame rather than ahead of it. Every assertion using this is negative, so there is
     * nothing to poll for: the scheduler's `setTimeout(0)` plus animation frame is the window being sampled
     * past (`scheduleContinuousAutoSize` in `columnAutosizeService.ts`).
     */
    // eslint-disable-next-line no-restricted-syntax -- samples past the continuous-resize scheduling frame; every assertion that follows it is negative
    const flushScheduledResize = (): Promise<void> => asyncSetTimeout(50);

    const expectWidth = (api: GridApi, colId: string, width: number): Promise<void> =>
        waitFor(() => expect(widthOf(api, colId)).toBe(width));

    /**
     * `pinned` opts out explicitly with `suppressAutoSize`; `eligible` is left for the grid to manage. Both
     * start at 300 with a `minWidth` of 120, so only an eligible column ends up at 120 once measured.
     */
    const createGrid = (options: GridOptions = {}): GridApi =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                {
                    colId: 'pinned',
                    field: 'pinned',
                    width: START_WIDTH,
                    minWidth: MEASURED_WIDTH,
                    suppressAutoSize: true,
                },
                { colId: 'eligible', field: 'eligible', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
            ],
            rowData: [{ pinned: 'a', eligible: 'b' }],
            autoSizeStrategy: { type: 'fitCellContents', continuous: true, skipHeader: true },
            ...options,
        });

    /** A grid whose strategy records every reason the callback is invoked with. */
    const createGridRecordingReasons = (): { api: GridApi; reasons: string[] } => {
        const reasons: string[] = [];
        const api = createGrid({
            autoSizeStrategy: {
                type: 'fitCellContents',
                continuous: true,
                skipHeader: true,
                shouldAutoSizeColumns: ({ reason }) => {
                    reasons.push(reason);
                    return true;
                },
            },
        });
        return { api, reasons };
    };

    const LONGER_DATA = [{ pinned: 'a much longer value', eligible: 'b much longer value' }];

    describe('ownership', () => {
        test('`initialWidth` is not owned, so a data change re-sizes the column', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            // `setColumnWidths` is an api resize, so it widens the column without taking ownership
            api.setColumnWidths([{ key: 'eligible', newWidth: START_WIDTH }]);
            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);

            api.setGridOption('rowData', LONGER_DATA);
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('`suppressAutoSize` holds a column at its starting width through a data change', async () => {
            const api = createGrid();
            // the eligible column moving is proof the pass ran; `pinned` opted out, so it did not move
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            expect(widthOf(api, 'pinned')).toBe(START_WIDTH);
        });

        test('a header drag resize takes ownership, and survives a later data change', async () => {
            const api = createGrid({
                columnDefs: [
                    {
                        colId: 'dragged',
                        field: 'dragged',
                        initialWidth: START_WIDTH,
                        minWidth: MEASURED_WIDTH,
                        resizable: true,
                    },
                    { colId: 'eligible', field: 'eligible', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
                ],
            });
            await expectWidth(api, 'dragged', MEASURED_WIDTH);

            const eResize = document.querySelector('[col-id="dragged"] .ag-header-cell-resize');
            expect(eResize).not.toBeNull();

            const dispatcher = new DragEventDispatcher('mouse', null, false);
            await dispatcher.startDrag(eResize!, 100, 10);
            await dispatcher.movePointer(eResize!, 200, 10);
            await dispatcher.finishDrag();

            const draggedWidth = widthOf(api, 'dragged');
            expect(draggedWidth).toBeGreaterThan(MEASURED_WIDTH);

            // widen `eligible` without owning it, so its return to 120 proves the follow-up pass ran
            api.setColumnWidths([{ key: 'eligible', newWidth: START_WIDTH }]);
            api.setGridOption('rowData', [{ dragged: 'a much longer value', eligible: 'b much longer value' }]);
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            expect(widthOf(api, 'dragged')).toBe(draggedWidth);
        });

        test('a `colDef.width` is only a starting width, so the column is still re-sized', async () => {
            const api = createGrid({
                columnDefs: [{ colId: 'eligible', field: 'eligible', width: START_WIDTH, minWidth: MEASURED_WIDTH }],
            });

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('a reused definition with an updated `width` is still re-sized', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.setGridOption('columnDefs', [
                { colId: 'pinned', field: 'pinned', minWidth: MEASURED_WIDTH, suppressAutoSize: true },
                { colId: 'eligible', field: 'eligible', width: 280, minWidth: MEASURED_WIDTH },
            ]);
            api.setGridOption('rowData', LONGER_DATA);

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('a user resize survives a column-definition update', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            const eResize = document.querySelector('[col-id="eligible"] .ag-header-cell-resize');
            const dispatcher = new DragEventDispatcher('mouse', null, false);
            await dispatcher.startDrag(eResize!, 100, 10);
            await dispatcher.movePointer(eResize!, 220, 10);
            await dispatcher.finishDrag();

            const draggedWidth = widthOf(api, 'eligible');
            expect(draggedWidth).toBeGreaterThan(MEASURED_WIDTH);

            api.setGridOption('columnDefs', [
                { colId: 'pinned', field: 'pinned', minWidth: MEASURED_WIDTH, suppressAutoSize: true },
                { colId: 'eligible', field: 'eligible', minWidth: MEASURED_WIDTH },
            ]);
            api.setGridOption('rowData', LONGER_DATA);
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));

            expect(widthOf(api, 'eligible')).toBe(draggedWidth);
        });

        test('`applyColumnState` with an explicit width takes ownership', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.applyColumnState({ state: [{ colId: 'eligible', width: 260 }] });
            await waitFor(() => expect(widthOf(api, 'eligible')).toBe(260));

            api.setGridOption('rowData', LONGER_DATA);
            // nothing is eligible any more, so wait on the callback-free path settling and assert it held
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
            expect(widthOf(api, 'eligible')).toBe(260);
        });

        test('a state width below the column minimum is ignored and does not take ownership', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.applyColumnState({ state: [{ colId: 'eligible', width: 10 }] });
            api.setGridOption('rowData', LONGER_DATA);

            // the invalid width was dropped, so the column is still eligible and still measures to 120
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('resetting column state restores ownership from the colDef', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.applyColumnState({ state: [{ colId: 'eligible', width: 260 }] });
            await waitFor(() => expect(widthOf(api, 'eligible')).toBe(260));

            api.resetColumnState();
            api.setGridOption('rowData', LONGER_DATA);

            // the colDef declares `initialWidth`, so the column is eligible again
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            expect(widthOf(api, 'pinned')).toBe(START_WIDTH);
        });
    });

    describe('triggers', () => {
        test('data replacement re-sizes eligible columns', async () => {
            const api = createGrid({ rowData: [] });
            api.setGridOption('rowData', [{ pinned: 'a', eligible: 'b' }]);

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('a transaction update re-sizes eligible columns', async () => {
            const api = createGrid({ rowData: [] });
            api.applyTransaction({ add: [{ pinned: 'a', eligible: 'b' }] });

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('`rowNode.setData` re-sizes eligible columns', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.setColumnWidths([{ key: 'eligible', newWidth: START_WIDTH }]);
            api.getDisplayedRowAtIndex(0)!.setData({ pinned: 'x', eligible: 'a much longer value' });

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('sorting is a data change for the content strategy, which re-measures what is rendered', async () => {
            const { api, reasons } = createGridRecordingReasons();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            reasons.length = 0;

            api.applyColumnState({ state: [{ colId: 'eligible', sort: 'asc' }] });

            await waitFor(() => expect(reasons).toContain('dataChanged'));
        });

        test('sorting alone is not a data change for the width-distribution strategies', async () => {
            const reasons: string[] = [];
            const api = createGrid({
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                autoSizeStrategy: {
                    type: 'fitGridWidth',
                    continuous: true,
                    shouldAutoSizeColumns: ({ reason }) => {
                        reasons.push(reason);
                        return true;
                    },
                },
            });
            await waitFor(() => expect(reasons.length).toBeGreaterThan(0));
            // startup schedules an initial pass of its own; let it land before clearing, or it turns up
            // afterwards and looks like a re-size the statement under test caused
            await flushScheduledResize();
            reasons.length = 0;

            api.applyColumnState({ state: [{ colId: 'a', sort: 'asc' }] });

            // applying the sort re-creates the displayed columns, so `columnsChanged` is the frame this waits
            // on. `dataChanged` outranks it, so a sort that had scheduled one would be reported in its place
            // and this would time out rather than silently pass.
            await waitFor(() => expect(reasons).toContain('columnsChanged'));
            await flushScheduledResize();

            // re-ordering rows changes neither the column set nor the width to share out
            expect(reasons).not.toContain('dataChanged');
        });

        test('a displayed-column change is reported as a column change', async () => {
            const { api, reasons } = createGridRecordingReasons();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            reasons.length = 0;

            api.setColumnsVisible(['pinned'], false);
            await waitFor(() => expect(reasons).toContain('columnsChanged'));
        });

        test('multiple triggers in one frame coalesce into a single evaluation', async () => {
            const { api, reasons } = createGridRecordingReasons();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            reasons.length = 0;

            api.setGridOption('rowData', [{ pinned: 'a', eligible: 'b' }]);
            api.setGridOption('rowData', [{ pinned: 'c', eligible: 'd' }]);
            api.setGridOption('rowData', [{ pinned: 'e', eligible: 'f' }]);

            await waitFor(() => expect(reasons.length).toBeGreaterThan(0));
            expect(reasons).toEqual(['dataChanged']);
        });

        test('the strategy stays one-shot when `continuous` is omitted', async () => {
            const api = createGrid({
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true },
            });
            // the one-shot pass runs on first data render and, by design, ignores ownership
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.applyColumnState({ state: [{ colId: 'eligible', width: START_WIDTH }] });
            api.setGridOption('rowData', LONGER_DATA);
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
            await flushScheduledResize();

            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);
        });
    });

    describe('all strategy types', () => {
        test('`fitProvidedWidth` re-distributes the provided width on a data change', async () => {
            const api = createGrid({
                columnDefs: [
                    { colId: 'pinnedWidth', field: 'pinnedWidth', width: 200, suppressSizeToFit: true },
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 800, continuous: true },
            });
            await waitFor(() => expect(widthOf(api, 'a') + widthOf(api, 'b')).toBe(600));

            // the opted-out column is held out of the distribution and stays where the colDef put it
            expect(widthOf(api, 'pinnedWidth')).toBe(200);

            api.setColumnWidths([
                { key: 'a', newWidth: 100 },
                { key: 'b', newWidth: 100 },
            ]);
            api.setGridOption('rowData', [{ pinnedWidth: 'x', a: 'y', b: 'z' }]);

            await waitFor(() => expect(widthOf(api, 'a') + widthOf(api, 'b')).toBe(600));
            expect(widthOf(api, 'pinnedWidth')).toBe(200);
        });

        test('`fitGridWidth` re-runs on a data change and holds opted-out columns fixed', async () => {
            const api = createGrid({
                columnDefs: [
                    { colId: 'pinnedWidth', field: 'pinnedWidth', width: 200, suppressSizeToFit: true },
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                autoSizeStrategy: { type: 'fitGridWidth', continuous: true },
            });
            await waitFor(() => expect(widthOf(api, 'a')).not.toBe(200));

            const distributed = widthOf(api, 'a') + widthOf(api, 'b');
            expect(widthOf(api, 'pinnedWidth')).toBe(200);

            api.setColumnWidths([
                { key: 'a', newWidth: 50 },
                { key: 'b', newWidth: 50 },
            ]);
            api.setGridOption('rowData', [{ pinnedWidth: 'x', a: 'y', b: 'z' }]);

            await waitFor(() => expect(widthOf(api, 'a') + widthOf(api, 'b')).toBe(distributed));
            expect(widthOf(api, 'pinnedWidth')).toBe(200);
        });

        /**
         * A real horizontal scroll is not drivable in happy-dom — there is no laid-out body viewport to
         * scroll — so this covers the registration instead: `virtualColumnsChanged` and `viewportChanged` do
         * fire during startup and on a column change, and would be reported here if the width-distribution
         * strategies had been wired to them. The scroll itself is covered by the docs e2e suite.
         */
        test('the width-distribution strategies never report a viewport change', async () => {
            const reasons: string[] = [];
            const api = createGrid({
                columnDefs: [
                    { colId: 'a', field: 'a' },
                    { colId: 'b', field: 'b' },
                ],
                autoSizeStrategy: {
                    type: 'fitGridWidth',
                    continuous: true,
                    shouldAutoSizeColumns: ({ reason }) => {
                        reasons.push(reason);
                        return true;
                    },
                },
            });
            await waitFor(() => expect(reasons.length).toBeGreaterThan(0));
            // startup schedules an initial pass of its own; let it land before clearing, or it turns up
            // afterwards and looks like a re-size the statement under test caused
            await flushScheduledResize();
            reasons.length = 0;

            api.setColumnsVisible(['b'], false);
            await waitFor(() => expect(reasons).toContain('columnsChanged'));
            await flushScheduledResize();

            expect(reasons).not.toContain('viewportChanged');
        });
    });

    describe('shouldAutoSizeColumns callback', () => {
        test('receives the reason, the eligible columns and the api', async () => {
            const seen: AutoSizeColumnsTriggerParams[] = [];
            const api = createGrid({
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    continuous: true,
                    skipHeader: true,
                    shouldAutoSizeColumns: (params) => {
                        seen.push(params);
                        return true;
                    },
                },
            });

            api.setGridOption('rowData', [{ pinned: 'a', eligible: 'b' }]);
            await waitFor(() => expect(seen.length).toBeGreaterThan(0));

            const last = seen[seen.length - 1];
            expect(last.api).toBe(api);
            // only `eligible` is a candidate — `pinned` sets `suppressAutoSize`
            expect(last.columns.map((col) => col.getColId())).toEqual(['eligible']);
            expect(['dataChanged', 'columnsChanged', 'viewportChanged', 'gridSizeChanged']).toContain(last.reason);
        });

        test('returning false suppresses the resize', async () => {
            let calls = 0;
            const api = createGrid({
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    continuous: true,
                    skipHeader: true,
                    shouldAutoSizeColumns: () => {
                        calls++;
                        return false;
                    },
                },
            });

            api.setGridOption('rowData', LONGER_DATA);
            await waitFor(() => expect(calls).toBeGreaterThan(0));

            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);
        });

        test('a throwing callback does not leave the service locked', async () => {
            let shouldThrow = true;
            const api = createGrid({
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    continuous: true,
                    skipHeader: true,
                    shouldAutoSizeColumns: () => {
                        if (shouldThrow) {
                            throw new Error('callback failed');
                        }
                        return true;
                    },
                },
            });

            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(1));
            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);

            shouldThrow = false;
            api.setGridOption('rowData', LONGER_DATA);

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });
    });

    describe('exclusions', () => {
        test('`suppressAutoSize` columns are left alone', async () => {
            const api = createGrid({
                columnDefs: [
                    {
                        colId: 'suppressed',
                        field: 'suppressed',
                        initialWidth: START_WIDTH,
                        minWidth: MEASURED_WIDTH,
                        suppressAutoSize: true,
                    },
                    { colId: 'eligible', field: 'eligible', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
                ],
            });
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            expect(widthOf(api, 'suppressed')).toBe(START_WIDTH);
        });

        // `colDef.flex` alongside `autoSizeStrategy` is a validated conflict (warning #318), so flex is
        // applied through column state — the one route that legally produces a flexing column here.
        test('flex columns are excluded from the candidate set', async () => {
            const seen: string[][] = [];
            const api = createGrid({
                columnDefs: [
                    { colId: 'flexed', field: 'flexed', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
                    { colId: 'eligible', field: 'eligible', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
                ],
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    continuous: true,
                    skipHeader: true,
                    shouldAutoSizeColumns: ({ columns }) => {
                        seen.push(columns.map((col) => col.getColId()));
                        return true;
                    },
                },
            });
            await waitFor(() => expect(widthOf(api, 'flexed')).toBe(MEASURED_WIDTH));

            api.applyColumnState({ state: [{ colId: 'flexed', flex: 1 }] });
            await waitFor(() => expect(api.getColumn('flexed')!.getFlex()).toBe(1));
            seen.length = 0;

            api.setGridOption('rowData', [{ flexed: 'a', eligible: 'b' }]);
            await waitFor(() => expect(seen.length).toBeGreaterThan(0));

            expect(seen[seen.length - 1]).toEqual(['eligible']);
        });

        test('`colIds` restricts sizing to the listed columns', async () => {
            const api = createGrid({
                columnDefs: [
                    { colId: 'listed', field: 'listed', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
                    { colId: 'unlisted', field: 'unlisted', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
                ],
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    continuous: true,
                    skipHeader: true,
                    colIds: ['listed'],
                },
            });

            api.setGridOption('rowData', [{ listed: 'a', unlisted: 'b' }]);
            await expectWidth(api, 'listed', MEASURED_WIDTH);

            expect(widthOf(api, 'unlisted')).toBe(START_WIDTH);
        });

        test('`suppressSizeToFit` columns are excluded from the width-distribution strategies', async () => {
            const seen: string[][] = [];
            const api = createGrid({
                columnDefs: [
                    { colId: 'pinnedWidth', field: 'pinnedWidth', suppressSizeToFit: true },
                    { colId: 'eligible', field: 'eligible' },
                ],
                autoSizeStrategy: {
                    type: 'fitProvidedWidth',
                    width: 800,
                    continuous: true,
                    shouldAutoSizeColumns: ({ columns }) => {
                        seen.push(columns.map((col) => col.getColId()));
                        return true;
                    },
                },
            });

            api.setGridOption('rowData', [{ pinnedWidth: 'a', eligible: 'b' }]);
            await waitFor(() => expect(seen.length).toBeGreaterThan(0));

            expect(seen[seen.length - 1]).toEqual(['eligible']);
        });

        test('an empty grid is safe and leaves widths untouched', async () => {
            const api = createGrid({ rowData: [] });
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));

            expect(widthOf(api, 'pinned')).toBe(START_WIDTH);
            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);
        });
    });

    describe('aligned grids', () => {
        /**
         * Two bidirectionally aligned grids, each continuously auto-sizing its own columns. A resize in
         * either grid is propagated to the other as an `alignedGridChanged` resize.
         */
        const createAlignedGrids = (): { api1: GridApi; api2: GridApi } => {
            const options = (): GridOptions => ({
                columnDefs: [
                    {
                        colId: 'pinned',
                        field: 'pinned',
                        width: START_WIDTH,
                        minWidth: MEASURED_WIDTH,
                        suppressAutoSize: true,
                    },
                    {
                        colId: 'eligible',
                        field: 'eligible',
                        initialWidth: START_WIDTH,
                        minWidth: MEASURED_WIDTH,
                        resizable: true,
                    },
                ],
                rowData: [{ pinned: 'a', eligible: 'b' }],
                autoSizeStrategy: { type: 'fitCellContents', continuous: true, skipHeader: true },
            });
            const api1 = gridsManager.createGrid('grid1', options());
            const api2 = gridsManager.createGrid('grid2', options());
            api1.setGridOption('alignedGrids', [{ api: api2 }]);
            api2.setGridOption('alignedGrids', [{ api: api1 }]);
            return { api1, api2 };
        };

        test('a user resize in one grid takes ownership in both', async () => {
            const { api1, api2 } = createAlignedGrids();
            await expectWidth(api1, 'eligible', MEASURED_WIDTH);
            await expectWidth(api2, 'eligible', MEASURED_WIDTH);

            const eResize = document.querySelector('#grid2 [col-id="eligible"] .ag-header-cell-resize');
            expect(eResize).not.toBeNull();

            const dispatcher = new DragEventDispatcher('mouse', null, false);
            await dispatcher.startDrag(eResize!, 100, 10);
            await dispatcher.movePointer(eResize!, 220, 10);
            await dispatcher.finishDrag();

            const draggedWidth = widthOf(api2, 'eligible');
            expect(draggedWidth).toBeGreaterThan(MEASURED_WIDTH);
            expect(widthOf(api1, 'eligible')).toBe(draggedWidth);

            // the propagated resize is owned in grid1 too, so its own continuous pass must not undo it —
            // nor, through the resize grid1 would fire back, the resize the user made in grid2
            api1.setGridOption('rowData', LONGER_DATA);
            api2.setGridOption('rowData', LONGER_DATA);
            await flushScheduledResize();

            expect(widthOf(api2, 'eligible')).toBe(draggedWidth);
            expect(widthOf(api1, 'eligible')).toBe(draggedWidth);
        });

        test('an api resize propagated between the grids leaves both columns eligible', async () => {
            const { api1, api2 } = createAlignedGrids();
            await expectWidth(api1, 'eligible', MEASURED_WIDTH);
            await expectWidth(api2, 'eligible', MEASURED_WIDTH);

            api1.setColumnWidths([{ key: 'eligible', newWidth: START_WIDTH }]);
            await expectWidth(api2, 'eligible', START_WIDTH);

            api1.setGridOption('rowData', LONGER_DATA);
            api2.setGridOption('rowData', LONGER_DATA);

            await expectWidth(api1, 'eligible', MEASURED_WIDTH);
            await expectWidth(api2, 'eligible', MEASURED_WIDTH);
        });
    });
});
