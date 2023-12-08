import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

function getColumnDefs(): ColDef<IOlympicData>[] {
  return [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ]
}

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    initialWidth: 100,
    filter: true,
  },
  columnDefs: getColumnDefs(),
}

function setHeaderNames() {
  const columnDefs = getColumnDefs()
  columnDefs.forEach((colDef, index) => {
    colDef.headerName = 'C' + index
  })
  gridApi!.setGridOption('columnDefs', columnDefs)
}

function removeHeaderNames() {
  const columnDefs = getColumnDefs()
  columnDefs.forEach((colDef, index) => {
    colDef.headerName = undefined
  })
  gridApi!.setGridOption('columnDefs', columnDefs)
}

function setValueFormatters() {
  const columnDefs = getColumnDefs()
  columnDefs.forEach((colDef, index) => {
    colDef.valueFormatter = function (params) {
      return '[ ' + params.value + ' ]'
    }
  })
  gridApi!.setGridOption('columnDefs', columnDefs)
}

function removeValueFormatters() {
  const columnDefs = getColumnDefs()
  columnDefs.forEach((colDef, index) => {
    colDef.valueFormatter = undefined
  })
  gridApi!.setGridOption('columnDefs', columnDefs)
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(data => {
    gridApi.setGridOption('rowData', data)
  })
