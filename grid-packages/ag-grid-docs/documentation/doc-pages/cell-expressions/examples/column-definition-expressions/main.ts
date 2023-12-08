import { CellValueChangedEvent, ColDef, GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";


const columnDefs: ColDef[] = [
  {
    headerName: 'String (editable)',
    field: 'simple',
    editable: true,
  },
  {
    headerName: 'Number (editable)',
    field: 'number',
    editable: true,
    valueFormatter: `"£" + Math.floor(value).toString().replace(/(\\d)(?=(\\d{3})+(?!\\d))/g, "$1,")`,
  },
  {
    headerName: 'Name (editable)',
    editable: true,
    valueGetter: 'data.firstName + " " + data.lastName',
    valueSetter:
      // an expression can span multiple lines!!!
      `var nameSplit = newValue.split(" ");
             var newFirstName = nameSplit[0];
             var newLastName = nameSplit[1];
             if (data.firstName !== newFirstName || data.lastName !== newLastName) {
                data.firstName = newFirstName;
                data.lastName = newLastName;
                return true;
            } else {
                return false;
            }`,
  },
  { headerName: 'A', field: 'a', width: 100 },
  { headerName: 'B', field: 'b', width: 100 },
  { headerName: 'A + B', valueGetter: 'data.a + data.b' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    sortable: false
  },
  rowData: getData(),
  onCellValueChanged: onCellValueChanged,
  autoSizeStrategy: {type: 'fitGridWidth'}
}


function onCellValueChanged(event: CellValueChangedEvent) {
  console.log('data after changes is: ', event.data)
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
