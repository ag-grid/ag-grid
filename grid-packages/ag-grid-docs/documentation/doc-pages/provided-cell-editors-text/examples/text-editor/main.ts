import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  ITextCellEditorParams
} from '@ag-grid-community/core';
import { colors } from './colors';

const columnDefs: ColDef[] = [
  {
    field: 'color',
    cellEditor: 'agTextCellEditor',
    cellEditorParams: {
      maxLength: 20
    } as ITextCellEditorParams
  },
  {
    field: 'value',
    valueFormatter: (params) => `£ ${params.value}`,
    cellEditor: 'agTextCellEditor',
    cellEditorParams: {
      maxLength: 20,
    } as ITextCellEditorParams
  },
];

function getRandomNumber(min: number, max: number) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const data = Array.from(Array(20).keys()).map(() => {
  const color = colors[getRandomNumber(0, colors.length - 1)];
  return ({
    color: color,
    value: getRandomNumber(0, 1000)
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
