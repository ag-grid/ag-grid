import type {
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
    IServerSideGetRowsRequest,
    IsServerSideGroupOpenByDefaultParams,
} from 'ag-grid-community';
import { ServerSideRowModelModule, TreeDataModule } from 'ag-grid-enterprise';

import {
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    ssrmExpandAndLoadAll,
    waitForNoLoadingRows,
} from '../../test-utils';
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
            cacheBlockSize: 2000000,
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

    test('purge refresh keeps client-side sort order for leaf rows', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'employeeId', hide: true }, { field: 'name', hide: true }, { field: 'experience' }],
            autoGroupColumnDef: {
                field: 'name',
            },
            defaultColDef: { flex: 1 },
            treeData: true,
            rowModelType: 'serverSide',
            animateRows: false,
            serverSideEnableClientSideSort: true,
            cacheBlockSize: 100,
            maxBlocksInCache: 1,
            getRowId: ({ data, parentKeys = [], level }) => {
                const base = data.employeeId ?? data.name;
                return `${parentKeys.join('/')}:${level}:${base}`;
            },
            isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
                return params.rowNode.level < 2;
            },
            isServerSideGroup: (dataItem: any) => {
                return dataItem.group;
            },
            getServerSideGroupKey: (dataItem: any) => {
                return dataItem.name;
            },
        };

        const api = gridsManager.createGrid('ssrmTreeDataClientSideSortPurgeRefresh', gridOptions);

        await asyncSetTimeout(1);

        const data = getExperienceTreeDataSet();
        const fakeServer = createExperienceFakeServer(data);
        const datasource = createExperienceServerSideDatasource(fakeServer);

        api!.setGridOption('serverSideDatasource', datasource);

        await waitForNoLoadingRows(api);
        await ssrmExpandAndLoadAll(api);

        api!.applyColumnState({
            state: [{ colId: 'experience', sort: 'asc' }],
        });

        const gridRows = new GridRows(api, 'ssrm tree data experience sorted');
        await gridRows.check(`
           ROOT id:<no-id>
           └─┬ Root GROUP id:":0:200" ag-Grid-AutoColumn:"Root" employeeId:"200" name:"Root" experience:0
           · ├── LEAF id:"Root:1:202" ag-Grid-AutoColumn:"Beta" employeeId:"202" name:"Beta" experience:1
           · ├── LEAF id:"Root:1:203" ag-Grid-AutoColumn:"Gamma" employeeId:"203" name:"Gamma" experience:2
           · └── LEAF id:"Root:1:201" ag-Grid-AutoColumn:"Alpha" employeeId:"201" name:"Alpha" experience:3
        `);

        api!.refreshServerSide({ purge: true });

        await waitForNoLoadingRows(api);
        await ssrmExpandAndLoadAll(api);

        await gridRows.check(`
            ROOT id:<no-id>
            └─┬ Root GROUP id:":0:200" ag-Grid-AutoColumn:"Root" employeeId:"200" name:"Root" experience:0
            · ├── LEAF id:"Root:1:202" ag-Grid-AutoColumn:"Beta" employeeId:"202" name:"Beta" experience:1
            · ├── LEAF id:"Root:1:203" ag-Grid-AutoColumn:"Gamma" employeeId:"203" name:"Gamma" experience:2
            · └── LEAF id:"Root:1:201" ag-Grid-AutoColumn:"Alpha" employeeId:"201" name:"Alpha" experience:3
        `);
    });
});

interface ExperienceNode {
    employeeId: string;
    name: string;
    experience: number;
    group?: boolean;
    underlings?: ExperienceNode[];
}

interface ExperienceRow {
    employeeId: string;
    name: string;
    experience: number;
    group?: boolean;
}

interface ExperienceServer {
    data: ExperienceNode[];
    getData(request: IServerSideGetRowsRequest): ExperienceRow[];
}

function getExperienceTreeDataSet(): ExperienceNode[] {
    return [
        {
            employeeId: '200',
            name: 'Root',
            experience: 0,
            underlings: [
                {
                    employeeId: '201',
                    name: 'Alpha',
                    experience: 3,
                },
                {
                    employeeId: '202',
                    name: 'Beta',
                    experience: 1,
                },
                {
                    employeeId: '203',
                    name: 'Gamma',
                    experience: 2,
                },
            ],
        },
    ];
}

function createExperienceFakeServer(data: ExperienceNode[]): ExperienceServer {
    return {
        data,
        getData(request: IServerSideGetRowsRequest): ExperienceRow[] {
            function extractRowsFromData(groupKeys: string[], rows: ExperienceNode[]): ExperienceRow[] {
                if (groupKeys.length === 0) {
                    return rows.map((row) => ({
                        group: !!row.underlings?.length,
                        employeeId: row.employeeId,
                        name: row.name,
                        experience: row.experience,
                    }));
                }

                const key = groupKeys[0];
                for (let i = 0; i < rows.length; i++) {
                    const node = rows[i];
                    if (node.name === key) {
                        const next = node.underlings ? node.underlings.slice() : [];
                        return extractRowsFromData(groupKeys.slice(1), next);
                    }
                }
                return [];
            }

            return extractRowsFromData(request.groupKeys ?? [], data);
        },
    };
}

function createExperienceServerSideDatasource(fakeServer: ExperienceServer): IServerSideDatasource {
    const dataSource: IServerSideDatasource = {
        getRows: (params: IServerSideGetRowsParams) => {
            const allRows = fakeServer.getData(params.request);
            const request = params.request;
            const doingInfinite = request.startRow != null && request.endRow != null;
            const result = doingInfinite
                ? {
                      rowData: allRows.slice(request.startRow, request.endRow),
                      rowCount: allRows.length,
                  }
                : { rowData: allRows };
            setTimeout(() => {
                params.success(result);
            }, 1);
        },
    };
    return dataSource;
}
