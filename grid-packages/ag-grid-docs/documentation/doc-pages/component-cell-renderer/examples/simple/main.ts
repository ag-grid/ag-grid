import { ColDef, GridOptions } from '@ag-grid-community/core'
declare var MedalCellRenderer: any
declare var TotalValueRenderer: any

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'year' },
  { field: 'gold', cellRendererComp: MedalCellRenderer },
  { field: 'silver', cellRendererComp: MedalCellRenderer },
  { field: 'bronze', cellRendererComp: MedalCellRenderer },
  { field: 'total', minWidth: 175, cellRendererComp: TotalValueRenderer },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
