import { Grid, ColDef, GridOptions, ValueFormatterParams } from '@ag-grid-community/core'
declare function createMockServer(): any;

const columnDefs: ColDef[] = [
  { field: 'code', maxWidth: 90 },
  { field: 'name', minWidth: 200 },
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

function numberFormatter(params: ValueFormatterParams) {
  if (typeof params.value === 'number') {
    return params.value.toFixed(2)
  }

  return params.value
}

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    resizable: true,
  },
  enableRangeSelection: true,
  // implement this so that we can do selection and have immutable data
  getRowId: function (params) {
    return params.data.code
  },

  onGridReady: function (params) {
    const mockServer = createMockServer(),
      initialLoad$ = mockServer.initialLoad(),
      updates$ = mockServer.allDataUpdates()

    initialLoad$.subscribe(function (rowData: any[]) {
      // the initial full set of data
      // note that we don't need to un-subscribe here as it's a one off data load
      params.api.setRowData(rowData)

      // now listen for updates
      // we're using immutableData this time, so although we're setting the entire
      // data set here, the grid will only re-render changed rows, improving performance
      updates$.subscribe(function (newRowData: any[]) {
        return params.api.setRowData(newRowData)
      })
    })
  },
}

document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})

