import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  ILargeTextEditorParams,
} from '@ag-grid-community/core';;

const columnDefs: ColDef[] = [
  {
    headerName: 'Large Text Editor',
    field: 'description',
    cellEditor: 'agLargeTextCellEditor',
    cellEditorPopup: true
  }
];

const data = Array.from(Array(20).keys()).map(() => {
  return ({
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  });
});

let gridApi: GridApi;

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
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
