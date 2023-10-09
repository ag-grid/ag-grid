import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  {
    headerName: '#',
    colId: 'rowNum',
    valueGetter: 'node.id',
    width: 80,
    pinned: 'left',
  },
  { field: 'athlete', width: 150, pinned: 'left' },
  { field: 'age', width: 90, pinned: 'left' },
  { field: 'country', width: 150 },
  { field: 'year', width: 90 },
  { field: 'date', width: 110 },
  { field: 'sport', width: 150 },
  { field: 'gold', width: 100 },
  { field: 'silver', width: 100 },
  { field: 'bronze', width: 100 },
  { field: 'total', width: 100, pinned: 'right' },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    resizable: true,
  },
  columnDefs: columnDefs,
  // debug: true,
  rowData: null,
}

function clearPinned() {
  api!.applyColumnState({ defaultState: { pinned: null } })
}

function resetPinned() {
  api!.applyColumnState({
    state: [
      { colId: 'rowNum', pinned: 'left' },
      { colId: 'athlete', pinned: 'left' },
      { colId: 'age', pinned: 'left' },
      { colId: 'total', pinned: 'right' },
    ],
    defaultState: { pinned: null },
  })
}

function pinCountry() {
  api!.applyColumnState({
    state: [{ colId: 'country', pinned: 'left' }],
    defaultState: { pinned: null },
  })
}

function jumpToCol() {
  const value = (document.getElementById('col') as HTMLInputElement).value
  if (typeof value !== 'string' || value === '') {
    return
  }

  const index = Number(value)
  if (typeof index !== 'number' || isNaN(index)) {
    return
  }

  // it's actually a column the api needs, so look the column up
  const allColumns = api!.getColumns()
  if (allColumns) {
    const column = allColumns[index]
    if (column) {
      api!.ensureColumnVisible(column)
    }
  }
}

function jumpToRow() {
  var value = (document.getElementById('row') as HTMLInputElement).value
  const index = Number(value)
  if (typeof index === 'number' && !isNaN(index)) {
    api!.ensureIndexVisible(index)
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
