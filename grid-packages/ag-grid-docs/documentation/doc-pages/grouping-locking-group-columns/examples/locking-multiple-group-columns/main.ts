import { createGrid, GridApi, GridOptions } from '@ag-grid-community/core'
let gridApi: GridApi<IOlympicData>;
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
  },
  autoGroupColumnDef: {
    minWidth: 150,
  },
  rowGroupPanelShow: 'always',
  groupDefaultExpanded: -1,
  groupDisplayType: 'multipleColumns',
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
