import { ColDef, GridApi, GridOptions, IServerSideDatasource, createGrid } from '@ag-grid-community/core';
import { CommunityFeaturesModule, ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { getCountries } from './countries';
import { CustomAgeFilter } from './customAgeFilter';
import { createFakeServer, createServerSideDatasource } from './server';

ModuleRegistry.registerModules([
    CommunityFeaturesModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    RowGroupingModule,
    ServerSideRowModelModule,
    SetFilterModule,
]);

const countries = getCountries();

const columnDefs: ColDef[] = [
    { field: 'athlete', enableRowGroup: true, filter: false },
    {
        field: 'age',
        enableRowGroup: true,
        enablePivot: true,
        filter: CustomAgeFilter,
    },
    {
        field: 'country',
        enableRowGroup: true,
        enablePivot: true,
        rowGroup: true,
        hide: true,
        filter: 'agSetColumnFilter',
        filterParams: { values: countries },
    },
    {
        field: 'year',
        enableRowGroup: true,
        enablePivot: true,
        rowGroup: true,
        hide: true,
        filter: 'agSetColumnFilter',
        filterParams: {
            values: ['2000', '2002', '2004', '2006', '2008', '2010', '2012'],
        },
    },
    { field: 'sport', enableRowGroup: true, enablePivot: true, filter: false },
    { field: 'gold', aggFunc: 'sum', filter: false, enableValue: true },
    { field: 'silver', aggFunc: 'sum', filter: false, enableValue: true },
    { field: 'bronze', aggFunc: 'sum', filter: false, enableValue: true },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        // restrict what aggregation functions the columns can have,
        // include a custom function 'random' that just returns a
        // random number
        allowedAggFuncs: ['sum', 'min', 'max', 'random'],
        filter: true,
    },
    autoGroupColumnDef: {
        width: 180,
    },
    columnDefs: columnDefs,
    rowModelType: 'serverSide',
    rowGroupPanelShow: 'always',
    pivotPanelShow: 'always',
    sideBar: true,
    maxConcurrentDatasourceRequests: 1,
    maxBlocksInCache: 2,
    purgeClosedRowNodes: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            const fakeServer = createFakeServer(data);
            const datasource = createServerSideDatasource(fakeServer);
            gridApi!.setGridOption('serverSideDatasource', datasource);
        });
});
