import { waitFor } from '@testing-library/dom';
import { GridRows, TestGridsManager } from 'ag-test-utils';
import { countLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridOptions, ServerSideTransactionResult } from 'ag-grid-community';
import { GridStateModule, PaginationModule, ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * AG-10278 spike: with no `serverSideDatasource`, the SSRM creates an empty, fully loaded root store on grid start
 * so the grid can be populated purely through transactions (e.g. data pushed over a WebSocket).
 */
describe('SSRM without a datasource', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            GridStateModule,
            PaginationModule,
            ScrollApiModule,
            ServerSideRowModelApiModule,
            ServerSideRowModelModule,
            RowGroupingModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGridOptions(): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params) => String(params.data.id),
        };
    }

    test('starts empty with no loading rows', () => {
        const api = gridsManager.createGrid(null, createGridOptions());

        expect(api.getDisplayedRowCount()).toBe(0);
        expect(countLoadingRows(api)).toBe(0);
    });

    test('sync transaction adds rows to the root store', async () => {
        const api = gridsManager.createGrid(null, createGridOptions());

        const result = api.applyServerSideTransaction({
            add: [
                { id: 1, value: 'One' },
                { id: 2, value: 'Two' },
            ],
        });

        expect(result?.status).toBe('Applied');
        expect(result?.add?.length).toBe(2);
        await new GridRows(api, 'sync add').check(`
            ROOT id:<no-id>
            ├── LEAF id:1 id:1 value:"One"
            └── LEAF id:2 id:2 value:"Two"
        `);
        expect(countLoadingRows(api)).toBe(0);
    });

    test('update and remove apply to rows added by transactions', async () => {
        const api = gridsManager.createGrid(null, createGridOptions());
        api.applyServerSideTransaction({
            add: [
                { id: 1, value: 'One' },
                { id: 2, value: 'Two' },
            ],
        });

        const result = api.applyServerSideTransaction({
            update: [{ id: 1, value: 'One updated' }],
            remove: [{ id: 2 }],
        });

        expect(result?.status).toBe('Applied');
        await new GridRows(api, 'update and remove').check(`
            ROOT id:<no-id>
            └── LEAF id:1 id:1 value:"One updated"
        `);
    });

    test('async transaction adds rows to the root store', async () => {
        const api = gridsManager.createGrid(null, createGridOptions());

        const results: ServerSideTransactionResult[] = [];
        api.applyServerSideTransactionAsync({ add: [{ id: 1, value: 'One' }] }, (r) => results.push(r));
        api.flushServerSideAsyncTransactions();

        // result callbacks run on the next tick after the flush
        await waitFor(() => expect(results.map((r) => r.status)).toEqual(['Applied']));
        await new GridRows(api, 'async add').check(`
            ROOT id:<no-id>
            └── LEAF id:1 id:1 value:"One"
        `);
    });

    test('refreshServerSide keeps rows added by transactions', async () => {
        const api = gridsManager.createGrid(null, createGridOptions());
        api.applyServerSideTransaction({ add: [{ id: 1, value: 'One' }] });

        api.refreshServerSide({ purge: true });
        api.refreshServerSide();

        await new GridRows(api, 'after refresh').check(`
            ROOT id:<no-id>
            └── LEAF id:1 id:1 value:"One"
        `);
        expect(countLoadingRows(api)).toBe(0);
    });

    test('grouped rows can be populated level by level through routes', async () => {
        const api = gridsManager.createGrid(null, {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'total' },
            ],
            rowModelType: 'serverSide',
            getRowId: (params) => [...(params.parentKeys ?? []), params.data.country ?? params.data.sport].join('-'),
            isServerSideGroupOpenByDefault: () => true,
        });

        const rootResult = api.applyServerSideTransaction({ route: [], add: [{ country: 'Ireland', total: 3 }] });
        const childResult = api.applyServerSideTransaction({
            route: ['Ireland'],
            add: [
                { sport: 'Rowing', total: 1 },
                { sport: 'Boxing', total: 2 },
            ],
        });

        expect(rootResult?.status).toBe('Applied');
        expect(childResult?.status).toBe('Applied');
        expect(childResult?.add?.length).toBe(2);
        expect(countLoadingRows(api)).toBe(0);
        expect(api.getDisplayedRowCount()).toBe(3);
    });

    test('setting a datasource afterwards hands rows over without showing loading rows', async () => {
        const api = gridsManager.createGrid(null, { ...createGridOptions(), rowSelection: { mode: 'multiRow' } });
        api.applyServerSideTransaction({
            add: [
                { id: 1, value: 'One' },
                { id: 2, value: 'Two' },
            ],
        });
        const nodeOne = api.getRowNode('1')!;
        nodeOne.setSelected(true);

        let respond: (() => void) | undefined;
        api.setGridOption('serverSideDatasource', {
            getRows: (params) => {
                respond = () =>
                    params.success({
                        rowData: [
                            { id: 1, value: 'One from server' },
                            { id: 3, value: 'Three' },
                            { id: 4, value: 'Four' },
                        ],
                        rowCount: 3,
                    });
            },
        });

        await waitFor(() => expect(respond).toBeDefined());
        expect(countLoadingRows(api)).toBe(0);
        expect(api.getDisplayedRowCount()).toBe(2);

        respond!();

        await new GridRows(api, 'after handover').check(`
            ROOT id:<no-id>
            ├── LEAF selected id:1 id:1 value:"One from server"
            ├── LEAF id:3 id:3 value:"Three"
            └── LEAF id:4 id:4 value:"Four"
        `);
        expect(api.getRowNode('1')).toBe(nodeOne);
    });

    test('setting a datasource on an empty store loads from the datasource', async () => {
        const api = gridsManager.createGrid(null, createGridOptions());

        api.setGridOption('serverSideDatasource', {
            getRows: (params) => params.success({ rowData: [{ id: 10, value: 'Ten' }], rowCount: 1 }),
        });

        await new GridRows(api, 'after datasource').check(`
            ROOT id:<no-id>
            └── LEAF id:10 id:10 value:"Ten"
        `);
    });

    test('setting a datasource on an empty store uses serverSideInitialRowCount', () => {
        const api = gridsManager.createGrid(null, { ...createGridOptions(), serverSideInitialRowCount: 100 });

        api.setGridOption('serverSideDatasource', { getRows: () => {} });

        expect(api.getDisplayedRowCount()).toBe(100);
    });

    test('rows added by transactions are not evicted by maxBlocksInCache', async () => {
        const api = gridsManager.createGrid(null, {
            ...createGridOptions(),
            cacheBlockSize: 2,
            maxBlocksInCache: 1,
        });
        api.applyServerSideTransaction({
            add: Array.from({ length: 10 }, (_, i) => ({ id: i, value: `v${i}` })),
        });

        api.ensureIndexVisible(9);
        api.ensureIndexVisible(0);

        const values: string[] = [];
        api.forEachNode((node) => values.push(node.data?.value));
        expect(values).toEqual(Array.from({ length: 10 }, (_, i) => `v${i}`));
        expect(countLoadingRows(api)).toBe(0);
    });

    test('client-side sort applies to rows added by transactions', async () => {
        const api = gridsManager.createGrid(null, { ...createGridOptions(), serverSideEnableClientSideSort: true });
        api.applyServerSideTransaction({
            add: [
                { id: 1, value: 'b' },
                { id: 2, value: 'a' },
            ],
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'sorted').check(`
            ROOT id:<no-id>
            ├── LEAF id:2 id:2 value:"a"
            └── LEAF id:1 id:1 value:"b"
        `);
    });

    test('initial pagination state is restored when a datasource is set after startup', async () => {
        const api = gridsManager.createGrid(null, {
            ...createGridOptions(),
            pagination: true,
            paginationPageSize: 20,
            serverSideInitialRowCount: 100,
            initialState: { pagination: { page: 3, pageSize: 20 } },
        });

        api.setGridOption('serverSideDatasource', { getRows: () => {} });

        await waitFor(() => expect(api.paginationGetCurrentPage()).toBe(3));
    });

    test('a row count supplied by a transaction does not cap rows loaded after a handover', async () => {
        const api = gridsManager.createGrid(null, { ...createGridOptions(), cacheBlockSize: 2 });
        api.applyServerSideTransaction({
            add: [
                { id: 1, value: 'One' },
                { id: 2, value: 'Two' },
                { id: 3, value: 'Three' },
            ],
        });
        api.applyServerSideTransaction({ remove: [{ id: 3 }], rowCount: 2 });

        const serverRows = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, value: `Server ${i + 1}` }));
        api.setGridOption('serverSideDatasource', {
            getRows: (params) => {
                const { startRow = 0, endRow = 0 } = params.request;
                params.success({ rowData: serverRows.slice(startRow, endRow) });
            },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(5));
        await waitFor(() => expect(countLoadingRows(api)).toBe(0));
        const values: string[] = [];
        api.forEachNode((node) => values.push(node.data?.value));
        expect(values).toEqual(serverRows.map((row) => row.value));
    });

    test('collapsing a group with purgeClosedRowNodes keeps its transaction-built children', () => {
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }],
            rowModelType: 'serverSide',
            purgeClosedRowNodes: true,
            getRowId: (params) => [...(params.parentKeys ?? []), params.data.country ?? params.data.sport].join('-'),
            isServerSideGroupOpenByDefault: () => true,
        });
        api.applyServerSideTransaction({ route: [], add: [{ country: 'Ireland' }] });
        api.applyServerSideTransaction({ route: ['Ireland'], add: [{ sport: 'Rowing' }, { sport: 'Boxing' }] });
        const group = api.getRowNode('Ireland')!;

        api.setRowNodeExpanded(group, false);
        api.setRowNodeExpanded(group, true);

        expect(api.getDisplayedRowCount()).toBe(3);
        expect(countLoadingRows(api)).toBe(0);
    });
});
