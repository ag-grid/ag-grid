import { Grid, ColGroupDef, GridOptions } from '@ag-grid-community/core'

const columnDefs: ColGroupDef[] = [
  {
    headerName: 'Everything Resizes',
    children: [
      {
        field: 'athlete',
        headerClass: 'resizable-header',
      },
      { field: 'age', headerClass: 'resizable-header' },
      {
        field: 'country',
        headerClass: 'resizable-header',
      },
    ],
  },
  {
    headerName: 'Only Year Resizes',
    children: [
      { field: 'year', headerClass: 'resizable-header' },
      {
        field: 'date',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'sport',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
    ],
  },
  {
    headerName: 'Nothing Resizes',
    children: [
      {
        field: 'gold',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'silver',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'bronze',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'total',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
    ],
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    width: 150,
    resizable: true,
  },
  columnDefs: columnDefs,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  // do http request to get our sample data - not using any framework to keep the example self contained.
  // you will probably use a framework like JQuery, Angular or something else to do your HTTP calls.
  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
