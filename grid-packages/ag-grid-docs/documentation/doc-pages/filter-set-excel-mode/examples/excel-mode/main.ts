import { GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Default',
      field: 'animal',
      filterComp: 'agSetColumnFilter',
    },
    {
      headerName: 'Excel (Windows)',
      field: 'animal',
      filterComp: 'agSetColumnFilter',
      filterParams: {
        excelMode: 'windows',
      },
    },
    {
      headerName: 'Excel (Mac)',
      field: 'animal',
      filterComp: 'agSetColumnFilter',
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
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})
