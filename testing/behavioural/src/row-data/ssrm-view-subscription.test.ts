import { waitFor } from '@testing-library/dom';
import {
    TestGridsManager,
    mockGridLayout,
    nextAnimationFrame,
    triggerResizeObservers,
    waitForEvent,
    waitForNoLoadingRows,
} from 'ag-test-utils';

import type {
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    ViewSubscriptionOptions,
} from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, PinnedRowModule, ScrollApiModule } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ViewSubscriptionModule,
} from 'ag-grid-enterprise';

import { createRecorder, range, setActive, subscribe, tryApi } from './viewSubscriptionTestUtils';

describe('SSRM viewSubscription', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ViewSubscriptionModule,
            ScrollApiModule,
            RowGroupingModule,
            PinnedRowModule,
        ],
    });

    let originalGridHeight: number;

    beforeAll(() => {
        // The grid then shows rows 0-5 (rows are 42px high), with row 5 partly visible.
        mockGridLayout.useRealOffsetDimensions = true;
        originalGridHeight = mockGridLayout.gridHeight;
        mockGridLayout.gridHeight = 300;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.gridHeight = originalGridHeight;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createFlatDatasource(rows: { id: string; value: number }[]): IServerSideDatasource {
        return {
            getRows: (params) => {
                const { startRow = 0, endRow = 0 } = params.request;
                params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
            },
        };
    }

    async function createFlatGrid(options: GridOptions = {}, rowCount = 1000): Promise<GridApi> {
        const rows = Array.from({ length: rowCount }, (_, i) => ({ id: String(i), value: i }));
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            rowBuffer: 5,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            serverSideDatasource: createFlatDatasource(rows),
            ...options,
        });
        await waitForEvent('firstDataRendered', api);
        return api;
    }

    test('setting the option subscribes to the loaded rows already in view straight away', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();

        subscribe(api, recorder);

        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
        expect(recorder.subscribed.get('2')).toEqual({
            type: 'leaf',
            id: '2',
            parentKeys: [],
            level: 0,
            data: { id: '2', value: 2 },
        });
    });

    test('the grid makes no call when it is ready, before anything loads, then loaded rows arrive', async () => {
        const recorder = createRecorder();
        gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide',
            rowBuffer: 5,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            serverSideDatasource: createFlatDatasource(
                Array.from({ length: 50 }, (_, i) => ({ id: String(i), value: i }))
            ),
            viewSubscription: recorder.handlers,
        });

        expect(recorder.calls).toEqual([]);

        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.batches('subscribe')).toEqual([range(0, 5)]);
        expect(recorder.violations).toEqual([]);
    });

    test('full width rows in view are subscribed like other rows', async () => {
        const api = await createFlatGrid({
            isFullWidthRow: ({ rowNode }) => Number(rowNode.id) % 2 === 0,
            fullWidthCellRenderer: () => 'full width',
        });
        const recorder = createRecorder();

        subscribe(api, recorder);

        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
        expect(recorder.violations).toEqual([]);
    });

    test('scrolling unsubscribes rows that leave the view before subscribing rows that enter it', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.ensureIndexVisible(300, 'top');
        await waitForNoLoadingRows(api);

        await waitFor(() => expect(recorder.ids()).toEqual(range(300, 305)));
        const unsubscribe = recorder.calls.findIndex((c) => c.type === 'unsubscribe');
        const lastSubscribe = recorder.calls.map((c) => c.type).lastIndexOf('subscribe');
        expect(recorder.calls[unsubscribe]).toEqual({ type: 'unsubscribe', ids: range(0, 5) });
        expect(unsubscribe).toBeLessThan(lastSubscribe);
        expect(recorder.violations).toEqual([]);
    });

    test('resizing the grid without row virtualisation updates the subscribed rows', async () => {
        try {
            const api = await createFlatGrid({ suppressRowVirtualisation: true }, 100);
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.ids()).toEqual(range(0, 5));

            mockGridLayout.gridHeight = 600;
            triggerResizeObservers();

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 12)));
            expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(6, 12)]);
            expect(recorder.violations).toEqual([]);
        } finally {
            mockGridLayout.gridHeight = 300;
        }
    });

    test('debounceMs delivers only the final state of a burst of scrolling', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: 20 });

        api.ensureIndexVisible(150, 'top');
        api.ensureIndexVisible(300, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(300, 305)));
        expect(recorder.batches('subscribe').slice(1).flat()).not.toContain('150');
        expect(recorder.violations).toEqual([]);
    });

    test('setting viewSubscriptionActive to false unsubscribes every row, and setting it back to true subscribes the rows in view', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        setActive(api, false);

        expect(recorder.calls).toEqual([
            { type: 'subscribe', ids: range(0, 5) },
            { type: 'unsubscribe', ids: range(0, 5) },
        ]);

        api.ensureIndexVisible(300, 'top');
        await waitForNoLoadingRows(api);
        await nextAnimationFrame();
        expect(recorder.calls).toHaveLength(2);

        setActive(api, true);

        expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(300, 305) }]);
        expect(recorder.violations).toEqual([]);
    });

    test('new handlers are used for the next calls, without unsubscribing any row', async () => {
        const api = await createFlatGrid();
        const oldRecorder = createRecorder();
        const newRecorder = createRecorder();
        subscribe(api, oldRecorder);

        subscribe(api, newRecorder);
        api.ensureIndexVisible(300, 'top');
        await waitFor(() => expect(newRecorder.ids()).toEqual(range(300, 305)));

        expect(oldRecorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
        expect(newRecorder.calls).toEqual([
            { type: 'unsubscribe', ids: range(0, 5) },
            { type: 'subscribe', ids: range(300, 305) },
        ]);
    });

    test('destroying the grid unsubscribes every row once, while the api is still usable', async () => {
        const api = await createFlatGrid();
        let destroyedDuringStop: boolean | undefined;
        const recorder = createRecorder();
        api.setGridOption('viewSubscription', {
            subscribeRows: recorder.handlers.subscribeRows,
            unsubscribeRows: (rows, params) => {
                destroyedDuringStop = params.api.isDestroyed();
                recorder.handlers.unsubscribeRows(rows, params);
            },
        });

        api.ensureIndexVisible(300, 'top');
        api.destroy();

        expect(recorder.calls.at(-1)).toEqual({ type: 'unsubscribe', ids: range(0, 5) });
        expect(destroyedDuringStop).toBe(false);
        expect(recorder.subscribed.size).toBe(0);

        await nextAnimationFrame();
        await nextAnimationFrame();
        expect(recorder.calls).toHaveLength(2);
    });

    test('disabling inside unsubscribeRows skips the rest of the batch', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe') {
                setActive(api, false);
            }
        });
        subscribe(api, recorder);

        api.ensureIndexVisible(300, 'top');
        await waitFor(() => expect(recorder.calls.some((c) => c.type === 'unsubscribe')).toBe(true));
        await waitForNoLoadingRows(api);
        await nextAnimationFrame();

        expect(recorder.subscribed.size).toBe(0);
        expect(recorder.calls.filter((c) => c.type === 'subscribe')).toHaveLength(1);
        expect(recorder.violations).toEqual([]);
    });

    test('disabling inside subscribeRows unsubscribes the rows just passed', async () => {
        const api = await createFlatGrid();
        let started = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'subscribe' && started) {
                setActive(api, false);
            }
        });
        subscribe(api, recorder);
        started = true;

        api.ensureIndexVisible(300, 'top');
        await waitFor(() => expect(recorder.batches('subscribe')).toHaveLength(2));
        expect(recorder.calls.at(-1)).toEqual({ type: 'unsubscribe', ids: recorder.batches('subscribe')[1] });

        expect(recorder.subscribed.size).toBe(0);
        expect(recorder.violations).toEqual([]);
    });

    describe('turning the subscription on while the grid is destroyed', () => {
        test('enabling inside every unsubscribeRows leaves no row subscribed', async () => {
            const api = await createFlatGrid();
            const warnings: (string | undefined)[] = [];
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    warnings.push(
                        tryApi(() => {
                            setActive(api, false);
                            setActive(api, true);
                        })
                    );
                }
            });
            subscribe(api, recorder);

            api.destroy();
            await nextAnimationFrame();
            await nextAnimationFrame();

            // Once gridPreDestroyed has fired, turning the subscription back on does not start it.
            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(warnings).toEqual([undefined]);
            expect(recorder.subscribed.size).toBe(0);
            expect(recorder.violations).toEqual([]);
        });

        test('enabling from onGridPreDestroyed leaves no row subscribed', async () => {
            const api = await createFlatGrid({ onGridPreDestroyed: () => setActive(api, true) });
            const recorder = createRecorder();
            setActive(api, false);
            subscribe(api, recorder);

            api.destroy();
            await nextAnimationFrame();
            await nextAnimationFrame();

            // The grid's own gridPreDestroyed listener runs first, so the subscription is never turned back on.
            expect(recorder.calls).toEqual([]);
            expect(recorder.subscribed.size).toBe(0);
            expect(recorder.violations).toEqual([]);
        });
    });

    test('a purge unsubscribes the dropped rows, then subscribes the reloaded rows', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.refreshServerSide({ purge: true });

        await waitFor(() => expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(0, 5)]));
        expect(recorder.batches('unsubscribe')).toEqual([range(0, 5)]);
        expect(recorder.violations).toEqual([]);
    });

    test('a sort that reloads rows unsubscribes and subscribes them again', async () => {
        const api = await createFlatGrid({ columnDefs: [{ field: 'value', sortable: true }] });
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await waitFor(() => expect(recorder.batches('unsubscribe')).toEqual([range(0, 5)]));
        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.violations).toEqual([]);
    });

    test('a client-side sort moves rows out of and into the view in one batch', async () => {
        const api = await createFlatGrid(
            { columnDefs: [{ field: 'value', sortable: true }], serverSideEnableClientSideSort: true },
            20
        );
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(range(14, 19)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: range(0, 5) },
            { type: 'subscribe', ids: range(14, 19).reverse() },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('a transaction that removes a visible row unsubscribes it', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.applyServerSideTransaction({ remove: [{ id: '2' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(['0', '1', ...range(3, 6)]));
        expect(recorder.calls[1]).toEqual({ type: 'unsubscribe', ids: ['2'] });
        expect(recorder.violations).toEqual([]);
    });

    test('a purge from inside unsubscribeRows does not subscribe the rows it destroyed', async () => {
        const api = await createFlatGrid();
        let purged = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && !purged) {
                purged = true;
                api.refreshServerSide({ purge: true });
            }
        });
        subscribe(api, recorder);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(50, 55)));
        // The rows the scroll brought in were destroyed by the purge, so only their reloaded replacements arrive.
        expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(50, 55)]);
        expect(recorder.batches('unsubscribe')).toEqual([range(0, 5)]);
        expect(recorder.violations).toEqual([]);
    });

    test('a scroll from inside unsubscribeRows does not subscribe the rows it scrolled away from', async () => {
        const api = await createFlatGrid();
        let scrolled = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && !scrolled) {
                scrolled = true;
                api.ensureIndexVisible(80, 'top');
            }
        });
        subscribe(api, recorder);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(80, 85)));
        const everSubscribed = recorder.calls.filter((c) => c.type === 'subscribe').flatMap((c) => c.ids);
        expect(everSubscribed.filter((id) => range(50, 55).includes(id))).toEqual([]);
        expect(recorder.violations).toEqual([]);
    });

    test('a row replaced by a refresh while another block still loads is unsubscribed', async () => {
        let rows = Array.from({ length: 20 }, (_, i) => ({ id: String(i), value: i }));
        let deferred = false;
        const pending: IServerSideGetRowsParams[] = [];
        const respond = (params: IServerSideGetRowsParams) => {
            const { startRow = 0, endRow = 0 } = params.request;
            params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
        };
        const api = await createFlatGrid({
            cacheBlockSize: 3,
            serverSideDatasource: { getRows: (params) => (deferred ? pending.push(params) : respond(params)) },
        });
        await waitForNoLoadingRows(api);
        const recorder = createRecorder();
        subscribe(api, recorder);
        expect(recorder.ids()).toEqual(range(0, 5));

        rows = rows.map((row) => (row.id === '1' ? { id: 'x1', value: 100 } : row));
        deferred = true;
        api.refreshServerSide({ purge: false });
        await waitFor(() => expect(pending.some((p) => p.request.startRow === 0)).toBe(true));

        // The first block replaces row 1 while the other blocks are still refreshing.
        respond(
            pending.splice(
                pending.findIndex((p) => p.request.startRow === 0),
                1
            )[0]
        );
        await waitFor(() => expect(recorder.subscribed.has('x1')).toBe(true));
        expect(recorder.calls.filter((c) => c.type === 'unsubscribe')).toEqual([{ type: 'unsubscribe', ids: ['1'] }]);

        deferred = false;
        pending.splice(0).forEach(respond);
        await waitForNoLoadingRows(api);
        expect(recorder.violations).toEqual([]);
    });

    test('debounceMs makes no call until rows stop changing', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: 100 });
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(30, 'top');
            await vi.advanceTimersByTimeAsync(90);
            expect(recorder.ids()).toEqual(range(0, 5));

            api.ensureIndexVisible(60, 'top');
            await vi.advanceTimersByTimeAsync(90);
            expect(recorder.ids()).toEqual(range(0, 5));

            await vi.advanceTimersByTimeAsync(20);
            expect(recorder.ids()).toEqual(range(60, 65));
            expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(60, 65)]);
            expect(recorder.violations).toEqual([]);
        } finally {
            vi.useRealTimers();
        }
    });

    test('debounceMs defaults to 50', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: undefined });
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(30, 'top');
            await vi.advanceTimersByTimeAsync(40);
            expect(recorder.ids()).toEqual(range(0, 5));

            await vi.advanceTimersByTimeAsync(10);
            expect(recorder.ids()).toEqual(range(30, 35));
        } finally {
            vi.useRealTimers();
        }
    });

    test('debounceMs 0 passes changes to the handlers once the current task ends', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: 0 });
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(30, 'top');
            expect(recorder.ids()).toEqual(range(0, 5));

            await vi.advanceTimersByTimeAsync(0);
            expect(recorder.ids()).toEqual(range(30, 35));
        } finally {
            vi.useRealTimers();
        }
    });

    test('data updates do not push a pending debounce back', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: 100 });
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(30, 'top');
            for (let i = 0; i < 4; ++i) {
                await vi.advanceTimersByTimeAsync(25);
                api.applyServerSideTransaction({ update: [{ id: String(i), value: -i }] });
            }
            expect(recorder.ids()).toEqual(range(30, 35));
        } finally {
            vi.useRealTimers();
        }
    });

    test('destroy() throws the unsubscribeRows error after every gridPreDestroyed listener has run', async () => {
        const preDestroyed: string[] = [];
        const api = await createFlatGrid({ onGridPreDestroyed: () => preDestroyed.push('onGridPreDestroyed') });
        api.addEventListener('gridPreDestroyed', () => preDestroyed.push('addEventListener'));
        let apiDestroyedInHandler: boolean | undefined;
        api.setGridOption('viewSubscription', {
            subscribeRows: () => {},
            unsubscribeRows: (_rows, params) => {
                apiDestroyedInHandler = params.api.isDestroyed();
                throw new Error('unsubscribe failed');
            },
        });

        expect(() => api.destroy()).toThrow('unsubscribe failed');

        expect(preDestroyed.sort()).toEqual(['addEventListener', 'onGridPreDestroyed']);
        expect(apiDestroyedInHandler).toBe(false);
        expect(api.isDestroyed()).toBe(true);
    });

    test('a subscribeRows handler that throws on an empty array does not stop createGrid returning the api', async () => {
        const subscribed: string[] = [];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params) => params.data.id,
            serverSideDatasource: createFlatDatasource([{ id: '0', value: 0 }]),
            viewSubscription: {
                subscribeRows: (rows) => {
                    if (!rows.length) {
                        throw new Error('subscribe failed');
                    }
                    subscribed.push(...rows.map((row) => row.id));
                },
                unsubscribeRows: () => {},
                debounceMs: 0,
            },
        });

        expect(api).toBeDefined();
        await waitFor(() => expect(subscribed).toEqual(['0']));
    });

    test('a subscribeRows call that throws is not retried', async () => {
        const api = await createFlatGrid();
        let calls = 0;
        vi.useFakeTimers();
        try {
            expect(() =>
                api.setGridOption('viewSubscription', {
                    subscribeRows: () => {
                        calls++;
                        throw new Error('subscribe failed');
                    },
                    unsubscribeRows: () => {},
                    debounceMs: 10,
                })
            ).toThrow('subscribe failed');

            await vi.advanceTimersByTimeAsync(100);
            expect(calls).toBe(1);
        } finally {
            vi.useRealTimers();
            api.setGridOption('viewSubscription', undefined);
        }
    });

    test('debounceMs still calls the handlers while data updates keep arriving', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: 100 });
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(30, 'top');
            for (let i = 0; i < 5; ++i) {
                api.applyServerSideTransaction({ update: [{ id: '30', value: i }] });
                await vi.advanceTimersByTimeAsync(50);
            }

            expect(recorder.ids()).toEqual(range(30, 35));
            expect(recorder.violations).toEqual([]);
        } finally {
            vi.useRealTimers();
        }
    });

    test('scrolling that keeps the same rows in view does not push a pending debounce back', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder, { debounceMs: 50 });
        mockGridLayout.asyncScrollEvents = true;
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(50, 'top');
            for (let i = 1; i <= 15; ++i) {
                // Rows added above the view are scrolled past, so the same rows stay in view.
                api.applyServerSideTransaction({ add: [{ id: `new${i}`, value: -i }], addIndex: 0 });
                api.ensureIndexVisible(50 + i, 'top');
                await vi.advanceTimersByTimeAsync(20);
            }
            expect(recorder.ids()).toEqual(range(50, 55));

            await vi.advanceTimersByTimeAsync(100);
            expect(recorder.ids()).toEqual(range(50, 55));
            expect(recorder.violations).toEqual([]);
        } finally {
            vi.useRealTimers();
            mockGridLayout.asyncScrollEvents = false;
        }
    });

    describe('lifecycle', () => {
        test('removing viewSubscription with another option in one update unsubscribes every row', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid();
            subscribe(api, recorder);

            // viewSubscriptionActive's listener runs before viewSubscription's, and finds the option already removed.
            api.updateGridOptions({ viewSubscriptionActive: false, viewSubscription: undefined });

            expect(recorder.subscribed.size).toBe(0);
            expect(recorder.calls.at(-1)).toEqual({ type: 'unsubscribe', ids: range(0, 5) });
            expect(recorder.violations).toEqual([]);
        });

        describe('pauseWhenHidden', () => {
            let pageHidden = false;

            function setPageHidden(hidden: boolean) {
                pageHidden = hidden;
                document.dispatchEvent(new Event('visibilitychange'));
            }

            beforeEach(() => {
                pageHidden = false;
                Object.defineProperty(document, 'hidden', { configurable: true, get: () => pageHidden });
            });

            afterEach(() => {
                delete (document as { hidden?: boolean }).hidden;
            });

            test('hiding the page unsubscribes every row, and showing it subscribes the rows in view', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder);

                setPageHidden(true);
                expect(recorder.subscribed.size).toBe(0);

                setPageHidden(false);
                expect(recorder.calls).toEqual([
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                    { type: 'subscribe', ids: range(0, 5) },
                ]);
                expect(recorder.violations).toEqual([]);
            });

            test('a grid created while the page is hidden subscribes once the page is shown', async () => {
                pageHidden = true;
                const recorder = createRecorder();
                await createFlatGrid({ viewSubscription: recorder.handlers });

                expect(recorder.calls).toEqual([]);

                setPageHidden(false);
                expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            });

            test('with pauseWhenHidden set to false, the rows stay subscribed while the page is hidden', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder, { pauseWhenHidden: false });

                setPageHidden(true);

                expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            });

            test('setting pauseWhenHidden to false while the page is hidden subscribes the rows in view', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder);
                setPageHidden(true);

                subscribe(api, recorder, { pauseWhenHidden: false });

                expect(recorder.ids()).toEqual(range(0, 5));
                expect(recorder.violations).toEqual([]);
            });

            test('showing the page does not subscribe while viewSubscriptionActive is false', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder);
                setPageHidden(true);
                setActive(api, false);

                setPageHidden(false);

                expect(recorder.subscribed.size).toBe(0);
                expect(recorder.violations).toEqual([]);
            });
        });

        describe('grid scrolled off screen', () => {
            const OriginalIntersectionObserver = window.IntersectionObserver;
            let observers: { callback: IntersectionObserverCallback; disconnected: boolean }[] = [];

            /** Reports whether the grid is in the browser viewport, as the browser does on scroll. */
            function setOnScreen(onScreen: boolean) {
                for (const observer of observers) {
                    if (!observer.disconnected) {
                        observer.callback([{ isIntersecting: onScreen } as IntersectionObserverEntry], {} as any);
                    }
                }
            }

            beforeEach(() => {
                observers = [];
                (window as any).IntersectionObserver = class {
                    private readonly entry;
                    constructor(callback: IntersectionObserverCallback) {
                        this.entry = { callback, disconnected: false };
                        observers.push(this.entry);
                    }
                    observe() {}
                    disconnect() {
                        this.entry.disconnected = true;
                    }
                };
            });

            afterEach(() => {
                window.IntersectionObserver = OriginalIntersectionObserver;
            });

            test('scrolling the grid off screen unsubscribes every row, and back on screen subscribes the rows in view', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder);

                setOnScreen(false);
                expect(recorder.subscribed.size).toBe(0);

                setOnScreen(true);
                expect(recorder.calls).toEqual([
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                    { type: 'subscribe', ids: range(0, 5) },
                ]);
                expect(recorder.violations).toEqual([]);
            });

            test('with pauseWhenHidden set to false, the rows stay subscribed while the grid is off screen', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder, { pauseWhenHidden: false });

                setOnScreen(false);

                expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            });

            test('destroying the grid stops observing whether it is on screen', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder);

                api.destroy();

                expect(observers.length).toBeGreaterThan(0);
                expect(observers.every((observer) => observer.disconnected)).toBe(true);
            });

            test('a grid without the option watches neither the page nor its place on screen until it is set', async () => {
                const addListener = vi.spyOn(document, 'addEventListener');
                const recorder = createRecorder();
                const api = await createFlatGrid();

                const visibilityListeners = () =>
                    addListener.mock.calls.filter(([type]) => type === 'visibilitychange');
                expect(observers).toEqual([]);
                expect(visibilityListeners()).toEqual([]);

                subscribe(api, recorder);
                expect(visibilityListeners()).toHaveLength(1);
                setOnScreen(false);
                expect(recorder.subscribed.size).toBe(0);
                addListener.mockRestore();
            });

            test('turning the subscription off stops watching the page and its place on screen', async () => {
                const removeListener = vi.spyOn(document, 'removeEventListener');
                const recorder = createRecorder();
                const api = await createFlatGrid();
                subscribe(api, recorder);

                setActive(api, false);

                expect(observers.length).toBeGreaterThan(0);
                expect(observers.every((observer) => observer.disconnected)).toBe(true);
                expect(removeListener.mock.calls.filter(([type]) => type === 'visibilitychange')).toHaveLength(1);
                removeListener.mockRestore();
            });

            test('without getRowId it watches neither the page nor its place on screen', async () => {
                const addListener = vi.spyOn(document, 'addEventListener');
                const recorder = createRecorder();
                const api = await createFlatGrid({ getRowId: undefined });

                expect(() => subscribe(api, recorder)).toThrow('warning #188');

                expect(observers).toEqual([]);
                expect(addListener.mock.calls.filter(([type]) => type === 'visibilitychange')).toEqual([]);
                expect(recorder.calls).toEqual([]);
                addListener.mockRestore();
            });
        });

        test('setting the option again with the same handlers makes no call', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid();
            subscribe(api, recorder);

            subscribe(api, recorder);
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
        });

        test('the handlers are called as methods of the current option', async () => {
            const receivers: unknown[] = [];
            const options: ViewSubscriptionOptions = {
                subscribeRows() {
                    receivers.push(this);
                },
                unsubscribeRows() {
                    receivers.push(this);
                },
            };
            const api = await createFlatGrid();
            api.setGridOption('viewSubscription', options);

            api.destroy();

            expect(receivers).toHaveLength(2);
            expect(receivers.every((receiver) => receiver === options)).toBe(true);
        });

        test('setting viewSubscriptionActive to false unsubscribes every row once, then makes no call while disabled', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid();
            subscribe(api, recorder);

            setActive(api, false);
            setActive(api, false);

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);

            api.ensureIndexVisible(50, 'top');
            api.applyServerSideTransaction({ update: [{ id: '50', value: -1 }], remove: [{ id: '51' }] });
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toHaveLength(2);
        });

        test('a grid created with viewSubscriptionActive false makes no call until viewSubscriptionActive', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({
                viewSubscription: recorder.handlers,
                viewSubscriptionActive: false,
            });
            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toEqual([]);

            setActive(api, true);

            expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(50, 55) }]);
        });

        test('setting viewSubscriptionActive to false then true in one go unsubscribes every row, then subscribes them again', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid();
            subscribe(api, recorder);

            setActive(api, false);
            setActive(api, true);
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(0, 5) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('setting the option to undefined unsubscribes every row, and setting it again subscribes the rows in view', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid();
            subscribe(api, recorder);

            api.setGridOption('viewSubscription', undefined);

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);

            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toHaveLength(2);

            subscribe(api, recorder);

            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(50, 55) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('destroying the grid while disabled makes no further call', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid();
            subscribe(api, recorder);
            setActive(api, false);

            api.destroy();

            expect(recorder.calls).toHaveLength(2);
        });

        test('destroying the grid inside unsubscribeRows makes no further call', async () => {
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    api.destroy();
                }
            });
            const api = await createFlatGrid();
            subscribe(api, recorder);

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(recorder.calls.some((c) => c.type === 'unsubscribe')).toBe(true));
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(api.isDestroyed()).toBe(true);
        });

        test('toggling viewSubscriptionActive inside unsubscribeRows subscribes the rows in view once', async () => {
            let toggled = false;
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe' && !toggled) {
                    toggled = true;
                    setActive(api, false);
                    setActive(api, true);
                }
            });
            const api = await createFlatGrid();
            subscribe(api, recorder);

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(recorder.ids()).toEqual(range(50, 55)));
            await nextAnimationFrame();

            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(50, 55) },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    test('without getRowId it warns and never calls the handlers', async () => {
        const recorder = createRecorder();

        await expect(createFlatGrid({ getRowId: undefined, viewSubscription: recorder.handlers })).rejects.toThrow(
            'warning #188'
        );
        expect(recorder.calls).toEqual([]);
    });

    describe('with row grouping', () => {
        const countries = ['Ireland', 'Spain', 'France'];

        function createGroupedGrid(options: GridOptions = {}): GridApi {
            return gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
                rowModelType: 'serverSide',
                rowBuffer: 5,
                suppressRowVirtualisation: false,
                getRowId: ({ data, parentKeys = [] }) => [...parentKeys, data.id ?? data.country].join('/'),
                serverSideDatasource: {
                    getRows: (params) => {
                        const [country] = params.request.groupKeys;
                        const rowData =
                            country == null
                                ? countries.map((c) => ({ country: c }))
                                : Array.from({ length: 10 }, (_, i) => ({ id: `${country}-${i}`, country, value: i }));
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
                ...options,
            });
        }

        test('a row covered by a sticky group row is not subscribed', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);

            // Scrolling to the top of Spain-3 leaves room for Spain's sticky row, which covers Spain-2.
            api.ensureIndexVisible(api.getRowNode('Spain/Spain-3')!.rowIndex!, 'top');

            await waitFor(() => expect(recorder.ids()).not.toContain('Ireland'));
            expect(recorder.ids()).toContain('Spain');
            expect(recorder.ids()).toContain('Spain/Spain-3');
            expect(recorder.ids()).not.toContain('Spain/Spain-2');
            expect(recorder.violations).toEqual([]);
        });

        test('group rows carry their route; leaf rows carry only parentKeys', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);

            expect(recorder.subscribed.get('Ireland')).toEqual({
                type: 'group',
                id: 'Ireland',
                route: ['Ireland'],
                parentKeys: [],
                level: 0,
                data: { country: 'Ireland' },
            });

            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitForNoLoadingRows(api);

            await waitFor(() => expect(recorder.subscribed.has('Ireland/Ireland-0')).toBe(true));
            expect(recorder.subscribed.get('Ireland/Ireland-0')).toEqual({
                type: 'leaf',
                id: 'Ireland/Ireland-0',
                parentKeys: ['Ireland'],
                level: 1,
                data: { id: 'Ireland-0', country: 'Ireland', value: 0 },
            });
            expect(recorder.violations).toEqual([]);
        });

        test('collapsing a group unsubscribes its children', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);

            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitFor(() => expect(recorder.ids()).toContain('Ireland/Ireland-4'));

            api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);
            await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']));
            expect(recorder.batches('unsubscribe').at(-1)).toEqual(range(0, 4).map((i) => `Ireland/Ireland-${i}`));
            expect(recorder.violations).toEqual([]);
        });

        test('a transaction that removes an expanded group unsubscribes it and its children', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.ids()).toEqual(['Ireland', ...range(0, 4).map((i) => `Ireland/Ireland-${i}`)]);

            api.applyServerSideTransaction({ remove: [{ country: 'Ireland' }] });

            await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Spain']));
            expect(recorder.batches('unsubscribe')).toEqual([
                ['Ireland', ...range(0, 4).map((i) => `Ireland/Ireland-${i}`)],
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a scoped purge in the same frame as a removal unsubscribes both sets of rows in one batch', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);
            const spainRows = range(0, 3).map((i) => `Spain/Spain-${i}`);
            expect(recorder.ids()).toEqual(['Ireland', 'Spain', ...spainRows]);

            api.refreshServerSide({ route: ['Spain'], purge: true });
            api.applyServerSideTransaction({ remove: [{ country: 'Ireland' }] });

            await waitFor(() =>
                expect(recorder.ids()).toEqual(['Spain', ...range(0, 4).map((i) => `Spain/Spain-${i}`)])
            );
            // France can pass through the view while Spain's rows reload, so only the first batch is checked.
            expect(recorder.batches('unsubscribe')[0]).toEqual(['Ireland', ...spainRows]);
            expect(recorder.violations).toEqual([]);
        });

        test('rows under an empty-key group with groupAllowUnbalanced are unsubscribed once when scrolled out', async () => {
            const api = createGroupedGrid({
                groupAllowUnbalanced: true,
                serverSideDatasource: {
                    getRows: (params) => {
                        const [country] = params.request.groupKeys;
                        const rowData =
                            country == null
                                ? [{ country: '' }, { country: 'Ireland' }]
                                : Array.from({ length: 20 }, (_, i) => ({ id: `${country}-${i}`, country, value: i }));
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
            });
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.ids()).toHaveLength(6);

            api.ensureIndexVisible(15, 'top');

            await waitFor(() => expect(recorder.batches('unsubscribe')).toHaveLength(1));
            const [unsubscribed] = recorder.batches('unsubscribe');
            expect(
                recorder
                    .batches('subscribe')
                    .slice(1)
                    .flat()
                    .filter((id) => unsubscribed.includes(id))
            ).toEqual([]);
            expect(recorder.violations).toEqual([]);
        });

        describe('a group collapsed and then destroyed before the next batch', () => {
            const irelandRows = range(0, 4).map((i) => `Ireland/Ireland-${i}`);

            async function subscribeWithIrelandExpanded(options: GridOptions = {}) {
                const api = createGroupedGrid(options);
                await waitForNoLoadingRows(api);
                api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
                await waitForNoLoadingRows(api);
                const recorder = createRecorder();
                subscribe(api, recorder);
                expect(recorder.ids()).toEqual(['Ireland', ...irelandRows]);
                return { api, recorder };
            }

            const unsubscribeCalls = (recorder: ReturnType<typeof createRecorder>) =>
                recorder.calls.filter((c) => c.type === 'unsubscribe');

            test('a purge of its rows unsubscribes only those rows', async () => {
                const { api, recorder } = await subscribeWithIrelandExpanded();

                api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);
                api.refreshServerSide({ route: ['Ireland'], purge: true });

                await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']));
                expect(unsubscribeCalls(recorder)).toEqual([{ type: 'unsubscribe', ids: irelandRows }]);
                expect(recorder.violations).toEqual([]);
            });

            test('a transaction removing the group unsubscribes it and its rows in one batch', async () => {
                const { api, recorder } = await subscribeWithIrelandExpanded();

                api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);
                api.applyServerSideTransaction({ remove: [{ country: 'Ireland' }] });

                await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Spain']));
                expect(unsubscribeCalls(recorder)).toEqual([{ type: 'unsubscribe', ids: ['Ireland', ...irelandRows] }]);
                expect(recorder.violations).toEqual([]);
            });

            test('purgeClosedRowNodes unsubscribes the rows it destroys on collapse', async () => {
                const { api, recorder } = await subscribeWithIrelandExpanded({ purgeClosedRowNodes: true });

                api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);

                await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']));
                expect(api.getRowNode('Ireland/Ireland-0')).toBeUndefined();
                expect(unsubscribeCalls(recorder)).toEqual([{ type: 'unsubscribe', ids: irelandRows }]);
                expect(recorder.violations).toEqual([]);
            });
        });

        test('group total rows are not passed to the handlers', async () => {
            const api = createGroupedGrid({ groupTotalRow: 'bottom', grandTotalRow: 'top' });
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);

            const recorder = createRecorder();
            subscribe(api, recorder);
            // Scroll Spain's total row into view, as it is below the rows in view.
            api.ensureIndexVisible(api.getDisplayedRowCount() - 1, 'bottom');

            await waitFor(() => expect(recorder.ids()).toContain('Spain/Spain-9'));
            const subscribed = recorder.batches('subscribe').flat();
            expect(subscribed).toContain('Spain');
            expect(subscribed.filter((id) => id.startsWith('rowGroupFooter_') && id !== GRAND_TOTAL_ROW_ID)).toEqual(
                []
            );
        });

        test('a group row stays subscribed while its total row is in view after the group row scrolls out', async () => {
            // Without sticky group rows, Spain's group row leaves the view while its total row is still shown.
            const api = createGroupedGrid({ groupTotalRow: 'bottom', suppressGroupRowsSticky: true });
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.ids()).toContain('Spain');

            const spainTotalRow = api.getRowNode('Spain')!.sibling!;
            api.ensureIndexVisible(spainTotalRow.rowIndex!, 'bottom');

            await waitFor(() => expect(recorder.ids()).toContain('Spain/Spain-9'));
            expect(recorder.ids()).not.toContain('Ireland');
            expect(recorder.ids()).toContain('Spain');
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('grand total row', () => {
        async function createGrandTotalGrid(
            grandTotalRow: GridOptions['grandTotalRow'],
            options: GridOptions = {}
        ): Promise<GridApi> {
            const rows = Array.from({ length: 1000 }, (_, i) => ({ id: String(i), value: i }));
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowModelType: 'serverSide',
                cacheBlockSize: 100,
                rowBuffer: 5,
                suppressRowVirtualisation: false,
                grandTotalRow,
                getRowId: (params) => params.data.id,
                serverSideDatasource: {
                    getRows: (params) => {
                        const { startRow = 0, endRow = 0 } = params.request;
                        params.success({
                            rowData: rows.slice(startRow, endRow),
                            rowCount: rows.length,
                            grandTotalData: { id: GRAND_TOTAL_ROW_ID, value: -1 },
                        });
                    },
                },
                ...options,
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            return api;
        }

        test('a grand total row that does not stick is subscribed only while it is in view', async () => {
            const api = await createGrandTotalGrid('bottom', { suppressStickyTotalRow: 'grand' });
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(false);

            api.ensureIndexVisible(api.getDisplayedRowCount() - 1, 'bottom');

            await waitFor(() => expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(true));
            expect(recorder.subscribed.get(GRAND_TOTAL_ROW_ID)).toEqual({
                type: 'group',
                id: GRAND_TOTAL_ROW_ID,
                parentKeys: [],
                route: [],
                level: api.getRowNode(GRAND_TOTAL_ROW_ID)!.level,
                data: { id: GRAND_TOTAL_ROW_ID, value: -1 },
            });

            api.ensureIndexVisible(0, 'top');

            await waitFor(() => expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(false));
            expect(recorder.violations).toEqual([]);
        });

        test('a grand total row at the top stays subscribed while it sticks over the rows scrolled under it', async () => {
            const api = await createGrandTotalGrid('top');
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(true);

            api.ensureIndexVisible(500, 'top');

            await waitFor(() => expect(recorder.ids()).toContain('500'));
            expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(true);
            expect(recorder.violations).toEqual([]);
        });

        test('a pinned grand total row stays subscribed wherever the grid is scrolled', async () => {
            const api = await createGrandTotalGrid('pinnedBottom');
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.get(GRAND_TOTAL_ROW_ID)?.type).toBe('group');

            api.ensureIndexVisible(500, 'top');

            await waitFor(() => expect(recorder.ids()).toContain('500'));
            await waitForNoLoadingRows(api);
            expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(true);
            expect(recorder.violations).toEqual([]);
        });

        test('a transaction applies streamed totals to the subscribed grand total row', async () => {
            const api = await createGrandTotalGrid('pinnedTop');
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(true);

            api.applyServerSideTransaction({ update: [{ id: GRAND_TOTAL_ROW_ID, value: 999 }] });

            const pinned = api.getPinnedTopRow(0)!;
            expect(pinned.data).toEqual({ id: GRAND_TOTAL_ROW_ID, value: 999 });
            expect(recorder.violations).toEqual([]);
        });

        test('removing the grand total row unsubscribes it', async () => {
            const api = await createGrandTotalGrid('pinnedBottom');
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(true);

            api.setGridOption('grandTotalRow', undefined);

            await waitFor(() => expect(recorder.subscribed.has(GRAND_TOTAL_ROW_ID)).toBe(false));
            expect(recorder.batches('unsubscribe')).toEqual([[GRAND_TOTAL_ROW_ID]]);
            expect(recorder.violations).toEqual([]);
        });
    });
});
