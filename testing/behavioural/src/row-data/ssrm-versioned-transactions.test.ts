import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type {
    GridApi,
    GridOptions,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import { ScrollApiModule, enableDevValidations } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM versioned transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, ScrollApiModule],
    });

    /** The server's latest rows; tests change them alongside the transactions they send. */
    let serverRows: { id: string; value: number }[];

    beforeEach(() => {
        serverRows = Array.from({ length: 50 }, (_, i) => ({ id: String(i), value: i }));
    });

    afterEach(() => gridsManager.reset());

    function respond(params: IServerSideGetRowsParams, dataVersion?: string | number, rows = serverRows) {
        const { startRow, endRow } = params.request;
        params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length, dataVersion });
    }

    function setServerValue(id: string, value: number) {
        serverRows = serverRows.map((row) => (row.id === id ? { id, value } : row));
    }

    /**
     * Creates a grid whose first block loads at `firstVersion`; later requests wait in `pending` until `settle`
     * answers them, and every request after it, at the version requested.
     */
    async function createGrid(firstVersion: string | number | undefined, extra: GridOptions = {}) {
        const pending: IServerSideGetRowsParams[] = [];
        const requests: IServerSideGetRowsRequest[] = [];
        let autoRespond = false;
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            rowBuffer: 0,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push(params.request);
                    if (requests.length === 1) {
                        respond(params, firstVersion);
                    } else if (autoRespond) {
                        respond(params, params.request.dataVersion);
                    } else {
                        pending.push(params);
                    }
                },
            },
            ...extra,
        });
        await waitForEvent('firstDataRendered', api);
        const settle = async () => {
            autoRespond = true;
            for (const params of pending.splice(0)) {
                respond(params, params.request.dataVersion);
            }
            await waitForNoLoadingRows(api);
        };
        return { api, pending, requests, settle };
    }

    /** Scrolls to a row and returns the request for its block, left waiting for a response. */
    async function requestBlockOf(api: GridApi, pending: IServerSideGetRowsParams[], rowIndex: number) {
        api.ensureIndexVisible(rowIndex);
        await waitFor(() => expect(pending.some((p) => p.request.startRow === rowIndex - (rowIndex % 10))).toBe(true));
        const index = pending.findIndex((p) => p.request.startRow === rowIndex - (rowIndex % 10));
        return pending.splice(index, 1)[0];
    }

    function value(api: GridApi, id: string) {
        return api.getRowNode(id)?.data.value;
    }

    test('an update or remove older than the loaded row is skipped and reported in unapplied', async () => {
        const { api } = await createGrid(5);

        const update = { id: '1', value: 100 };
        const remove = { id: '2', value: 2 };
        const result = api.applyServerSideTransaction({ version: 4, update: [update], remove: [remove] })!;

        expect(result.status).toBe('Applied');
        expect(result.update).toBeUndefined();
        expect(result.remove).toBeUndefined();
        expect(result.unapplied).toEqual([update, remove]);
        expect(value(api, '1')).toBe(1);
        expect(!!api.getRowNode('2')).toBe(true);
    });

    test('a newer update is applied, and an update older than it is then skipped', async () => {
        const { api } = await createGrid(5);

        const newer = api.applyServerSideTransaction({ version: 7, update: [{ id: '1', value: 700 }] })!;
        expect(newer.update!.map((node) => node.id)).toEqual(['1']);
        expect(newer.unapplied).toBeUndefined();
        expect(value(api, '1')).toBe(700);

        const older = { id: '1', value: 600 };
        const outOfOrder = api.applyServerSideTransaction({ version: 6, update: [older] })!;
        expect(outOfOrder.unapplied).toEqual([older]);
        expect(value(api, '1')).toBe(700);
    });

    test('a transaction sent while a block loads is applied to the rows the block read before it', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);
        expect(block.request.dataVersion).toBe(1);

        const before = serverRows;
        setServerValue('25', 2500);
        serverRows = serverRows.filter((row) => row.id !== '26');
        const result = api.applyServerSideTransaction({
            version: 2,
            update: [{ id: '25', value: 2500 }],
            remove: [{ id: '26', value: 26 }],
        })!;
        expect(result.update).toEqual([]);
        expect(result.remove).toEqual([]);

        // read at the version requested, before the transaction
        respond(block, 1, before);
        expect(value(api, '25')).toBe(2500);
        expect(api.getRowNode('26')).toBeUndefined();

        await settle();
        expect(value(api, '25')).toBe(2500);
        expect(api.getRowNode('26')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('an add sent while a block loads is not duplicated when the block already has the row', async () => {
        const { api, pending, settle } = await createGrid(undefined);
        const block = await requestBlockOf(api, pending, 25);

        const added = { id: 'new', value: -1 };
        serverRows = [...serverRows.slice(0, 25), added, ...serverRows.slice(25)];
        api.applyServerSideTransaction({ version: 2, addIndex: 25, add: [added] });

        // read after the transaction
        respond(block, 2);
        await settle();

        const ids: string[] = [];
        api.forEachNode((node) => node.id && ids.push(node.id));
        expect(ids.filter((id) => id === 'new').length).toBe(1);
        expect(new Set(ids).size).toBe(ids.length);
        expect(api.getDisplayedRowCount()).toBe(51);
        expect(api.getDisplayedRowAtIndex(25)!.id).toBe('new');
    });

    test.each([
        ['added', 51],
        ['removed', 49],
    ])('a row %s outside a loading block is kept in the row count the block returns', async (change, rowCount) => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        const added = { id: 'new', value: -1 };
        if (change === 'added') {
            serverRows = [...serverRows, added];
            api.applyServerSideTransaction({ version: 2, add: [added] });
        } else {
            serverRows = serverRows.filter((row) => row.id !== '3');
            api.applyServerSideTransaction({ version: 2, remove: [{ id: '3', value: 3 }] });
        }
        expect(api.getDisplayedRowCount()).toBe(rowCount);

        // read before the transaction, with the row count of that version
        respond(block, 1, before);
        expect(api.getDisplayedRowCount()).toBe(rowCount);

        await settle();
        expect(api.getDisplayedRowCount()).toBe(rowCount);
        expect(!!api.getRowNode('new')).toBe(change === 'added');
    });

    test('a row added inside a loading block is kept when the block was read before it', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        const added = { id: 'new', value: -1 };
        serverRows = [...serverRows.slice(0, 25), added, ...serverRows.slice(25)];
        api.applyServerSideTransaction({ version: 2, addIndex: 25, add: [added] });

        respond(block, 1, before);
        expect(api.getRowNode('new')).toBeDefined();
        expect(api.getDisplayedRowCount()).toBe(51);

        await settle();
        expect(api.getRowNode('new')).toBeDefined();
        expect(api.getDisplayedRowCount()).toBe(51);
    });

    test('a row removed inside one of two loading blocks stays removed from the row count', async () => {
        const { api, pending, settle } = await createGrid(1, { maxConcurrentDatasourceRequests: -1 });
        api.ensureIndexVisible(35);
        await waitFor(() => expect(pending.filter((p) => p.request.startRow! >= 20).length).toBeGreaterThan(1));
        const blocks = pending.splice(0);

        const before = serverRows;
        const removed = before[blocks[0].request.startRow! + 1];
        serverRows = serverRows.filter((row) => row !== removed);
        api.applyServerSideTransaction({ version: 2, remove: [removed] });

        for (const params of blocks) {
            respond(params, 1, before);
        }
        expect(api.getDisplayedRowCount()).toBe(49);

        await settle();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('a loaded row removed while its block reloads is removed once from the row count', async () => {
        const { api, pending, settle } = await createGrid(1, { maxConcurrentDatasourceRequests: -1 });
        api.refreshServerSide({ purge: false });
        await waitFor(() => expect(pending.some((p) => p.request.startRow === 0)).toBe(true));
        const reload = pending.splice(
            pending.findIndex((p) => p.request.startRow === 0),
            1
        )[0];

        const before = serverRows;
        serverRows = serverRows.filter((row) => row.id !== '5');
        api.applyServerSideTransaction({ version: 2, remove: [{ id: '5', value: 5 }] });
        expect(api.getDisplayedRowCount()).toBe(49);

        respond(reload, 1, before);
        expect(api.getRowNode('5')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);

        await settle();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('a row added inside a loading block and then updated keeps the update', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        serverRows = [...serverRows.slice(0, 25), { id: 'new', value: -3 }, ...serverRows.slice(25)];
        api.applyServerSideTransaction({ version: 2, addIndex: 25, add: [{ id: 'new', value: -2 }] });
        api.applyServerSideTransaction({ version: 3, update: [{ id: 'new', value: -3 }] });

        respond(block, 1, before);
        expect(value(api, 'new')).toBe(-3);
        expect(api.getDisplayedRowCount()).toBe(51);

        await settle();
        expect(value(api, 'new')).toBe(-3);
    });

    test('a row added and then removed while a block loads is not restored', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const added = { id: 'new', value: -1 };
        api.applyServerSideTransaction({ version: 2, add: [added] });
        api.applyServerSideTransaction({ version: 3, remove: [added] });

        respond(block, 1);
        expect(api.getRowNode('new')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(50);

        await settle();
        expect(api.getRowNode('new')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(50);
    });

    test('a remove with rowCount inside a loading block is counted once', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        serverRows = serverRows.filter((row) => row.id !== '25');
        api.applyServerSideTransaction({ version: 2, remove: [{ id: '25', value: 25 }], rowCount: 49 });
        expect(api.getDisplayedRowCount()).toBe(49);

        respond(block, 1, before);
        expect(api.getRowNode('25')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);

        await settle();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('a row added while the first block loads is kept in the row count the block returns', async () => {
        const pending: IServerSideGetRowsParams[] = [];
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => params.data.id,
            serverSideDatasource: { getRows: (params) => pending.push(params) },
        });
        await waitFor(() => expect(pending.length).toBe(1));

        const before = serverRows;
        const added = { id: 'new', value: -1 };
        serverRows = [added, ...serverRows];
        api.applyServerSideTransaction({ version: 2, addIndex: 0, add: [added] });

        respond(pending.shift()!, 1, before);
        await waitForNoLoadingRows(api);
        expect(api.getDisplayedRowAtIndex(0)!.id).toBe('new');
        expect(api.getDisplayedRowCount()).toBe(51);
    });

    test('rows added across the end of a loading block keep their order when the block overwrites some', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        const added = [
            { id: 'a', value: -1 },
            { id: 'b', value: -2 },
        ];
        serverRows = [...serverRows.slice(0, 29), ...added, ...serverRows.slice(29)];
        api.applyServerSideTransaction({ version: 2, addIndex: 29, add: added });

        respond(block, 1, before);
        const idsFrom29 = () => [29, 30, 31].map((index) => api.getDisplayedRowAtIndex(index)?.id);
        expect(idsFrom29()).toEqual(['a', 'b', '29']);
        expect(api.getDisplayedRowCount()).toBe(52);

        await settle();
        expect(idsFrom29()).toEqual(['a', 'b', '29']);
    });

    test('a row count returned with a block is used, with the changes of transactions held for it', async () => {
        const { api, pending, settle } = await createGrid(1, { serverSideDataVersionMode: 'stream' });

        // a remove of a row that is not loaded, without a row count, leaves the row count as it is
        serverRows = serverRows.filter((row) => row.id !== '45');
        api.applyServerSideTransaction({ version: 2, remove: [{ id: '45', value: 45 }] });
        expect(api.getDisplayedRowCount()).toBe(50);

        const block = await requestBlockOf(api, pending, 25);
        expect(block.request.dataVersion).toBe(2);
        api.applyServerSideTransaction({ version: 3, update: [{ id: '25', value: 2500 }] });

        respond(block, 2);
        expect(api.getDisplayedRowCount()).toBe(49);
        expect(value(api, '25')).toBe(2500);
        await settle();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('a row count given with a transaction is not reduced by removes skipped as stale', async () => {
        const { api } = await createGrid(5);
        api.applyServerSideTransaction({ version: 10, update: [{ id: '1', value: 100 }] });

        const result = api.applyServerSideTransaction({
            version: 6,
            remove: [
                { id: '1', value: 100 },
                { id: '2', value: 2 },
            ],
            rowCount: 48,
        })!;

        expect(result.unapplied).toEqual([{ id: '1', value: 100 }]);
        expect(api.getRowNode('2')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test('a row added while the first block loads is kept in the row count inferred from a short block', async () => {
        const pending: IServerSideGetRowsParams[] = [];
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => params.data.id,
            serverSideDatasource: { getRows: (params) => pending.push(params) },
        });
        await waitFor(() => expect(pending.length).toBe(1));

        const added = { id: 'new', value: -1 };
        api.applyServerSideTransaction({ version: 2, addIndex: 0, add: [added] });

        pending.shift()!.success({ rowData: serverRows, dataVersion: 1 });
        await waitForNoLoadingRows(api);
        expect(api.getDisplayedRowAtIndex(0)!.id).toBe('new');
        expect(api.getDisplayedRowCount()).toBe(51);
    });

    test('a surviving added row keeps its node and later updates when the rows added with it are restored', async () => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        const added = [
            { id: 'a', value: -1 },
            { id: 'b', value: -2 },
        ];
        serverRows = [...serverRows.slice(0, 29), added[0], { id: 'b', value: -20 }, ...serverRows.slice(29)];
        api.applyServerSideTransaction({ version: 2, addIndex: 29, add: added });
        api.applyServerSideTransaction({ version: 3, update: [{ id: 'b', value: -20 }] });
        const survivor = api.getRowNode('b');

        respond(block, 1, before);
        expect(api.getRowNode('b')).toBe(survivor);
        expect(value(api, 'b')).toBe(-20);
        expect(api.applyServerSideTransaction({ version: 2, update: [{ id: 'b', value: -2 }] })!.unapplied).toEqual([
            { id: 'b', value: -2 },
        ]);

        await settle();
        expect(value(api, 'b')).toBe(-20);
    });

    test('a remove with rowCount while the first block loads is counted once', async () => {
        const pending: IServerSideGetRowsParams[] = [];
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            getRowId: (params) => params.data.id,
            serverSideDatasource: { getRows: (params) => pending.push(params) },
        });
        await waitFor(() => expect(pending.length).toBe(1));

        api.applyServerSideTransaction({ version: 2, remove: [{ id: '25', value: 25 }], rowCount: 49 });

        respond(pending.shift()!, 1);
        await waitForNoLoadingRows(api);
        expect(api.getRowNode('25')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(49);
    });

    test.each([
        ['added', 21],
        ['removed', 19],
    ])('a block read before a row was %s above it is placed where its rows now are', async (change, blockStart) => {
        const { api, pending, settle } = await createGrid(1);
        const block = await requestBlockOf(api, pending, 25);

        const before = serverRows;
        if (change === 'added') {
            const added = { id: 'new', value: -1 };
            serverRows = [added, ...serverRows];
            api.applyServerSideTransaction({ version: 2, addIndex: 0, add: [added] });
        } else {
            serverRows = serverRows.filter((row) => row.id !== '3');
            api.applyServerSideTransaction({ version: 2, remove: [{ id: '3', value: 3 }] });
        }

        respond(block, 1, before);
        const blockIds = () => Array.from({ length: 10 }, (_, i) => api.getDisplayedRowAtIndex(blockStart + i)?.id);
        const expected = Array.from({ length: 10 }, (_, i) => String(20 + i));
        expect(blockIds()).toEqual(expected);

        await settle();
        expect(blockIds()).toEqual(expected);
    });

    test('a load discarded by a purge does not drop transactions held for the blocks loading after it', async () => {
        const { api, pending } = await createGrid(1, { maxConcurrentDatasourceRequests: -1 });
        const discarded = await requestBlockOf(api, pending, 25);
        const otherDiscarded = pending.splice(0);

        api.refreshServerSide({ purge: true });
        await waitFor(() => expect(pending.length).toBeGreaterThan(0));
        const reload = pending.shift()!;

        const id = String(reload.request.startRow);
        api.applyServerSideTransaction({ version: 2, update: [{ id, value: -1 }] });
        for (const params of [discarded, ...otherDiscarded]) {
            respond(params, 1);
        }
        respond(reload, 1);

        expect(value(api, id)).toBe(-1);
    });

    test('a transaction not newer than the loaded block is dropped on replay', async () => {
        const { api, pending, settle } = await createGrid(undefined);
        const block = await requestBlockOf(api, pending, 25);

        api.applyServerSideTransaction({ version: 2, update: [{ id: '25', value: 2500 }] });
        api.applyServerSideTransaction({ version: 4, update: [{ id: '26', value: 2600 }] });

        // read at version 3, after a change to row 25 newer than the first transaction, before the second
        setServerValue('25', 2501);
        respond(block, 3);
        setServerValue('26', 2600);
        await settle();

        expect(value(api, '25')).toBe(2501);
        expect(value(api, '26')).toBe(2600);
    });

    test('async transactions skip stale changes and are replayed after a load', async () => {
        const { api, pending, settle } = await createGrid(5);
        const block = await requestBlockOf(api, pending, 25);

        const results: ServerSideTransactionResult[] = [];
        const stale = { id: '1', value: 100 };
        api.applyServerSideTransactionAsync({ version: 4, update: [stale] }, (r) => results.push(r));
        api.applyServerSideTransactionAsync({ version: 6, update: [{ id: '25', value: 2500 }] }, (r) =>
            results.push(r)
        );
        api.flushServerSideAsyncTransactions();
        await waitFor(() => expect(results.length).toBe(2));

        expect(results[0].unapplied).toEqual([stale]);
        expect(value(api, '1')).toBe(1);

        const before = serverRows;
        setServerValue('25', 2500);
        respond(block, 5, before);
        expect(value(api, '25')).toBe(2500);
        await settle();
    });

    test('without versions, transactions behave as before', async () => {
        const { api, pending, requests, settle } = await createGrid(5);
        const block = await requestBlockOf(api, pending, 25);

        const result = api.applyServerSideTransaction({
            update: [
                { id: '1', value: 100 },
                { id: '25', value: 2500 },
            ],
        })!;
        expect(result.unapplied).toBeUndefined();
        expect(result.update!.map((node) => node.id)).toEqual(['1']);
        expect(value(api, '1')).toBe(100);

        respond(block, 5);
        await settle();
        expect(value(api, '25')).toBe(25);
        expect(api.getServerSideGroupLevelState()[0].dataVersion).toBe(5);
        expect(requests.slice(1).every((r) => r.dataVersion === 5)).toBe(true);
    });

    test('compareServerSideDataVersions orders string versions', async () => {
        const byRevision = (a: string | number, b: string | number) =>
            Number(String(a).slice(1)) - Number(String(b).slice(1));
        const { api } = await createGrid('r10', {
            compareServerSideDataVersions: byRevision,
            serverSideDataVersionMode: 'stream',
        });

        const stale = { id: '1', value: 100 };
        expect(api.applyServerSideTransaction({ version: 'r9', update: [stale] })!.unapplied).toEqual([stale]);
        expect(value(api, '1')).toBe(1);

        api.applyServerSideTransaction({ version: 'r11', update: [{ id: '1', value: 1100 }] });
        expect(value(api, '1')).toBe(1100);
        expect(api.getServerSideGroupLevelState()[0].dataVersion).toBe('r11');
    });

    test('without a comparator, different string versions are applied as before', async () => {
        const { api } = await createGrid('r10');

        const result = api.applyServerSideTransaction({ version: 'r9', update: [{ id: '1', value: 100 }] })!;
        expect(result.unapplied).toBeUndefined();
        expect(value(api, '1')).toBe(100);
        expect(api.getServerSideGroupLevelState()[0].dataVersion).toBe('r10');
    });

    describe('serverSideDataVersionMode', () => {
        function spyOnWarnings() {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [338] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const versionWarnings = () =>
                warnSpy.mock.calls.map((call) => String(call[0])).filter((message) => message.includes('#338'));
            return { warnSpy, versionWarnings };
        }

        function rootVersion(api: GridApi) {
            return api.getServerSideGroupLevelState()[0].dataVersion;
        }

        test("'snapshot' keeps the first version: a newer transaction does not move it", async () => {
            const { api, pending } = await createGrid(5);

            api.applyServerSideTransaction({ version: 7, update: [{ id: '1', value: 700 }] });
            expect(value(api, '1')).toBe(700);
            expect(rootVersion(api)).toBe(5);

            const block = await requestBlockOf(api, pending, 25);
            expect(block.request.dataVersion).toBe(5);
        });

        test("'snapshot' warns when a block returns a newer version, and keeps the first version", async () => {
            const { warnSpy, versionWarnings } = spyOnWarnings();
            try {
                const { api, pending } = await createGrid(5);
                respond(await requestBlockOf(api, pending, 25), 6);

                expect(versionWarnings().length).toBe(1);
                expect(rootVersion(api)).toBe(5);
            } finally {
                warnSpy.mockRestore();
            }
        });

        test("'stream' moves the version forward to a newer transaction, for later requests", async () => {
            const { api, pending } = await createGrid(5, { serverSideDataVersionMode: 'stream' });

            api.applyServerSideTransaction({ version: 7, update: [{ id: '1', value: 700 }] });
            expect(rootVersion(api)).toBe(7);

            const block = await requestBlockOf(api, pending, 25);
            expect(block.request.dataVersion).toBe(7);
        });

        test("'stream' accepts a block with a newer version without a warning, and moves the version forward", async () => {
            const { warnSpy, versionWarnings } = spyOnWarnings();
            try {
                const { api, pending } = await createGrid(5, { serverSideDataVersionMode: 'stream' });
                respond(await requestBlockOf(api, pending, 25), 6);

                expect(versionWarnings()).toEqual([]);
                expect(rootVersion(api)).toBe(6);
            } finally {
                warnSpy.mockRestore();
            }
        });

        test("'stream' accepts a block read at the version requested after a transaction moved the version on", async () => {
            const { warnSpy, versionWarnings } = spyOnWarnings();
            try {
                const { api, pending } = await createGrid(5, { serverSideDataVersionMode: 'stream' });
                const block = await requestBlockOf(api, pending, 25);

                api.applyServerSideTransaction({ version: 7, update: [{ id: '25', value: 2500 }] });
                const before = serverRows;
                setServerValue('25', 2500);
                respond(block, 5, before);

                expect(versionWarnings()).toEqual([]);
                expect(rootVersion(api)).toBe(7);
                expect(value(api, '25')).toBe(2500);
            } finally {
                warnSpy.mockRestore();
            }
        });

        test("'stream' does not warn about an older version for a block requested without a version", async () => {
            const { warnSpy, versionWarnings } = spyOnWarnings();
            try {
                const { api, pending } = await createGrid(undefined, {
                    serverSideDataVersionMode: 'stream',
                    maxConcurrentDatasourceRequests: -1,
                });
                api.ensureIndexVisible(35);
                await waitFor(() => expect(pending.length).toBeGreaterThan(1));
                const [first, second] = pending.splice(0);
                expect('dataVersion' in second.request).toBe(false);

                respond(first, 5);
                api.applyServerSideTransaction({ version: 8, update: [{ id: '1', value: 800 }] });
                respond(second, 6);

                expect(versionWarnings()).toEqual([]);
                expect(rootVersion(api)).toBe(8);
            } finally {
                warnSpy.mockRestore();
            }
        });

        test("'stream' warns when a block returns a version older than the one requested", async () => {
            const { warnSpy, versionWarnings } = spyOnWarnings();
            try {
                const { api, pending } = await createGrid(5, { serverSideDataVersionMode: 'stream' });
                respond(await requestBlockOf(api, pending, 25), 4);

                expect(versionWarnings().length).toBe(1);
                expect(rootVersion(api)).toBe(5);
            } finally {
                warnSpy.mockRestore();
            }
        });

        test('switching from snapshot to stream moves the version forward from then on', async () => {
            const { api } = await createGrid(5);

            api.applyServerSideTransaction({ version: 7, update: [{ id: '1', value: 700 }] });
            expect(rootVersion(api)).toBe(5);

            api.setGridOption('serverSideDataVersionMode', 'stream');
            api.applyServerSideTransaction({ version: 8, update: [{ id: '1', value: 800 }] });
            expect(rootVersion(api)).toBe(8);

            api.setGridOption('serverSideDataVersionMode', 'snapshot');
            api.applyServerSideTransaction({ version: 9, update: [{ id: '1', value: 900 }] });
            expect(rootVersion(api)).toBe(8);
            expect(value(api, '1')).toBe(900);
        });
    });
});
