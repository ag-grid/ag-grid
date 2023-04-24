import { Grid, ColDef, GridOptions, IRowDragItem } from '@ag-grid-community/core'

var athleteRowDragTextCallback = function (params: IRowDragItem, dragItemCount: number) {
  // keep double equals here because data can be a string or number
  return `${dragItemCount} athlete(s) selected`
}

var rowDragTextCallback = function (params: IRowDragItem) {
  // keep double equals here because data can be a string or number
  if (params.rowNode!.data.year == '2012') {
    return params.defaultTextValue + ' (London Olympics)'
  }
  return params.defaultTextValue
}

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    rowDrag: true,
    rowDragText: athleteRowDragTextCallback,
  },
  { field: 'country', rowDrag: true },
  { field: 'year', width: 100 },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    width: 170,
    sortable: true,
    filter: true,
  },
  rowDragManaged: true,
  columnDefs: columnDefs,
  animateRows: true,
  rowDragText: rowDragTextCallback,
  rowDragMultiRow: true,
  rowSelection: 'multiple'
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
