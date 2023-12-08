import { GridApi, createGrid, ColGroupDef, GridOptions } from '@ag-grid-community/core';

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

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    initialWidth: 100,
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
  gridApi!.setGridOption('columnDefs', createColSetA())
}

function onBtSetB() {
  gridApi!.setGridOption('columnDefs', createColSetB())
}

// setup the grid
const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(data => {
    gridApi.setGridOption('rowData', data)
  })
