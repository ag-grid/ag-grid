import { Grid, ColGroupDef, GridOptions } from '@ag-grid-community/core'

function createColSetA(): ColGroupDef[] {
  return [
    {
      headerName: 'Group A',
      groupId: 'groupA',
      children: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country', columnGroupShow: 'open' },
      ],
    },
    {
      headerName: 'Group B',
      children: [
        { field: 'sport' },
        { field: 'year' },
        { field: 'date', columnGroupShow: 'open' },
      ],
    },
    {
      headerName: 'Group C',
      groupId: 'groupC',
      children: [
        { field: 'total' },
        { field: 'gold', columnGroupShow: 'open' },
        { field: 'silver', columnGroupShow: 'open' },
        { field: 'bronze', columnGroupShow: 'open' },
      ],
    },
  ]
}

function createColSetB(): ColGroupDef[] {
  return [
    {
      headerName: 'GROUP A',
      groupId: 'groupA',
      children: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country', columnGroupShow: 'open' },
      ],
    },
    {
      headerName: 'Group B',
      children: [
        { field: 'sport' },
        { field: 'year' },
        { field: 'date', columnGroupShow: 'open' },
      ],
    },
    {
      headerName: 'Group C',
      groupId: 'groupC',
      children: [
        { field: 'total' },
        { field: 'gold', columnGroupShow: 'open' },
        { field: 'silver', columnGroupShow: 'open' },
        { field: 'bronze', columnGroupShow: 'open' },
        { field: 'extraA' },
        { field: 'extraB', columnGroupShow: 'open' },
      ],
    },
  ]
}

const gridOptions: GridOptions = {
  defaultColDef: {
    initialWidth: 100,
    sortable: true,
    resizable: true,
  },
  columnDefs: [
    {
      headerName: 'Group A',
      groupId: 'groupA',
      children: [
        { field: 'athlete' },
        { field: 'age' },
        { field: 'country', columnGroupShow: 'open' },
      ],
    },
    {
      headerName: 'Group B',
      children: [
        { field: 'sport' },
        { field: 'year' },
        { field: 'date', columnGroupShow: 'open' },
      ],
    },
    {
      headerName: 'Group C',
      groupId: 'groupC',
      children: [
        { field: 'total' },
        { field: 'gold', columnGroupShow: 'open' },
        { field: 'silver', columnGroupShow: 'open' },
        { field: 'bronze', columnGroupShow: 'open' },
      ],
    },
  ],
}

function onBtSetA() {
  gridOptions.api!.setColumnDefs(createColSetA())
}

function onBtSetB() {
  gridOptions.api!.setColumnDefs(createColSetB())
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
