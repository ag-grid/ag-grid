import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
import { MedalCellRenderer } from "./medalCellRenderer_typescript";
import { TotalValueRenderer } from "./totalValueRenderer_typescript";

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'year' },
  { field: 'gold', cellRendererFramework: MedalCellRenderer },
  { field: 'silver', cellRendererFramework: MedalCellRenderer },
  { field: 'bronze', cellRendererFramework: MedalCellRenderer },
  { field: 'total', minWidth: 175, cellRendererFramework: TotalValueRenderer },
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
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
