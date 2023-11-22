import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  INumberCellEditorParams,
} from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { 
    headerName: 'Number Editor',
    field: 'number',
    cellEditor: 'agNumberCellEditor',
    cellEditorParams: {
      precision: 0,
    } as INumberCellEditorParams,
  }
];

const data = Array.from(Array(20).keys()).map( (val: any, index: number) => ({
  number: index
}) );

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
