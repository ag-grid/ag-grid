import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', pinned: 'left' },
  { field: 'age', pinned: 'left' },
  {
    field: 'country',
    colSpan: (params) => {
      const country = params.data.country
      if (country === 'Russia') {
        // have all Russia age columns width 2
        return 2
      } else if (country === 'United States') {
        // have all United States column width 4
        return 4
      } else {
        // all other rows should be just normal
        return 1
      }
    },
  },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
    resizable: true,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
