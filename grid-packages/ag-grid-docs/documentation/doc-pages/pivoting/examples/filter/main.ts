import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'country', pivot: true, enablePivot: true },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    sortable: true,
    resizable: true,
  },
  pivotMode: true,
  sideBar: true,
}

function setTitle(title: string) {
   (document.querySelector('#title') as any).innerText = title
}

function clearFilter() {
  gridOptions.api!.setFilterModel(null)
  setTitle('All Medals by Country')
}

function filterUKAndIrelandBoxing() {
  gridOptions.api!.setFilterModel({
    country: {
      type: 'set',
      values: ['Ireland', 'Great Britain'],
    },
    sport: {
      type: 'set',
      values: ['Boxing'],
    },
  })
  setTitle('UK and Ireland - Boxing')
}

function filterUKAndIrelandEquestrian() {
  gridOptions.api!.setFilterModel({
    country: {
      type: 'set',
      values: ['Ireland', 'Great Britain'],
    },
    sport: {
      type: 'set',
      values: ['Equestrian'],
    },
  })
  setTitle('UK and Ireland - Equestrian')
}

function filterUsaAndCanadaBoxing() {
  gridOptions.api!.setFilterModel({
    country: {
      type: 'set',
      values: ['United States', 'Canada'],
    },
    sport: {
      type: 'set',
      values: ['Bobsleigh'],
    },
  })
  setTitle('USA and Canada - Boxing')
}

function filterUsaAndCanadaEquestrian() {
  gridOptions.api!.setFilterModel({
    country: {
      type: 'set',
      values: ['United States', 'Canada'],
    },
    sport: {
      type: 'set',
      values: ['Equestrian'],
    },
  })
  setTitle('USA and Canada - Equestrian')
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
