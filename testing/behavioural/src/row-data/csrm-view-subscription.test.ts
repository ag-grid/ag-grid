import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout, nextAnimationFrame } from 'ag-test-utils';

import type { GridApi, GridOptions, ViewSubscriptionOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    NumberFilterModule,
    PaginationModule,
    ScrollApiModule,
} from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule, ViewSubscriptionModule } from 'ag-grid-enterprise';

import { createRecorder, range, setActive, subscribe, tryApi } from './viewSubscriptionTestUtils';

describe('CSRM viewSubscription', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            ViewSubscriptionModule,
            ScrollApiModule,
            NumberFilterModule,
            PaginationModule,
            RowGroupingModule,
            TreeDataModule,
            InfiniteRowModelModule,
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

    function createRows(count: number, prefix = '') {
        return Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, value: i }));
    }

    async function createFlatGrid(options: GridOptions = {}, rowCount = 100): Promise<GridApi> {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
            rowData: createRows(rowCount),
            rowBuffer: 5,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            ...options,
        });
        await nextAnimationFrame();
        return api;
    }

    test('the grid subscribes to the rows in view when it is ready', async () => {
        const recorder = createRecorder();

        await createFlatGrid({ viewSubscription: recorder.handlers });

        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
        expect(recorder.subscribed.get('2')).toEqual({
            type: 'leaf',
            id: '2',
            parentKeys: [],
            level: 0,
            data: { id: '2', value: 2 },
        });
    });

    test('the grid makes the first call when it is ready even with no rows', async () => {
        const recorder = createRecorder();

        await createFlatGrid({ viewSubscription: recorder.handlers }, 0);

        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: [] }]);
    });

    test('setting the option subscribes to the rows already in view straight away', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();

        subscribe(api, recorder);

        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
    });

    test('scrolling unsubscribes rows that leave the view before subscribing rows that enter it', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(50, 55)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: range(0, 5) },
            { type: 'subscribe', ids: range(50, 55) },
        ]);
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
                api.applyTransaction({ update: [{ id: String(i), value: -i }] });
            }
            expect(recorder.ids()).toEqual(range(30, 35));
        } finally {
            vi.useRealTimers();
        }
    });

    test('rows that came into view are still subscribed when unsubscribeRows throws', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        let fail = true;
        api.setGridOption('viewSubscription', {
            subscribeRows: recorder.handlers.subscribeRows,
            unsubscribeRows: (rows, params) => {
                recorder.handlers.unsubscribeRows(rows, params);
                if (fail) {
                    fail = false;
                    throw new Error('unsubscribe failed');
                }
            },
            debounceMs: 10,
        });
        vi.useFakeTimers();
        try {
            api.ensureIndexVisible(50, 'top');
            await expect(vi.advanceTimersByTimeAsync(10)).rejects.toThrow('unsubscribe failed');

            await vi.advanceTimersByTimeAsync(10);
            expect(recorder.ids()).toEqual(range(50, 55));
            expect(recorder.violations).toEqual([]);
        } finally {
            vi.useRealTimers();
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
                api.applyTransaction({ update: [{ id: '30', value: i }] });
                await vi.advanceTimersByTimeAsync(50);
            }

            expect(recorder.ids()).toEqual(range(30, 35));
            expect(recorder.violations).toEqual([]);
        } finally {
            vi.useRealTimers();
        }
    });

    describe('lifecycle', () => {
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
                await createFlatGrid({ viewSubscription: recorder.handlers });

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
                await createFlatGrid({ viewSubscription: { ...recorder.handlers, pauseWhenHidden: false } });

                setPageHidden(true);

                expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            });

            test('setting pauseWhenHidden to false while the page is hidden subscribes the rows in view', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid({ viewSubscription: recorder.handlers });
                setPageHidden(true);

                api.setGridOption('viewSubscription', { ...recorder.handlers, pauseWhenHidden: false });

                expect(recorder.ids()).toEqual(range(0, 5));
                expect(recorder.violations).toEqual([]);
            });

            test('showing the page does not subscribe while viewSubscriptionActive is false', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid({ viewSubscription: recorder.handlers });
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
                await createFlatGrid({ viewSubscription: recorder.handlers });

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
                await createFlatGrid({ viewSubscription: { ...recorder.handlers, pauseWhenHidden: false } });

                setOnScreen(false);

                expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            });

            test('destroying the grid stops observing whether it is on screen', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid({ viewSubscription: recorder.handlers });

                api.destroy();

                expect(observers.length).toBeGreaterThan(0);
                expect(observers.every((observer) => observer.disconnected)).toBe(true);
            });
        });

        test('setting the option again with the same handlers makes no call', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

            subscribe(api, recorder);
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
        });

        test('new handlers are used for the next calls, without unsubscribing any row', async () => {
            const oldRecorder = createRecorder();
            const api = await createFlatGrid({ viewSubscription: oldRecorder.handlers });
            const newRecorder = createRecorder();

            subscribe(api, newRecorder);
            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(newRecorder.ids()).toEqual(range(50, 55)));

            expect(oldRecorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            // The rows the old handlers subscribed are unsubscribed through the new ones.
            expect(newRecorder.calls).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(50, 55) },
            ]);
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
            const api = await createFlatGrid({ viewSubscription: options });

            api.destroy();

            expect(receivers).toHaveLength(2);
            expect(receivers.every((receiver) => receiver === options)).toBe(true);
        });

        test('setting viewSubscriptionActive to false unsubscribes every row once, then makes no call while disabled', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

            setActive(api, false);
            setActive(api, false);

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);

            api.ensureIndexVisible(50, 'top');
            api.applyTransaction({ update: [{ id: '50', value: -1 }], remove: [{ id: '51' }] });
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toHaveLength(2);
        });

        test('setting viewSubscriptionActive back to true subscribes to the rows in view', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });
            setActive(api, false);
            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();

            setActive(api, true);

            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(50, 55) }]);
            expect(recorder.violations).toEqual([]);
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
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

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
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

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

        test('destroying the grid unsubscribes every row once, while the api is still usable', async () => {
            let destroyedDuringStop: boolean | undefined;
            const recorder = createRecorder();
            const api = await createFlatGrid({
                viewSubscription: {
                    subscribeRows: recorder.handlers.subscribeRows,
                    unsubscribeRows: (rows, params) => {
                        destroyedDuringStop = params.api.isDestroyed();
                        recorder.handlers.unsubscribeRows(rows, params);
                    },
                },
            });

            api.destroy();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(destroyedDuringStop).toBe(false);
            expect(recorder.subscribed.size).toBe(0);

            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toHaveLength(2);
        });

        test('destroying the grid while disabled makes no further call', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });
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
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(recorder.calls.some((c) => c.type === 'unsubscribe')).toBe(true));
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(api.isDestroyed()).toBe(true);
        });

        test('disabling inside unsubscribeRows skips the rest of the batch', async () => {
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    setActive(api, false);
                }
            });
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(recorder.calls.some((c) => c.type === 'unsubscribe')).toBe(true));
            await nextAnimationFrame();

            expect(recorder.subscribed.size).toBe(0);
            expect(recorder.calls.filter((c) => c.type === 'subscribe')).toHaveLength(1);
            expect(recorder.violations).toEqual([]);
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
            const api = await createFlatGrid({ viewSubscription: recorder.handlers });

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(recorder.ids()).toEqual(range(50, 55)));
            await nextAnimationFrame();

            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(50, 55) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        describe('turning the subscription on while the grid is destroyed', () => {
            test('enabling inside every unsubscribeRows leaves no row subscribed', async () => {
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
                const api = await createFlatGrid({ viewSubscription: recorder.handlers });

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
                const recorder = createRecorder();
                const api = await createFlatGrid({
                    viewSubscription: recorder.handlers,
                    viewSubscriptionActive: false,
                    onGridPreDestroyed: () => setActive(api, true),
                });

                api.destroy();
                await nextAnimationFrame();
                await nextAnimationFrame();

                // The grid's own gridPreDestroyed listener runs first, so the subscription is never turned back on.
                expect(recorder.calls).toEqual([]);
                expect(recorder.subscribed.size).toBe(0);
                expect(recorder.violations).toEqual([]);
            });
        });
    });

    test('a sort moves rows out of and into the view', async () => {
        const api = await createFlatGrid({ columnDefs: [{ field: 'value', sortable: true }] });
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(range(94, 99)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: range(0, 5) },
            { type: 'subscribe', ids: range(94, 99).reverse() },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('a sort from inside unsubscribeRows unsubscribes the rows it moves out of view in a later batch', async () => {
        const api = await createFlatGrid({ columnDefs: [{ field: 'value', sortable: true }] });
        let sorted = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && !sorted) {
                sorted = true;
                api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
            }
        });
        subscribe(api, recorder);

        // Rows 3 to 5 stay in view, then the sort in the handler moves them out.
        api.ensureIndexVisible(3, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(91, 96)));
        const unsubscribed = recorder.calls.filter((c) => c.type === 'unsubscribe');
        expect(unsubscribed).toEqual([
            { type: 'unsubscribe', ids: range(0, 2) },
            { type: 'unsubscribe', ids: range(3, 5) },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('a filter hides rows and brings others into view', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 2 });
        api.onFilterChanged();

        await waitFor(() => expect(recorder.ids()).toEqual(range(3, 8)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: range(0, 2) },
            { type: 'subscribe', ids: range(6, 8) },
        ]);

        await api.setColumnFilterModel('value', null);
        api.onFilterChanged();

        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.batches('unsubscribe')).toEqual([range(0, 2), range(6, 8)]);
        expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(6, 8), range(0, 2)]);
        expect(recorder.violations).toEqual([]);
    });

    test('new row data unsubscribes the rows it drops and keeps the rest', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.setGridOption('rowData', createRows(100).slice(3));

        await waitFor(() => expect(recorder.ids()).toEqual(range(3, 8)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: range(0, 2) },
            { type: 'subscribe', ids: range(6, 8) },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('a transaction that removes a visible row unsubscribes it', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.applyTransaction({ remove: [{ id: '2' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(['0', '1', ...range(3, 6)]));
        expect(recorder.calls[1]).toEqual({ type: 'unsubscribe', ids: ['2'] });
        expect(recorder.violations).toEqual([]);
    });

    test('async transactions applied together are reported in one batch', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        for (let i = 0; i < 5; ++i) {
            api.applyTransactionAsync({ remove: [{ id: String(i) }] });
        }
        api.flushAsyncTransactions();

        await waitFor(() => expect(recorder.ids()).toEqual(range(5, 10)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: range(0, 4) },
            { type: 'subscribe', ids: range(6, 10) },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('paging unsubscribes the old page and subscribes the new one', async () => {
        const api = await createFlatGrid({ pagination: true, paginationPageSize: 20 });
        const recorder = createRecorder();
        subscribe(api, recorder);
        expect(recorder.ids()).toEqual(range(0, 5));

        api.paginationGoToNextPage();

        await waitFor(() => expect(recorder.ids()).toEqual(range(20, 25)));
        expect(recorder.batches('unsubscribe')).toEqual([range(0, 5)]);
        expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(20, 25)]);
        expect(recorder.violations).toEqual([]);
    });

    test('redrawing a row that becomes full width unsubscribes it, and subscribes it again when it stops being full width', async () => {
        const api = await createFlatGrid({
            isFullWidthRow: (params) => !!params.rowNode.data?.fullWidth,
            fullWidthCellRenderer: () => 'full width',
        });
        const recorder = createRecorder();
        subscribe(api, recorder);
        expect(recorder.ids()).toEqual(range(0, 5));

        const node = api.getRowNode('2')!;
        node.updateData({ ...node.data, fullWidth: true });
        api.redrawRows({ rowNodes: [node] });
        await waitFor(() => expect(recorder.ids()).toEqual(['0', '1', '3', '4', '5']));

        node.updateData({ ...node.data, fullWidth: false });
        api.redrawRows({ rowNodes: [node] });
        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.violations).toEqual([]);
    });

    test('a row that an unsubscribe handler makes full width is not subscribed', async () => {
        const api = await createFlatGrid({
            isFullWidthRow: (params) => !!params.rowNode.data?.fullWidth,
            fullWidthCellRenderer: () => 'full width',
        });
        let madeFullWidth = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && !madeFullWidth) {
                madeFullWidth = true;
                const node = api.getRowNode('52')!;
                node.updateData({ ...node.data, fullWidth: true });
                api.redrawRows({ rowNodes: [node] });
            }
        });
        subscribe(api, recorder);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(['50', '51', '53', '54', '55']));
        expect(recorder.calls.some((c) => c.type === 'subscribe' && c.ids.includes('52'))).toBe(false);
        expect(recorder.violations).toEqual([]);
    });

    test('a row that is only partly visible because of a fractional row height is subscribed', async () => {
        // With 1px rows, the number of visible rows is the viewport height.
        const probe = await createFlatGrid({ rowHeight: 1 }, 1000);
        const probeRecorder = createRecorder();
        subscribe(probe, probeRecorder);
        const viewportHeight = probeRecorder.subscribed.size;
        gridsManager.reset();

        // Row 1 then starts half a pixel above the bottom edge of the viewport.
        const api = await createFlatGrid({
            getRowHeight: (params) => (params.data.id === '0' ? viewportHeight - 0.5 : 42),
        });
        const recorder = createRecorder();
        subscribe(api, recorder);

        expect(recorder.ids()).toEqual(['0', '1']);
    });

    test('without getRowId it warns and never calls the handlers', async () => {
        const recorder = createRecorder();

        await expect(createFlatGrid({ getRowId: undefined, viewSubscription: recorder.handlers })).rejects.toThrow(
            'warning #188'
        );
        expect(recorder.calls).toEqual([]);
    });

    test('other row models warn and never call the handlers', () => {
        const recorder = createRecorder();

        expect(() =>
            gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowModelType: 'infinite',
                getRowId: (params) => params.data.id,
                viewSubscription: recorder.handlers,
            })
        ).toThrow('warning #309');
        expect(recorder.calls).toEqual([]);
    });

    describe('with row grouping', () => {
        const countries = ['Ireland', 'Spain', 'France'];

        async function createGroupedGrid(options: GridOptions = {}): Promise<GridApi> {
            const rowData = countries.flatMap((country) =>
                Array.from({ length: 10 }, (_, i) => ({ id: `${country}-${i}`, country, value: i }))
            );
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
                rowData,
                rowBuffer: 5,
                suppressRowVirtualisation: false,
                getRowId: (params) => params.data.id,
                ...options,
            });
            await nextAnimationFrame();
            return api;
        }

        test('a sticky group row stays subscribed while it is stuck over the view, and is unsubscribed once it scrolls away', async () => {
            const api = await createGroupedGrid({ groupDefaultExpanded: 1 });
            const recorder = createRecorder();
            subscribe(api, recorder);
            const ireland = api.getDisplayedRowAtIndex(0)!.id!;
            const spain = api.getDisplayedRowAtIndex(11)!.id!;
            expect(recorder.ids()).toContain(ireland);

            api.ensureIndexVisible(6, 'top');

            await waitFor(() => expect(recorder.ids()).toContain('Ireland-5'));
            await waitFor(() =>
                expect(document.querySelector(`[class*="sticky-top"] [row-id="${ireland}"]`)).not.toBeNull()
            );
            expect(recorder.ids()).toContain(ireland);
            expect(recorder.unsubscribedRefs.map((ref) => ref.id)).not.toContain(ireland);

            // Past the last Ireland row, the Spain group row is stuck over the view in its place.
            api.ensureIndexVisible(13, 'top');

            await waitFor(() => expect(recorder.ids()).not.toContain(ireland));
            expect(recorder.ids()).toContain(spain);
            expect(recorder.violations).toEqual([]);
        });

        test('with suppressGroupRowsSticky, a group row is unsubscribed once it scrolls above the rows in view', async () => {
            const api = await createGroupedGrid({ groupDefaultExpanded: 1, suppressGroupRowsSticky: true });
            const recorder = createRecorder();
            subscribe(api, recorder);
            const ireland = api.getDisplayedRowAtIndex(0)!.id!;

            api.ensureIndexVisible(6, 'top');

            await waitFor(() => expect(recorder.ids()).toContain('Ireland-5'));
            expect(recorder.ids()).not.toContain(ireland);
            expect(recorder.violations).toEqual([]);
        });

        test('expanding and collapsing a group subscribes and unsubscribes its rows', async () => {
            const api = await createGroupedGrid();
            const recorder = createRecorder();
            subscribe(api, recorder);
            const [ireland, spain, france] = [0, 1, 2].map((i) => api.getDisplayedRowAtIndex(i)!.id!);
            const irelandRows = range(0, 4).map((i) => `Ireland-${i}`);

            api.setRowNodeExpanded(api.getRowNode(ireland)!, true);
            await waitFor(() => expect(recorder.subscribed.has('Ireland-4')).toBe(true));
            expect(recorder.subscribed.get('Ireland-0')).toEqual({
                type: 'leaf',
                id: 'Ireland-0',
                parentKeys: ['Ireland'],
                level: 1,
                data: { id: 'Ireland-0', country: 'Ireland', value: 0 },
            });
            // Row grouping creates the group rows, so they have no data.
            expect(recorder.subscribed.get(ireland)).toEqual({
                type: 'group',
                id: ireland,
                route: ['Ireland'],
                parentKeys: [],
                level: 0,
                data: undefined,
            });

            api.setRowNodeExpanded(api.getRowNode(ireland)!, false);
            await waitFor(() => expect(recorder.subscribed.has(spain)).toBe(true));

            expect(recorder.calls.slice(1)).toEqual([
                // Expanding Ireland pushes the other groups out of view.
                { type: 'unsubscribe', ids: [spain, france] },
                { type: 'subscribe', ids: irelandRows },
                { type: 'unsubscribe', ids: irelandRows },
                { type: 'subscribe', ids: [spain, france] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('expandAll and collapseAll subscribe and unsubscribe the rows they show and hide', async () => {
            const api = await createGroupedGrid();
            const recorder = createRecorder();
            subscribe(api, recorder);
            const groups = recorder.calls[0].ids;
            const irelandRows = range(0, 4).map((i) => `Ireland-${i}`);

            api.expandAll();
            await waitFor(() => expect(recorder.subscribed.has('Ireland-4')).toBe(true));
            api.collapseAll();
            await waitFor(() => expect(recorder.ids()).toHaveLength(3));

            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: groups.slice(1) },
                { type: 'subscribe', ids: irelandRows },
                { type: 'unsubscribe', ids: irelandRows },
                { type: 'subscribe', ids: groups.slice(1) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a transaction that moves a visible row to another group unsubscribes its old ref and subscribes the new one', async () => {
            const rowData = ['Ireland', 'Spain'].flatMap((country) =>
                [0, 1].map((i) => ({ id: `${country}-${i}`, country, value: i }))
            );
            const api = await createGroupedGrid({ rowData, groupDefaultExpanded: -1 });
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.get('Ireland-1')).toMatchObject({ parentKeys: ['Ireland'] });

            api.applyTransaction({ update: [{ id: 'Ireland-1', country: 'Spain', value: 1 }] });

            await waitFor(() => expect(recorder.subscribed.get('Ireland-1')).toMatchObject({ parentKeys: ['Spain'] }));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['Ireland-1'] },
                { type: 'subscribe', ids: ['Ireland-1'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('changing the parentKeys and route a handler receives does not resubscribe the row', async () => {
            const rowData = ['Ireland', 'Spain'].flatMap((country) =>
                [0, 1].map((i) => ({ id: `${country}-${i}`, country, value: i }))
            );
            const api = await createGroupedGrid({ rowData, groupDefaultExpanded: -1 });
            const recorder = createRecorder();
            api.setGridOption('viewSubscription', {
                ...recorder.handlers,
                subscribeRows(rows, params) {
                    for (const row of rows) {
                        row.parentKeys.push('changed');
                        if (row.type !== 'leaf') {
                            row.route?.push('changed');
                        }
                    }
                    recorder.handlers.subscribeRows(rows, params);
                },
            });

            api.applyTransaction({ update: [{ id: 'Ireland-1', country: 'Ireland', value: 5 }] });
            api.applyTransaction({ add: [{ id: 'Ireland-2', country: 'Ireland', value: 2 }] });

            await waitFor(() => expect(recorder.subscribed.has('Ireland-2')).toBe(true));
            expect(recorder.calls.filter((c) => c.ids.includes('Ireland-1'))).toHaveLength(1);
            expect(recorder.violations).toEqual([]);
        });

        test('a transaction that moves a visible row into an expanded group out of view unsubscribes it', async () => {
            const api = await createGroupedGrid({ groupDefaultExpanded: -1 });
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.has('Ireland-1')).toBe(true);

            api.applyTransaction({ update: [{ id: 'Ireland-1', country: 'Spain', value: 1 }] });

            await waitFor(() => expect(recorder.subscribed.has('Ireland-1')).toBe(false));
            expect(recorder.calls.filter((c) => c.type === 'unsubscribe')).toEqual([
                { type: 'unsubscribe', ids: ['Ireland-1'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('a transaction that moves a visible row into a collapsed group unsubscribes it', async () => {
            const api = await createGroupedGrid();
            api.setRowNodeExpanded(api.getDisplayedRowAtIndex(0)!, true);
            await nextAnimationFrame();
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.subscribed.has('Ireland-1')).toBe(true);

            api.applyTransaction({ update: [{ id: 'Ireland-1', country: 'Spain', value: 1 }] });

            await waitFor(() => expect(recorder.subscribed.has('Ireland-1')).toBe(false));
            expect(recorder.calls.filter((c) => c.type === 'unsubscribe')).toEqual([
                { type: 'unsubscribe', ids: ['Ireland-1'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('removing the grouping unsubscribes the group rows', async () => {
            const api = await createGroupedGrid();
            const recorder = createRecorder();
            subscribe(api, recorder);
            const groups = recorder.calls[0].ids;
            expect(groups).toHaveLength(3);

            api.applyColumnState({ state: [{ colId: 'country', rowGroup: false }] });

            await waitFor(() => expect(recorder.ids()).toHaveLength(6));
            expect(recorder.calls[1]).toEqual({ type: 'unsubscribe', ids: groups });
            expect(recorder.violations).toEqual([]);
        });
    });

    test('tree data rows carry their path as route and their parent path as parentKeys', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            treeData: true,
            groupDefaultExpanded: -1,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
            rowData: [
                { id: 'a', path: ['A'], value: 1 },
                { id: 'b', path: ['A', 'B'], value: 2 },
                { id: 'c', path: ['A', 'B', 'C'], value: 3 },
            ],
        });
        await nextAnimationFrame();
        const recorder = createRecorder();

        subscribe(api, recorder);

        expect(recorder.ids()).toEqual(['a', 'b', 'c']);
        expect(recorder.subscribed.get('c')).toMatchObject({
            route: ['A', 'B', 'C'],
            parentKeys: ['A', 'B'],
            level: 2,
        });
        expect(recorder.subscribed.get('a')).toMatchObject({ route: ['A'], parentKeys: [], level: 0 });

        api.applyTransaction({ update: [{ id: 'c', path: ['A', 'C'], value: 3 }] });

        await waitFor(() =>
            expect(recorder.subscribed.get('c')).toMatchObject({ route: ['A', 'C'], parentKeys: ['A'], level: 1 })
        );
        // b loses its only child, so it is passed again with hasChildren updated.
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: ['b', 'c'] },
            { type: 'subscribe', ids: ['b', 'c'] },
        ]);
        expect(recorder.subscribed.get('b')).toMatchObject({ hasChildren: false });
        // The ref passed to unsubscribeRows is the one captured when the row was subscribed.
        expect(recorder.unsubscribedRefs).toEqual([
            { type: 'tree', id: 'b', route: ['A', 'B'], parentKeys: ['A'], level: 1 },
            { type: 'tree', id: 'c', route: ['A', 'B', 'C'], parentKeys: ['A', 'B'], level: 2 },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('tree data rows, including the filler rows the grid creates for missing parents, are passed with type tree', async () => {
        const recorder = createRecorder();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            treeData: true,
            groupDefaultExpanded: -1,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
            rowData: [
                { id: 'a', path: ['A'], value: 1 },
                { id: 'x', path: ['A', 'B', 'X'], value: 2 },
            ],
            viewSubscription: recorder.handlers,
        });
        const filler = api.getDisplayedRowAtIndex(1)!;

        expect(filler.data).toBeUndefined();
        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: ['a', filler.id, 'x'] }]);
        expect(recorder.subscribed.get('a')).toEqual({
            type: 'tree',
            id: 'a',
            route: ['A'],
            parentKeys: [],
            level: 0,
            hasChildren: true,
            data: { id: 'a', path: ['A'], value: 1 },
        });
        expect(recorder.subscribed.get(filler.id!)).toEqual({
            type: 'tree',
            id: filler.id,
            route: ['A', 'B'],
            parentKeys: ['A'],
            level: 1,
            hasChildren: true,
            data: undefined,
        });
        expect(recorder.subscribed.get('x')).toEqual({
            type: 'tree',
            id: 'x',
            route: ['A', 'B', 'X'],
            parentKeys: ['A', 'B'],
            level: 2,
            hasChildren: false,
            data: { id: 'x', path: ['A', 'B', 'X'], value: 2 },
        });
        expect(recorder.violations).toEqual([]);
    });

    test('a tree data row that gains or loses its only child is unsubscribed and subscribed again with hasChildren updated', async () => {
        const recorder = createRecorder();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            treeData: true,
            groupDefaultExpanded: -1,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
            rowData: [{ id: 'a', path: ['A'], value: 1 }],
            viewSubscription: recorder.handlers,
        });
        expect(recorder.subscribed.get('a')).toMatchObject({ hasChildren: false });

        api.applyTransaction({ add: [{ id: 'b', path: ['A', 'B'], value: 2 }] });
        await waitFor(() => expect(recorder.subscribed.get('a')).toMatchObject({ hasChildren: true }));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', ids: ['a'] },
            { type: 'subscribe', ids: ['a', 'b'] },
        ]);

        api.applyTransaction({ remove: [{ id: 'b', path: ['A', 'B'], value: 2 }] });
        await waitFor(() => expect(recorder.subscribed.get('a')).toMatchObject({ hasChildren: false }));
        expect(recorder.calls.slice(3)).toEqual([
            { type: 'unsubscribe', ids: ['a', 'b'] },
            { type: 'subscribe', ids: ['a'] },
        ]);
        expect(recorder.violations).toEqual([]);
    });
});
