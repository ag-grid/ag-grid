import { Grid, GridOptions, ColDef } from '@ag-grid-community/core'
const gridOptions: GridOptions = {
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
  processSecondaryColDef: (colDef: ColDef) => {
    colDef.filter = 'agNumberColumnFilter';
    colDef.floatingFilter = true;
  },
  pivotMode: true,
  sideBar: 'filters',
}

function clearFilter() {
  gridOptions.api!.setFilterModel(null)
}

function filterUsRussiaAustralia() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    country: {
      type: 'set',
      values: ['United States', 'Russia', 'Australia'],
    },
  })
}

function filterCanadaNorwayChinaZimbabweNetherlands() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    country: {
      type: 'set',
      values: ['Canada', 'Norway', 'China', 'Zimbabwe', 'Netherlands'],
    },
  })
}

function filter20042006() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    year: {
      type: 'set',
      values: ['2004', '2006'],
    },
  })
}

function filter200820102012() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    year: {
      type: 'set',
      values: ['2008', '2010', '2012'],
    },
  })
}

function filterClearYears() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    year: undefined,
  })
}

function filterSwimmingHockey() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    sport: {
      type: 'set',
      values: ['Swimming', 'Hockey'],
    },
  })
}

function filterHockeyIceHockey() {
  gridOptions.api!.setFilterModel({
    ...gridOptions.api!.getFilterModel(),
    sport: {
      type: 'set',
      values: ['Hockey', 'Ice Hockey'],
    },
  })
}

function filterEveryYearGold() {
  const goldPivotCols = gridOptions.columnApi!.getSecondaryColumns()!.filter(col => col.getColDef().pivotValueColumn!.getColId() === 'gold');
  if (goldPivotCols) {
    const newOpts = goldPivotCols.reduce((acc, col) => {
      acc[col.getId()] = {
        filter: 0,
        filterType: 'number',
        type: 'greaterThan',
      }
      return acc;
    }, gridOptions.api!.getFilterModel() || {})
    gridOptions.api!.setFilterModel(newOpts)
  }
}

function filter2000Silver() {
  const targetCol = gridOptions.columnApi!.getSecondaryPivotColumn(['2000'], 'silver');
  if (targetCol) {
    gridOptions.api!.setFilterModel({
      ...gridOptions.api!.getFilterModel(),
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
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
}) 