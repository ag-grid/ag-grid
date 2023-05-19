import { Grid, ColDef, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: 'Athlete Details',
    stickyLabel: true,
    children: [
      { field: 'athlete', pinned: true, colId: 'athlete' },
      { field: 'country', colId: 'country' },
      { field: 'age', colId: 'age' }
    ],
  },
  {
    headerName: 'Sports Results',
    stickyLabel: true,
    openByDefault: true,
    children: [
      { field: 'sport', colId: 'sport' },
      { field: 'gold', colId: 'gold', columnGroupShow: 'open' },
      { field: 'silver', colId: 'silver', columnGroupShow: 'open' },
      { field: 'bronze', colId: 'bronze', columnGroupShow: 'open' },
      { field: 'total', colId: 'total', columnGroupShow: 'closed' },
    ],
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    resizable: true,
    width: 200,
  },
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
