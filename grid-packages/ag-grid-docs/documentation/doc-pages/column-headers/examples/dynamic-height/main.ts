import { Grid, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColGroupDef[] = [
  {
    headerName: 'Athlete Details',
    children: [
      {
        field: 'athlete',
        width: 150,
        suppressSizeToFit: true,
        enableRowGroup: true,
        rowGroupIndex: 0,
      },
      {
        field: 'age',
        width: 90,
        minWidth: 75,
        maxWidth: 100,
        enableRowGroup: true,
      },
      {
        field: 'country',
        enableRowGroup: true,
      },
      {
        field: 'year',
        width: 90,
        enableRowGroup: true,
        pivotIndex: 0,
      },
      { field: 'sport', width: 110, enableRowGroup: true },
      {
        field: 'gold',
        enableValue: true,
        suppressMenu: true,
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
      },
      {
        field: 'silver',
        enableValue: true,
        suppressMenu: true,
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
      },
      {
        field: 'bronze',
        enableValue: true,
        suppressMenu: true,
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
      },
      {
        field: 'total',
        enableValue: true,
        suppressMenu: true,
        filter: 'agNumberColumnFilter',
        aggFunc: 'sum',
      },
    ],
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    floatingFilter: true,
    width: 120
  },
  columnDefs: columnDefs,
  rowData: null,
}

function setIdText(id: string, value: string | number | undefined) {
  document.getElementById(id)!.innerHTML = value == undefined ? 'undefined' : value + ''
}

function setPivotOn() {
  document.querySelector('#requiresPivot')!.className = ''
  document.querySelector('#requiresNotPivot')!.className = 'hidden'
  gridOptions.columnApi!.setPivotMode(true)
  setIdText('pivot', 'on')
}

function setPivotOff() {
  document.querySelector('#requiresPivot')!.className = 'hidden'
  document.querySelector('#requiresNotPivot')!.className = ''
  gridOptions.columnApi!.setPivotMode(false)
  setIdText('pivot', 'off')
}

function setHeaderHeight(value?: number) {
  gridOptions.api!.setHeaderHeight(value)
  setIdText('headerHeight', value)
}

function setGroupHeaderHeight(value?: number) {
  gridOptions.api!.setGroupHeaderHeight(value)
  setIdText('groupHeaderHeight', value)
}

function setFloatingFiltersHeight(value?: number) {
  gridOptions.api!.setFloatingFiltersHeight(value)
  setIdText('floatingFiltersHeight', value)
}

function setPivotGroupHeaderHeight(value?: number) {
  gridOptions.api!.setPivotGroupHeaderHeight(value)
  setIdText('pivotGroupHeaderHeight', value)
}

function setPivotHeaderHeight(value?: number) {
  gridOptions.api!.setPivotHeaderHeight(value)
  setIdText('pivotHeaderHeight', value)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
