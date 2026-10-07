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
    VisibleRowsModule,
} from 'ag-grid-community';
import { RowGroupingModule, TreeDataModule } from 'ag-grid-enterprise';

import { createRecorder, range } from './visibleRowsTestUtils';

describe('CSRM subscribeToVisibleRows', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ClientSideRowModelApiModule,
            VisibleRowsModule,
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

    test('first call lists the visible rows straight away', async () => {
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

    test('scrolling unsubscribes rows that leave the view before subscribing rows that enter it', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.ensureIndexVisible(50, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(50, 55)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', reason: 'scroll', ids: range(0, 5) },
            { type: 'subscribe', reason: 'scroll', ids: range(50, 55) },
        ]);
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

    test('debounceMs still delivers the final state', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers, { debounceMs: 20 });

        api.ensureIndexVisible(30, 'top');
        api.ensureIndexVisible(60, 'top');

        await waitFor(() => expect(recorder.ids()).toEqual(range(60, 65)));
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

        api.ensureIndexVisible(50, 'top');
        await nextAnimationFrame();
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

        api.destroy();

        expect(recorder.calls.at(-1)).toEqual({ type: 'unsubscribe', reason: 'stop', ids: range(0, 5) });
        expect(destroyedDuringStop).toBe(false);
        expect(recorder.subscribed.size).toBe(0);
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

        api.ensureIndexVisible(50, 'top');
        await waitFor(() => expect(recorder.calls.some((c) => c.reason === 'scroll')).toBe(true));
        await nextAnimationFrame();

        expect(recorder.subscribed.size).toBe(0);
        expect(recorder.calls.filter((c) => c.type === 'subscribe')).toHaveLength(1);
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

    test('a sort moves rows out of and into the view with reason sort', async () => {
        const api = await createFlatGrid({ columnDefs: [{ field: 'value', sortable: true }] });
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(range(94, 99)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', reason: 'sort', ids: range(0, 5) },
            { type: 'subscribe', reason: 'sort', ids: range(94, 99).reverse() },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('a filter hides rows and brings others into view with reason filter', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 2 });
        api.onFilterChanged();

        await waitFor(() => expect(recorder.ids()).toEqual(range(3, 8)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', reason: 'filter', ids: range(0, 2) },
            { type: 'subscribe', reason: 'filter', ids: range(6, 8) },
        ]);

        await api.setColumnFilterModel('value', null);
        api.onFilterChanged();

        await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
        expect(recorder.reasons('unsubscribe')).toEqual(['filter', 'filter']);
        expect(recorder.reasons('subscribe')).toEqual(['initial', 'filter', 'filter']);
        expect(recorder.violations).toEqual([]);
    });

    test('new row data unsubscribes the rows it drops with reason reset and keeps the rest', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.setGridOption('rowData', createRows(100).slice(3));

        await waitFor(() => expect(recorder.ids()).toEqual(range(3, 8)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', reason: 'reset', ids: range(0, 2) },
            { type: 'subscribe', reason: 'load', ids: range(6, 8) },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('a transaction that removes a visible row unsubscribes it with reason remove', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.applyTransaction({ remove: [{ id: '2' }] });

        await waitFor(() => expect(recorder.ids()).toEqual(['0', '1', ...range(3, 6)]));
        expect(recorder.calls[1]).toEqual({ type: 'unsubscribe', reason: 'remove', ids: ['2'] });
        expect(recorder.violations).toEqual([]);
    });

    test('async transactions applied together are reported in one batch', async () => {
        const api = await createFlatGrid();
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        for (let i = 0; i < 5; ++i) {
            api.applyTransactionAsync({ remove: [{ id: String(i) }] });
        }
        api.flushAsyncTransactions();

        await waitFor(() => expect(recorder.ids()).toEqual(range(5, 10)));
        expect(recorder.calls.slice(1)).toEqual([
            { type: 'unsubscribe', reason: 'remove', ids: range(0, 4) },
            { type: 'subscribe', reason: 'load', ids: range(6, 10) },
        ]);
        expect(recorder.violations).toEqual([]);
    });

    test('paging unsubscribes the old page and subscribes the new one with reason scroll', async () => {
        const api = await createFlatGrid({ pagination: true, paginationPageSize: 20 });
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);
        expect(recorder.ids()).toEqual(range(0, 5));

        api.paginationGoToNextPage();

        await waitFor(() => expect(recorder.ids()).toEqual(range(20, 25)));
        expect(recorder.reasons('unsubscribe')).toEqual(['scroll']);
        expect(recorder.reasons('subscribe')).toEqual(['initial', 'scroll']);
        expect(recorder.violations).toEqual([]);
    });

    test('without getRowId it warns and never calls the handlers', async () => {
        const api = await createFlatGrid({ getRowId: undefined });
        const recorder = createRecorder();

        expect(() => api.subscribeToVisibleRows(recorder.handlers)).toThrow('warning #336');
        expect(recorder.calls).toEqual([]);
    });

    test('other row models warn and never call the handlers', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'infinite',
            getRowId: (params) => params.data.id,
        });
        const recorder = createRecorder();

        expect(() => api.subscribeToVisibleRows(recorder.handlers)).toThrow('warning #311');
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

        test('expanding and collapsing a group subscribes and unsubscribes its rows with expand and collapse', async () => {
            const api = await createGroupedGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const [ireland, spain, france] = [0, 1, 2].map((i) => api.getDisplayedRowAtIndex(i)!.id!);
            const irelandRows = range(0, 4).map((i) => `Ireland-${i}`);

            api.setRowNodeExpanded(api.getRowNode(ireland)!, true);
            await waitFor(() => expect(recorder.subscribed.has('Ireland-4')).toBe(true));
            expect(recorder.subscribed.get('Ireland-0')).toMatchObject({ parentKeys: ['Ireland'], level: 1 });
            expect(recorder.subscribed.get('Ireland-0')!.route).toBeUndefined();
            expect(recorder.subscribed.get(ireland)).toMatchObject({ route: ['Ireland'], parentKeys: [] });

            api.setRowNodeExpanded(api.getRowNode(ireland)!, false);
            await waitFor(() => expect(recorder.subscribed.has(spain)).toBe(true));

            expect(recorder.calls.slice(1)).toEqual([
                // Expanding Ireland pushes the other groups out of view.
                { type: 'unsubscribe', reason: 'scroll', ids: [spain, france] },
                { type: 'subscribe', reason: 'expand', ids: irelandRows },
                { type: 'unsubscribe', reason: 'collapse', ids: irelandRows },
                { type: 'subscribe', reason: 'collapse', ids: [spain, france] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('removing the grouping unsubscribes the group rows with reason reset', async () => {
            const api = await createGroupedGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            const groups = recorder.calls[0].ids;
            expect(groups).toHaveLength(3);

            api.applyColumnState({ state: [{ colId: 'country', rowGroup: false }] });

            await waitFor(() => expect(recorder.ids()).toHaveLength(6));
            expect(recorder.calls[1]).toEqual({ type: 'unsubscribe', reason: 'reset', ids: groups });
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

        api.subscribeToVisibleRows(recorder.handlers);

        expect(recorder.ids()).toEqual(['a', 'b', 'c']);
        expect(recorder.subscribed.get('c')).toMatchObject({
            route: ['A', 'B', 'C'],
            parentKeys: ['A', 'B'],
            level: 2,
        });
        expect(recorder.subscribed.get('a')).toMatchObject({ route: ['A'], parentKeys: [], level: 0 });
    });
});
