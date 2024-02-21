import { GridApi, createGrid, GridOptions, ISetFilterParams } from '@ag-grid-community/core';
import { getData } from "./data";

let gridApi: GridApi;

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
      } as ISetFilterParams,
    },
    {
      headerName: 'Excel (Mac)',
      field: 'animal',
      filter: 'agSetColumnFilter',
      filterParams: {
        excelMode: 'mac',
      } as ISetFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
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
  gridApi = createGrid(gridDiv, gridOptions);
})
