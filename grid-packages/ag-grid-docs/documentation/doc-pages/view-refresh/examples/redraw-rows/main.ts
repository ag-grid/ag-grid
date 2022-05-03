import { Grid, GridOptions, RowClassParams, RowStyle } from '@ag-grid-community/core'

var colorIndex = 0
var colors = ['#000000', '#000066', '#006600', '#660000']

const gridOptions: GridOptions = {
  columnDefs: [
    { headerName: 'A', field: 'a' },
    { headerName: 'B', field: 'b' },
    { headerName: 'C', field: 'c' },
    { headerName: 'D', field: 'd' },
    { headerName: 'E', field: 'e' },
    { headerName: 'F', field: 'f' },
  ],
  defaultColDef: {
    flex: 1,
  },
  rowData: createData(12),
  getRowStyle: (params: RowClassParams): RowStyle | undefined => {
    return {
      backgroundColor: colors[colorIndex],
    }
  },
}

function createData(count: number) {
  var result = []
  for (var i = 1; i <= count; i++) {
    result.push({
      a: (i * 863) % 100,
      b: (i * 811) % 100,
      c: (i * 743) % 100,
      d: (i * 677) % 100,
      e: (i * 619) % 100,
      f: (i * 571) % 100,
    })
  }
  return result
}

function progressColor() {
  colorIndex++
  if (colorIndex === colors.length) {
    colorIndex = 0
  }
}

function redrawAllRows() {
  progressColor()
  gridOptions.api!.redrawRows()
}

function redrawTopRows() {
  progressColor()
  var rows = []
  for (var i = 0; i < 6; i++) {
    var row = gridOptions.api!.getDisplayedRowAtIndex(i)!
    rows.push(row)
  }
  gridOptions.api!.redrawRows({ rowNodes: rows })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
