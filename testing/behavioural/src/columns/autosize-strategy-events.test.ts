/**
 * `autoSizeStrategy.events` — re-running the configured auto-size strategy when grid events fire.
 *
 * The re-run goes through the same code path as the initial application, so these tests cover the
 * wiring only: a configured event triggers a re-run, an unconfigured grid is untouched, rapid
 * events collapse into one run, and updating `autoSizeStrategy` re-registers the listeners.
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
import { ClientSideRowModelModule, ColumnAutoSizeModule, PaginationModule } from 'ag-grid-community';

import { TestGridsManager, asyncSetTimeout } from '../test-utils';

/** Comfortably longer than the strategy's internal debounce plus the deferred run. */
const SETTLE_MS = 100;

describe('autoSizeStrategy events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnAutoSizeModule, PaginationModule],
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
            await asyncSetTimeout(SETTLE_MS);

            expect(widthOf(api, 'a')).toBe(400);
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
            await asyncSetTimeout(SETTLE_MS);

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
            await asyncSetTimeout(SETTLE_MS);

            // The user resize triggers one re-run. That run's own resize re-enters the listener,
            // but finds nothing left to change, so the feedback stops there.
            expect(widthOf(api, 'a')).toBe(100);
            expect(resizeBatches()).toBe(2);
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
            await asyncSetTimeout(SETTLE_MS);

            expect(resizeBatches()).toBe(1);
        });
    });

    describe('fitGridWidth', () => {
        test('re-runs on a configured event without disturbing the columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                autoSizeStrategy: { type: 'fitGridWidth', defaultMinWidth: 100, events: ['columnVisible'] },
            });
            await asyncSetTimeout(SETTLE_MS);

            api.setColumnsVisible(['c'], false);
            await asyncSetTimeout(SETTLE_MS);

            expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
            expect(widths(api)).toEqual([200, 200]);
        });
    });

    describe('runtime updates', () => {
        test('setting autoSizeStrategy at runtime registers its events', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
            });
            await asyncSetTimeout(SETTLE_MS);
            expect(widthOf(api, 'a')).toBe(200);

            api.setGridOption('autoSizeStrategy', {
                type: 'fitCellContents',
                skipHeader: true,
                events: ['columnVisible'],
            });
            api.setColumnsVisible(['c'], false);

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('a run queued before a replacement applies the new strategy, not the old one', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnVisible'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            // queue a re-run, then swap the strategy before the debounce has fired
            api.setColumnsVisible(['c'], false);
            api.setGridOption('autoSizeStrategy', { type: 'fitProvidedWidth', width: 900 });

            await waitFor(() => expect(totalWidth(api)).toBe(900));
        });

        test('replacing autoSizeStrategy before first data render applies the new strategy', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true },
            });
            api.setGridOption('autoSizeStrategy', { type: 'fitProvidedWidth', width: 900 });

            await waitFor(() => expect(totalWidth(api)).toBe(900));
        });

        test('replacing autoSizeStrategy tears down the previous events', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnVisible'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setGridOption('autoSizeStrategy', { type: 'fitCellContents', skipHeader: true });
            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.setColumnsVisible(['c'], false);
            await asyncSetTimeout(SETTLE_MS);

            expect(widthOf(api, 'a')).toBe(400);
        });
    });
});
