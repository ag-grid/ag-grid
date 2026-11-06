import { waitFor } from '@testing-library/dom';
import {
    TestGridsManager,
    installMockResizeObserver,
    mockGridLayout,
    nextAnimationFrame,
    triggerResizeObservers,
    waitForEvent,
    waitForNoLoadingRows,
} from 'ag-test-utils';

import type { GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule, ViewportSubscriptionModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { createRecorder, range, subscribe, tryApi } from './viewportSubscriptionTestUtils';

describe('SSRM viewportSubscription', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ViewportSubscriptionModule,
            ScrollApiModule,
            RowGroupingModule,
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

    test('the grid makes the first call with no rows when it is ready, before anything loads, then loaded rows arrive', async () => {
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
            viewportSubscription: recorder.handlers,
        });

        expect(recorder.calls).toEqual([{ type: 'subscribe', ids: [] }]);

        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.batches('subscribe')).toEqual([range(0, 5)]);
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

    test('includeBuffer includes the rows rendered in the row buffer', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();

        subscribe(api, recorder, { includeBuffer: true });

        const first = api.getFirstDisplayedRowIndex();
        const last = api.getLastDisplayedRowIndex();
        expect(last - first).toBeGreaterThan(5);
        expect(recorder.ids()).toEqual(range(first, last));
    });

    test('resizing the grid without row virtualisation updates the subscribed rows', async () => {
        const uninstall = installMockResizeObserver();
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
            uninstall();
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

    test('unsubscribeFromViewport unsubscribes every row and stops further calls, and subscribeToViewport starts again', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.unsubscribeFromViewport();
        api.unsubscribeFromViewport();

        expect(recorder.calls).toEqual([
            { type: 'subscribe', ids: range(0, 5) },
            { type: 'unsubscribe', ids: range(0, 5) },
        ]);

        api.ensureIndexVisible(300, 'top');
        await waitForNoLoadingRows(api);
        await nextAnimationFrame();
        expect(recorder.calls).toHaveLength(2);

        api.subscribeToViewport();

        expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(300, 305) }]);
        expect(recorder.violations).toEqual([]);
    });

    test('changing the option unsubscribes every row from the old handlers, then subscribes them with the new ones', async () => {
        const api = await createFlatGrid();
        const oldRecorder = createRecorder();
        const newRecorder = createRecorder();
        subscribe(api, oldRecorder);

        subscribe(api, newRecorder, { includeBuffer: true });

        expect(oldRecorder.calls).toEqual([
            { type: 'subscribe', ids: range(0, 5) },
            { type: 'unsubscribe', ids: range(0, 5) },
        ]);
        expect(newRecorder.ids()).toEqual(range(api.getFirstDisplayedRowIndex(), api.getLastDisplayedRowIndex()));
    });

    test('destroying the grid unsubscribes every row once, while the api is still usable', async () => {
        const api = await createFlatGrid();
        let destroyedDuringStop: boolean | undefined;
        const recorder = createRecorder();
        api.setGridOption('viewportSubscription', {
            onSubscribe: recorder.handlers.onSubscribe,
            onUnsubscribe: (rows, params) => {
                destroyedDuringStop = params.api.isDestroyed();
                recorder.handlers.onUnsubscribe(rows, params);
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

    test('unsubscribeFromViewport inside onUnsubscribe skips the rest of the batch', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe') {
                api.unsubscribeFromViewport();
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

    test('unsubscribeFromViewport inside onSubscribe unsubscribes the rows just passed', async () => {
        const api = await createFlatGrid();
        let started = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'subscribe' && started) {
                api.unsubscribeFromViewport();
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

    test('unsubscribeFromViewport inside onUnsubscribe while restarting stays unsubscribed', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe') {
                api.unsubscribeFromViewport();
            }
        });
        subscribe(api, recorder);

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
            const api = await createFlatGrid();
            const warnings: (string | undefined)[] = [];
            const recorder = createRecorder((call) => {
                if (call.type === 'unsubscribe') {
                    warnings.push(tryApi(() => api.subscribeToViewport()));
                }
            });
            subscribe(api, recorder);

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
            const api = await createFlatGrid();
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
            subscribe(api, oldRecorder);

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
            const api = await createFlatGrid({ onGridPreDestroyed: () => api.subscribeToViewport() });
            const recorder = createRecorder();
            subscribe(api, recorder);

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

    test('a purge from inside onUnsubscribe does not subscribe the rows it destroyed', async () => {
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

    test('a scroll from inside onUnsubscribe does not subscribe the rows it scrolled away from', async () => {
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

    test('without getRowId it warns and never calls the handlers', async () => {
        const recorder = createRecorder();

        await expect(createFlatGrid({ getRowId: undefined, viewportSubscription: recorder.handlers })).rejects.toThrow(
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

        test('includeGroups false leaves group rows out', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitForNoLoadingRows(api);

            const recorder = createRecorder();
            subscribe(api, recorder, { includeGroups: false });

            expect(recorder.ids()).toEqual(range(0, 4).map((i) => `Ireland/Ireland-${i}`));
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

        test('group total rows and the grand total row are left out', async () => {
            const api = createGroupedGrid({ groupTotalRow: 'bottom', grandTotalRow: 'top' });
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);

            const recorder = createRecorder();
            subscribe(api, recorder, { includeBuffer: true });

            expect(recorder.ids()).toContain('Spain');
            expect(recorder.ids().filter((id) => id.startsWith('rowGroupFooter_'))).toEqual([]);
        });
    });
});
