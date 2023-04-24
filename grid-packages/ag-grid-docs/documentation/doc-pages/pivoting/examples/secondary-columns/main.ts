import { Grid, GridOptions, ColDef, ColGroupDef } from '@ag-grid-community/core'

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'country', rowGroup: true, enableRowGroup: true },
    {
      field: 'year',
      pivot: true,
      enablePivot: true,
      pivotComparator: MyYearPivotComparator,
    },
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
    resizable: true,
  },
  autoGroupColumnDef: {
    minWidth: 250,
  },
  pivotMode: true,

  // we don't want the grid putting in 'sum' in the headers for us
  suppressAggFuncInHeader: true,

  // this is a callback that gets called on each column definition
  processPivotResultColDef: (colDef: ColDef) => {
    if (colDef.pivotValueColumn && colDef.pivotValueColumn.getId() === 'gold') {
      colDef.headerName = colDef.headerName ? colDef.headerName.toUpperCase() : undefined;
    }
  },

  // this is a callback that gets called on each group definition
  processPivotResultColGroupDef: (colGroupDef: ColGroupDef) => {
    // for fun, add a css class for 2010
    if (colGroupDef.pivotKeys && colGroupDef.pivotKeys.length && colGroupDef.pivotKeys[0] === '2010') {
      colGroupDef.headerClass = 'color-background'
    }
    // put 'year' in front of each group
    colGroupDef.headerName = 'Year ' + colGroupDef.headerName
  },
}

function MyYearPivotComparator(a: string, b: string) {
  var requiredOrder = ['2012', '2010', '2008', '2006', '2004', '2002', '2000']
  return requiredOrder.indexOf(a) - requiredOrder.indexOf(b)
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})