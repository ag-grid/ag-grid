import { Grid, ColDef, FirstDataRenderedEvent, GridOptions, IDoesFilterPassParams, IFilterComp, IFilterParams, IServerSideDatasource, AgPromise, IAfterGuiAttachedParams } from '@ag-grid-community/core'
declare var CustomAgeFilter: any;
declare function createFakeServer(data: any): any;
declare function createServerSideDatasource(server: any, gridOptions: GridOptions): IServerSideDatasource;
declare function getCountries(): string[];

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
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    // restrict what aggregation functions the columns can have,
    // include a custom function 'random' that just returns a
    // random number
    allowedAggFuncs: ['sum', 'min', 'max', 'random'],
    sortable: true,
    resizable: true,
    filter: true,
  },
  autoGroupColumnDef: {
    width: 180,
  },
  columnDefs: columnDefs,
  rowModelType: 'serverSide',
  rowGroupPanelShow: 'always',
  pivotPanelShow: 'always',
  animateRows: true,
  sideBar: true,
  maxConcurrentDatasourceRequests: 1,
  maxBlocksInCache: 2,
  purgeClosedRowNodes: true,
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.sizeColumnsToFit()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions)

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      const fakeServer = createFakeServer(data);
      const datasource = createServerSideDatasource(fakeServer, gridOptions);
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})

