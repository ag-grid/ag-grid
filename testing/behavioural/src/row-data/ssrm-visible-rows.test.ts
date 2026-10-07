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

import type {
    GridApi,
    GridOptions,
    IServerSideDatasource,
    VisibleRowRef,
    VisibleRowsHandlers,
    VisibleRowsReason,
} from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    ServerSideRowModelVisibleRowsModule,
} from 'ag-grid-enterprise';

interface Call {
    type: 'subscribe' | 'unsubscribe';
    reason: VisibleRowsReason;
    ids: string[];
}

/** Records handler calls and checks that every subscribed row is unsubscribed exactly once. */
function createRecorder(onCall?: (call: Call) => void) {
    const subscribed = new Map<string, VisibleRowRef>();
    const calls: Call[] = [];
    const violations: string[] = [];

    const handlers: VisibleRowsHandlers = {
        onSubscribe(rows, params) {
            for (const row of rows) {
                if (subscribed.has(row.id)) {
                    violations.push(`subscribed twice: ${row.id}`);
                }
                subscribed.set(row.id, row);
            }
            const call: Call = { type: 'subscribe', reason: params.reason, ids: rows.map((r) => r.id) };
            calls.push(call);
            onCall?.(call);
        },
        onUnsubscribe(rows, params) {
            for (const row of rows) {
                if (!subscribed.delete(row.id)) {
                    violations.push(`unsubscribed without subscribe: ${row.id}`);
                }
            }
            const call: Call = { type: 'unsubscribe', reason: params.reason, ids: rows.map((r) => r.id) };
            calls.push(call);
            onCall?.(call);
        },
    };

    return {
        handlers,
        subscribed,
        calls,
        violations,
        ids: () => Array.from(subscribed.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
        reasons: (type: Call['type']) => calls.filter((c) => c.type === type && c.ids.length).map((c) => c.reason),
    };
}

function range(from: number, to: number): string[] {
    return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

describe('SSRM subscribeToVisibleRows', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ServerSideRowModelVisibleRowsModule,
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

    test('first call lists the visible loaded rows straight away', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();

        api.subscribeToVisibleRows(recorder.handlers);

        expect(recorder.calls).toEqual([{ type: 'subscribe', reason: 'initial', ids: range(0, 5) }]);
        expect(recorder.subscribed.get('2')).toEqual({
            id: '2',
            parentKeys: [],
            level: 0,
            group: false,
            data: { id: '2', value: 2 },
        });
    });

    test('first call is made with no rows before anything loads, then loaded rows arrive with reason load', async () => {
        const recorder = createRecorder();
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide',
            rowBuffer: 5,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            serverSideDatasource: createFlatDatasource(
                Array.from({ length: 50 }, (_, i) => ({ id: String(i), value: i }))
            ),
        });

        api.subscribeToVisibleRows(recorder.handlers);
        expect(recorder.calls).toEqual([{ type: 'subscribe', reason: 'initial', ids: [] }]);

        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.reasons('subscribe')).toEqual(['load']);
        expect(recorder.violations).toEqual([]);
    });

    test('scrolling unsubscribes rows that leave the view before subscribing rows that enter it', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.ensureIndexVisible(300, 'top');
        await waitForNoLoadingRows(api);

        await waitFor(() => expect(recorder.ids()).toEqual(range(300, 305)));
        const unsubscribe = recorder.calls.findIndex((c) => c.type === 'unsubscribe');
        const lastSubscribe = recorder.calls.map((c) => c.type).lastIndexOf('subscribe');
        expect(recorder.calls[unsubscribe]).toEqual({ type: 'unsubscribe', reason: 'scroll', ids: range(0, 5) });
        expect(unsubscribe).toBeLessThan(lastSubscribe);
        expect(recorder.violations).toEqual([]);
    });

    test('includeBuffer includes the rows rendered in the row buffer', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();

        api.subscribeToVisibleRows(recorder.handlers, { includeBuffer: true });

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
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(range(0, 5));

            mockGridLayout.gridHeight = 600;
            triggerResizeObservers();

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 12)));
            expect(recorder.reasons('subscribe')).toEqual(['initial', 'scroll']);
            expect(recorder.violations).toEqual([]);
        } finally {
            mockGridLayout.gridHeight = 300;
            uninstall();
        }
    });

    test('debounceMs still delivers the final state', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers, { debounceMs: 20 });

        api.ensureIndexVisible(150, 'top');
        api.ensureIndexVisible(300, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(300, 305)));
        expect(recorder.violations).toEqual([]);
    });

    test('the stop function unsubscribes every row with reason stop and stops further calls', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        const stop = api.subscribeToVisibleRows(recorder.handlers);

        stop();
        stop();

        expect(recorder.calls).toEqual([
            { type: 'subscribe', reason: 'initial', ids: range(0, 5) },
            { type: 'unsubscribe', reason: 'stop', ids: range(0, 5) },
        ]);

        api.ensureIndexVisible(300, 'top');
        await waitForNoLoadingRows(api);
        await nextAnimationFrame();
        expect(recorder.calls).toHaveLength(2);
    });

    test('destroying the grid unsubscribes every row with reason stop while the api is still usable', async () => {
        const api = await createFlatGrid();
        let destroyedDuringStop: boolean | undefined;
        const recorder = createRecorder();
        api.subscribeToVisibleRows({
            onSubscribe: recorder.handlers.onSubscribe,
            onUnsubscribe: (rows, params) => {
                destroyedDuringStop = params.api.isDestroyed();
                recorder.handlers.onUnsubscribe(rows, params);
            },
        });

        api.ensureIndexVisible(300, 'top');
        api.destroy();

        expect(recorder.calls.at(-1)).toEqual({ type: 'unsubscribe', reason: 'stop', ids: range(0, 5) });
        expect(destroyedDuringStop).toBe(false);
        expect(recorder.subscribed.size).toBe(0);

        await nextAnimationFrame();
        await nextAnimationFrame();
        expect(recorder.calls).toHaveLength(2);
    });

    test('stopping inside onUnsubscribe skips the rest of the batch', async () => {
        const api = await createFlatGrid();
        let stop: () => void = () => {};
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && call.reason === 'scroll') {
                stop();
            }
        });
        stop = api.subscribeToVisibleRows(recorder.handlers);

        api.ensureIndexVisible(300, 'top');
        await waitFor(() => expect(recorder.calls.some((c) => c.reason === 'scroll')).toBe(true));
        await waitForNoLoadingRows(api);
        await nextAnimationFrame();

        expect(recorder.subscribed.size).toBe(0);
        expect(recorder.calls.filter((c) => c.type === 'subscribe')).toHaveLength(1);
        expect(recorder.violations).toEqual([]);
    });

    test('stopping inside onSubscribe unsubscribes the rows just passed', async () => {
        const api = await createFlatGrid();
        const subscription: { stop?: () => void } = {};
        const recorder = createRecorder((call) => {
            if (call.type === 'subscribe' && call.reason !== 'initial') {
                subscription.stop?.();
            }
        });
        subscription.stop = api.subscribeToVisibleRows(recorder.handlers);

        api.ensureIndexVisible(300, 'top');
        await waitFor(() => expect(recorder.calls.at(-1)?.reason).toBe('stop'));

        expect(recorder.subscribed.size).toBe(0);
        expect(recorder.violations).toEqual([]);
    });

    test('several listeners each track their own rows', async () => {
        const api = await createFlatGrid();
        const unbuffered = createRecorder();
        const buffered = createRecorder();
        api.subscribeToVisibleRows(unbuffered.handlers);
        const stopBuffered = api.subscribeToVisibleRows(buffered.handlers, { includeBuffer: true });

        stopBuffered();

        expect(unbuffered.ids()).toEqual(range(0, 5));
        expect(unbuffered.calls).toHaveLength(1);
        expect(buffered.subscribed.size).toBe(0);
    });

    test('a purge unsubscribes the dropped rows with reason reset, then reloaded rows arrive with reason load', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.refreshServerSide({ purge: true });

        await waitFor(() => expect(recorder.reasons('subscribe')).toEqual(['initial', 'load']));
        expect(recorder.reasons('unsubscribe')).toEqual(['reset']);
        expect(recorder.ids()).toEqual(range(0, 5));
        expect(recorder.violations).toEqual([]);
    });

    test('a sort that reloads rows unsubscribes them with reason reset', async () => {
        const api = await createFlatGrid({ columnDefs: [{ field: 'value', sortable: true }] });
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await waitFor(() => expect(recorder.reasons('unsubscribe')).toEqual(['reset']));
        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.violations).toEqual([]);
    });

    test('a client-side sort that keeps the rows does not reset them', async () => {
        const api = await createFlatGrid(
            { columnDefs: [{ field: 'value', sortable: true }], serverSideEnableClientSideSort: true },
            20
        );
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(range(14, 19)));
        expect(recorder.reasons('unsubscribe')).toEqual(['scroll']);
        expect(recorder.violations).toEqual([]);
    });

    test('a transaction that removes a visible row unsubscribes it with reason remove', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.applyServerSideTransaction({ remove: [{ id: '2' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(['0', '1', ...range(3, 6)]));
        expect(recorder.calls[1]).toEqual({ type: 'unsubscribe', reason: 'remove', ids: ['2'] });
        expect(recorder.violations).toEqual([]);
    });

    test('a purge from inside onUnsubscribe does not subscribe the rows it destroyed', async () => {
        const api = await createFlatGrid();
        let purged = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && call.reason === 'scroll' && !purged) {
                purged = true;
                api.refreshServerSide({ purge: true });
            }
        });
        api.subscribeToVisibleRows(recorder.handlers);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(50, 55)));
        // The rows the scroll brought in were destroyed by the purge, so only their reloaded replacements arrive.
        expect(recorder.reasons('subscribe')).toEqual(['initial', 'load']);
        expect(recorder.reasons('unsubscribe')).toEqual(['scroll']);
        expect(recorder.violations).toEqual([]);
    });

    test('a scroll from inside onUnsubscribe does not subscribe the rows it scrolled away from', async () => {
        const api = await createFlatGrid();
        let scrolled = false;
        const recorder = createRecorder((call) => {
            if (call.type === 'unsubscribe' && call.reason === 'scroll' && !scrolled) {
                scrolled = true;
                api.ensureIndexVisible(80, 'top');
            }
        });
        api.subscribeToVisibleRows(recorder.handlers);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(80, 85)));
        const everSubscribed = recorder.calls.filter((c) => c.type === 'subscribe').flatMap((c) => c.ids);
        expect(everSubscribed.filter((id) => range(50, 55).includes(id))).toEqual([]);
        expect(recorder.violations).toEqual([]);
    });

    test('without getRowId it warns and never calls the handlers', async () => {
        const api = await createFlatGrid({ getRowId: undefined });
        const recorder = createRecorder();

        expect(() => api.subscribeToVisibleRows(recorder.handlers)).toThrow('warning #188');
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
            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.subscribed.get('Ireland')).toEqual({
                id: 'Ireland',
                route: ['Ireland'],
                parentKeys: [],
                level: 0,
                group: true,
                data: { country: 'Ireland' },
            });

            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitForNoLoadingRows(api);

            await waitFor(() => expect(recorder.subscribed.has('Ireland/Ireland-0')).toBe(true));
            const leaf = recorder.subscribed.get('Ireland/Ireland-0')!;
            expect(leaf.route).toBeUndefined();
            expect(leaf.parentKeys).toEqual(['Ireland']);
            expect(leaf.level).toBe(1);
            expect(recorder.violations).toEqual([]);
        });

        test('collapsing a group unsubscribes its children with reason collapse', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitFor(() => expect(recorder.ids()).toContain('Ireland/Ireland-4'));

            api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);
            await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']));
            const collapsed = recorder.calls.find((c) => c.type === 'unsubscribe' && c.reason === 'collapse');
            expect(collapsed?.ids).toEqual(range(0, 4).map((i) => `Ireland/Ireland-${i}`));
            expect(recorder.violations).toEqual([]);
        });

        test('includeGroups false leaves group rows out', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitForNoLoadingRows(api);

            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers, { includeGroups: false });

            expect(recorder.ids()).toEqual(range(0, 4).map((i) => `Ireland/Ireland-${i}`));
        });

        test('a transaction that removes an expanded group unsubscribes it and its children with reason remove', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Ireland')!, true);
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(['Ireland', ...range(0, 4).map((i) => `Ireland/Ireland-${i}`)]);

            api.applyServerSideTransaction({ remove: [{ country: 'Ireland' }] });

            await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Spain']));
            expect(recorder.reasons('unsubscribe')).toEqual(['remove']);
            expect(recorder.violations).toEqual([]);
        });

        test('a scoped purge in the same frame as a removal labels each row by what happened to it', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const spainRows = range(0, 3).map((i) => `Spain/Spain-${i}`);
            expect(recorder.ids()).toEqual(['Ireland', 'Spain', ...spainRows]);

            api.refreshServerSide({ route: ['Spain'], purge: true });
            api.applyServerSideTransaction({ remove: [{ country: 'Ireland' }] });

            await waitFor(() =>
                expect(recorder.ids()).toEqual(['Spain', ...range(0, 4).map((i) => `Spain/Spain-${i}`)])
            );
            // France can pass through the view while Spain's rows reload, so only the first batch is checked.
            const unsubscribed = recorder.calls.filter((c) => c.type === 'unsubscribe').slice(0, 2);
            expect(unsubscribed).toEqual([
                { type: 'unsubscribe', reason: 'reset', ids: spainRows },
                { type: 'unsubscribe', reason: 'remove', ids: ['Ireland'] },
            ]);
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
                api.subscribeToVisibleRows(recorder.handlers);
                expect(recorder.ids()).toEqual(['Ireland', ...irelandRows]);
                return { api, recorder };
            }

            const unsubscribeCalls = (recorder: ReturnType<typeof createRecorder>) =>
                recorder.calls.filter((c) => c.type === 'unsubscribe');

            test('a purge of its rows labels them reset', async () => {
                const { api, recorder } = await subscribeWithIrelandExpanded();

                api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);
                api.refreshServerSide({ route: ['Ireland'], purge: true });

                await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']));
                expect(unsubscribeCalls(recorder)).toEqual([
                    { type: 'unsubscribe', reason: 'reset', ids: irelandRows },
                ]);
                expect(recorder.violations).toEqual([]);
            });

            test('a transaction removing the group labels it and its rows remove', async () => {
                const { api, recorder } = await subscribeWithIrelandExpanded();

                api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);
                api.applyServerSideTransaction({ remove: [{ country: 'Ireland' }] });

                await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Spain']));
                expect(unsubscribeCalls(recorder)).toEqual([
                    { type: 'unsubscribe', reason: 'remove', ids: ['Ireland', ...irelandRows] },
                ]);
                expect(recorder.violations).toEqual([]);
            });

            test('purgeClosedRowNodes still labels the rows it destroys on collapse as collapse', async () => {
                const { api, recorder } = await subscribeWithIrelandExpanded({ purgeClosedRowNodes: true });

                api.setRowNodeExpanded(api.getRowNode('Ireland')!, false);

                await waitFor(() => expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']));
                expect(api.getRowNode('Ireland/Ireland-0')).toBeUndefined();
                expect(unsubscribeCalls(recorder)).toEqual([
                    { type: 'unsubscribe', reason: 'collapse', ids: irelandRows },
                ]);
                expect(recorder.violations).toEqual([]);
            });
        });

        test('group total rows and the grand total row are left out', async () => {
            const api = createGroupedGrid({ groupTotalRow: 'bottom', grandTotalRow: 'top' });
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('Spain')!, true);
            await waitForNoLoadingRows(api);

            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers, { includeBuffer: true });

            expect(recorder.ids()).toContain('Spain');
            expect(recorder.ids().filter((id) => id.startsWith('rowGroupFooter_'))).toEqual([]);
        });
    });
});
