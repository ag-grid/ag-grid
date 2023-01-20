import { Grid, GridOptions, IGroupCellRendererParams } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, hide: true },
    { field: 'sport', rowGroup: true, hide: true },
    { field: 'age', minWidth: 120, aggFunc: 'sum' },
    { field: 'year', maxWidth: 120 },
    { field: 'date', minWidth: 150 },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
    { field: 'total', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    headerName: 'Athlete',
    field: 'athlete',
    minWidth: 250,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      checkbox: true,
    } as IGroupCellRendererParams,
  },
  rowSelection: 'multiple',
  groupSelectsChildren: true,
  groupSelectsFiltered: true,
  suppressAggFuncInHeader: true,
  suppressRowClickSelection: true,
}

function filterSwimming() {
  gridOptions.api!.setFilterModel({
    sport: {
      type: 'set',
      values: ['Swimming'],
    },
  })
}

function ages16And20() {
  gridOptions.api!.setFilterModel({
    age: {
      type: 'set',
      values: ['16', '20'],
    },
  })
}

function clearFilter() {
  gridOptions.api!.setFilterModel(null)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
