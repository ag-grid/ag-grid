import { Grid, FirstDataRenderedEvent, GridOptions, GridSizeChangedEvent } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { field: 'age', minWidth: 70, maxWidth: 90 },
    { field: 'country', minWidth: 130 },
    { field: 'year', minWidth: 70, maxWidth: 90 },
    { field: 'date', minWidth: 120 },
    { field: 'sport', minWidth: 120 },
    { field: 'gold', minWidth: 80 },
    { field: 'silver', minWidth: 80 },
    { field: 'bronze', minWidth: 80 },
    { field: 'total', minWidth: 80 },
  ],

  defaultColDef: {
    resizable: true,
  },

  onFirstDataRendered: onFirstDataRendered,
  onGridSizeChanged: onGridSizeChanged,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.sizeColumnsToFit()
}

function onGridSizeChanged(params: GridSizeChangedEvent) {
  // get the current grids width
  var gridWidth = document.getElementById('grid-wrapper')!.offsetWidth

  // keep track of which columns to hide/show
  var columnsToShow = []
  var columnsToHide = []

  // iterate over all columns (visible or not) and work out
  // now many columns can fit (based on their minWidth)
  var totalColsWidth = 0
  var allColumns = params.columnApi.getAllColumns()
  if (allColumns && allColumns.length > 0) {
    for (var i = 0; i < allColumns.length; i++) {
      var column = allColumns[i]
      totalColsWidth += column.getMinWidth() || 0
      if (totalColsWidth > gridWidth) {
        columnsToHide.push(column.getColId())
      } else {
        columnsToShow.push(column.getColId())
      }
    }
  }

  // show/hide columns based on current grid width
  params.columnApi.setColumnsVisible(columnsToShow, true)
  params.columnApi.setColumnsVisible(columnsToHide, false)

  // fill out any available space to ensure there are no gaps
  params.api.sizeColumnsToFit()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
