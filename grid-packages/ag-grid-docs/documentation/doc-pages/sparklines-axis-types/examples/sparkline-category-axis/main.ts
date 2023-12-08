import { AreaSparklineOptions, GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'symbol', maxWidth: 110 },
    { field: 'name', minWidth: 250 },
    {
      field: 'change',
      cellRenderer: 'agSparklineCellRenderer',
      cellRendererParams: {
        sparklineOptions: {
          type: 'area',
          axis: {
            // this can be omitted as the axis type is 'category' by default
            type: 'category',
          },
        } as AreaSparklineOptions,
      },
    },
    { field: 'volume', type: 'numericColumn', maxWidth: 140 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  rowData: getData(),
  rowHeight: 50,
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
