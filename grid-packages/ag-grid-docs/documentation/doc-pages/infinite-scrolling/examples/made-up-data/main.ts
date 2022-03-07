import { Grid, ColDef, GridOptions, IDatasource, IGetRowsParams } from '@ag-grid-community/core'

var ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

function getColumnDefs() {
  const columnDefs: ColDef[] = [
    { checkboxSelection: true, headerName: '', width: 60 },
    { headerName: '#', width: 80, valueGetter: 'node.rowIndex' },
  ]

  ALPHABET.forEach(function (letter) {
    columnDefs.push({
      headerName: letter.toUpperCase(),
      field: letter,
      width: 150,
    })
  })
  return columnDefs
}

const gridOptions: GridOptions = {
  columnDefs: getColumnDefs(),
  defaultColDef: {
    resizable: true,
  },
  rowModelType: 'infinite',
  rowSelection: 'multiple',
  maxBlocksInCache: 2,
  suppressRowClickSelection: true,
  getRowId: function (params) {
    return params.data.a
  },
  datasource: getDataSource(100),
}

function getDataSource(count: number) {

  const dataSource: IDatasource = {
    rowCount: count,
    getRows: function (params: IGetRowsParams) {
      var rowsThisPage: any[] = []

      for (var rowIndex = params.startRow; rowIndex < params.endRow; rowIndex++) {
        var record: Record<string, string> = {}
        ALPHABET.forEach(function (letter, colIndex) {
          var randomNumber = 17 + rowIndex + colIndex
          var cellKey = letter.toUpperCase() + (rowIndex + 1)
          record[letter] = cellKey + ' = ' + randomNumber
        })
        rowsThisPage.push(record)
      }

      // to mimic server call, we reply after a short delay
      setTimeout(function () {
        // no need to pass the second 'rowCount' parameter as we have already provided it
        params.successCallback(rowsThisPage)
      }, 100)
    }

  }
  return dataSource;
}

document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
