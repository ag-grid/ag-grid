import { GridApi, createGrid, GridOptions, FillOperationParams } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', minWidth: 150 },
    { field: 'age', maxWidth: 90 },
    { field: 'country', minWidth: 150 },
    { field: 'year', maxWidth: 90 },
    { field: 'date', minWidth: 150 },
    { field: 'sport', minWidth: 150 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
    cellDataType: false,
  },
  enableRangeSelection: true,
  enableFillHandle: true,
  suppressClearOnFillReduction: true,
  fillOperation: (params: FillOperationParams) => {
    if (params.column.getColId() === 'country') {
      return params.currentCellValue
    }

    return params.values[params.values.length - 1]
  },
}

function createRowData(data: any[]) {
  var rowData = data.slice(0, 100)
  return rowData
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then(function (data) {
    gridApi.setGridOption('rowData', createRowData(data))
  })
