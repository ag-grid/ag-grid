import {
  ColDef, Grid,
  GridOptions,
  HeaderValueGetterParams,
} from '@ag-grid-community/core'

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
    headerValueGetter: countryHeaderValueGetter,
  },
  {
    field: 'year',
    enableRowGroup: true,
    enablePivot: true,
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
  },
  {
    field: 'gold',
    hide: true,
    enableValue: true,
    toolPanelClass: 'tp-gold',
  },
  {
    field: 'silver',
    hide: true,
    enableValue: true,
    toolPanelClass: ['tp-silver'],
  },
  {
    field: 'bronze',
    hide: true,
    enableValue: true,
    toolPanelClass: (params) => {
      return 'tp-bronze'
    },
  },
  {
    headerName: 'Total',
    field: 'totalAgg',
    valueGetter:
      'node.group ? data.totalAgg : data.gold + data.silver + data.bronze',
  },
]

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  },
  autoGroupColumnDef: {
    minWidth: 200,
  },
  sideBar: 'columns',
  rowGroupPanelShow: 'always',
}

function countryHeaderValueGetter(params: HeaderValueGetterParams) {
  switch (params.location) {
    case 'csv':
      return 'CSV Country'
    case 'clipboard':
      return 'CLIP Country'
    case 'columnToolPanel':
      return 'TP Country'
    case 'columnDrop':
      return 'CD Country'
    case 'header':
      return 'H Country'
    default:
      return 'Should never happen!'
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
