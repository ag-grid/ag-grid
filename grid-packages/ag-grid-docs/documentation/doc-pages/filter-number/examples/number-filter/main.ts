import { ColDef, Grid, GridOptions, INumberFilterParams, ValueFormatterParams } from '@ag-grid-community/core';
import { getData } from "./data";


var numberValueFormatter = function (params: ValueFormatterParams) {
  return params.value.toFixed(2)
}

var saleFilterParams: INumberFilterParams = {
  allowedCharPattern: '\\d\\-\\,\\$',
  numberParser: (text: string | null) => {
    return text == null
      ? null
      : parseFloat(text.replace(',', '.').replace('$', ''))
  },
}

var saleValueFormatter = function (params: ValueFormatterParams) {
  var formatted = params.value.toFixed(2).replace('.', ',')

  if (formatted.indexOf('-') === 0) {
    return '-$' + formatted.slice(1)
  }

  return '$' + formatted
}

const columnDefs: ColDef[] = [
  {
    field: 'sale',
    headerName: 'Sale ($)',
    filter: 'agNumberColumnFilter',
    floatingFilter: true,
    valueFormatter: numberValueFormatter,
  },
  {
    field: 'sale',
    headerName: 'Sale',
    filter: 'agNumberColumnFilter',
    floatingFilter: true,
    filterParams: saleFilterParams,
    valueFormatter: saleValueFormatter,
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
  },
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
