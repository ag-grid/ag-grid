import { Grid, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core'
import { DetailCellRenderer } from './detailCellRenderer_typescript'

const gridOptions: GridOptions = {
  masterDetail: true,
  detailCellRenderer: DetailCellRenderer,
  detailRowHeight: 150,
  animateRows: true,
  columnDefs: [
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer', pinned: 'left' },
    { field: 'account' },
    { field: 'calls' },
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
    { headerName: 'Extra Col 1', valueGetter: '"AAA"' },
    { headerName: 'Extra Col 2', valueGetter: '"BBB"' },
    { headerName: 'Extra Col 3', valueGetter: '"CCC"' },
    { headerName: 'Pinned Right', pinned: 'right' },
  ],
  defaultColDef: {},
  embedFullWidthRows: true,
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  setTimeout(function () {
    params.api.forEachNode(function (node) {
      node.setExpanded(node.id === '1')
    })
  }, 1000)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
    .then(response => response.json())
    .then(function (data) {
      gridOptions.api!.setRowData(data)
    })
})
