import { Grid, GridOptions, ISetFilterParams, SetFilterValuesFuncParams } from '@ag-grid-community/core'

var filterParams: ISetFilterParams = {
  values: (params: SetFilterValuesFuncParams) => {
    setTimeout(function () {
      params.success(['value 1', 'value 2'])
    }, 3000)
  },
}

const gridOptions: GridOptions = {
  rowData: [
    { value: 'value 1' },
    { value: 'value 1' },
    { value: 'value 1' },
    { value: 'value 1' },
    { value: 'value 2' },
    { value: 'value 2' },
    { value: 'value 2' },
    { value: 'value 2' },
    { value: 'value 2' },
  ],
  columnDefs: [
    {
      headerName: 'Set filter column',
      field: 'value',
      flex: 1,
      filter: 'agSetColumnFilter',
      floatingFilter: true,
      filterParams: filterParams,
    },
  ],
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
