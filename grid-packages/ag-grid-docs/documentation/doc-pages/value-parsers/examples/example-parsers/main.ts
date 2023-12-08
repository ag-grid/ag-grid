import { CellValueChangedEvent, GridApi, createGrid, GridOptions, ValueParserParams } from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions = {
  columnDefs: [
    { headerName: 'Name', field: 'simple' },
    { headerName: 'Bad Number', field: 'numberBad' },
    {
      headerName: 'Good Number',
      field: 'numberGood',
      valueParser: numberParser,
    },
  ],
  defaultColDef: {
    flex: 1,
    editable: true,
    cellDataType: false,
  },
  rowData: getData(),
  onCellValueChanged: onCellValueChanged,
}

function onCellValueChanged(event: CellValueChangedEvent) {
  console.log('data after changes is: ', event.data);
}

function numberParser(params: ValueParserParams) {
  return Number(params.newValue)
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
