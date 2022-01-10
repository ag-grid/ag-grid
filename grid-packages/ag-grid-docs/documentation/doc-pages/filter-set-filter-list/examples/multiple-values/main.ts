import {
  GridOptions,
  KeyCreatorParams,
  ValueFormatterParams,
  ValueGetterParams,
} from '@ag-grid-community/core'

var valueGetter = function (params: ValueGetterParams) {
  return params.data['animalsString'].split('|')
}

var valueFormatter = function (params: ValueFormatterParams) {
  return params.value
    .map(function (animal: any) {
      return animal.name
    })
    .join(', ')
}

var keyCreator = function (params: KeyCreatorParams) {
  return params.value.map(function (animal: any) {
    return animal.name
  })
}

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Animals (array)',
      field: 'animalsArray',
      filterComp: 'agSetColumnFilter',
    },
    {
      headerName: 'Animals (string)',
      filterComp: 'agSetColumnFilter',
      valueGetter: valueGetter,
    },
    {
      headerName: 'Animals (objects)',
      field: 'animalsObjects',
      filterComp: 'agSetColumnFilter',
      valueFormatter: valueFormatter,
      keyCreator: keyCreator,
    },
  ],
  defaultColDef: {
    flex: 1,
  },
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)
})
