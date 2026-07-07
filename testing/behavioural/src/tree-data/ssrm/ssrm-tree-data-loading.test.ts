import type { GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { TextFilterModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';
import { ssrmExpandAndLoadAll, waitForNoLoadingRows } from '../../test-utils/ssrm-test-utils';
import { createFakeServer, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

/**
 * CHARACTERIZATION tests (golden-master) pinning the CURRENT behaviour of the
 * Server-Side Row Model (SSRM) with tree data.
 *
 * These are NOT specification tests: each assertion records what the grid does
 * today (node identification via `isServerSideGroup` + `getServerSideGroupKey`,
 * lazy child loading on expand, and sort/filter re-request behaviour). If a
 * value looks bug-shaped it is still pinned as the baseline; a future change to
 * these values will surface as a failure to be reviewed, not silently accepted.
 */
describe('ag-grid SSRM treeData lazy loading (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ServerSideRowModelModule, TreeDataModule, TextFilterModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // Shared inline setup: builds a tree-data SSRM grid whose datasource records
    // every getRows request (groupKeys + range) so we can assert which node's
    // children were requested and when.
    function createTreeGrid(gridId: string, extraOptions?: Partial<GridOptions>) {
        const data = getSmallTreeDataSet();
        const fakeServer = createFakeServer(data);

        // Record the request stream inline: the path (groupKeys) and range for
        // each getRows call the grid makes against the server.
        const requests: { groupKeys: string[]; range: [number | undefined, number | undefined] }[] = [];

        const datasource: IServerSideDatasource = {
            getRows: (params: IServerSideGetRowsParams) => {
                const request = params.request;
                requests.push({
                    groupKeys: request.groupKeys ?? [],
                    range: [request.startRow, request.endRow],
                });
                const allRows = fakeServer.getData(request);
                const doingInfinite = request.startRow != null && request.endRow != null;
                const result = doingInfinite
                    ? { rowData: allRows.slice(request.startRow, request.endRow), rowCount: allRows.length }
                    : { rowData: allRows };
                setTimeout(() => {
                    params.success(result);
                }, 1);
            },
        };

        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'employeeId', hide: true },
                { field: 'employeeName', hide: true },
                { field: 'jobTitle', filter: true },
                { field: 'employmentType' },
            ],
            autoGroupColumnDef: {
                field: 'employeeName',
            },
            defaultColDef: { flex: 1, sortable: true },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            getRowId: ({ data: rowData }) => rowData.employeeId,
            isServerSideGroup: (dataItem: any) => dataItem.group,
            getServerSideGroupKey: (dataItem: any) => dataItem.employeeId,
            ...extraOptions,
        };

        const api = gridsManager.createGrid(gridId, gridOptions);
        api.setGridOption('serverSideDatasource', datasource);
        return { api, requests, fakeServer };
    }

    test('initial load requests the root children (groupKeys: []) and marks groups expandable', async () => {
        const { api, requests } = createTreeGrid('ssrmInitial');

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        // Only the root children are requested on initial load.
        expect(requests).toEqual([{ groupKeys: [], range: [0, 100] }]);

        // Node identification: the single top-level node is a server-side group
        // (isServerSideGroup returned truthy), keyed by its employeeId.
        expect(!!api.getRowNode('101')).toBe(true);
        expect(api.getRowNode('101')!.isExpandable()).toBe(true);

        await new GridRows(api, 'initial root children').check(`
            ROOT id:<no-id>
            └── 101 GROUP collapsed id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
        `);
    });

    test("expanding a group node lazily requests ONLY that node's children", async () => {
        const { api, requests } = createTreeGrid('ssrmExpandOne');

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);
        requests.length = 0; // discard the initial root request

        api.getRowNode('101')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        // The expand triggers exactly one request, scoped to the expanded node's path.
        expect(requests).toEqual([{ groupKeys: ['101'], range: [0, 100] }]);

        await new GridRows(api, 'expanded 101').check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├── 102 GROUP collapsed id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('expanding a nested node requests its full groupKeys path', async () => {
        const { api, requests } = createTreeGrid('ssrmExpandNested');

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);

        api.getRowNode('101')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        api.getRowNode('102')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        requests.length = 0; // discard everything up to the 2-level-deep expand

        // Expand a node that is 2 levels deep (101 -> 102 -> 103).
        api.getRowNode('103')!.setExpanded(true);
        await waitForNoLoadingRows(api);

        // The requested path is the full route to the expanded node.
        expect(requests).toEqual([{ groupKeys: ['101', '102', '103'], range: [0, 100] }]);

        await new GridRows(api, 'expanded nested 103').check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ 103 GROUP id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ │ ├── 104 GROUP collapsed id:104 ag-Grid-AutoColumn:"Brittany Hanson" employeeId:"104" employeeName:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ └── LEAF id:107 ag-Grid-AutoColumn:"Derek Paul" employeeId:"107" employeeName:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ └── 108 GROUP collapsed id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('applying a sort re-requests loaded blocks from the server', async () => {
        const { api, requests } = createTreeGrid('ssrmSort');

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);
        api.getRowNode('101')!.setExpanded(true);
        await waitForNoLoadingRows(api);
        requests.length = 0; // discard load requests, keep only sort-induced requests

        // Sort by jobTitle descending.
        api.applyColumnState({ state: [{ colId: 'jobTitle', sort: 'desc' }] });
        await waitForNoLoadingRows(api);

        // Pin whether/how the sort re-requests the server. The fake server ignores
        // the sortModel, so re-requested rows come back in their original order.
        expect(requests).toEqual([
            { groupKeys: [], range: [0, 100] },
            { groupKeys: ['101'], range: [0, 100] },
        ]);

        await new GridRows(api, 'after sort jobTitle desc').check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├── 102 GROUP collapsed id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });

    test('applying a filter re-requests from the server', async () => {
        const { api, requests } = createTreeGrid('ssrmFilter');

        await asyncSetTimeout(1);
        await waitForNoLoadingRows(api);
        requests.length = 0; // discard initial load

        // Apply a text filter on jobTitle.
        api.setFilterModel({ jobTitle: { filterType: 'text', type: 'contains', filter: 'CEO' } });
        await waitForNoLoadingRows(api);

        // Pin the re-request. The fake server ignores the filterModel, so the
        // returned rows are unchanged; this pins that filtering is delegated to
        // the server rather than applied client-side.
        expect(requests).toEqual([{ groupKeys: [], range: [0, 100] }]);

        await new GridRows(api, 'after filter jobTitle CEO').check(`
            ROOT id:<no-id>
            └── 101 GROUP collapsed id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
        `);
    });

    test('expand-and-load-all walks the whole tree, one request per group node', async () => {
        const { api, requests } = createTreeGrid('ssrmExpandAll');

        await asyncSetTimeout(1);
        await ssrmExpandAndLoadAll(api);

        // Every group node in the dataset produces exactly one children request.
        // Pin the set of requested paths (order-independent).
        const paths = requests.map((r) => r.groupKeys.join('/')).sort();
        expect(paths).toEqual(
            [
                '',
                '101',
                '101/102',
                '101/102/103',
                '101/102/103/104',
                '101/102/108',
                '101/113',
                '101/113/114',
                '101/113/114/115',
                '101/113/119',
            ].sort()
        );

        await new GridRows(api, 'fully expanded tree').check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├─┬ 103 GROUP id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ │ ├─┬ 104 GROUP id:104 ag-Grid-AutoColumn:"Brittany Hanson" employeeId:"104" employeeName:"Brittany Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · │ │ │ ├── LEAF id:105 ag-Grid-AutoColumn:"Leah Flowers" employeeId:"105" employeeName:"Leah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · │ │ │ └── LEAF id:106 ag-Grid-AutoColumn:"Tammy Sutton" employeeId:"106" employeeName:"Tammy Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · │ │ └── LEAF id:107 ag-Grid-AutoColumn:"Derek Paul" employeeId:"107" employeeName:"Derek Paul" jobTitle:"Inventory Control" employmentType:"Permanent"
            · │ └─┬ 108 GROUP id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · │ · ├── LEAF id:109 ag-Grid-AutoColumn:"Morris Hanson" employeeId:"109" employeeName:"Morris Hanson" jobTitle:"Sales Manager" employmentType:"Permanent"
            · │ · ├── LEAF id:110 ag-Grid-AutoColumn:"Todd Tyler" employeeId:"110" employeeName:"Todd Tyler" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ · ├── LEAF id:111 ag-Grid-AutoColumn:"Bennie Wise" employeeId:"111" employeeName:"Bennie Wise" jobTitle:"Sales Executive" employmentType:"Contract"
            · │ · └── LEAF id:112 ag-Grid-AutoColumn:"Joel Cooper" employeeId:"112" employeeName:"Joel Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
            · └─┬ 113 GROUP id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · · ├─┬ 114 GROUP id:114 ag-Grid-AutoColumn:"Sarah Baker" employeeId:"114" employeeName:"Sarah Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · · │ ├─┬ 115 GROUP id:115 ag-Grid-AutoColumn:"Mason Hanson" employeeId:"115" employeeName:"Mason Hanson" jobTitle:"Fleet Coordinator" employmentType:"Permanent"
            · · │ │ ├── LEAF id:116 ag-Grid-AutoColumn:"Hannah Flowers" employeeId:"116" employeeName:"Hannah Flowers" jobTitle:"Parts Technician" employmentType:"Contract"
            · · │ │ └── LEAF id:117 ag-Grid-AutoColumn:"Rob Sutton" employeeId:"117" employeeName:"Rob Sutton" jobTitle:"Service Technician" employmentType:"Contract"
            · · │ └── LEAF id:118 ag-Grid-AutoColumn:"Paul Smith" employeeId:"118" employeeName:"Paul Smith" jobTitle:"Inventory Control" employmentType:"Permanent"
            · · └─┬ 119 GROUP id:119 ag-Grid-AutoColumn:"Adam Newman" employeeId:"119" employeeName:"Adam Newman" jobTitle:"VP Sales" employmentType:"Permanent"
            · · · ├── LEAF id:120 ag-Grid-AutoColumn:"John Smith" employeeId:"120" employeeName:"John Smith" jobTitle:"Sales Manager" employmentType:"Permanent"
            · · · ├── LEAF id:121 ag-Grid-AutoColumn:"Alice Grant" employeeId:"121" employeeName:"Alice Grant" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · ├── LEAF id:122 ag-Grid-AutoColumn:"Ben Hill" employeeId:"122" employeeName:"Ben Hill" jobTitle:"Sales Executive" employmentType:"Contract"
            · · · └── LEAF id:123 ag-Grid-AutoColumn:"Joe Cooper" employeeId:"123" employeeName:"Joe Cooper" jobTitle:"Sales Executive" employmentType:"Permanent"
        `);
    });
});
