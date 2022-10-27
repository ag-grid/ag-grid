import { Grid, ColDef, GridOptions, ProcessDataFromClipboardParams } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { headerName: 'Athlete', field: 'athlete', width: 150 },
  { headerName: 'Age', field: 'age', width: 90 },
  { headerName: 'Country', field: 'country', width: 120 },
  { headerName: 'Year', field: 'year', width: 90 },
  { headerName: 'Date', field: 'date', width: 110 },
  { headerName: 'Sport', field: 'sport', width: 110 },
];

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
  },
  columnDefs,
  rowSelection: 'multiple',
  processDataFromClipboard
};

function processDataFromClipboard(params: ProcessDataFromClipboardParams): string[][] | null {
  const data = [...params.data];
  const emptyLastRow =
    data[data.length - 1][0] === '' &&
    data[data.length - 1].length === 1;

  if (emptyLastRow) {
    data.splice(data.length - 1, 1);
  }

  const lastIndex = gridOptions.api!.getModel().getRowCount() - 1;
  const focusedCell = gridOptions.api!.getFocusedCell();
  const focusedIndex = focusedCell!.rowIndex;

  if (focusedIndex + data.length - 1 > lastIndex) {
    const resultLastIndex = focusedIndex + (data.length - 1);
    const numRowsToAdd = resultLastIndex - lastIndex;

    const rowsToAdd: any[] = [];
    for (let i = 0; i < numRowsToAdd; i++) {
      const index = data.length - 1;
      const row = data.slice(index, index + 1)[0];

      // Create row object
      const rowObject: any = {};
      let currentColumn: any = focusedCell!.column;
      row.forEach((item) => {
        if (!currentColumn) { return; }
        rowObject[currentColumn.colDef.field] = item;
        currentColumn = gridOptions.columnApi!.getDisplayedColAfter(currentColumn);
      });

      rowsToAdd.push(rowObject);
    }

    gridOptions.api!.applyTransaction({ add: rowsToAdd });
  }

  return data;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
  new Grid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then((response) => response.json())
    .then((data) => gridOptions.api!.setRowData(data.slice(0,8)));
});
