import { waitFor } from '@testing-library/dom';
import { TestGridsManager, mockGridLayout, nextAnimationFrame } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    InfiniteRowModelModule,
    NumberFilterModule,
    PaginationModule,
    ScrollApiModule,
    ViewportSubscriptionModule,
} from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { createRecorder, range, subscribe, tryApi } from './viewportSubscriptionTestUtils';

describe('CSRM viewportSubscription', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            ViewportSubscriptionModule,
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

        await createFlatGrid({ viewportSubscription: recorder.handlers });

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

        await createFlatGrid({ viewportSubscription: recorder.handlers }, 0);

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

    test('includeBuffer includes the rows rendered in the row buffer', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();

        subscribe(api, recorder, { includeBuffer: true });

        const first = api.getFirstDisplayedRowIndex();
        const last = api.getLastDisplayedRowIndex();
        expect(last - first).toBeGreaterThan(5);
        expect(recorder.ids()).toEqual(range(first, last));
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
        test('unsubscribeFromViewport unsubscribes every row and stops further calls, and subscribeToViewport starts again', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

            api.unsubscribeFromViewport();
            api.unsubscribeFromViewport();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);

            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toHaveLength(2);

            api.subscribeToViewport();

            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(50, 55) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('subscribeToViewport while subscribed unsubscribes every row, then subscribes the rows in view', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

            api.subscribeToViewport();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(0, 5) },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('subscribeToViewport without the option warns and does nothing', async () => {
            const api = await createFlatGrid();

            expect(() => api.subscribeToViewport()).toThrow('warning #337');
        });

        test('changing the option unsubscribes every row from the old handlers, then subscribes them with the new ones', async () => {
            const oldRecorder = createRecorder();
            const api = await createFlatGrid({ viewportSubscription: oldRecorder.handlers });
            const newRecorder = createRecorder();

            subscribe(api, newRecorder, { includeBuffer: true });

            expect(oldRecorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(newRecorder.calls).toEqual([
                {
                    type: 'subscribe',
                    ids: range(api.getFirstDisplayedRowIndex(), api.getLastDisplayedRowIndex()),
                },
            ]);

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(newRecorder.ids()).toContain('50'));
            expect(oldRecorder.calls).toHaveLength(2);
            expect(oldRecorder.violations).toEqual([]);
            expect(newRecorder.violations).toEqual([]);
        });

        test('setting the option to undefined unsubscribes every row and stops further calls', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

            api.setGridOption('viewportSubscription', undefined);

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);

            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toHaveLength(2);
        });

        test('destroying the grid unsubscribes every row once, while the api is still usable', async () => {
            let destroyedDuringStop: boolean | undefined;
            const recorder = createRecorder();
            const api = await createFlatGrid({
                viewportSubscription: {
                    onSubscribe: recorder.handlers.onSubscribe,
                    onUnsubscribe: (rows, params) => {
                        destroyedDuringStop = params.api.isDestroyed();
                        recorder.handlers.onUnsubscribe(rows, params);
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

        test('destroying the grid after unsubscribeFromViewport makes no further call', async () => {
            const recorder = createRecorder();
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });
            api.unsubscribeFromViewport();

            api.destroy();

            expect(recorder.calls).toHaveLength(2);
        });

        test('changing the option inside onUnsubscribe while restarting subscribes the rows once, with the new handlers', async () => {
            const newRecorder = createRecorder();
            const oldRecorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    subscribe(api, newRecorder);
                }
            });
            const api = await createFlatGrid({ viewportSubscription: oldRecorder.handlers });

            api.subscribeToViewport();

            expect(oldRecorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(newRecorder.calls).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            expect(newRecorder.violations).toEqual([]);
        });

        test('destroying the grid inside onUnsubscribe while restarting makes no further call', async () => {
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    api.destroy();
                }
            });
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

            api.subscribeToViewport();
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
        });

        test('unsubscribeFromViewport inside onUnsubscribe skips the rest of the batch', async () => {
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    api.unsubscribeFromViewport();
                }
            });
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

            api.ensureIndexVisible(50, 'top');
            await waitFor(() => expect(recorder.calls.some((c) => c.type === 'unsubscribe')).toBe(true));
            await nextAnimationFrame();

            expect(recorder.subscribed.size).toBe(0);
            expect(recorder.calls.filter((c) => c.type === 'subscribe')).toHaveLength(1);
            expect(recorder.violations).toEqual([]);
        });

        test('unsubscribeFromViewport inside onUnsubscribe while restarting stays unsubscribed', async () => {
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    api.unsubscribeFromViewport();
                }
            });
            const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

            api.subscribeToViewport();
            api.ensureIndexVisible(50, 'top');
            await nextAnimationFrame();
            await nextAnimationFrame();

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: range(0, 5) },
                { type: 'unsubscribe', ids: range(0, 5) },
            ]);
            expect(recorder.subscribed.size).toBe(0);
        });

        describe('restarting while the grid is destroyed', () => {
            test('subscribeToViewport inside every onUnsubscribe leaves no row subscribed', async () => {
                const warnings: (string | undefined)[] = [];
                const recorder = createRecorder((call) => {
                    if (call.type === 'unsubscribe') {
                        warnings.push(tryApi(() => api.subscribeToViewport()));
                    }
                });
                const api = await createFlatGrid({ viewportSubscription: recorder.handlers });

                api.destroy();
                await nextAnimationFrame();
                await nextAnimationFrame();

                // The restart from the gridPreDestroyed stop is unsubscribed by the final stop, where the api is unusable.
                expect(recorder.calls).toEqual([
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                ]);
                expect(warnings).toEqual([undefined, expect.stringContaining('warning #26')]);
                expect(recorder.subscribed.size).toBe(0);
                expect(recorder.violations).toEqual([]);
            });

            test('changing the option inside every onUnsubscribe leaves no row subscribed', async () => {
                const warnings: (string | undefined)[] = [];
                const newRecorder = createRecorder((call) => {
                    if (call.type === 'unsubscribe') {
                        warnings.push(tryApi(() => subscribe(api, oldRecorder)));
                    }
                });
                const oldRecorder = createRecorder((call) => {
                    if (call.type === 'unsubscribe') {
                        warnings.push(tryApi(() => subscribe(api, newRecorder)));
                    }
                });
                const api = await createFlatGrid({ viewportSubscription: oldRecorder.handlers });

                api.destroy();
                await nextAnimationFrame();
                await nextAnimationFrame();

                expect(oldRecorder.calls).toEqual([
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                ]);
                expect(newRecorder.calls).toEqual([
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                ]);
                expect(warnings).toEqual([undefined, expect.stringContaining('warning #26')]);
                expect(oldRecorder.subscribed.size).toBe(0);
                expect(newRecorder.subscribed.size).toBe(0);
                expect(oldRecorder.violations).toEqual([]);
                expect(newRecorder.violations).toEqual([]);
            });

            test('subscribeToViewport from onGridPreDestroyed leaves no row subscribed', async () => {
                const recorder = createRecorder();
                const api = await createFlatGrid({
                    viewportSubscription: recorder.handlers,
                    onGridPreDestroyed: () => api.subscribeToViewport(),
                });

                api.destroy();
                await nextAnimationFrame();
                await nextAnimationFrame();

                expect(recorder.calls).toEqual([
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                    { type: 'subscribe', ids: range(0, 5) },
                    { type: 'unsubscribe', ids: range(0, 5) },
                ]);
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

    test('a sort from inside onUnsubscribe unsubscribes the rows it moves out of view in a later batch', async () => {
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

        await expect(createFlatGrid({ getRowId: undefined, viewportSubscription: recorder.handlers })).rejects.toThrow(
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
                viewportSubscription: recorder.handlers,
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
            api.setGridOption('viewportSubscription', {
                ...recorder.handlers,
                onSubscribe(rows, params) {
                    for (const row of rows) {
                        row.parentKeys.push('changed');
                        if (row.type !== 'leaf') {
                            row.route?.push('changed');
                        }
                    }
                    recorder.handlers.onSubscribe(rows, params);
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
        // The ref passed to onUnsubscribe is the one captured when the row was subscribed.
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
            viewportSubscription: recorder.handlers,
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

        api.setGridOption('viewportSubscription', { ...recorder.handlers, includeGroups: false });

        expect(recorder.ids()).toEqual(['x']);
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
            viewportSubscription: recorder.handlers,
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
