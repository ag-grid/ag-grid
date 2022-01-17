import { Grid, GridOptions, RowSelectedEvent, SelectionChangedEvent } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  rowSelection: 'multiple',
  rowData: null,
  onRowSelected: onRowSelected,
  onSelectionChanged: onSelectionChanged,
}

function onRowSelected(event: RowSelectedEvent) {
  window.alert(
    'row ' + event.node.data.athlete + ' selected = ' + event.node.isSelected()
  )
}

function onSelectionChanged(event: SelectionChangedEvent) {
  var rowCount = event.api.getSelectedNodes().length
  window.alert('selection changed, ' + rowCount + ' rows selected')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
