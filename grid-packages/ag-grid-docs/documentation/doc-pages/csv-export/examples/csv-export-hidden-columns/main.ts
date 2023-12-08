import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    minWidth: 100,
    flex: 1,
  },

  suppressExcelExport: true,
  popupParent: document.body,

  columnDefs: [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'gold', hide: true },
    { field: 'silver', hide: true },
    { field: 'bronze', hide: true },
    { field: 'total' },
  ],

  rowData: getData()
}

function getBoolean(id: string) {
  var field: any = document.querySelector('#' + id)

  return !!field.checked
}

function getParams() {
  return {
    allColumns: getBoolean('allColumns'),
  }
}

function onBtnExport() {
  gridApi!.exportDataAsCsv(getParams())
}

function onBtnUpdate() {
  (document.querySelector('#csvResult') as any).value = gridApi!.getDataAsCsv(
    getParams()
  )
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
