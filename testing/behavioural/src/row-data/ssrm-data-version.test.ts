import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ClientSideRowModelModule, ScrollApiModule, enableDevValidations } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM data version', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, ScrollApiModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    const totalRows = 50;
    const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: String(i), value: i }));

    function respond(params: IServerSideGetRowsParams, dataVersion?: string | number) {
        const rows = rowData.slice(params.request.startRow, params.request.endRow);
        params.success({ rowData: rows, rowCount: totalRows, dataVersion });
    }

    function flatGridOptions(
        getRows: (params: IServerSideGetRowsParams) => void,
        extra: GridOptions = {}
    ): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value', sortable: true }],
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            rowBuffer: 0,
            getRowId: (params) => params.data.id,
            serverSideDatasource: { getRows },
            ...extra,
        };
    }

    function rootVersion(api: GridApi) {
        return api.getServerSideGroupLevelState()[0].dataVersion;
    }

    async function scrollTo(api: GridApi, rowIndex: number) {
        api.ensureIndexVisible(rowIndex);
        await waitForNoLoadingRows(api);
    }

    test('the first version returned is passed back on every later request for the level', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        let responseCount = 0;
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) => {
                requests.push(params.request);
                respond(params, params.request.dataVersion ?? `v${++responseCount}`);
            })
        );
        await waitForEvent('firstDataRendered', api);

        expect('dataVersion' in requests[0]).toBe(false);
        expect(rootVersion(api)).toBe('v1');

        await scrollTo(api, 45);

        const later = requests.slice(1);
        expect(later.length).toBeGreaterThan(0);
        expect(later.every((r) => r.dataVersion === 'v1')).toBe(true);
        expect(rootVersion(api)).toBe('v1');
    });

    test('the pinned version survives maxBlocksInCache eviction, and the evicted block is re-read from it', async () => {
        const evictionRowCount = 500;
        const evictionRowData = Array.from({ length: evictionRowCount }, (_, i) => ({ id: String(i), value: i }));
        const requests: IServerSideGetRowsRequest[] = [];
        let responseCount = 0;
        const api = gridsManager.createGrid(
            null,
            flatGridOptions(
                (params) => {
                    requests.push(params.request);
                    const { startRow, endRow } = params.request;
                    params.success({
                        rowData: evictionRowData.slice(startRow, endRow),
                        rowCount: evictionRowCount,
                        dataVersion: params.request.dataVersion ?? `v${++responseCount}`,
                    });
                },
                { cacheBlockSize: 100, maxBlocksInCache: 2, suppressRowVirtualisation: false }
            )
        );
        await waitForEvent('firstDataRendered', api);
        expect(rootVersion(api)).toBe('v1');

        await scrollTo(api, 250);
        await scrollTo(api, 450);
        expect(!!api.getRowNode('450')).toBe(true);
        expect(!!api.getRowNode('0')).toBe(false);

        await scrollTo(api, 0);
        expect(!!api.getRowNode('0')).toBe(true);

        const block0Requests = requests.filter((r) => r.startRow === 0);
        expect(block0Requests.length).toBe(2);
        expect(block0Requests[1].dataVersion).toBe('v1');
        expect(requests.slice(1).every((r) => r.dataVersion === 'v1')).toBe(true);
        expect(rootVersion(api)).toBe('v1');
    });

    test('the datasource returning a different version for a pinned level warns, and the level keeps its version', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [338] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            let responseCount = 0;
            const api = gridsManager.createGrid(
                null,
                flatGridOptions((params) => respond(params, `v${++responseCount}`))
            );
            await waitForEvent('firstDataRendered', api);
            await scrollTo(api, 25);

            expect(rootVersion(api)).toBe('v1');
            expect(warnSpy.mock.calls.map((call) => String(call[0]))).toContainEqual(
                expect.stringContaining('warning #338')
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    describe('comparing versions', () => {
        /** Pins `pinnedVersion`, then supplies a block read from `laterVersion`, and lists the mismatch warnings. */
        async function mismatchWarnings(
            pinnedVersion: string | number,
            laterVersion: string | number,
            extra: GridOptions = {}
        ) {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [338] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const pending: IServerSideGetRowsParams[] = [];
                const api = gridsManager.createGrid(
                    null,
                    flatGridOptions((params) => pending.push(params), extra)
                );
                await waitFor(() => expect(pending.length).toBe(1));
                respond(pending.shift()!, pinnedVersion);
                await waitForEvent('firstDataRendered', api);

                api.applyServerSideRowData({
                    successParams: { rowData: rowData.slice(0, 10), rowCount: totalRows, dataVersion: laterVersion },
                });
                expect(rootVersion(api)).toBe(pinnedVersion);
                return warnSpy.mock.calls
                    .map((call) => String(call[0]))
                    .filter((message) => message.includes('warning #338'));
            } finally {
                warnSpy.mockRestore();
            }
        }

        test('numbers are compared numerically by default', async () => {
            expect(await mismatchWarnings(3, 3)).toEqual([]);
            expect(await mismatchWarnings(3, 4)).toHaveLength(1);
        });

        test('other versions are checked for equality by default', async () => {
            expect(await mismatchWarnings('a', 'a')).toEqual([]);
            expect(await mismatchWarnings('a', 'A')).toHaveLength(1);
        });

        test('compareServerSideDataVersions decides whether two versions are the same', async () => {
            const compareServerSideDataVersions = (a: string | number, b: string | number) =>
                String(a).toLowerCase().localeCompare(String(b).toLowerCase());
            expect(await mismatchWarnings('a', 'A', { compareServerSideDataVersions })).toEqual([]);
            expect(await mismatchWarnings('a', 'b', { compareServerSideDataVersions })).toHaveLength(1);
        });
    });

    test('compareServerSideDataVersions must be a function, and is only supported by the Server-Side Row Model', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [309, 321] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            gridsManager.createGrid(null, flatGridOptions(respond, { compareServerSideDataVersions: 'newest' as any }));
            gridsManager.createGrid(
                null,
                { columnDefs: [{ field: 'id' }], rowData, compareServerSideDataVersions: () => 0 },
                { modules: [ClientSideRowModelModule] }
            );
            const warnings = warnSpy.mock.calls.map((call) => String(call[0]));
            expect(warnings).toContainEqual(expect.stringContaining('warning #321'));
            expect(warnings).toContainEqual(expect.stringContaining('warning #309'));
        } finally {
            warnSpy.mockRestore();
        }
    });

    test('a purge refresh and a sort change drop the pinned version', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        let responseCount = 0;
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) => {
                requests.push(params.request);
                respond(params, params.request.dataVersion ?? `v${++responseCount}`);
            })
        );
        await waitForEvent('firstDataRendered', api);
        expect(rootVersion(api)).toBe('v1');

        const beforePurge = requests.length;
        const responsesBeforePurge = responseCount;
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        expect('dataVersion' in requests[beforePurge]).toBe(false);
        expect(rootVersion(api)).toBe(`v${responsesBeforePurge + 1}`);

        const beforeSort = requests.length;
        const responsesBeforeSort = responseCount;
        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
        await waitForNoLoadingRows(api);
        expect(requests[beforeSort].sortModel[0]).toMatchObject({ colId: 'value', sort: 'desc' });
        expect('dataVersion' in requests[beforeSort]).toBe(false);
        expect(rootVersion(api)).toBe(`v${responsesBeforeSort + 1}`);
    });

    test('a non-purge refresh drops the pinned version, and a response to an earlier request is discarded', async () => {
        const pending: IServerSideGetRowsParams[] = [];
        let autoRespond = false;
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) => (autoRespond ? respond(params, 'v2') : pending.push(params)))
        );
        await waitFor(() => expect(pending.length).toBe(1));
        respond(pending.shift()!, 'v1');
        await waitForEvent('firstDataRendered', api);

        api.ensureIndexVisible(25);
        await waitFor(() => expect(pending.length).toBeGreaterThan(0));
        const beforeRefresh = [...pending];
        pending.length = 0;
        expect(beforeRefresh.every((p) => p.request.dataVersion === 'v1')).toBe(true);

        api.refreshServerSide({ purge: false });
        expect(rootVersion(api)).toBeUndefined();

        for (const params of beforeRefresh) {
            respond(params, 'v1');
        }
        expect(rootVersion(api)).toBeUndefined();
        expect(api.getDisplayedRowAtIndex(25)!.stub).toBe(true);

        await waitFor(() => expect(pending.some((p) => p.request.startRow === 20)).toBe(true));
        expect(pending.every((p) => !('dataVersion' in p.request))).toBe(true);
        respond(pending.shift()!, 'v2');
        expect(rootVersion(api)).toBe('v2');

        autoRespond = true;
        while (pending.length > 0) {
            respond(pending.shift()!, 'v2');
        }
        await waitForNoLoadingRows(api);
        expect(rootVersion(api)).toBe('v2');
        expect(api.getDisplayedRowAtIndex(25)!.data).toEqual(rowData[25]);
    });

    test('a response without a version to a request sent with the dropped version is discarded', async () => {
        const pending: IServerSideGetRowsParams[] = [];
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) => pending.push(params))
        );
        await waitFor(() => expect(pending.length).toBe(1));
        respond(pending.shift()!, 'v1');
        await waitForEvent('firstDataRendered', api);

        api.ensureIndexVisible(25);
        await waitFor(() => expect(pending.length).toBeGreaterThan(0));
        const beforeRefresh = pending.splice(0);
        expect(beforeRefresh.every((p) => p.request.dataVersion === 'v1')).toBe(true);

        api.refreshServerSide({ purge: false });
        for (const params of beforeRefresh) {
            respond(params);
        }
        expect(api.getDisplayedRowAtIndex(25)!.stub).toBe(true);

        await waitFor(() => expect(pending.some((p) => p.request.startRow === 20)).toBe(true));
        expect(pending.every((p) => !('dataVersion' in p.request))).toBe(true);
    });

    test('a block requested before the level was pinned and read from another version is loaded again with the pinned version', async () => {
        const pending: IServerSideGetRowsParams[] = [];
        let autoRespond = false;
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) =>
                autoRespond ? respond(params, params.request.dataVersion) : pending.push(params)
            )
        );
        await waitFor(() => expect(pending.length).toBe(1));
        respond(pending.shift()!);
        await waitForEvent('firstDataRendered', api);

        api.ensureIndexVisible(25);
        await waitFor(() => expect(pending.length).toBe(2));
        expect(pending.every((p) => !('dataVersion' in p.request))).toBe(true);
        const [pinning, otherVersion] = pending.splice(0);
        const { startRow } = otherVersion.request;

        respond(pinning, 'v1');
        respond(otherVersion, 'v2');
        expect(rootVersion(api)).toBe('v1');
        expect(api.getDisplayedRowAtIndex(startRow!)!.stub).toBe(true);

        await waitFor(() => expect(pending.some((p) => p.request.startRow === startRow)).toBe(true));
        expect(pending.every((p) => p.request.dataVersion === 'v1')).toBe(true);
        autoRespond = true;
        while (pending.length > 0) {
            const params = pending.shift()!;
            respond(params, params.request.dataVersion);
        }
        await waitForNoLoadingRows(api);
        expect(rootVersion(api)).toBe('v1');
        expect(api.getDisplayedRowAtIndex(startRow!)!.data).toEqual(rowData[startRow!]);
    });

    test('each group level pins its own version', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => {
                    requests.push(params.request);
                    const isRoot = params.request.groupKeys.length === 0;
                    params.success({
                        rowData: isRoot ? [{ country: 'UK' }] : [{ value: 1 }],
                        rowCount: 1,
                        dataVersion: isRoot ? 'root-v1' : 'uk-v1',
                    });
                },
            },
        });
        await waitForEvent('firstDataRendered', api);

        api.getDisplayedRowAtIndex(0)!.setExpanded(true);
        await waitForNoLoadingRows(api);

        expect(requests[1].groupKeys).toEqual(['UK']);
        expect('dataVersion' in requests[1]).toBe(false);
        expect(api.getServerSideGroupLevelState().map((s) => [s.route, s.dataVersion])).toEqual([
            [[], 'root-v1'],
            [['UK'], 'uk-v1'],
        ]);
    });

    test('applyServerSideRowData pins the version of an unpinned level', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) => {
                requests.push(params.request);
                respond(params);
            })
        );
        await waitForEvent('firstDataRendered', api);
        expect(rootVersion(api)).toBeUndefined();

        api.applyServerSideRowData({
            successParams: { rowData: rowData.slice(0, 10), rowCount: totalRows, dataVersion: 'applied' },
        });
        expect(rootVersion(api)).toBe('applied');

        await scrollTo(api, 25);
        expect(requests.length).toBeGreaterThan(1);
        expect(requests.slice(1).every((r) => r.dataVersion === 'applied')).toBe(true);
    });
});
