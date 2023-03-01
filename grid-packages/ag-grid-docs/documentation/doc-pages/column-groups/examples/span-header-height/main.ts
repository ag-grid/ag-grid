import { Grid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    field: 'athlete',
    width: 180,
    spanHeaderHeight: true,
    pinned: true
  },
  {
    headerName: 'Athlete Details',
    children: [
      { field: 'country' },
      { field: 'age' },
    ],
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
  },
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
