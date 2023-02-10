import { Grid, CellKeyDownEvent, CellKeyPressEvent, ColDef, GridOptions } from '@ag-grid-community/core'

function changeSize(e) {
  const sizes = ['large', 'normal', 'compact'];
  const size = e.target.innerText.toLowerCase();

  const el = document.querySelector('.ag-theme-alpine');

  sizes.forEach(s => el.classList.toggle(s, s === size));
}

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 170 },
  { field: 'age' },
  { field: 'country' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions<IOlympicData> = {
  rowData: null,
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    sortable: true,
    filter: true,
    resizable: true,
  },
  sideBar: 'columns'
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})

