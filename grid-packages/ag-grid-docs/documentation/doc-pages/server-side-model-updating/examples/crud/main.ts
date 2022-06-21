import { Grid, ColDef, GetRowIdParams, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from '@ag-grid-community/core'
declare var window: any;

const columnDefs: ColDef[] = [
  { field: 'athlete', width: 150 },
  { field: 'age' },
  { field: 'country', width: 150 },
  { field: 'year' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 100,
    resizable: true,
  },
  rowSelection: 'single',
  columnDefs: columnDefs,
  rowModelType: 'serverSide',
  serverSideInfiniteScroll: true,
  getRowId: getRowId
}

function getRowId(params: GetRowIdParams) {
  return params.data.id;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(function (data) {
      // add id to data
      let idSequence = 0;
      data.forEach(function (item: any) {
        item.id = idSequence++
      });
      var datasource = createMyDataSource(data)
      gridOptions.api!.setServerSideDatasource(datasource)
    })
})

var newItemCount = 0

function onBtRemove() {
  var selectedRows = gridOptions.api!.getSelectedNodes()
  if (!selectedRows || selectedRows.length === 0) {
    return
  }

  var selectedRow = selectedRows[0]

  var indexToRemove = window.rowDataServerSide.indexOf(selectedRow.data)
  // the record could be missing, if the user hit the 'remove' button a few times before refresh happens
  if (indexToRemove >= 0) {
    window.rowDataServerSide.splice(indexToRemove, 1)
  }

  gridOptions.api!.refreshServerSide()
}

function onBtAdd() {
  var selectedRows = gridOptions.api!.getSelectedNodes()
  if (!selectedRows || selectedRows.length === 0) {
    return
  }

  var selectedRow = selectedRows[0]

  // insert new row in the source data, at the top of the page
  window.rowDataServerSide.splice(selectedRow.rowIndex, 0, {
    athlete: 'New Item' + newItemCount,
    id: '' + Math.random()
  })
  newItemCount++

  gridOptions.api!.refreshServerSide()
}

function createMyDataSource(data: any[]) {
  window.rowDataServerSide = data

  const dataSource: IServerSideDatasource = {

    getRows: (params: IServerSideGetRowsParams) => {
      setTimeout(function () {
        // take a slice of the total rows
        var rowsThisPage = data.slice(
          params.request.startRow,
          params.request.endRow
        )
        // call the success callback
        params.success({
          rowData: rowsThisPage,
          rowCount: window.rowDataServerSide.length,
        })
      }, 500)
    }
  }

  return dataSource;
}
