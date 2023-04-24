import { Grid, GridOptions, SideBarDef } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', filter: 'agTextColumnFilter', minWidth: 200 },
    { field: 'age' },
    { field: 'country', minWidth: 200 },
    { field: 'year' },
    { field: 'date', minWidth: 160 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    // allow every column to be aggregated
    enableValue: true,
    // allow every column to be grouped
    enableRowGroup: true,
    // allow every column to be pivoted
    enablePivot: true,
    sortable: true,
    filter: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
    ],
    defaultToolPanel: 'filters',
    hiddenByDefault: true,
  },
}

function setSideBarVisible(value: boolean) {
  gridOptions.api!.setSideBarVisible(value)
}

function isSideBarVisible() {
  alert(gridOptions.api!.isSideBarVisible())
}

function openToolPanel(key: string) {
  gridOptions.api!.openToolPanel(key)
}

function closeToolPanel() {
  gridOptions.api!.closeToolPanel()
}

function getOpenedToolPanel() {
  alert(gridOptions.api!.getOpenedToolPanel())
}

function setSideBar(def: SideBarDef | string | string[] | boolean) {
  gridOptions.api!.setSideBar(def)
}

function getSideBar() {
  var sideBar = gridOptions.api!.getSideBar()
  alert(JSON.stringify(sideBar))
  console.log(sideBar)
}

function setSideBarPosition(position: 'left' | 'right') {
  gridOptions.api!.setSideBarPosition(position)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
