import { ColDef, GridOptions } from '@ag-grid-community/core'

declare var PartialMatchFilter: any;

const columnDefs: ColDef[] = [
  { field: 'row' },
  {
    field: 'name',
    filter: 'partialMatchFilter',
    menuTabs: ['filterMenuTab'],
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: getData(),
  components: {
    partialMatchFilter: PartialMatchFilter,
  },
}

function onClicked() {
  gridOptions.api!.getFilterInstance('name', function (instance) {
    (instance as any).componentMethod('Hello World!')
  })
}


// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
  gridOptions.api!.sizeColumnsToFit()
})
