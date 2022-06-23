import { Grid, GridOptions, CellEditRequestEvent, GetRowIdParams } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicDataWithId> = {
  columnDefs: [
    { field: 'athlete', minWidth: 160 },
    { field: 'age' },
    { field: 'country', minWidth: 140 },
    { field: 'year' },
    { field: 'date', minWidth: 140 },
    { field: 'sport', minWidth: 160 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
  },
  getRowId: (params: GetRowIdParams) => params.data.id,
  readOnlyEdit: true,
  onCellEditRequest: onCellEditRequest
}

function onCellEditRequest(event: CellEditRequestEvent) {
  const oldData = event.data;
  const field = event.colDef.field;
  const newValue = event.newValue;
  const newData = { ...oldData };
  newData[field!] = event.newValue;

  console.log('onCellEditRequest, updating ' + field + ' to ' + newValue);

  const tx = {
    update: [newData]
  };
  event.api.applyTransaction(tx);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: any[]) => {
      data.forEach((item, index) => item.id = index);
      gridOptions.api!.setRowData(data);
    });
})
