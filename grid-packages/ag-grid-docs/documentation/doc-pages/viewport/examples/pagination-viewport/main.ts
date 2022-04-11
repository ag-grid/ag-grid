import { Grid, ColDef, GridOptions, IViewportDatasource, ValueFormatterParams, ICellRendererParams, ICellRendererComp, GetRowIdParams } from '@ag-grid-community/core'
declare function createMockServer(): any;
declare function createViewportDatasource(mockServer: any): IViewportDatasource;

class RowIndexRenderer implements ICellRendererComp {
  eGui!: HTMLDivElement;
  init(params: ICellRendererParams) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '' + params.rowIndex;

  }
  refresh(params: ICellRendererParams): boolean {
    return false;
  }
  getGui(): HTMLElement {
    return this.eGui;
  }
}


const columnDefs: ColDef[] = [
  // this col shows the row index, doesn't use any data from the row
  {
    headerName: '#',
    maxWidth: 80,
    cellRenderer: RowIndexRenderer
  },
  { field: 'code', maxWidth: 90 },
  { field: 'name', minWidth: 220 },
  {
    field: 'bid',
    cellClass: 'cell-number',
    valueFormatter: numberFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    field: 'mid',
    cellClass: 'cell-number',
    valueFormatter: numberFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    field: 'ask',
    cellClass: 'cell-number',
    valueFormatter: numberFormatter,
    cellRenderer: 'agAnimateShowChangeCellRenderer',
  },
  {
    field: 'volume',
    cellClass: 'cell-number',
    cellRenderer: 'agAnimateSlideCellRenderer',
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 140,
    resizable: true,
  },
  enableRangeSelection: true,
  rowModelType: 'viewport',
  pagination: true,
  paginationAutoPageSize: true,
  viewportRowModelPageSize: 1,
  viewportRowModelBufferSize: 0,
  // implement this so that we can do selection
  getRowId: function (params: GetRowIdParams) {
    // the code is unique, so perfect for the id
    return params.data.code
  },
  // debug: true,
}

function numberFormatter(params: ValueFormatterParams) {
  if (typeof params.value === 'number') {
    return params.value.toFixed(2)
  } else {
    return params.value
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  fetch('https://www.ag-grid.com/example-assets/stocks.json')
    .then(response => response.json())
    .then(function (data) {
      // set up a mock server - real code will not do this, it will contact your
      // real server to get what it needs
      var mockServer = createMockServer()
      mockServer.init(data)

      var viewportDatasource = createViewportDatasource(mockServer)
      gridOptions.api!.setViewportDatasource(viewportDatasource)
      // put the 'size cols to fit' into a timeout, so that the scroll is taken into consideration
      setTimeout(function () {
        gridOptions.api!.sizeColumnsToFit()
      }, 100)
    })
})



