import type { GridOptions, IsServerSideGroupOpenByDefaultParams } from 'ag-grid-community';
import { ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../../test-utils';
import { createFakeServer, createServerSideDatasource, getSmallTreeDataSet } from './ssrmSmallTreeDataSet';

describe('ag-grid SSRM treeData open-by-default loads children', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('groups open by default (level < 2) load their children on initial load', async () => {
        // Small tree mirroring the docs example shape

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
            getRowId: ({ data }) => data.employeeId,

            isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
                // open first two levels by default
                return params.rowNode.level < 2;
            },
            isServerSideGroup: (dataItem: any) => {
                // indicate if node is a group
                return dataItem.group;
            },
            getServerSideGroupKey: (dataItem: any) => {
                // specify which group key to use
                return dataItem.employeeId;
            },
        };

        const api = gridsManager.createGrid('ssrmOpenDefault', gridOptions);

        await asyncSetTimeout(1);

        const data = getSmallTreeDataSet();
        const fakeServer = createFakeServer(data);
        const datasource = createServerSideDatasource(fakeServer);

        api!.setGridOption('serverSideDatasource', datasource);

        for (let repeat = 0; fakeServer.loadsCount < 4 && repeat < 500; ++repeat) {
            await asyncSetTimeout(1);
        }

        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'ssrm open by default');
        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ 101 GROUP id:101 ag-Grid-AutoColumn:"Erica Rogers" employeeId:"101" employeeName:"Erica Rogers" jobTitle:"CEO" employmentType:"Permanent"
            · ├─┬ 102 GROUP id:102 ag-Grid-AutoColumn:"Malcolm Barrett" employeeId:"102" employeeName:"Malcolm Barrett" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · │ ├── 103 GROUP collapsed id:103 ag-Grid-AutoColumn:"Esther Baker" employeeId:"103" employeeName:"Esther Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · │ └── 108 GROUP collapsed id:108 ag-Grid-AutoColumn:"Francis Strickland" employeeId:"108" employeeName:"Francis Strickland" jobTitle:"VP Sales" employmentType:"Permanent"
            · └─┬ 113 GROUP id:113 ag-Grid-AutoColumn:"Luke McBride" employeeId:"113" employeeName:"Luke McBride" jobTitle:"Exec. Vice President" employmentType:"Permanent"
            · · ├── 114 GROUP collapsed id:114 ag-Grid-AutoColumn:"Sarah Baker" employeeId:"114" employeeName:"Sarah Baker" jobTitle:"Director of Operations" employmentType:"Permanent"
            · · └── 119 GROUP collapsed id:119 ag-Grid-AutoColumn:"Adam Newman" employeeId:"119" employeeName:"Adam Newman" jobTitle:"VP Sales" employmentType:"Permanent"
        `);
    });
});
