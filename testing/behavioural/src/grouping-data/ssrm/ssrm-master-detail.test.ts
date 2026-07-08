import type {
    GetDetailRowDataParams,
    GetRowIdParams,
    GridOptions,
    IRowNode,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import { DETAIL_ROW_ID_PREFIX } from 'ag-grid-community';
import { MasterDetailModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForNoLoadingRows } from '../../test-utils';

/**
 * CHARACTERIZATION (golden-master) tests pinning CURRENT flat SSRM master/detail behaviour:
 * detail-datasource load + refresh mechanics. These assert what the grid DOES today (bugs
 * included). RowNode objects are never asserted directly (circular → RangeError); existence /
 * shape is checked via booleans, scalar counts, and ids. This is a FLAT master-detail SSRM grid
 * (rowData is a plain list of master account rows) — NOT tree data (a tree-data md smoke test
 * already lives in tree-data/ssrm/ssrm-tree-data-master-detail.test.ts).
 */

interface RecordedRequest {
    groupKeys: string[];
    range: [number | undefined, number | undefined];
}

interface MasterRow {
    id: string;
    name: string;
    records: { name: string; value: number }[];
}

describe('ag-grid SSRM flat master-detail load & refresh (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function createMasterRows(): MasterRow[] {
        return [
            {
                id: 'A',
                name: 'Account A',
                records: [
                    { name: 'A0', value: 1 },
                    { name: 'A1', value: 2 },
                ],
            },
            { id: 'B', name: 'Account B', records: [] },
            { id: 'C', name: 'Account C', records: [{ name: 'C0', value: 3 }] },
        ];
    }

    // Base flat master-detail SSRM grid options. Each test supplies its own datasource / detail
    // counters inline (house style — no shared datasource factory).
    function createGridOptions(extra: Partial<GridOptions> = {}): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'name' }],
            rowModelType: 'serverSide',
            animateRows: false,
            masterDetail: true,
            getRowId: (params: GetRowIdParams) => params.data.id,
            isRowMaster: (dataItem: MasterRow) => !!dataItem?.records?.length,
            ...extra,
        };
    }

    test('expanding a master row invokes getDetailRowData once and the detail row appears with correct data', async () => {
        const masterRows = createMasterRows();
        const requests: RecordedRequest[] = [];
        let detailCalls = 0;
        const detailRequestedFor: string[] = [];

        const api = gridsManager.createGrid(
            'ssrmMdExpand',
            createGridOptions({
                detailCellRendererParams: {
                    detailGridOptions: {
                        columnDefs: [{ field: 'name' }, { field: 'value' }],
                        getRowId: ({ data }: GetRowIdParams) => data.name,
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) => {
                        ++detailCalls;
                        detailRequestedFor.push(params.data.id);
                        params.successCallback(params.data.records);
                    },
                },
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        setTimeout(() => params.success({ rowData: masterRows, rowCount: masterRows.length }), 1);
                    },
                },
            })
        );

        await waitForNoLoadingRows(api);

        // Master rows loaded via a single root request (empty groupKeys). Only A and C are masters
        // (B has no records → isRowMaster false), so 3 master rows displayed, none expanded yet.
        expect(requests.length).toBe(1);
        expect(requests[0].groupKeys).toEqual([]);
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(detailCalls).toBe(0);
        expect(api.getRowNode('A')!.master).toBe(true);
        expect(api.getRowNode('B')!.master).toBe(false);

        // Expand master A → the detail row appears and getDetailRowData is called exactly once for A.
        api.getRowNode('A')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        expect(detailCalls).toBe(1);
        expect(detailRequestedFor).toEqual(['A']);
        // 3 masters + 1 detail row = 4 displayed.
        expect(api.getDisplayedRowCount()).toBe(4);

        const detailNode = api.getRowNode(DETAIL_ROW_ID_PREFIX + 'A');
        expect(detailNode?.detail).toBe(true);
        expect(detailNode?.data?.id).toBe('A');

        // Detail grid received the master's records (A0, A1) via successCallback.
        const detailApi = api.getDetailGridInfo(DETAIL_ROW_ID_PREFIX + 'A')!.api!;
        expect(detailApi.getDisplayedRowCount()).toBe(2);
        const detailIds: string[] = [];
        detailApi.forEachNode((n: IRowNode) => detailIds.push(n.id!));
        expect(detailIds.sort()).toEqual(['A0', 'A1']);
    });

    test('collapse then re-expand the same master RE-FETCHES detail data (getDetailRowData called again)', async () => {
        const masterRows = createMasterRows();
        let detailCalls = 0;

        const api = gridsManager.createGrid(
            'ssrmMdReExpand',
            createGridOptions({
                detailCellRendererParams: {
                    detailGridOptions: {
                        columnDefs: [{ field: 'name' }, { field: 'value' }],
                        getRowId: ({ data }: GetRowIdParams) => data.name,
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) => {
                        ++detailCalls;
                        params.successCallback(params.data.records);
                    },
                },
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        setTimeout(() => params.success({ rowData: masterRows, rowCount: masterRows.length }), 1);
                    },
                },
            })
        );

        await waitForNoLoadingRows(api);

        api.getRowNode('A')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        expect(detailCalls).toBe(1);

        // Collapse A.
        api.getRowNode('A')!.setExpanded(false);
        await waitForNoLoadingRows(api);
        expect(api.getDisplayedRowCount()).toBe(3);

        // Re-expand A. Surprising pin: the SSRM detail node is NOT cached across collapse — the
        // detail row is destroyed on collapse and getDetailRowData is called AGAIN on re-expand.
        api.getRowNode('A')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        expect(detailCalls).toBe(2);
        expect(api.getDisplayedRowCount()).toBe(4);
        expect(api.getRowNode(DETAIL_ROW_ID_PREFIX + 'A')?.detail).toBe(true);
    });

    test('refreshServerSide({purge:true}) re-issues the master getRows while the open detail survives', async () => {
        const masterRows = createMasterRows();
        const requests: RecordedRequest[] = [];
        let detailCalls = 0;

        const api = gridsManager.createGrid(
            'ssrmMdRefreshPurge',
            createGridOptions({
                detailCellRendererParams: {
                    detailGridOptions: {
                        columnDefs: [{ field: 'name' }, { field: 'value' }],
                        getRowId: ({ data }: GetRowIdParams) => data.name,
                    },
                    getDetailRowData: (params: GetDetailRowDataParams) => {
                        ++detailCalls;
                        params.successCallback(params.data.records);
                    },
                },
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        setTimeout(() => params.success({ rowData: masterRows, rowCount: masterRows.length }), 1);
                    },
                },
            })
        );

        await waitForNoLoadingRows(api);
        expect(requests.length).toBe(1);

        // Open detail on A.
        api.getRowNode('A')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        expect(detailCalls).toBe(1);
        expect(api.getDisplayedRowCount()).toBe(4);

        // Purge refresh reloads the master rows: a second root getRows is issued (empty groupKeys).
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(requests.length).toBe(2);
        expect(requests[1].groupKeys).toEqual([]);

        // Surprising pin: after a purge refresh the previously-open detail SURVIVES — master A
        // stays expanded and the detail row is auto-restored (displayed count remains 4 = 3
        // masters + 1 detail). The detail node for A still exists.
        expect(api.getDisplayedRowCount()).toBe(4);
        expect(api.getRowNode('A')!.expanded).toBe(true);
        expect(api.getRowNode(DETAIL_ROW_ID_PREFIX + 'A')?.detail).toBe(true);

        // Restoring the detail after purge re-runs getDetailRowData (fresh master store → refetch).
        expect(detailCalls).toBe(2);
    });
});
