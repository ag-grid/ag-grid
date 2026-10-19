import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('SSRM data version', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, ScrollApiModule, RowGroupingModule],
    });

    afterEach(() => gridsManager.reset());

    const totalRows = 50;
    const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: String(i), value: i }));

    function respond(params: IServerSideGetRowsParams, dataVersion?: string) {
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
                respond(params, `v${++responseCount}`);
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

    test('a purge refresh and a sort change drop the pinned version', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        let responseCount = 0;
        const api = gridsManager.createGrid(
            null,
            flatGridOptions((params) => {
                requests.push(params.request);
                respond(params, `v${++responseCount}`);
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

    test('a non-purge refresh drops the pinned version, and a response to an earlier request cannot re-pin it', async () => {
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
        const beforeRefresh = [...pending];
        pending.length = 0;
        expect(beforeRefresh.every((p) => p.request.dataVersion === 'v1')).toBe(true);

        api.refreshServerSide({ purge: false });
        expect(rootVersion(api)).toBeUndefined();

        for (const params of beforeRefresh) {
            respond(params, 'v1');
        }
        expect(rootVersion(api)).toBeUndefined();

        await waitFor(() => expect(pending.length).toBeGreaterThan(0));
        expect(pending.every((p) => !('dataVersion' in p.request))).toBe(true);
        respond(pending.shift()!, 'v2');
        expect(rootVersion(api)).toBe('v2');
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
