import { GridApi, createGrid, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core';
import { DetailCellRenderer } from './detailCellRenderer_typescript'

declare var window: any;
let api: GridApi<IAccount>;
const gridOptions: GridOptions<IAccount> = {
  columnDefs: [
    // group cell renderer needed for expand / collapse icons
    { field: 'name', cellRenderer: 'agGroupCellRenderer' },
    { field: 'account' },
    { field: 'calls' },
    { field: 'minutes', valueFormatter: "x.toLocaleString() + 'm'" },
  ],
  defaultColDef: {
    flex: 1,
  },
  masterDetail: true,
  detailRowHeight: 310,
  detailCellRenderer: DetailCellRenderer,
  onFirstDataRendered: onFirstDataRendered,
}

function expandCollapseAll() {
  api!.forEachNode(function (node) {
    node.expanded = !!window.collapsed
  })

  window.collapsed = !window.collapsed
  api!.onGroupExpandedOrCollapsed()
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  // arbitrarily expand a row for presentational purposes
  setTimeout(function () {
    params.api.getDisplayedRowAtIndex(1)!.setExpanded(true)
  }, 0)
}

function printDetailGridInfo() {
  console.log("Currently registered detail grid's: ")
  api!.forEachDetailGridInfo(function (detailGridInfo) {
    console.log(detailGridInfo)
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
    .then(response => response.json())
    .then((data: IAccount[]) => {
      api!.setRowData(data)
    })
})
