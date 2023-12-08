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

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 200,
    editable: true
  },
  columnDefs: columnDefs,
  rowData: data
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
