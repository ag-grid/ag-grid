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
      min: 0,
      max: 100
    } as INumberCellEditorParams,
  }
];

const data = Array.from(Array(20).keys()).map( (val: any, index: number) => ({
  number: index
}) );

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
