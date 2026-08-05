/**
 * `autoSizeStrategy.events` — re-runs the configured auto-size strategy when the listed grid
 * events fire, and `api.applyAutoSizeStrategy()` for the imperative case.
 *
 * jsdom returns 0 px for the fixed-position autosize dummy container, so `autoWidthCalc` falls back
 * to each column's `minWidth`; changing a column's `minWidth` is therefore the lever for "the
 * content got wider". `mockGridLayout` gives the grid root a 1000 px width.
 *
 * Each test widens a column's width away from what the strategy produces, then fires the event and
 * asserts the strategy pulled it back — so a strategy that never re-ran fails the test.
 */
import { waitFor } from '@testing-library/dom';

import type { ColumnEventType, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    PaginationModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnsToolPanelModule, RowGroupingModule } from 'ag-grid-enterprise';

import { ALL_SEVERITIES, TestGridsManager, mockGridLayout } from '../test-utils';

const NUDGED_WIDTH = 220;

describe('autoSizeStrategy events', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnAutoSizeModule,
            ColumnsToolPanelModule,
            PaginationModule,
            RowGroupingModule,
            ValidationModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    const rowData = [
        { a: 'x', b: 'y', c: 'z' },
        { a: 'xx', b: 'yy', c: 'zz' },
    ];

    const columnDefs = [
        { colId: 'a', field: 'a', minWidth: 100 },
        { colId: 'b', field: 'b', minWidth: 100 },
        { colId: 'c', field: 'c', minWidth: 100 },
    ];

    const totalWidth = (api: GridApi): number =>
        api.getAllDisplayedColumns().reduce((total, col) => total + col.getActualWidth(), 0);

    /** Collects the `columnResized(finished)` sources so re-runs can be counted and attributed. */
    const captureResizeSources = (api: GridApi): ColumnEventType[] => {
        const sources: ColumnEventType[] = [];
        api.addEventListener('columnResized', (e) => {
            if (e.finished) {
                sources.push(e.source);
            }
        });
        return sources;
    };

    /** Moves a column off its strategy width via the API, so a re-run is observable. */
    const nudge = (api: GridApi, colId: string): void => {
        api.setColumnWidths([{ key: colId, newWidth: NUDGED_WIDTH }]);
        expect(api.getColumn(colId)!.getActualWidth()).toBe(NUDGED_WIDTH);
    };

    describe('opt-in', () => {
        test('no events configured — the strategy runs once at init and never again', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents' },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            nudge(api, 'a');
            api.setColumnsVisible(['b'], false);
            api.setGridOption('rowData', [...rowData]);

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(NUDGED_WIDTH));
        });

        test('events not listed do not trigger a re-run', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            nudge(api, 'a');
            api.setColumnsVisible(['c'], false);

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(NUDGED_WIDTH));
        });
    });

    describe('per-event triggers', () => {
        test('columnVisible re-runs the strategy — a newly shown column is sized', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a', minWidth: 100 },
                    { colId: 'b', field: 'b', minWidth: 100, hide: true },
                ],
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['columnVisible'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            api.setColumnsVisible(['b'], true);

            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(100));
        });

        test('paginationChanged re-runs the strategy on a page change', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                pagination: true,
                paginationPageSize: 1,
                paginationPageSizeSelector: [1, 20],
                autoSizeStrategy: { type: 'fitCellContents', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            nudge(api, 'a');
            api.paginationGoToNextPage();

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
        });

        test('rowDataUpdated re-runs the strategy after a transaction', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['rowDataUpdated'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            nudge(api, 'a');
            api.applyTransaction({ add: [{ a: 'a much longer value', b: 'b', c: 'c' }] });

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
        });

        test('gridColumnsChanged re-runs the strategy after new column defs', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['gridColumnsChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            api.setGridOption('columnDefs', [{ colId: 'c', field: 'c', minWidth: 130 }]);

            await waitFor(() => expect(api.getColumn('c')!.getActualWidth()).toBe(130));
        });

        test('rowGroupOpened re-runs the strategy when a group is expanded', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    { colId: 'a', field: 'a', rowGroup: true },
                    { colId: 'b', field: 'b', minWidth: 100 },
                ],
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['rowGroupOpened'] },
            });
            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(100));

            nudge(api, 'b');
            api.setRowNodeExpanded(api.getDisplayedRowAtIndex(0)!, true);

            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(100));
        });

        test('columnGroupOpened re-runs the strategy when a column group is expanded', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        groupId: 'grp',
                        openByDefault: false,
                        children: [
                            { colId: 'a', field: 'a', minWidth: 100 },
                            { colId: 'b', field: 'b', minWidth: 100, columnGroupShow: 'open' },
                        ],
                    },
                ],
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['columnGroupOpened'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            api.setColumnGroupOpened('grp', true);

            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(100));
        });
    });

    describe('all strategy types re-run', () => {
        test('fitProvidedWidth', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 600, events: ['paginationChanged'] },
            });
            await waitFor(() => expect(totalWidth(api)).toBe(600));

            nudge(api, 'a');
            api.setGridOption('pagination', true);

            await waitFor(() => expect(totalWidth(api)).toBe(600));
        });

        test('fitGridWidth', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitGridWidth', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(totalWidth(api)).toBe(mockGridLayout.gridWidth));

            nudge(api, 'a');
            api.setGridOption('pagination', true);

            await waitFor(() => expect(totalWidth(api)).toBe(mockGridLayout.gridWidth));
        });
    });

    describe('coalescing and termination', () => {
        test('several configured events in one tick produce a single re-run', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    events: ['columnVisible', 'displayedColumnsChanged', 'modelUpdated'],
                },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            const sources = captureResizeSources(api);
            api.setColumnsVisible(['b'], false);
            api.setColumnsVisible(['b'], true);

            await waitFor(() => expect(sources).toContain('autosizeStrategy'));
            await waitFor(() => expect(sources.filter((source) => source === 'autosizeStrategy')).toHaveLength(1));
        });

        test('self-dispatched events run exactly once, then the next real trigger still runs', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                pagination: true,
                paginationPageSize: 1,
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    // every one of these is dispatched by auto-sizing itself
                    events: ['displayedColumnsChanged', 'virtualColumnsChanged', 'modelUpdated', 'paginationChanged'],
                },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            const sources = captureResizeSources(api);
            api.setColumnsVisible(['b'], false);

            await waitFor(() => expect(sources).toContain('autosizeStrategy'));
            // give any feedback loop several ticks to run away
            for (let i = 0; i < 5; ++i) {
                await new Promise((resolve) => setTimeout(resolve));
            }
            // a run dispatches `columnResized` whether or not it changed a width, so an echoed run counts
            expect(sources.filter((source) => source === 'autosizeStrategy')).toHaveLength(1);

            // the fence must not outlive the run it guards
            nudge(api, 'a');
            api.paginationGoToNextPage();

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
            expect(sources.filter((source) => source === 'autosizeStrategy')).toHaveLength(2);
        });

        test('a runaway re-run loop is capped and warns', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [326] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['columnVisible'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            const sources = captureResizeSources(api);
            // stand in for a grid whose own sizing re-dispatches a configured event forever; deferring
            // to the next tick puts the echo past the run's re-entrancy fence, as a queued run would
            api.addEventListener('columnResized', ({ finished, source }) => {
                if (finished && source === 'autosizeStrategy') {
                    setTimeout(() => api.setColumnsVisible(['b'], !api.getColumn('b')!.isVisible()));
                }
            });
            api.setColumnsVisible(['c'], false);

            await waitFor(() => expect(warn.mock.calls.flat().join(' ')).toContain('stopped re-running'));
            expect(sources.filter((source) => source === 'autosizeStrategy').length).toBeLessThanOrEqual(11);
        });
    });

    describe('manual resizes are preserved', () => {
        test('a column the user dragged keeps its width; the others re-run', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            // 'uiColumnResized' is the source a header-handle drag reports
            api.setColumnWidths([{ key: 'a', newWidth: 320 }], true, 'uiColumnResized');
            nudge(api, 'b');
            api.setGridOption('pagination', true);

            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(100));
            expect(api.getColumn('a')!.getActualWidth()).toBe(320);
        });

        test('a column dropped from the column defs stops being excluded when its id comes back', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            api.setColumnWidths([{ key: 'a', newWidth: 320 }], true, 'uiColumnResized');
            // 'a' leaves and comes back, so it is a new column that nobody has resized
            api.setGridOption('columnDefs', [{ colId: 'b', field: 'b', minWidth: 100 }]);
            api.setGridOption('columnDefs', [{ colId: 'a', field: 'a', minWidth: 140 }]);

            nudge(api, 'a');
            api.setGridOption('pagination', true);

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(140));
        });

        test('updating the option re-applies the strategy without discarding manual widths', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', defaultMinWidth: 150 },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(150));

            api.setColumnWidths([{ key: 'a', newWidth: 320 }], true, 'uiColumnResized');
            nudge(api, 'b');
            api.setGridOption('autoSizeStrategy', { type: 'fitCellContents', defaultMinWidth: 180 });

            await waitFor(() => expect(api.getColumn('b')!.getActualWidth()).toBe(180));
            expect(api.getColumn('a')!.getActualWidth()).toBe(320);
        });

        test('applyAutoSizeStrategy reclaims a manually resized column', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents' },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            api.setColumnWidths([{ key: 'a', newWidth: 320 }], true, 'uiColumnResized');
            api.applyAutoSizeStrategy();

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));
        });
    });

    describe('applyAutoSizeStrategy', () => {
        test('re-applies each strategy type on demand', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 750 },
            });
            await waitFor(() => expect(totalWidth(api)).toBe(750));

            nudge(api, 'a');
            api.applyAutoSizeStrategy();

            await waitFor(() => expect(totalWidth(api)).toBe(750));
        });

        test('is a no-op when no strategy is configured', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', { columnDefs, rowData });
            const widthBefore = api.getColumn('a')!.getActualWidth();

            api.applyAutoSizeStrategy();

            await new Promise((resolve) => setTimeout(resolve));
            expect(api.getColumn('a')!.getActualWidth()).toBe(widthBefore);
        });
    });

    describe('runtime updates', () => {
        test('setGridOption re-registers the listeners and re-applies, without an initial-property warning', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            nudge(api, 'a');
            api.setGridOption('autoSizeStrategy', { type: 'fitProvidedWidth', width: 900, events: ['columnVisible'] });

            // changing the option re-applies it straight away
            await waitFor(() => expect(totalWidth(api)).toBe(900));
            expect(warn.mock.calls.flat().join(' ')).not.toContain('autoSizeStrategy');

            // the new event is live
            nudge(api, 'a');
            api.setColumnsVisible(['c'], false);
            await waitFor(() => expect(totalWidth(api)).toBe(900));

            // and the old one is not
            nudge(api, 'a');
            api.setGridOption('pagination', true);
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(NUDGED_WIDTH));
        });

        test('re-passing an equal strategy object does not re-apply, whatever the key order', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, defaultMinWidth: 120 },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(120));

            nudge(api, 'a');
            // frameworks re-pass an inline options object on every render, in no guaranteed order
            api.setGridOption('autoSizeStrategy', { defaultMinWidth: 120, type: 'fitCellContents', skipHeader: true });

            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(NUDGED_WIDTH));
        });
    });

    describe('validation', () => {
        test('an unrecognised event name warns', async () => {
            // this test deliberately configures an invalid event name, which warns #320
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [320] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                // deliberately not valid TypeScript — this guards the JavaScript path
                autoSizeStrategy: { type: 'fitCellContents', events: ['columnResized'] } as any,
            });

            expect(warn.mock.calls.flat().join(' ')).toContain('autoSizeStrategy.events');
        });
    });

    describe('teardown', () => {
        test('a configured event firing after destroy does not throw', async () => {
            const api = await gridsManager.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                autoSizeStrategy: { type: 'fitCellContents', events: ['paginationChanged'] },
            });
            await waitFor(() => expect(api.getColumn('a')!.getActualWidth()).toBe(100));

            api.setGridOption('pagination', true);
            api.destroy();

            await expect(new Promise((resolve) => setTimeout(resolve))).resolves.toBeUndefined();
        });
    });
});
