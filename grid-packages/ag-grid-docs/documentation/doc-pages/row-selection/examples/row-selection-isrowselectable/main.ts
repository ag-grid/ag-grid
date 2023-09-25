import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefsA: ColDef[] = [
  { field: 'athlete', checkboxSelection: true },
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
  isRowSelectable: (node) => node.data.year === 2008,
}

function selectItem(value: boolean) {
  if (gridOptions.api) {
    gridOptions.api.__updateProperty('isRowSelectable', value ? (node) => node.data.year === 2008 : undefined, false);
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
