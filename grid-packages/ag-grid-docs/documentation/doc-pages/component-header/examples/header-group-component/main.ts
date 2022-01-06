import { ColGroupDef, GridOptions } from '@ag-grid-community/core'
declare var CustomHeaderGroup: any

const columnDefs: ColGroupDef[] = [
  {
    headerName: 'Athlete Details',
    headerGroupComp: CustomHeaderGroup,
    children: [
      { field: 'athlete', width: 150 },
      { field: 'age', width: 90, columnGroupShow: 'open' },
      {
        field: 'country',
        width: 120,
        columnGroupShow: 'open',
      },
    ],
  },
  {
    headerName: 'Medal details',
    headerGroupComp: CustomHeaderGroup,
    children: [
      { field: 'year', width: 90 },
      { field: 'date', width: 110 },
      {
        field: 'sport',
        width: 110,
        columnGroupShow: 'open',
      },
      {
        field: 'gold',
        width: 100,
        columnGroupShow: 'open',
      },
      {
        field: 'silver',
        width: 100,
        columnGroupShow: 'open',
      },
      {
        field: 'bronze',
        width: 100,
        columnGroupShow: 'open',
      },
      {
        field: 'total',
        width: 100,
        columnGroupShow: 'open',
      },
    ],
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: null,
  defaultColDef: {
    width: 100,
    resizable: true,
  },
}
// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
