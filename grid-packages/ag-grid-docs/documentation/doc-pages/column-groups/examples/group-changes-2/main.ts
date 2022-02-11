import { Grid, GridOptions } from '@ag-grid-community/core'

function createNormalColDefs() {
  return [
    {
      headerName: 'Athlete Details',
      headerClass: 'participant-group',
      children: [
        { field: 'athlete', colId: 'athlete' },
        { field: 'country', colId: 'country' },
      ],
    },
    { field: 'age', colId: 'age' },
    {
      headerName: 'Sports Results',
      headerClass: 'medals-group',
      children: [
        { field: 'sport', colId: 'sport' },
        { field: 'gold', colId: 'gold' },
      ],
    },
  ]
}

function createExtraColDefs() {
  return [
    {
      headerName: 'Athlete Details',
      headerClass: 'participant-group',
      children: [
        { field: 'athlete', colId: 'athlete' },
        { field: 'country', colId: 'country' },
        { field: 'region1', colId: 'region1' },
        { field: 'region2', colId: 'region2' },
      ],
    },
    { field: 'age', colId: 'age' },
    { field: 'distance', colId: 'distance' },
    {
      headerName: 'Sports Results',
      headerClass: 'medals-group',
      children: [
        { field: 'sport', colId: 'sport' },
        { field: 'gold', colId: 'gold' },
      ],
    },
  ]
}

function onBtNormalCols() {
  gridOptions.api!.setColumnDefs(createNormalColDefs())
}

function onBtExtraCols() {
  gridOptions.api!.setColumnDefs(createExtraColDefs())
}

const gridOptions: GridOptions = {
  defaultColDef: {
    resizable: true,
    width: 150,
  },
  // debug: true,
  columnDefs: createNormalColDefs(),
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
