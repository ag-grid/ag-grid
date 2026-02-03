import type { GridOptions, IsServerSideGroupOpenByDefaultParams } from 'ag-grid-community';
import { ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../../test-utils';
import { createFakeServer, createServerSideDatasource, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

describe('ag-grid SSRM treeData client-side sort refresh', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('refreshServerSide keeps client-side sort order', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'employeeId', hide: true },
                { field: 'employeeName', hide: true },
                { field: 'jobTitle' },
                { field: 'employmentType' },
            ],
            autoGroupColumnDef: {
                field: 'employeeName',
            },
            defaultColDef: { flex: 1 },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            serverSideEnableClientSideSort: true,
            cacheBlockSize: 100,
            maxBlocksInCache: 1,
            getRowId: ({ data }) => data.employeeId,
            isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
                return params.rowNode.level < 1;
            },
            isServerSideGroup: (dataItem: any) => {
                return dataItem.group;
            },
            getServerSideGroupKey: (dataItem: any) => {
                return dataItem.employeeId;
            },
        };

        const api = gridsManager.createGrid('ssrmTreeDataClientSideSortRefresh', gridOptions);

        await asyncSetTimeout(1);

        const data = getSmallTreeDataSet();
        const fakeServer = createFakeServer(data);
        const datasource = createServerSideDatasource(fakeServer);

        api!.setGridOption('serverSideDatasource', datasource);

        await waitForNoLoadingRows(api);

        api!.applyColumnState({
            state: [{ colId: 'ag-Grid-AutoColumn', sort: 'asc' }],
        });

        const gridRows = new GridRows(api, 'ssrm tree data sorted');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── 102 GROUP collapsed id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);

        api!.refreshServerSide({ purge: true });

        await waitForNoLoadingRows(api);

        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├── 113 GROUP collapsed id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · └── 102 GROUP collapsed id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
        `);
    });
});
