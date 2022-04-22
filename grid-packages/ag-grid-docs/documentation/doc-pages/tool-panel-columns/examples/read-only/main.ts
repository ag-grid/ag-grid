import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    minWidth: 200,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'age',
    enableValue: true,
  },
  {
    field: 'country',
    minWidth: 200,
    enableRowGroup: true,
    enablePivot: true,
    rowGroupIndex: 1,
  },
  {
    field: 'year',
    enableRowGroup: true,
    enablePivot: true,
    pivotIndex: 1,
  },
  {
    field: 'date',
    minWidth: 180,
    enableRowGroup: true,
    enablePivot: true,
  },
  {
    field: 'sport',
    minWidth: 200,
    enableRowGroup: true,
    enablePivot: true,
    rowGroupIndex: 2,
  },
  {
    field: 'gold',
    hide: true,
    enableValue: true,
  },
  {
    field: 'silver',
    hide: true,
    enableValue: true,
    aggFunc: 'sum',
  },
  {
    field: 'bronze',
    hide: true,
    enableValue: true,
    aggFunc: 'sum',
  },
  {
    headerName: 'Total',
    field: 'totalAgg',
    valueGetter:
      'node.group ? data.totalAgg : data.gold + data.silver + data.bronze',
  },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 250,
  },
  pivotMode: true,
  sideBar: 'columns',
  rowGroupPanelShow: 'always',
  pivotPanelShow: 'always',
  functionsReadOnly: true,
  onGridReady: (params) => {
    (document.getElementById('read-only') as HTMLInputElement).checked = true;
  }
}

function setReadOnly() {
  gridOptions.api!.setFunctionsReadOnly(
    (document.getElementById('read-only') as HTMLInputElement).checked
  )
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
