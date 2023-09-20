import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true, },
    { field: 'year', rowGroup: true, enableRowGroup: true },
    { field: 'sport', rowGroup: true, enableRowGroup: true },
    { field: 'gold' },
  ],
  groupLockGroupColumns: 2,

  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 150,
  },
  animateRows: true,
  rowGroupPanelShow: 'always',
  groupDefaultExpanded: -1,
  groupDisplayType: 'multipleColumns',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
