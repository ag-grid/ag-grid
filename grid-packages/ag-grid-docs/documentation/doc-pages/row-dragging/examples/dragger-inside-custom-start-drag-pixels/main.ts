import {
  GridApi,
  createGrid,
  ColDef,
  GridOptions,
  RowDragEnterEvent,
  RowDragEndEvent,
} from '@ag-grid-community/core';
import { CustomCellRenderer } from "./customCellRenderer_typescript";

const columnDefs: ColDef[] = [
  {
    field: 'athlete',
    cellClass: 'custom-athlete-cell',
    cellRenderer: CustomCellRenderer,
  },
  { field: 'country' },
  { field: 'year', width: 100 },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
]

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    width: 170,
    filter: true,
  },
  rowDragManaged: true,
  columnDefs: columnDefs,
  onRowDragEnter: onRowDragEnter,
  onRowDragEnd: onRowDragEnd,
}

function onRowDragEnter(e: RowDragEnterEvent) {
  console.log('onRowDragEnter', e)
}

function onRowDragEnd(e: RowDragEndEvent) {
  console.log('onRowDragEnd', e)
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi<IOlympicData> = createGrid(gridDiv, gridOptions);

fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  .then(response => response.json())
  .then((data: IOlympicData[]) => gridApi.setGridOption('rowData', data))
