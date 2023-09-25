import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefsA: ColDef[] = [
  { colId: 'permutationA', field: 'athlete', checkboxSelection: true },
  { field: 'country' },
  { field: 'year' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
];

const columnDefsB: ColDef[] = [
  { colId: 'permutationB', field: 'athlete' },
  { field: 'country' },
  { field: 'year' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
];

const gridOptions: GridOptions = {
  animateRows: true,
  defaultColDef: { flex: 1 },
  columnDefs: columnDefsA,

  rowSelection: 'multiple',
}

function selectItem(value: boolean) {
  if (gridOptions.api) {
    gridOptions.api.__updateProperty('columnDefs', value ? columnDefsA : columnDefsB, false);
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#true')!.setAttribute('checked', 'true');
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions);
  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(resp => resp.json())
    .then(data => gridOptions.api!.setRowData(data));
})
