import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type {
    GridApi,
    GridOptions,
    IServerSideGetRowsParams,
    ServerSideLevelInconsistentEvent,
} from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
}

const BLOCK_SIZE = 10;
const TOTAL_ROWS = 30;

describe('SSRM level consistency check', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    /**
     * A server holding one live copy of the data. `afterRequest` runs once the block starting at that row has been
     * served, so the data changes between that block request and the next.
     */
    function createServer(afterRequest: Record<number, (rows: Row[]) => void> = {}) {
        const rows: Row[] = Array.from({ length: TOTAL_ROWS }, (_, i) => ({ id: String(i) }));
        const requests: [number, number][] = [];
        const getRows = (params: IServerSideGetRowsParams<Row>) => {
            const { startRow, endRow } = params.request;
            requests.push([startRow!, endRow!]);
            params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
            const mutate = afterRequest[startRow!];
            delete afterRequest[startRow!];
            mutate?.(rows);
        };
        return { rows, requests, getRows };
    }

    async function createGrid(getRows: (params: IServerSideGetRowsParams<Row>) => void, options: GridOptions<Row>) {
        const events: ServerSideLevelInconsistentEvent<Row>[] = [];
        const api: GridApi<Row> = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }],
            rowModelType: 'serverSide',
            cacheBlockSize: BLOCK_SIZE,
            suppressRowVirtualisation: true,
            maxConcurrentDatasourceRequests: 1,
            getRowId: ({ data }) => data.id,
            serverSideDatasource: { getRows },
            onServerSideLevelInconsistent: (event) => events.push(event),
            ...options,
        });
        await waitForLoadingFinished(api);
        return { api, events };
    }

    /** The event is dispatched on the tick after the last block lands, once the loader finds nothing left to load. */
    async function waitForLoadingFinished(api: GridApi<Row>) {
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(0);
    }

    function displayedIds(api: GridApi<Row>): (string | undefined)[] {
        const ids: (string | undefined)[] = [];
        api.forEachNode((node) => ids.push(node.id));
        return ids;
    }

    describe('disabled (default)', () => {
        test('requests exactly one block per request and fires no event when data changes mid-read', async () => {
            const server = createServer({ 0: (rows) => rows.splice(3, 1) });
            const { api, events } = await createGrid(server.getRows, {});

            expect(server.requests).toEqual([
                [0, 10],
                [10, 20],
                [20, 30],
            ]);
            expect(events).toEqual([]);
            expect(displayedIds(api)).toEqual([
                ...Array.from({ length: 10 }, (_, i) => String(i)),
                ...Array.from({ length: 19 }, (_, i) => String(i + 11)),
            ]);
        });
    });

    describe('enabled', () => {
        test('requests one extra row per block and does not display it', async () => {
            const server = createServer();
            const { api, events } = await createGrid(server.getRows, { serverSideCheckLevelConsistency: true });

            expect(server.requests).toEqual([
                [0, 11],
                [10, 21],
                [20, 31],
            ]);
            expect(displayedIds(api)).toEqual(Array.from({ length: TOTAL_ROWS }, (_, i) => String(i)));
            expect(api.getDisplayedRowCount()).toBe(TOTAL_ROWS);
            expect(events).toEqual([]);
        });

        test('does not display the extra row before the next block has loaded', async () => {
            const server = createServer();
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                if (params.request.startRow === 0) {
                    server.getRows(params);
                }
            };
            const api: GridApi<Row> = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }],
                rowModelType: 'serverSide',
                cacheBlockSize: BLOCK_SIZE,
                serverSideInitialRowCount: TOTAL_ROWS,
                suppressRowVirtualisation: true,
                maxConcurrentDatasourceRequests: 1,
                serverSideCheckLevelConsistency: true,
                getRowId: ({ data }) => data.id,
                serverSideDatasource: { getRows },
            });

            await waitFor(() => expect(api.getDisplayedRowAtIndex(9)?.id).toBe('9'));
            expect(api.getDisplayedRowAtIndex(10)?.stub).toBe(true);
        });

        test('applies the option when it is changed after the grid is created', async () => {
            const server = createServer();
            const { api } = await createGrid(server.getRows, {});
            server.requests.length = 0;

            api.setGridOption('serverSideCheckLevelConsistency', true);
            await waitFor(() => expect(server.requests).toHaveLength(3));

            expect(server.requests).toEqual([
                [0, 11],
                [10, 21],
                [20, 31],
            ]);
        });

        test('does not report a refresh of consistent data', async () => {
            const server = createServer();
            const { api, events } = await createGrid(server.getRows, { serverSideCheckLevelConsistency: true });

            api.refreshServerSide({ purge: false });
            await waitFor(() => expect(server.requests).toHaveLength(6));
            await waitForLoadingFinished(api);

            expect(events).toEqual([]);
        });

        test('infers the last row from a short block as before', async () => {
            const server = createServer();
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                const { startRow, endRow } = params.request;
                params.success({ rowData: server.rows.slice(startRow, endRow) });
            };
            const { api, events } = await createGrid(getRows, { serverSideCheckLevelConsistency: true });

            expect(api.getDisplayedRowCount()).toBe(TOTAL_ROWS);
            expect(displayedIds(api)).toEqual(Array.from({ length: TOTAL_ROWS }, (_, i) => String(i)));
            expect(events).toEqual([]);
        });

        test('reports dropped rows when a row above a boundary is deleted between block reads', async () => {
            const server = createServer({ 0: (rows) => rows.splice(3, 1) });
            const { events } = await createGrid(server.getRows, { serverSideCheckLevelConsistency: true });

            expect(events).toHaveLength(1);
            expect(events[0].route).toEqual([]);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
        });

        test('reports duplicated rows when a row above a boundary is inserted between block reads', async () => {
            const server = createServer({ 0: (rows) => rows.unshift({ id: 'new' }) });
            const { events } = await createGrid(server.getRows, { serverSideCheckLevelConsistency: true });

            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([{ type: 'duplicated', boundaryIndex: 10, rowIds: ['9'] }]);
        });

        test('reports dropped rows when the later block loads first', async () => {
            const rows: Row[] = Array.from({ length: TOTAL_ROWS }, (_, i) => ({ id: String(i) }));
            const pending = new Map<number, IServerSideGetRowsParams<Row>>();
            let respondImmediately = false;
            const success = (params: IServerSideGetRowsParams<Row>) =>
                params.success({
                    rowData: rows.slice(params.request.startRow, params.request.endRow),
                    rowCount: rows.length,
                });
            const respond = (startRow: number) => {
                success(pending.get(startRow)!);
                pending.delete(startRow);
            };
            const api: GridApi<Row> = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }],
                rowModelType: 'serverSide',
                cacheBlockSize: BLOCK_SIZE,
                serverSideInitialRowCount: TOTAL_ROWS,
                suppressRowVirtualisation: true,
                maxConcurrentDatasourceRequests: -1,
                serverSideCheckLevelConsistency: true,
                getRowId: ({ data }) => data.id,
                serverSideDatasource: {
                    getRows: (params) => {
                        if (respondImmediately) {
                            success(params);
                        } else {
                            pending.set(params.request.startRow!, params);
                        }
                    },
                },
            });
            const events: ServerSideLevelInconsistentEvent<Row>[] = [];
            api.addEventListener('serverSideLevelInconsistent', (event) => events.push(event));
            await waitFor(() => expect([...pending.keys()].sort((a, b) => a - b)).toEqual([0, 10, 20]));

            respond(20);
            respond(10);
            // keeps the row count, so no further blocks are loaded
            rows.unshift({ id: 'new' });
            rows.pop();
            respondImmediately = true;
            respond(0);
            await waitForLoadingFinished(api);

            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
        });

        test('coalesces several boundaries into one event per level', async () => {
            const server = createServer({
                0: (rows) => rows.splice(3, 1),
                10: (rows) => rows.splice(12, 1),
            });
            const { events } = await createGrid(server.getRows, { serverSideCheckLevelConsistency: true });

            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([
                { type: 'dropped', boundaryIndex: 10, rowIds: [] },
                { type: 'dropped', boundaryIndex: 20, rowIds: [] },
            ]);
        });

        test('reports the route of a child level', async () => {
            const server = createServer({ 0: (rows) => rows.splice(3, 1) });
            const { api, events } = await createGrid(
                (params) => {
                    if (params.request.groupKeys.length === 0) {
                        params.success({ rowData: [{ id: 'A' }], rowCount: 1 });
                        return;
                    }
                    server.getRows(params);
                },
                {
                    columnDefs: [{ field: 'id', rowGroup: true, hide: true }],
                    serverSideCheckLevelConsistency: true,
                    getRowId: ({ data, level }) => (level === 0 ? data.id : `A-${data.id}`),
                }
            );

            api.getRowNode('A')!.setExpanded(true);
            await waitFor(() => expect(events).toHaveLength(1));
            expect(events[0].route).toEqual(['A']);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
        });

        test('is inert without getRowId', async () => {
            enableDevValidations({ throwOn: [] });
            const consoleWarnSpy: MockInstance = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const server = createServer({ 0: (rows) => rows.splice(3, 1) });
                const { events } = await createGrid(server.getRows, {
                    serverSideCheckLevelConsistency: true,
                    getRowId: undefined,
                });

                expect(server.requests).toEqual([
                    [0, 10],
                    [10, 20],
                    [20, 30],
                ]);
                expect(events).toEqual([]);
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.stringContaining('`serverSideCheckLevelConsistency` requires the `getRowId` callback'),
                    expect.any(String)
                );
            } finally {
                consoleWarnSpy.mockRestore();
                enableDevValidations();
            }
        });
    });
});
