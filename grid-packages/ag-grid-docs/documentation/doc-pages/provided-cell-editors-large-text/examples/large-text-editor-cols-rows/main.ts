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
    cellEditorPopup: true,
    cellEditorParams: {
        rows: 15,
        cols: 50
    } as ILargeTextEditorParams,
  }
];

const data = Array.from(Array(20).keys()).map(() => {
  return ({
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  });
});

const gridOptions: GridOptions = {
  defaultColDef: {
    flex: 1,
    editable: true
  },
  columnDefs: columnDefs,
  rowData: data
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
