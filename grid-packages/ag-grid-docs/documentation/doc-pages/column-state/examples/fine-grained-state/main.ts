import { GridApi, createGrid, ColDef, GridOptions } from '@ag-grid-community/core';

const columnDefs: ColDef[] = [
  { field: 'athlete' },
  { field: 'age' },
  { field: 'country' },
  { field: 'sport' },
  { field: 'year' },
  { field: 'date' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
]

let api: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    width: 150,
    enableRowGroup: true,
    enablePivot: true,
    enableValue: true,
  },
  sideBar: {
    toolPanels: ['columns'],
  },
  rowGroupPanelShow: 'always',
  pivotPanelShow: 'always',
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
}

function onBtSortAthlete() {
  api!.applyColumnState({
    state: [{ colId: 'athlete', sort: 'asc' }],
  })
}

function onBtSortCountryThenSportClearOthers() {
  api!.applyColumnState({
    state: [
      { colId: 'country', sort: 'asc', sortIndex: 0 },
      { colId: 'sport', sort: 'asc', sortIndex: 1 },
    ],
    defaultState: { sort: null },
  })
}

function onBtClearAllSorting() {
  api!.applyColumnState({
    defaultState: { sort: null },
  })
}

function onBtRowGroupCountryThenSport() {
  api!.applyColumnState({
    state: [
      { colId: 'country', rowGroupIndex: 0 },
      { colId: 'sport', rowGroupIndex: 1 },
    ],
    defaultState: { rowGroup: false },
  })
}

function onBtRemoveCountryRowGroup() {
  api!.applyColumnState({
    state: [{ colId: 'country', rowGroup: false }],
  })
}

function onBtClearAllRowGroups() {
  api!.applyColumnState({
    defaultState: { rowGroup: false },
  })
}

function onBtOrderColsMedalsFirst() {
  api!.applyColumnState({
    state: [
      { colId: 'gold' },
      { colId: 'silver' },
      { colId: 'bronze' },
      { colId: 'total' },
      { colId: 'athlete' },
      { colId: 'age' },
      { colId: 'country' },
      { colId: 'sport' },
      { colId: 'year' },
      { colId: 'date' },
    ],
    applyOrder: true,
  })
}

function onBtOrderColsMedalsLast() {
  api!.applyColumnState({
    state: [
      { colId: 'athlete' },
      { colId: 'age' },
      { colId: 'country' },
      { colId: 'sport' },
      { colId: 'year' },
      { colId: 'date' },
      { colId: 'gold' },
      { colId: 'silver' },
      { colId: 'bronze' },
      { colId: 'total' },
    ],
    applyOrder: true,
  })
}

function onBtHideMedals() {
  api!.applyColumnState({
    state: [
      { colId: 'gold', hide: true },
      { colId: 'silver', hide: true },
      { colId: 'bronze', hide: true },
      { colId: 'total', hide: true },
    ],
  })
}

function onBtShowMedals() {
  api!.applyColumnState({
    state: [
      { colId: 'gold', hide: false },
      { colId: 'silver', hide: false },
      { colId: 'bronze', hide: false },
      { colId: 'total', hide: false },
    ],
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
