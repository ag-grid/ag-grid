import { Grid, CellKeyDownEvent, CellKeyPressEvent, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  { field: 'athlete', minWidth: 170 },
  { field: 'age' },
  { field: 'country' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

const gridOptions: GridOptions<IOlympicData> = {
  rowData: null,
  columnDefs: columnDefs,
  defaultColDef: {
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  onCellKeyDown: onCellKeyDown,
  onCellKeyPress: onCellKeyPress,
}

function onCellKeyDown(e: CellKeyDownEvent) {
  console.log('onCellKeyDown', e)
}

function onCellKeyPress(e: CellKeyPressEvent) {
  console.log('onCellKeyPress', e)
  if (e.event) {
    var keyPressed = (e.event as KeyboardEvent).key
    console.log('Key Pressed = ' + keyPressed)
    if (keyPressed === 's') {
      var rowNode = e.node
      var newSelection = !rowNode.isSelected()
      console.log(
        'setting selection on node ' +
        rowNode.data.athlete +
        ' to ' +
        newSelection
      )
      rowNode.setSelected(newSelection)
    }
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
