import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
} from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: 'Date as String Editor',
    field: 'dateString',
    cellEditor: 'agDateStringCellEditor',
  },
];

const data = Array.from(Array(20).keys()).map( (val: any, index: number) => ({
  dateString: `2023-06-${index < 9 ? '0' + (index + 1) : index + 1}`,
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
