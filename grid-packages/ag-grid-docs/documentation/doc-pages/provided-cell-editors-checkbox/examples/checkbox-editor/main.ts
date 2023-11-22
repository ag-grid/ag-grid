import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
} from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { 
    headerName: 'Checkbox Cell Editor',
    field: 'boolean',
    cellEditor: 'agCheckboxCellEditor',
  }
];

const data = Array.from(Array(20).keys()).map( (val: any, index: number) => ({
  boolean: !!(index % 2),
}));

let gridApi: GridApi;

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
    resizable: true,
    editable: true
  },
  columnDefs: columnDefs,
  rowData: data
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
