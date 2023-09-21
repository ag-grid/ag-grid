import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { colId: 'permutationA', field: 'athlete' },
  { field: 'country' },
  { field: 'year' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
];

const columnDefs2: ColDef[] = [
  { colId: 'permutationB', field: 'athlete', checkboxSelection: (params) => params.node.data.year === 2008, },
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

  rowSelection: 'single',
}

let checked = false;
function selectItem(event: any) {
  if (gridOptions.api) {
    checked = !checked;
    gridOptions.api.__updateProperty('columnDefs', !checked ? columnDefs : columnDefs2, false);
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
