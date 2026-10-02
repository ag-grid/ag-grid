import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from 'ag-test-utils';
import type { MockInstance } from 'vitest';

import type {
    GridApi,
    GridOptions,
    IServerSideGetRowsParams,
    Module,
    ServerSideLevelInconsistentEvent,
} from 'ag-grid-community';
import { GRAND_TOTAL_ROW_ID, ScrollApiModule, enableDevValidations } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

interface Row {
    id: string;
    value?: number;
    group?: boolean;
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
    function createServer(afterRequest: Record<number, (rows: Row[]) => void> = {}, rows = makeRows(TOTAL_ROWS)) {
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

    function makeRows(count: number, prefix = ''): Row[] {
        return ids(0, count, prefix).map((id) => ({ id }));
    }

    function ids(start: number, end: number, prefix = ''): string[] {
        return Array.from({ length: end - start }, (_, i) => prefix + (start + i));
    }

    /** A server that holds every request until `respond` is called with its start row. */
    function createDeferredServer() {
        const rows = makeRows(TOTAL_ROWS);
        const requests: [number, number][] = [];
        const pending = new Map<number, IServerSideGetRowsParams<Row>>();
        let respondImmediately = false;
        const success = (params: IServerSideGetRowsParams<Row>) => {
            const { startRow, endRow } = params.request;
            params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
        };
        return {
            rows,
            requests,
            pending,
            getRows: (params: IServerSideGetRowsParams<Row>) => {
                const { startRow, endRow } = params.request;
                requests.push([startRow!, endRow!]);
                if (respondImmediately) {
                    success(params);
                } else {
                    pending.set(startRow!, params);
                }
            },
            respond: (startRow: number) => {
                const params = pending.get(startRow)!;
                pending.delete(startRow);
                success(params);
            },
            respondToAll: () => {
                respondImmediately = true;
                pending.forEach(success);
                pending.clear();
            },
        };
    }

    async function createGrid(
        getRows: (params: IServerSideGetRowsParams<Row>) => void,
        options: GridOptions<Row>,
        modules?: Module[]
    ) {
        const grid = startGrid(getRows, options, modules);
        await waitForLoadingFinished(grid.api);
        return grid;
    }

    function startGrid(
        getRows: (params: IServerSideGetRowsParams<Row>) => void,
        options: GridOptions<Row>,
        modules?: Module[]
    ) {
        const events: ServerSideLevelInconsistentEvent<Row>[] = [];
        const api: GridApi<Row> = gridsManager.createGrid(
            'myGrid',
            {
                columnDefs: [{ field: 'id' }],
                rowModelType: 'serverSide',
                cacheBlockSize: BLOCK_SIZE,
                suppressRowVirtualisation: true,
                maxConcurrentDatasourceRequests: 1,
                getRowId: ({ data }) => data.id,
                serverSideDatasource: { getRows },
                onServerSideLevelInconsistent: (event) => events.push(event),
                ...options,
            },
            { modules }
        );
        return { api, events };
    }

    /** The event is dispatched on the tick after the last block lands, once the loader finds nothing left to load. */
    async function waitForLoadingFinished(api: GridApi<Row>) {
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(0);
    }

    function displayedIds(api: GridApi<Row>): (string | undefined)[] {
        const result: (string | undefined)[] = [];
        for (let i = 0, count = api.getDisplayedRowCount(); i < count; ++i) {
            result.push(api.getDisplayedRowAtIndex(i)?.id);
        }
        return result;
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
    describe('with data changing between block reads', () => {
        const enabled: GridOptions<Row> = { serverSideCheckLevelConsistency: true };

        test('reports every affected boundary once per load cycle', async () => {
            const hooks: Record<number, (rows: Row[]) => void> = {
                0: (rows) => rows.splice(3, 1),
                10: (rows) => rows.splice(12, 0, { id: 'A' }, { id: 'B' }),
            };
            const server = createServer(hooks);
            const { api, events } = await createGrid(server.getRows, enabled);

            await waitFor(() => expect(events).toHaveLength(1));
            expect(events[0].inconsistencies).toEqual([
                { type: 'dropped', boundaryIndex: 10, rowIds: [] },
                { type: 'duplicated', boundaryIndex: 20, rowIds: ['19', '20'] },
            ]);
            const displayed = displayedIds(api);
            expect(new Set(displayed).size).toBe(displayed.length);
            expect(displayed).toEqual([...ids(0, 10), '11', '12', 'A', 'B', ...ids(13, 30)]);

            hooks[0] = (rows) => rows.splice(5, 1);
            api.refreshServerSide({ purge: true });
            await waitFor(() => expect(events).toHaveLength(2));
            await waitForLoadingFinished(api);

            expect(events[1].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
            expect(events).toHaveLength(2);
        });

        test('reports a row that a changed sort value moves across a boundary', async () => {
            const rows: Row[] = ids(0, TOTAL_ROWS).map((id) => ({ id, value: Number(id) }));
            let movedRow = false;
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                const { startRow, endRow, sortModel } = params.request;
                const sorted = sortModel.length ? [...rows].sort((a, b) => a.value! - b.value!) : rows;
                params.success({ rowData: sorted.slice(startRow, endRow), rowCount: rows.length });
                if (!movedRow) {
                    movedRow = true;
                    rows[5].value = 15.5;
                }
            };
            const { api, events } = await createGrid(getRows, {
                ...enabled,
                columnDefs: [{ field: 'id' }, { field: 'value', sort: 'asc' }],
            });

            await waitFor(() => expect(events).toHaveLength(1));
            expect(events[0].inconsistencies).toEqual([{ type: 'duplicated', boundaryIndex: 10, rowIds: ['5'] }]);
            await waitForLoadingFinished(api);
            expect(displayedIds(api)).toEqual([...ids(0, 5), ...ids(6, 16), '5', ...ids(16, 30)]);
        });

        test.each<[string, Record<number, (rows: Row[]) => void>]>([
            [
                'a row deleted after the extra row',
                { 0: (rows) => rows.splice(15, 1), 10: (rows) => rows.splice(25, 1) },
            ],
            [
                'a row deleted and another inserted above the boundary',
                { 0: (rows) => rows.splice(3, 1, { id: 'new' }) },
            ],
            ['rows reordered inside a block already read', { 10: (rows) => rows.splice(3, 2, rows[4], rows[3]) }],
        ])('does not report %s', async (_, hooks) => {
            const server = createServer(hooks);
            const { api, events } = await createGrid(server.getRows, enabled);

            expect(hooks).toEqual({});
            expect(server.requests.map(([start]) => start)).toEqual([0, 10, 20]);
            expect(api.getDisplayedRowCount()).toBe(server.rows.length);
            expect(events).toEqual([]);
        });

        test('reports a boundary row replaced in place as dropped', async () => {
            const server = createServer({ 0: (rows) => rows.splice(10, 1, { id: 'X' }) });
            const { api, events } = await createGrid(server.getRows, enabled);

            // Known limitation: no row is missing, but the row at the boundary has changed identity.
            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
            expect(displayedIds(api)).toEqual(server.rows.map(({ id }) => id));
        });

        test('compares a reloaded block only with neighbours still in the cache', async () => {
            const hooks: Record<number, (rows: Row[]) => void> = {};
            const server = createServer(hooks, makeRows(60));
            const { api, events } = await createGrid(
                server.getRows,
                { ...enabled, suppressRowVirtualisation: false, rowBuffer: 0, maxBlocksInCache: 1 },
                [ScrollApiModule]
            );
            expect(server.requests).toEqual([[0, 11]]);

            api.ensureIndexVisible(25);
            await waitFor(() => expect(api.getRowNode('25')).toBeDefined());
            await waitForLoadingFinished(api);
            expect(api.getRowNode('0')).toBeUndefined();

            server.rows.splice(3, 1);
            api.ensureIndexVisible(15);
            await waitFor(() => expect(events).toHaveLength(1));
            expect(events[0].inconsistencies).toEqual([{ type: 'duplicated', boundaryIndex: 20, rowIds: ['20'] }]);

            api.ensureIndexVisible(0);
            await waitFor(() => expect(api.getRowNode('0')).toBeDefined());
            await waitForLoadingFinished(api);
            expect(server.requests.map(([start]) => start)).toEqual([0, 20, 10, 0]);
            expect(events).toHaveLength(1);
        });

        test('does not check blocks when the server ignores the extra row', async () => {
            const server = createServer({ 0: (rows) => rows.splice(3, 1) });
            const endRows: number[] = [];
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                const { startRow, endRow } = params.request;
                endRows.push(endRow!);
                server.getRows({ ...params, request: { ...params.request, endRow: startRow! + BLOCK_SIZE } });
            };
            const { api, events } = await createGrid(getRows, enabled);

            expect(endRows).toEqual([11, 21, 31]);
            expect(events).toEqual([]);
            expect(displayedIds(api)).toEqual([...ids(0, 10), ...ids(11, 30)]);
        });

        test.each<[string, (rows: Row[]) => void, ServerSideLevelInconsistentEvent<Row>['inconsistencies'], number]>([
            [
                'shrinks above the last boundary',
                (rows) => rows.splice(5, 1),
                [{ type: 'dropped', boundaryIndex: 20, rowIds: [] }],
                29,
            ],
            ['shrinks below the last boundary', (rows) => rows.splice(25, 1), [], 29],
            ['grows at the end', (rows) => rows.push({ id: 'end' }), [], 31],
        ])('handles a row count that %s', async (_, mutate, inconsistencies, rowCount) => {
            const server = createServer({ 10: mutate });
            const { api, events } = await createGrid(server.getRows, enabled);

            expect(api.getDisplayedRowCount()).toBe(rowCount);
            expect(events.flatMap((event) => event.inconsistencies)).toEqual(inconsistencies);
        });

        test('reports without a row count from the server', async () => {
            const server = createServer({ 0: (rows) => rows.splice(3, 1) });
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                server.getRows({ ...params, success: ({ rowData }) => params.success({ rowData }) });
            };
            const { api, events } = await createGrid(getRows, enabled);

            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
            expect(api.getDisplayedRowCount()).toBe(29);
        });

        test('does not report consistent blocks that load in reverse order', async () => {
            const server = createDeferredServer();
            const { api, events } = startGrid(server.getRows, {
                ...enabled,
                serverSideInitialRowCount: TOTAL_ROWS,
                maxConcurrentDatasourceRequests: -1,
            });
            await waitFor(() => expect([...server.pending.keys()].sort((a, b) => a - b)).toEqual([0, 10, 20]));

            server.respond(20);
            server.respond(10);
            server.respond(0);
            await waitForLoadingFinished(api);

            expect(displayedIds(api)).toEqual(ids(0, TOTAL_ROWS));
            expect(events).toEqual([]);
        });

        test('reports a duplicate that the grid has already resolved by the time the event fires', async () => {
            const server = createServer({ 0: (rows) => rows.unshift({ id: 'new' }) });
            const { api, events } = startGrid(server.getRows, enabled);
            const displayedOnEvent: (string | undefined)[][] = [];
            api.addEventListener('serverSideLevelInconsistent', () => displayedOnEvent.push(displayedIds(api)));
            await waitFor(() => expect(events).toHaveLength(1));
            await waitForLoadingFinished(api);

            const serverIds = server.rows.map(({ id }) => id);
            expect(events[0].inconsistencies).toEqual([{ type: 'duplicated', boundaryIndex: 10, rowIds: ['9'] }]);
            expect(displayedOnEvent).toEqual([serverIds]);
            expect(displayedIds(api)).toEqual(serverIds);
        });

        test.each<
            [boolean, string, (rows: Row[]) => void, ServerSideLevelInconsistentEvent<Row>['inconsistencies'], string[]]
        >([
            [
                false,
                'a deletion',
                (rows) => rows.splice(3, 1),
                [{ type: 'dropped', boundaryIndex: 10, rowIds: [] }],
                [...ids(0, 10), ...ids(11, 30)],
            ],
            [
                true,
                'a deletion',
                (rows) => rows.splice(3, 1),
                [{ type: 'dropped', boundaryIndex: 10, rowIds: [] }],
                [...ids(0, 10), ...ids(11, 30)],
            ],
            [
                false,
                'an insertion',
                (rows) => rows.unshift({ id: 'new' }),
                [{ type: 'duplicated', boundaryIndex: 10, rowIds: ['9'] }],
                ['new', ...ids(0, 30)],
            ],
            [
                true,
                'an insertion',
                (rows) => rows.unshift({ id: 'new' }),
                [{ type: 'duplicated', boundaryIndex: 10, rowIds: ['9'] }],
                ['new', ...ids(0, 30)],
            ],
        ])(
            'reports a refresh (purge: %s) when %s above a boundary lands between its block reads',
            async (purge, _, mutate, inconsistencies, displayed) => {
                const hooks: Record<number, (rows: Row[]) => void> = {};
                const server = createServer(hooks);
                const { api, events } = await createGrid(server.getRows, enabled);
                expect(events).toEqual([]);

                hooks[0] = mutate;
                api.refreshServerSide({ purge });
                await waitFor(() => expect(events).toHaveLength(1));
                await waitForLoadingFinished(api);

                expect(events[0].inconsistencies).toEqual(inconsistencies);
                expect(displayedIds(api)).toEqual(displayed);
                expect(events).toHaveLength(1);
            }
        );

        test.each<[string, (api: GridApi<Row>, rows: Row[]) => void]>([
            [
                'add',
                (api, rows) => {
                    rows.unshift({ id: 'new' });
                    api.applyServerSideTransaction({ add: [{ id: 'new' }], addIndex: 0 });
                },
            ],
            [
                'remove',
                (api, rows) => {
                    rows.splice(3, 1);
                    api.applyServerSideTransaction({ remove: [{ id: '3' }] });
                },
            ],
        ])('does not report a transaction (%s) applied between block reads', async (_, applyTransaction) => {
            const server = createServer({ 0: (rows) => applyTransaction(grid.api, rows) });
            const grid = startGrid(server.getRows, enabled);
            await waitForLoadingFinished(grid.api);
            await waitFor(() => expect(displayedIds(grid.api)).toEqual(server.rows.map(({ id }) => id)));

            expect(grid.events).toEqual([]);
        });

        test('reports with client-side sorting once the level is fully loaded and sorted', async () => {
            const rows: Row[] = ids(0, TOTAL_ROWS).map((id) => ({ id, value: Number(id) }));
            const server = createServer({ 0: () => rows.splice(3, 1) }, rows);
            const { api, events } = await createGrid(server.getRows, {
                ...enabled,
                serverSideEnableClientSideSort: true,
                columnDefs: [{ field: 'id' }, { field: 'value', sort: 'desc' }],
            });

            expect(displayedIds(api)[0]).toBe('29');
            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
        });

        test('keeps the grand total row out of the comparison', async () => {
            const server = createServer({ 0: (rows) => rows.splice(3, 1) });
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                server.getRows({
                    ...params,
                    success: ({ rowData, rowCount }) =>
                        params.success({ rowData: [{ id: GRAND_TOTAL_ROW_ID, value: 99 }, ...rowData], rowCount }),
                });
            };
            const { api, events } = await createGrid(
                getRows,
                { ...enabled, grandTotalRow: 'bottom', columnDefs: [{ field: 'id' }, { field: 'value' }] },
                [RowGroupingModule]
            );

            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);
            expect(displayedIds(api)).toEqual([...ids(0, 10), ...ids(11, 30), 'rowGroupFooter_ROOT_NODE_ID']);
            const lastRow = api.getDisplayedRowAtIndex(api.getDisplayedRowCount() - 1);
            expect(lastRow?.footer).toBe(true);
            expect(lastRow?.data?.value).toBe(99);
        });

        test('compares a block that failed to load once it is retried', async () => {
            const server = createServer();
            let failed = false;
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                if (params.request.startRow === 10 && !failed) {
                    failed = true;
                    params.fail();
                    return;
                }
                server.getRows(params);
            };
            const { api, events } = startGrid(getRows, enabled);
            await waitFor(() => expect(server.requests.map(([start]) => start)).toEqual([0, 20]));
            await waitFor(() => expect(api.getDisplayedRowAtIndex(25)?.id).toBe('25'));
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(15)?.failedLoad).toBe(true);
            expect(events).toEqual([]);

            server.rows.splice(3, 1);
            api.retryServerSideLoads();
            await waitFor(() => expect(events).toHaveLength(1));

            expect(events[0].inconsistencies).toEqual([
                { type: 'dropped', boundaryIndex: 10, rowIds: [] },
                { type: 'duplicated', boundaryIndex: 20, rowIds: ['20'] },
            ]);
        });

        test('does not dispatch when the grid is destroyed before loading finishes', async () => {
            const server = createDeferredServer();
            const { api, events } = startGrid(server.getRows, { ...enabled, serverSideInitialRowCount: TOTAL_ROWS });
            await waitFor(() => expect(server.pending.has(0)).toBe(true));
            server.respond(0);
            server.rows.splice(3, 1);
            await waitFor(() => expect(server.pending.has(10)).toBe(true));
            server.respond(10);
            await waitFor(() => expect(server.pending.has(20)).toBe(true));

            server.respond(20);
            api.destroy();
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);

            expect(events).toEqual([]);
        });

        test('discards a pending report when the option is turned off', async () => {
            const server = createDeferredServer();
            const { api, events } = startGrid(server.getRows, { ...enabled, serverSideInitialRowCount: TOTAL_ROWS });
            await waitFor(() => expect(server.pending.has(0)).toBe(true));
            server.respond(0);
            server.rows.splice(3, 1);
            await waitFor(() => expect(server.pending.has(10)).toBe(true));
            server.respond(10);
            await waitFor(() => expect(server.pending.has(20)).toBe(true));

            server.requests.length = 0;
            api.setGridOption('serverSideCheckLevelConsistency', false);
            server.respondToAll();
            await waitForLoadingFinished(api);

            expect(server.requests).toEqual([
                [0, 10],
                [10, 20],
                [20, 30],
            ]);
            expect(events).toEqual([]);
        });

        test('does not compare a block with rows applied by applyServerSideRowData', async () => {
            const server = createDeferredServer();
            const { api, events } = startGrid(server.getRows, { ...enabled, serverSideInitialRowCount: TOTAL_ROWS });
            await waitFor(() => expect(server.pending.has(0)).toBe(true));
            server.respond(0);
            await waitFor(() => expect(server.pending.has(10)).toBe(true));

            server.rows.unshift({ id: 'new' });
            api.applyServerSideRowData({
                successParams: { rowData: server.rows.slice(0, BLOCK_SIZE), rowCount: server.rows.length },
            });
            server.respondToAll();
            await waitForLoadingFinished(api);

            expect(displayedIds(api)).toEqual(server.rows.map(({ id }) => id));
            expect(events).toEqual([]);
        });

        test('reports each level with its own route', async () => {
            const root = createServer({ 0: (rows) => rows.splice(3, 1) }, makeRows(TOTAL_ROWS, 'G'));
            const child = createServer({ 0: (rows) => rows.unshift({ id: 'new' }) });
            const { api, events } = await createGrid(
                (params) => (params.request.groupKeys.length === 0 ? root : child).getRows(params),
                {
                    ...enabled,
                    columnDefs: [{ field: 'id', rowGroup: true, hide: true }],
                    getRowId: ({ data, level }) => (level === 0 ? data.id : `G0-${data.id}`),
                }
            );
            expect(events).toHaveLength(1);
            expect(events[0].route).toEqual([]);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);

            api.getRowNode('G0')!.setExpanded(true);
            await waitFor(() => expect(events).toHaveLength(2));

            expect(events[1].route).toEqual(['G0']);
            expect(events[1].inconsistencies).toEqual([{ type: 'duplicated', boundaryIndex: 10, rowIds: ['G0-9'] }]);
        });
    });
    describe('dispatch per level', () => {
        const enabled: GridOptions<Row> = { serverSideCheckLevelConsistency: true };

        async function respondTo(server: ReturnType<typeof createDeferredServer>, startRow: number) {
            await waitFor(() => expect([...server.pending.keys()]).toEqual([startRow]));
            server.respond(startRow);
        }

        test('keeps a pending report through a refresh started before the level settles', async () => {
            const server = createDeferredServer();
            const { api, events } = startGrid(server.getRows, { ...enabled, serverSideInitialRowCount: TOTAL_ROWS });
            await respondTo(server, 0);
            server.rows.splice(3, 1);
            await respondTo(server, 10);
            await waitFor(() => expect([...server.pending.keys()]).toEqual([20]));

            api.refreshServerSide({ purge: false });
            server.respond(20);
            await respondTo(server, 0);
            server.rows.splice(14, 1);
            await respondTo(server, 10);
            server.respondToAll();
            await waitFor(() => expect(events).toHaveLength(1));
            await waitForLoadingFinished(api);

            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([
                { type: 'dropped', boundaryIndex: 10, rowIds: [] },
                { type: 'duplicated', boundaryIndex: 20, rowIds: ['21'] },
            ]);
        });

        test('reports a level without waiting for another level to finish loading', async () => {
            const inconsistent = createServer({ 0: (rows) => rows.splice(3, 1) });
            const held: IServerSideGetRowsParams<Row>[] = [];
            const { api, events } = await createGrid(
                (params) => {
                    const [groupKey] = params.request.groupKeys;
                    if (groupKey === undefined) {
                        params.success({ rowData: [{ id: 'G0' }, { id: 'G1' }], rowCount: 2 });
                    } else if (groupKey === 'G1') {
                        held.push(params);
                    } else {
                        inconsistent.getRows(params);
                    }
                },
                {
                    ...enabled,
                    maxConcurrentDatasourceRequests: 2,
                    columnDefs: [{ field: 'id', rowGroup: true, hide: true }],
                    getRowId: ({ data, level, parentKeys }) => (level === 0 ? data.id : `${parentKeys![0]}-${data.id}`),
                }
            );

            api.getRowNode('G1')!.setExpanded(true);
            await waitFor(() => expect(held).toHaveLength(1));
            api.getRowNode('G0')!.setExpanded(true);
            await waitFor(() => expect(events).toHaveLength(1));

            expect(held).toHaveLength(1);
            expect(events[0].route).toEqual(['G0']);
            expect(events[0].inconsistencies).toEqual([{ type: 'dropped', boundaryIndex: 10, rowIds: [] }]);

            held[0].success({ rowData: [{ id: 'x' }], rowCount: 1 });
            await waitFor(() => expect(api.getRowNode('G1-x')).toBeDefined());
            await waitForLoadingFinished(api);
            expect(events).toHaveLength(1);
        });

        test('coalesces a level loading block by block with no row count into one event', async () => {
            const server = createServer({
                0: (rows) => rows.splice(3, 1),
                10: (rows) => rows.splice(12, 1),
            });
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                server.getRows({ ...params, success: ({ rowData }) => params.success({ rowData }) });
            };
            const { api, events } = await createGrid(getRows, enabled);

            expect(server.requests.map(([start]) => start)).toEqual([0, 10, 20]);
            expect(api.getDisplayedRowCount()).toBe(28);
            expect(events).toHaveLength(1);
            expect(events[0].inconsistencies).toEqual([
                { type: 'dropped', boundaryIndex: 10, rowIds: [] },
                { type: 'dropped', boundaryIndex: 20, rowIds: [] },
            ]);
        });

        test('delivers reports while the same level is refreshed on every response against shifting data', async () => {
            const server = createServer();
            let responsesLeft = 0;
            let added = 0;
            const getRows = (params: IServerSideGetRowsParams<Row>) => {
                server.getRows(params);
                if (responsesLeft > 0) {
                    server.rows.unshift({ id: `new${added++}` });
                    if (--responsesLeft % 3 === 0) {
                        api.refreshServerSide({ purge: false });
                    }
                }
            };
            const { api, events } = await createGrid(getRows, enabled);
            expect(events).toEqual([]);

            for (let cycle = 1; cycle <= 2; ++cycle) {
                responsesLeft = 9;
                api.refreshServerSide({ purge: false });
                await waitFor(() => expect(responsesLeft).toBe(0));
                await waitFor(() => expect(events).toHaveLength(cycle));
                await waitForLoadingFinished(api);
            }

            expect(events).toHaveLength(2);
            for (const { inconsistencies } of events) {
                const boundaries = inconsistencies.map(({ boundaryIndex }) => boundaryIndex);
                expect(new Set(boundaries).size).toBe(boundaries.length);
                for (const { boundaryIndex, rowIds } of inconsistencies) {
                    expect(boundaryIndex % BLOCK_SIZE).toBe(0);
                    expect(new Set(rowIds).size).toBe(rowIds.length);
                }
            }
            const displayed = displayedIds(api);
            expect(new Set(displayed).size).toBe(displayed.length);
            expect(displayed).toEqual(server.rows.map(({ id }) => id));
        });
    });

    describe('tree data against a server snapshot replaced once a second', () => {
        const FOLDER_COUNT = 25;
        const LEAF_COUNT = 25;
        const MS_PER_REQUEST = 500;

        interface Snapshot {
            root: Row[];
            children: Record<string, Row[]>;
        }

        function makeSnapshot(): Snapshot {
            const root = ids(0, FOLDER_COUNT, 'F').map((id, i) => ({ id, value: 1000 - i, group: true }));
            const children: Record<string, Row[]> = {};
            for (const { id } of root) {
                children[id] = ids(0, LEAF_COUNT, `${id}-L`).map((leafId, i) => ({ id: leafId, value: 100 - i }));
            }
            return { root, children };
        }

        /** Every request takes `MS_PER_REQUEST` of server time; each second the next change replaces the snapshot. */
        function createTreeServer(changes: ((snapshot: Snapshot) => void)[]) {
            let snapshot = makeSnapshot();
            let clock = 0;
            const sorted = (rows: Row[], sortModel: IServerSideGetRowsParams['request']['sortModel']) => {
                const [sort] = sortModel;
                const direction = sort?.sort === 'asc' ? 1 : -1;
                return sort ? [...rows].sort((a, b) => direction * (a.value! - b.value!)) : rows;
            };
            return {
                getRows: (params: IServerSideGetRowsParams<Row>) => {
                    const { groupKeys, startRow, endRow, sortModel } = params.request;
                    const rows = groupKeys.length ? snapshot.children[groupKeys[0]] : snapshot.root;
                    params.success({ rowData: sorted(rows, sortModel).slice(startRow, endRow), rowCount: rows.length });
                    clock += MS_PER_REQUEST;
                    const change = clock % 1000 === 0 ? changes.shift() : undefined;
                    if (change) {
                        const next = structuredClone(snapshot);
                        change(next);
                        snapshot = next;
                    }
                },
                sortedIds: (rows: (snapshot: Snapshot) => Row[]) =>
                    sorted(rows(snapshot), [{ colId: 'value', sort: 'desc' }]).map(({ id }) => id),
            };
        }

        function levelIds(api: GridApi<Row>, level: number): (string | undefined)[] {
            return displayedIds(api).filter((id) => api.getRowNode(id!)?.level === level);
        }

        async function runScenario(changes: ((snapshot: Snapshot) => void)[]) {
            const server = createTreeServer(changes);
            const grid = await createGrid(
                server.getRows,
                {
                    ...{ serverSideCheckLevelConsistency: true },
                    treeData: true,
                    isServerSideGroup: (data) => !!data.group,
                    getServerSideGroupKey: (data) => data.id,
                    columnDefs: [{ field: 'value', sort: 'desc' }],
                    autoGroupColumnDef: { field: 'id' },
                },
                [TreeDataModule]
            );
            const rootEvents = [...grid.events];

            grid.api.getRowNode('F0')!.setExpanded(true);
            await waitFor(() =>
                expect(levelIds(grid.api, 1)).toHaveLength(server.sortedIds((s) => s.children.F0).length)
            );
            await waitForLoadingFinished(grid.api);
            return { ...grid, server, rootEvents };
        }

        const bumpLeaf = (folder: string, leaf: number, value: number) => (snapshot: Snapshot) => {
            snapshot.children[folder].find(({ id }) => id === `${folder}-L${leaf}`)!.value = value;
        };
        const insertLeaf = (folder: string, id: string, value: number) => (snapshot: Snapshot) => {
            snapshot.children[folder].push({ id: `${folder}-${id}`, value });
        };

        test('reports each level that a change stream shifts while it is read', async () => {
            const { api, events, rootEvents, server } = await runScenario([
                (snapshot) => {
                    snapshot.root.find(({ id }) => id === 'F2')!.value = 0;
                    snapshot.root.splice(5, 1);
                },
                insertLeaf('F0', 'new1', 500),
                bumpLeaf('F0', 20, 400),
                insertLeaf('F0', 'new2', 300),
                bumpLeaf('F0', 3, -1),
                insertLeaf('F0', 'new3', 200),
            ]);

            expect(rootEvents.map(({ route }) => route)).toEqual([[]]);
            expect(events.map(({ route }) => route)).toEqual([[], ['F0']]);
            expect(events.map(({ route, inconsistencies }) => ({ route, inconsistencies }))).toMatchInlineSnapshot(`
              [
                {
                  "inconsistencies": [
                    {
                      "boundaryIndex": 10,
                      "rowIds": [
                        "F10",
                        "F11",
                      ],
                      "type": "duplicated",
                    },
                    {
                      "boundaryIndex": 20,
                      "rowIds": [
                        "F2",
                      ],
                      "type": "duplicated",
                    },
                  ],
                  "route": [],
                },
                {
                  "inconsistencies": [
                    {
                      "boundaryIndex": 10,
                      "rowIds": [
                        "F0-L8",
                        "F0-L7",
                      ],
                      "type": "duplicated",
                    },
                    {
                      "boundaryIndex": 20,
                      "rowIds": [
                        "F0-L17",
                      ],
                      "type": "duplicated",
                    },
                  ],
                  "route": [
                    "F0",
                  ],
                },
              ]
            `);
            const displayed = displayedIds(api);
            expect(new Set(displayed).size).toBe(displayed.length);
            expect(levelIds(api, 0)).toEqual(server.sortedIds((s) => s.root));
            expect(levelIds(api, 1)).toEqual(server.sortedIds((s) => s.children.F0));
        });

        test('does not report when the snapshot does not change', async () => {
            const { api, events, server } = await runScenario([]);

            expect(events).toEqual([]);
            expect(levelIds(api, 0)).toEqual(server.sortedIds((s) => s.root));
            expect(levelIds(api, 1)).toEqual(server.sortedIds((s) => s.children.F0));
        });
    });
});
