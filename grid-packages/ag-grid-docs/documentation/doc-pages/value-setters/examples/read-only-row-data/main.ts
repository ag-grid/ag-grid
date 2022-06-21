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

let rowImmutableStore: any[];

function onCellEditRequest(event: CellEditRequestEvent) {
  const data = event.data;
  const field = event.colDef.field;
  const newValue = event.newValue;
  const newItem = { ...data };
  newItem[field!] = event.newValue;

  console.log('onCellEditRequest, updating ' + field + ' to ' + newValue);

  rowImmutableStore = rowImmutableStore.map(oldItem => oldItem.id == newItem.id ? newItem : oldItem);
  gridOptions.api!.setRowData(rowImmutableStore);
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
      rowImmutableStore = data;
      gridOptions.api!.setRowData(rowImmutableStore);
    });
})
