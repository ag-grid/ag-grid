import { GridApi, createGrid, FirstDataRenderedEvent, GridOptions } from '@ag-grid-community/core';

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', minWidth: 200 },
    { field: 'age' },
    { field: 'country', minWidth: 200 },
    { field: 'year' },
    { field: 'date', minWidth: 180 },
    { field: 'sport', minWidth: 200 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  onFirstDataRendered: onFirstDataRendered,
  enableRangeSelection: true,
  statusBar: {
    statusPanels: [
      {
        statusPanel: 'agAggregationComponent',
        statusPanelParams: {
          // possible values are: 'count', 'sum', 'min', 'max', 'avg'
          aggFuncs: ['sum', 'avg'],
        },
      },
    ],
  },
}

function onFirstDataRendered(event: FirstDataRenderedEvent) {
  event.api.addCellRange({
    rowStartIndex: 3,
    rowEndIndex: 8,
    columns: ['age'],
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data))
})
