import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Default',
      field: 'animal',
      filter: 'agSetColumnFilter',
    },
    {
      headerName: 'Excel (Windows)',
      field: 'animal',
      filter: 'agSetColumnFilter',
      filterParams: {
        excelMode: 'windows',
      },
    },
    {
      headerName: 'Excel (Mac)',
      field: 'animal',
      filter: 'agSetColumnFilter',
      filterParams: {
        excelMode: 'mac',
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
  },
  sideBar: 'filters',
  rowData: getData(),
  localeText: {
    applyFilter: 'OK',
    cancelFilter: 'Cancel',
    resetFilter: 'Clear Filter',
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
