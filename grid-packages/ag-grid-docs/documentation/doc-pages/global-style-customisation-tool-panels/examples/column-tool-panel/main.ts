import { GridApi, createGrid, GridOptions } from '@ag-grid-community/core';


let gridApi: GridApi<IOlympicData>;


const gridOptions: GridOptions<IOlympicData> = {
  rowData: null,
  columnDefs: [
    {
      headerName: 'Athlete',
      children: [
        { field: 'athlete', minWidth: 170, rowGroup: true },
        { field: 'age', rowGroup: true },
        { field: 'country' },
      ]
    },
    {
      headerName: 'Event',
      children: [
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
      ]
    },
    {
      headerName: 'Medals',
      children: [
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
      ]
    }
  ],
  defaultColDef: {
    editable: true,
    filter: true,
  },
  sideBar: 'columns'
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
