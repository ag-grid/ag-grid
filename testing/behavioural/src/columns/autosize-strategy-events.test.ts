/**
 * `autoSizeStrategy.events` — re-running the configured auto-size strategy when grid events fire.
 *
 * The re-run goes through the same code path as the initial application, so these tests cover the
 * wiring only: a configured event triggers a re-run, an unconfigured grid is untouched, and rapid
 * events collapse into one run.
 *
 * jsdom reports 0 px for the autosize measuring container, so `fitCellContents` lands every column
 * on its `minWidth`. That makes a content re-run observable: widen a column by hand, fire the
 * event, and it snaps back to `minWidth`.
 *
 * `fitGridWidth` derives its target from the grid body width, also 0 px in jsdom, so its re-run
 * cannot move widths here — that test asserts the re-run is harmless, the same bar the
 * initial-application test in column-autosize.test.ts sets.
 */
import { waitFor } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    EventApiModule,
    PaginationModule,
} from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('autoSizeStrategy events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, EventApiModule, PaginationModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const columnDefs = [
        { colId: 'a', minWidth: 100, width: 200 },
        { colId: 'b', minWidth: 100, width: 200 },
        { colId: 'c', minWidth: 100, width: 200 },
    ];

    const widths = (api: GridApi): number[] => api.getAllDisplayedColumns().map((col) => col.getActualWidth());

    const totalWidth = (api: GridApi): number => widths(api).reduce((sum, width) => sum + width, 0);

    const widthOf = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    /** Counts `columnResized(finished=true)` batches, i.e. completed sizing runs. */
    const countResizeBatches = (api: GridApi): (() => number) => {
        let count = 0;
        api.addEventListener('columnResized', (e) => {
            if (e.finished) {
                count++;
            }
        });
        return () => count;
    };

    /**
     * Positive signal that a re-run scheduled before this call has had its chance to run.
     * A control grid, created after that point, is driven through a full debounce plus deferred
     * run — it cannot complete before the earlier-scheduled run would have, so any assertion made
     * afterwards sees a settled grid without guessing at a delay.
     */
    let controlGridCount = 0;
    const settleStrategyWindow = async (): Promise<void> => {
        const control = gridsManager.createGrid(`controlGrid${controlGridCount++}`, {
            columnDefs,
            autoSizeStrategy: { type: 'fitProvidedWidth', width: 900, events: ['columnVisible'] },
        });
        await waitFor(() => expect(widths(control)).toEqual([300, 300, 300]));

        control.setColumnsVisible(['c'], false);
        await waitFor(() => expect(widths(control)).toEqual([450, 450]));
    };

    const paginatedGridOptions = {
        columnDefs,
        rowData: [
            { a: '1', b: '1', c: '1' },
            { a: '2', b: '2', c: '2' },
        ],
        pagination: true,
        paginationPageSize: 1,
        paginationPageSizeSelector: false,
    };

    describe('fitProvidedWidth', () => {
        test('re-runs on a configured event', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900, events: ['paginationChanged'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.paginationGoToNextPage();

            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));
            expect(totalWidth(api)).toBe(900);
        });

        test('does not re-run when no events are configured', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900 },
            });
            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.paginationGoToNextPage();
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(400);
        });

        test('a sizing event in the list settles instead of looping', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900, events: ['columnResized'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));

            const resizeBatches = countResizeBatches(api);

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            await settleStrategyWindow();

            expect(widths(api)).toEqual([300, 300, 300]);
            expect(resizeBatches()).toBe(2);
        });
    });

    describe('fitCellContents', () => {
        test('re-runs on a configured event', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnVisible'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            expect(widthOf(api, 'a')).toBe(400);

            api.setColumnsVisible(['c'], false);

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('does not re-run when no events are configured', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.setColumnsVisible(['c'], false);
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(400);
        });

        test('re-runs on pagination changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['paginationChanged'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.paginationGoToNextPage();

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('re-runs when a column group is expanded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'group',
                        children: [
                            { colId: 'a', minWidth: 100, width: 200 },
                            { colId: 'b', minWidth: 100, width: 200, columnGroupShow: 'open' },
                        ],
                    },
                ],
                rowData: [{ a: 'x', b: 'y' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnGroupOpened'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.setColumnGroupOpened('group', true);

            await waitFor(() => expect(widths(api)).toEqual([100, 100]));
        });

        test('re-runs when new column defs are set', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['gridColumnsChanged'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setGridOption('columnDefs', [{ colId: 'c', minWidth: 150, width: 400 }]);

            await waitFor(() => expect(widths(api)).toEqual([150]));
        });

        test('re-runs after a row transaction', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.applyTransaction({ add: [{ a: 'a much longer value', b: 'y', c: 'z' }] });

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('a sizing event in the list settles instead of looping', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnResized'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            const resizeBatches = countResizeBatches(api);

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            await settleStrategyWindow();

            // The user resize triggers one re-run. That run's own resize is not fed back in, so
            // there are exactly two batches: the user's and the strategy's.
            expect(widthOf(api, 'a')).toBe(100);
            expect(resizeBatches()).toBe(2);
        });

        test('an autoSizeColumns API call is not treated as a trigger', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    skipHeader: true,
                    defaultMinWidth: 100,
                    events: ['columnResized'],
                },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            // a wider floor than the strategy uses, so a strategy re-run would undo it
            api.autoSizeColumns({ colIds: ['a'], defaultMinWidth: 250 });
            await waitFor(() => expect(widthOf(api, 'a')).toBe(250));
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(250);
        });

        test('debounces rapid events into a single run', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnVisible'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            const resizeBatches = countResizeBatches(api);

            api.setColumnsVisible(['c'], false);
            api.setColumnsVisible(['c'], true);
            api.setColumnsVisible(['c'], false);
            await settleStrategyWindow();

            expect(resizeBatches()).toBe(1);
        });
    });

    describe('startup', () => {
        test('a lifecycle event fired during setup does not size the columns twice', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            const resizeBatches = countResizeBatches(api);

            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));
            await settleStrategyWindow();

            expect(resizeBatches()).toBe(1);
        });

        test('an event after setup still re-runs the strategy', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.applyTransaction({ add: [{ a: 'x2', b: 'y2', c: 'z2' }] });

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });
    });

    describe('fitGridWidth', () => {
        test('re-runs on a configured event without disturbing the columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                autoSizeStrategy: { type: 'fitGridWidth', defaultMinWidth: 100, events: ['columnVisible'] },
            });
            await settleStrategyWindow();

            api.setColumnsVisible(['c'], false);
            await settleStrategyWindow();

            expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
            expect(widths(api)).toEqual([200, 200]);
        });
    });
});
