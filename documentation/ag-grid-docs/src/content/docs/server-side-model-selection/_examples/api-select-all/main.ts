import {
  GridApi,
  createGrid,
  GridOptions,
  GetRowIdParams,
  IsServerSideGroupOpenByDefaultParams,
  FirstDataRenderedEvent,
  IServerSideDatasource,
  IServerSideSelectionState,
} from '@ag-grid-community/core';
import { FakeServer } from './fakeServer';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([RowGroupingModule, ServerSideRowModelModule]);

let gridApi: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', enableRowGroup: true, rowGroup: true, hide: true },
    { field: 'year', enableRowGroup: true, rowGroup: true, hide: true },
    { field: 'athlete', hide: true },
    { field: 'sport', enableRowGroup: true, checkboxSelection: true, filter: 'agTextColumnFilter' },
    { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'silver', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
    { field: 'bronze', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
  ],
  defaultColDef: {
    floatingFilter: true,
    flex: 1,
    minWidth: 120,
  },
  getRowId: (params: GetRowIdParams) => {
    if (params.data.id != null) {
      return 'leaf-' + params.data.id;
    }
    const rowGroupCols = params.api.getRowGroupColumns();
    const rowGroupColIds = rowGroupCols.map(col => col.getId()).join('-');
    const thisGroupCol = rowGroupCols[params.level];
    return 'group-' + rowGroupColIds + '-' + (params.parentKeys || []).join('-') + params.data[thisGroupCol.getColDef().field!];
  },
  isServerSideGroupOpenByDefault: (params: IsServerSideGroupOpenByDefaultParams) => {
    return params.rowNode.key === 'United States' || String(params.rowNode.key) === '2004';
  },
  autoGroupColumnDef: {
    headerCheckboxSelection: true,
    field: 'athlete',
    flex: 1,
    minWidth: 240,
    cellRendererParams: {
      checkbox: true,
    },
  },

  onFirstDataRendered: (params: FirstDataRenderedEvent) => {
    params.api.setServerSideSelectionState({
      selectAll: true,
      toggledNodes: ['United States', 'United States2004'],
    });
  },
  rowGroupPanelShow: 'always',

  // use the server-side row model
  rowModelType: 'serverSide',

  // allow multiple row selections
  rowSelection: 'multiple',

  // restrict row selections via checkbox selection
  suppressRowClickSelection: true,

  suppressAggFuncInHeader: true,
}

let selectionState: IServerSideSelectionState = {
  selectAll: false,
  toggledNodes: [],
};

function saveSelectionState() {
  selectionState = (gridApi!.getServerSideSelectionState() as IServerSideSelectionState);
  console.log(JSON.stringify(selectionState, null, 2));
}

function loadSelectionState() {
  gridApi!.setServerSideSelectionState(selectionState);
}

function clearSelectionState() {
  gridApi!.setServerSideSelectionState({
    selectAll: false,
    toggledNodes: [],
  });
}

function getServerSideDatasource(server: any): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log('[Datasource] - rows requested by grid: ', params.request)

      var response = server.getData(params.request)

      // adding delay to simulate real server call
      setTimeout(() => {
        if (response.success) {
          // call the success callback
          params.success({ rowData: response.rows, rowCount: response.lastRow })
        } else {
          // inform the grid request failed
          params.fail()
        }
      }, 200)
    },
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      // assign a unique ID to each data item
      data.forEach(function (item: any, index: number) {
        item.id = index;
      });

      // setup the fake server with entire dataset
      var fakeServer = new FakeServer(data)

      // create datasource with a reference to the fake server
      var datasource = getServerSideDatasource(fakeServer)

      // register the datasource with the grid
      gridApi!.setGridOption('serverSideDatasource', datasource)
    })
})