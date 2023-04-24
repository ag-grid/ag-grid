import { Grid, GridOptions, ICellRendererComp, ICellRendererParams } from '@ag-grid-community/core'
import { CellRenderer } from './cellRenderer_typescript';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete', minWidth: 180 },
    { field: 'age' },
    { field: 'country', minWidth: 160 },
    { field: 'year' },
    { field: 'date', minWidth: 160 },
    { field: 'sport', minWidth: 180 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
    // we use a cell renderer to include a button, so when the button
    // gets clicked, the editing starts.
    cellRenderer: CellRenderer,
  },
  // set the bottom grid to no click editing
  suppressClickEdit: true
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
