import {
  Grid,
  GridOptions,
  ISetFilterParams,
  KeyCreatorParams,
  ValueFormatterParams,
  ValueGetterParams
} from '@ag-grid-community/core';
import { getData } from "./data";


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

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Animals (array)',
      field: 'animalsArray',
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Animals (string)',
      filter: 'agSetColumnFilter',
      valueGetter: valueGetter,
    },
    {
      headerName: 'Animals (objects)',
      field: 'animalsObjects',
      filter: 'agSetColumnFilter',
      valueFormatter: valueFormatter,
      keyCreator: (params: KeyCreatorParams) => params.value.name,
      filterParams: {
        valueFormatter: (params: ValueFormatterParams) => params.value ? params.value.name : '(Blanks)'
      } as ISetFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
  },
  rowData: getData(),
  sideBar: 'filters',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
