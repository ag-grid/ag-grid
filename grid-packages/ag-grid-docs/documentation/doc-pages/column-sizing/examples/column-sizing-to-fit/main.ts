import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete', width: 150, suppressSizeToFit: true },
  { field: 'age', width: 50, maxWidth: 50 },
  { colId: 'country', field: 'country', maxWidth: 300 },
  { field: 'year', width: 90 },
  { field: 'date', width: 110 },
  { field: 'sport', width: 110 },
  { field: 'gold', width: 100 },
  { field: 'silver', width: 100 },
  { field: 'bronze', width: 100 },
  { field: 'total', width: 100 },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
}

function sizeToFit() {
  api!.sizeColumnsToFit({
    defaultMinWidth: 100,
    columnLimits: [{ key: 'country', minWidth: 900 }],
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
