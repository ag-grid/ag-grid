import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'country' },
  { field: 'year' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
];

const gridOptions: GridOptions = {
  animateRows: true,
  defaultColDef: { flex: 1 },
  columnDefs: columnDefs,

  rowSelection: 'multiple',
  rowMultiSelectWithClick: false,
}

let checked = false;
function selectItem(event: any) {
  if (gridOptions.api) {
    checked = !checked;
    gridOptions.api.__updateProperty('rowMultiSelectWithClick', checked, false);
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions);
  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(resp => resp.json())
    .then(data => gridOptions.api!.setRowData(data));
})
