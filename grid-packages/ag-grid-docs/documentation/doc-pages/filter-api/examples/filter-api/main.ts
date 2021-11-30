import { ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [{ field: 'athlete', filter: 'agSetColumnFilter' }]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
  },
}

var savedMiniFilterText = ''

function getMiniFilterText() {
  const athleteFilter = gridOptions.api!.getFilterInstance('athlete')! as any
  console.log(athleteFilter.getMiniFilter())
}

function saveMiniFilterText() {
  const athleteFilter = gridOptions.api!.getFilterInstance('athlete')! as any
  savedMiniFilterText = athleteFilter.getMiniFilter()
}

function restoreMiniFilterText() {
  const athleteFilter = gridOptions.api!.getFilterInstance('athlete')! as any
  athleteFilter.setMiniFilter(savedMiniFilterText)
}

function resetFilter() {
  const athleteFilter = gridOptions.api!.getFilterInstance('athlete')! as any
  athleteFilter.setModel(null)
  gridOptions.api!.onFilterChanged()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
