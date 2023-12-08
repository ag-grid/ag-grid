import { GridApi, createGrid, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core';
import { DetailCellRenderer } from './detailCellRenderer_typescript'

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
  gridApi!.forEachNode(function (node) {
    node.expanded = !!window.collapsed
  })

  window.collapsed = !window.collapsed
  gridApi!.onGroupExpandedOrCollapsed()
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  // arbitrarily expand a row for presentational purposes
  setTimeout(() => {
    params.api.getDisplayedRowAtIndex(1)!.setExpanded(true)
  }, 0)
}

function printDetailGridInfo() {
  console.log("Currently registered detail grid's: ")
  gridApi!.forEachDetailGridInfo(function (detailGridInfo) {
    console.log(detailGridInfo)
  })
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IAccount> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/master-detail-data.json')
  .then(response => response.json())
  .then((data: IAccount[]) => {
    gridApi.setGridOption('rowData', data)
  })
