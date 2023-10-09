import { GridApi, createGrid, GridOptions, ColDef } from '@ag-grid-community/core';
let api: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true },
    { field: 'year', pivot: true, enablePivot: true },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold', aggFunc: 'sum' },
    { field: 'silver', aggFunc: 'sum' },
    { field: 'bronze', aggFunc: 'sum' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 150,
    filter: true,
    floatingFilter: true,
    sortable: true,
    resizable: true,
  },
  processPivotResultColDef: (colDef: ColDef) => {
    colDef.filter = 'agNumberColumnFilter';
    colDef.floatingFilter = true;
  },
  pivotMode: true,
  sideBar: 'filters',
}

function clearFilter() {
  api!.setFilterModel(null)
}

function filterUsRussiaAustralia() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    country: {
      type: 'set',
      values: ['United States', 'Russia', 'Australia'],
    },
  })
}

function filterCanadaNorwayChinaZimbabweNetherlands() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    country: {
      type: 'set',
      values: ['Canada', 'Norway', 'China', 'Zimbabwe', 'Netherlands'],
    },
  })
}

function filter20042006() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    year: {
      type: 'set',
      values: ['2004', '2006'],
    },
  })
}

function filter200820102012() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    year: {
      type: 'set',
      values: ['2008', '2010', '2012'],
    },
  })
}

function filterClearYears() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    year: undefined,
  })
}

function filterSwimmingHockey() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    sport: {
      type: 'set',
      values: ['Swimming', 'Hockey'],
    },
  })
}

function filterHockeyIceHockey() {
  api!.setFilterModel({
    ...api!.getFilterModel(),
    sport: {
      type: 'set',
      values: ['Hockey', 'Ice Hockey'],
    },
  })
}

function filterEveryYearGold() {
  const goldPivotCols = api!.getPivotResultColumns()!.filter(col => col.getColDef().pivotValueColumn!.getColId() === 'gold');
  if (goldPivotCols) {
    const newOpts = goldPivotCols.reduce((acc, col) => {
      acc[col.getId()] = {
        filter: 0,
        filterType: 'number',
        type: 'greaterThan',
      }
      return acc;
    }, api!.getFilterModel() || {})
    api!.setFilterModel(newOpts)
  }
}

function filter2000Silver() {
  const targetCol = api!.getPivotResultColumn(['2000'], 'silver');
  if (targetCol) {
    api!.setFilterModel({
      ...api!.getFilterModel(),
      [targetCol.getId()]: {
        filterType: 'number',
        type: 'notBlank'
      },
    })
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
}) 