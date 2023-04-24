import { Grid, ColDef, GridOptions, GridReadyEvent } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 200 },
  { field: 'country', minWidth: 200 },
  { headerName: 'Group', valueGetter: 'data.country.charAt(0)' },
  { field: 'sport', minWidth: 150 },
  { field: 'gold', hide: true },
  { field: 'silver', hide: true },
  { field: 'bronze', hide: true },
  { field: 'total', hide: true },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },
  columnDefs: columnDefs,
  onGridReady: (params: GridReadyEvent) => {
    (document.getElementById('allRows') as HTMLInputElement).checked = true
  },
}

function onBtExport() {
  gridOptions.api!.exportDataAsExcel({
    exportedRows: (document.getElementById('allRows') as HTMLInputElement).checked ? 'all' : 'filteredAndSorted',
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(response => response.json())
    .then(data =>
      gridOptions.api!.setRowData(data.filter((rec: any) => rec.country != null))
    )
})
