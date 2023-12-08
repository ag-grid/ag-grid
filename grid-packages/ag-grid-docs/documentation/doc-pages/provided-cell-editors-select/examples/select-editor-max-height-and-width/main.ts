import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  ISelectCellEditorParams,
} from '@ag-grid-community/core';
import { colors } from './colors';

const columnDefs: ColDef[] = [
  {
    headerName: 'Select Editor Without Max Height and Max Width',
    field: 'color',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: colors
    } as ISelectCellEditorParams
  },
  {
    headerName: 'Select Editor With Max Height and Max Width',
    field: 'color',
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: colors,
      valueListMaxHeight: 200,
      valueListMaxWidth: 150
    } as ISelectCellEditorParams
  }
];

function getRandomNumber(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const data = Array.from(Array(20).keys()).map(() => {
  const color = colors[getRandomNumber(0, colors.length - 1)];
  return ({ color });
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
