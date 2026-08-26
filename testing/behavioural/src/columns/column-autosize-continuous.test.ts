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
import { DragEventDispatcher, TestGridsManager } from 'ag-test-utils';

import type { AutoSizeColumnsTriggerParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ColumnAutoSizeModule } from 'ag-grid-community';

/** The width every eligible column lands on once measured: `minWidth` beats the 20px happy-dom measurement. */
const MEASURED_WIDTH = 120;
const START_WIDTH = 300;

describe('Continuous Column Autosize', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnAutoSizeModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const widthOf = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    const expectWidth = (api: GridApi, colId: string, width: number): Promise<void> =>
        waitFor(() => expect(widthOf(api, colId)).toBe(width));

    /**
     * `owned` starts at 300 via an explicit `width`, `eligible` starts at 300 via `initialWidth`. Both
     * have a `minWidth` of 120, so only an eligible column ends up at 120 once measured.
     */
    const createGrid = (options: GridOptions = {}): GridApi =>
        gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'owned', field: 'owned', width: START_WIDTH, minWidth: MEASURED_WIDTH },
                { colId: 'eligible', field: 'eligible', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
            ],
            rowData: [{ owned: 'a', eligible: 'b' }],
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

    const LONGER_DATA = [{ owned: 'a much longer value', eligible: 'b much longer value' }];

    describe('ownership', () => {
        test('`initialWidth` is not owned, so a data change re-sizes the column', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.applyColumnState({ state: [{ colId: 'eligible', width: START_WIDTH }] });
            api.setGridOption('rowData', LONGER_DATA);

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('an explicit `width` is owned from construction and survives a data change', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            expect(widthOf(api, 'owned')).toBe(START_WIDTH);
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

            // force `eligible` back up so its return to 120 proves the follow-up sizing pass ran
            api.applyColumnState({ state: [{ colId: 'eligible', width: START_WIDTH }] });
            api.setGridOption('rowData', [{ dragged: 'a much longer value', eligible: 'b much longer value' }]);
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            expect(widthOf(api, 'dragged')).toBe(draggedWidth);
        });

        test('a reused definition with an updated `width` becomes owned', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.setGridOption('columnDefs', [
                { colId: 'owned', field: 'owned', width: START_WIDTH, minWidth: MEASURED_WIDTH },
                { colId: 'eligible', field: 'eligible', width: 280, minWidth: MEASURED_WIDTH },
            ]);
            api.setGridOption('rowData', LONGER_DATA);

            await waitFor(() => expect(widthOf(api, 'eligible')).toBe(280));
        });

        test('a reused definition without a `width` preserves prior ownership', async () => {
            const api = createGrid();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            api.setGridOption('columnDefs', [
                { colId: 'owned', field: 'owned', minWidth: MEASURED_WIDTH },
                { colId: 'eligible', field: 'eligible', initialWidth: START_WIDTH, minWidth: MEASURED_WIDTH },
            ]);
            await expectWidth(api, 'eligible', MEASURED_WIDTH);

            expect(widthOf(api, 'owned')).toBe(START_WIDTH);
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
            expect(widthOf(api, 'owned')).toBe(START_WIDTH);
        });
    });

    describe('triggers', () => {
        test('data replacement re-sizes eligible columns', async () => {
            const api = createGrid({ rowData: [] });
            api.setGridOption('rowData', [{ owned: 'a', eligible: 'b' }]);

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('a transaction update re-sizes eligible columns', async () => {
            const api = createGrid({ rowData: [] });
            api.applyTransaction({ add: [{ owned: 'a', eligible: 'b' }] });

            await expectWidth(api, 'eligible', MEASURED_WIDTH);
        });

        test('sorting alone is not reported as a data change', async () => {
            const { api, reasons } = createGridRecordingReasons();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            reasons.length = 0;

            api.applyColumnState({ state: [{ colId: 'eligible', sort: 'asc' }] });
            await waitFor(() => expect(api.getColumn('eligible')!.getSort()).toBe('asc'));

            expect(reasons).not.toContain('dataChanged');
        });

        test('a displayed-column change is reported as a column change', async () => {
            const { api, reasons } = createGridRecordingReasons();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            reasons.length = 0;

            api.setColumnsVisible(['owned'], false);
            await waitFor(() => expect(reasons).toContain('columnsChanged'));
        });

        test('multiple triggers in one frame coalesce into a single evaluation', async () => {
            const { api, reasons } = createGridRecordingReasons();
            await expectWidth(api, 'eligible', MEASURED_WIDTH);
            reasons.length = 0;

            api.setGridOption('rowData', [{ owned: 'a', eligible: 'b' }]);
            api.setGridOption('rowData', [{ owned: 'c', eligible: 'd' }]);
            api.setGridOption('rowData', [{ owned: 'e', eligible: 'f' }]);

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

            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);
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

            api.setGridOption('rowData', [{ owned: 'a', eligible: 'b' }]);
            await waitFor(() => expect(seen.length).toBeGreaterThan(0));

            const last = seen[seen.length - 1];
            expect(last.api).toBe(api);
            // only `eligible` is a candidate — `owned` has an explicit `colDef.width`
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

        test('flex columns are excluded from the candidate set', async () => {
            const seen: string[][] = [];
            const api = createGrid({
                columnDefs: [
                    { colId: 'flexed', field: 'flexed', flex: 1, minWidth: MEASURED_WIDTH },
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

        test('an empty grid is safe and leaves widths untouched', async () => {
            const api = createGrid({ rowData: [] });
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(0));

            expect(widthOf(api, 'owned')).toBe(START_WIDTH);
            expect(widthOf(api, 'eligible')).toBe(START_WIDTH);
        });
    });
});
