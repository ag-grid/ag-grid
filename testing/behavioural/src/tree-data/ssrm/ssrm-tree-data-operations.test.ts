import type { GridOptions, IServerSideGetRowsParams, LoadSuccessParams } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';
import { asyncSetTimeout } from '../../test-utils/node-utils';
import { waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';
import type { EmployeeRow } from './ssrmSmallTreeDataSet';
import { createFakeServer, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

/**
 * Characterization tests pinning current SSRM tree-data operation behaviour.
 *
 * These are golden-master tests: they capture whatever the grid does today
 * (bugs included) so that future changes surface as diffs. Each case asserts
 * something tree-data-specific — behaviour tied to the `isServerSideGroup` /
 * `getServerSideGroupKey` routes, nested tree paths, or node identity across
 * refresh — rather than re-testing the flat/grouped equivalents already
 * characterized in sibling suites.
 */

interface RecordedRequest {
    groupKeys: string[];
    range: [number | undefined, number | undefined];
}

// Base tree-data grid options; datasource is supplied per test so each test can
// record its own request stream inline.
function createTreeGridOptions(extra: Partial<GridOptions> = {}): GridOptions {
    return {
        columnDefs: [
            { field: 'employeeId', hide: true },
            { field: 'employeeName', hide: true },
            { field: 'jobTitle' },
            { field: 'employmentType' },
        ],
        autoGroupColumnDef: { field: 'employeeName' },
        defaultColDef: { flex: 1 },
        treeData: true,
        rowModelType: 'serverSide',
        animateRows: false,
        getRowId: ({ data }) => data.employeeId,
        isServerSideGroup: (dataItem: any) => dataItem.group,
        getServerSideGroupKey: (dataItem: any) => dataItem.employeeId,
        ...extra,
    };
}

// Expands a displayed group row (by employeeId key) and waits for its children.
async function expandById(api: any, id: string): Promise<void> {
    const node = api.getRowNode(id);
    node.setExpanded(true);
    await waitForNoLoadingRows(api);
}

describe('ag-grid SSRM treeData operations (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule, ScrollApiModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('block eviction (maxBlocksInCache=1) does not evict a collapsed tree child block; re-expansion serves from cache with no re-fetch', async () => {
        const requests: RecordedRequest[] = [];
        const fakeServer = createFakeServer(getSmallTreeDataSet());

        const api = gridsManager.createGrid(
            'ssrmTreeEviction',
            createTreeGridOptions({
                // One block per store; only a single block may live in the cache at once,
                // so expanding a second (non-displayed) route forces the first to be evicted.
                cacheBlockSize: 100,
                maxBlocksInCache: 1,
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        const rows = fakeServer.getData(params.request);
                        setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                    },
                },
            })
        );

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        // Expand the deep path 101 -> 102 to create a nested child block, then collapse 102.
        await expandById(api, '101');
        await expandById(api, '102');
        const node102 = api.getRowNode('102')!;
        node102.setExpanded(false);
        await asyncSetTimeout(1);

        const requestsBeforeReExpand = requests.length;

        // Re-expand 102.
        node102.setExpanded(true);
        await waitForNoLoadingRows(api);

        const reFetched = requests.slice(requestsBeforeReExpand);
        // Tree-specific finding: even with maxBlocksInCache=1, collapsing then re-expanding a
        // nested tree node does NOT re-fetch — the child block survives in cache. Block
        // eviction does not reclaim a collapsed group's child store here.
        expect(reFetched.map((r) => r.groupKeys)).toEqual([]);

        const gridRows = new GridRows(api, 'tree eviction re-expand 102');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├── 103 GROUP collapsed id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ └── 108 GROUP collapsed id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('serverSideEnableClientSideSort sorts an expanded tree level without re-requesting the route', async () => {
        const requests: RecordedRequest[] = [];
        const fakeServer = createFakeServer(getSmallTreeDataSet());

        const api = gridsManager.createGrid(
            'ssrmTreeClientSort',
            createTreeGridOptions({
                serverSideEnableClientSideSort: true,
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        const rows = fakeServer.getData(params.request);
                        setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                    },
                },
            })
        );

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        // Expand 101 -> 102 -> 108 to get a leaf-ish level (sales execs) with distinct jobTitles.
        await expandById(api, '101');
        await expandById(api, '102');
        await expandById(api, '108');

        const loadsBeforeSort = requests.length;

        // Sort by jobTitle ascending — with client-side sort enabled the already-loaded
        // tree levels should reorder without any new server request.
        api.applyColumnState({ state: [{ colId: 'jobTitle', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Tree-specific: no re-request fired for the sort (contrast with the default
        // server-delegated sort pinned in the tree-data-loading suite).
        expect(requests.length).toBe(loadsBeforeSort);

        const gridRows = new GridRows(api, 'tree client-side sort by jobTitle asc');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├── 103 GROUP collapsed id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ └─┬ 108 GROUP id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ · ├── LEAF id:110 ag-Grid-AutoColumn:"Todd Tyler" employeeId:"110" employeeName:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ · ├── LEAF id:111 ag-Grid-AutoColumn:"Bennie Wise" employeeId:"111" employeeName:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ · ├── LEAF id:112 ag-Grid-AutoColumn:"Joel Cooper" employeeId:"112" employeeName:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · │ · └── LEAF id:109 ag-Grid-AutoColumn:"Morris Hanson" employeeId:"109" employeeName:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('refreshServerSide purge at root re-fetches every previously-expanded route and preserves the expanded tree', async () => {
        const requests: RecordedRequest[] = [];
        const fakeServer = createFakeServer(getSmallTreeDataSet());

        const api = gridsManager.createGrid(
            'ssrmTreeRefreshRoot',
            createTreeGridOptions({
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        const rows = fakeServer.getData(params.request);
                        setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                    },
                },
            })
        );

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);
        await expandById(api, '101');
        await expandById(api, '102');

        const requestsBeforeRefresh = requests.length;

        // Purge refresh at root — destroys and rebuilds the whole tree from the top.
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        const refreshFetches = requests.slice(requestsBeforeRefresh).map((r) => r.groupKeys);
        // Tree-specific: a root purge rebuilds the whole tree but re-fetches every route that
        // was expanded before the purge — root, then each ancestor path down the open branch.
        expect(refreshFetches).toEqual([[], ['101'], ['101', '102']]);

        // Node identity survives (getRowId keyed on employeeId) and the expanded branch is
        // restored — pin the post-refresh display state.
        const gridRows = new GridRows(api, 'tree root purge refresh');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├── 103 GROUP collapsed id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ └── 108 GROUP collapsed id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('refreshServerSide purge routed at a tree node re-fetches only that node route and preserves ancestor expansion', async () => {
        const requests: RecordedRequest[] = [];
        const fakeServer = createFakeServer(getSmallTreeDataSet());

        const api = gridsManager.createGrid(
            'ssrmTreeRefreshRoute',
            createTreeGridOptions({
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        const rows = fakeServer.getData(params.request);
                        setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                    },
                },
            })
        );

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);
        await expandById(api, '101');
        await expandById(api, '102');

        const requestsBeforeRefresh = requests.length;

        // Purge only the child route [101, 102] — destroys just that node's child cache.
        api.refreshServerSide({ route: ['101', '102'], purge: true });
        await waitForNoLoadingRows(api);

        const refreshFetches = requests.slice(requestsBeforeRefresh).map((r) => r.groupKeys);
        // Tree-specific: only the routed node's children re-fetch; ancestors are untouched.
        expect(refreshFetches).toEqual([['101', '102']]);

        // Ancestor 101 and node 102 stay expanded through a routed purge.
        const gridRows = new GridRows(api, 'tree routed purge refresh');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├── 103 GROUP collapsed id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ └── 108 GROUP collapsed id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('applyServerSideRowData on a tree node route replaces only that node children and fires no server request', async () => {
        const requests: RecordedRequest[] = [];
        const fakeServer = createFakeServer(getSmallTreeDataSet());

        const api = gridsManager.createGrid(
            'ssrmTreeApplyRowData',
            createTreeGridOptions({
                serverSideDatasource: {
                    getRows: (params: IServerSideGetRowsParams) => {
                        requests.push({
                            groupKeys: [...(params.request.groupKeys ?? [])],
                            range: [params.request.startRow, params.request.endRow],
                        });
                        const rows = fakeServer.getData(params.request);
                        setTimeout(() => params.success({ rowData: rows, rowCount: rows.length }), 1);
                    },
                },
            })
        );

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);
        await expandById(api, '101');
        await expandById(api, '102');

        const requestsBeforeApply = requests.length;

        // Bulk-set node 102's children to a brand-new set via applyServerSideRowData on the
        // [101, 102] route. Node 200 is a leaf, 201 is a group.
        const successParams: LoadSuccessParams<EmployeeRow> = {
            rowData: [
                {
                    employeeId: '200',
                    employeeName: 'New Leaf',
                    jobTitle: 'Analyst',
                    employmentType: 'Permanent',
                    group: false,
                },
                {
                    employeeId: '201',
                    employeeName: 'New Group',
                    jobTitle: 'Manager',
                    employmentType: 'Permanent',
                    group: true,
                },
            ],
            rowCount: 2,
        };
        api.applyServerSideRowData({ route: ['101', '102'], successParams });
        await asyncSetTimeout(1);

        // Tree-specific: no server fetch fired — the children were set directly on the route.
        expect(requests.length).toBe(requestsBeforeApply);

        // Only node 102's children were replaced; 101 and the rest of the tree are untouched.
        const gridRows = new GridRows(api, 'tree applyServerSideRowData on route');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├── LEAF id:200 ag-Grid-AutoColumn:"New Leaf" employeeId:"200" employeeName:"New Leaf" jobTitle:"Analyst" employmentType:"Permanent"
            · │ └── 201 GROUP collapsed id:201 ag-Grid-AutoColumn:"New Group" employeeId:"201" employeeName:"New Group" jobTitle:"Manager" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });
});
