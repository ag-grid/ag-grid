import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', headerTooltip: "The athlete's name" },
  { field: 'age', headerTooltip: "The athlete's age" },
  { field: 'country' },
  { field: 'year' },
  { field: 'date', headerTooltip: 'The date of the Olympics' },
  { field: 'sport', headerTooltip: 'The sport the medal was for' },
  { field: 'gold', headerTooltip: 'How many gold medals' },
  { field: 'silver', headerTooltip: 'How many silver medals' },
  { field: 'bronze', headerTooltip: 'How many bronze medals' },
  { field: 'total', headerTooltip: 'The total number of medals' },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
  },
  tooltipShowDelay: 500,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
