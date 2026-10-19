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
