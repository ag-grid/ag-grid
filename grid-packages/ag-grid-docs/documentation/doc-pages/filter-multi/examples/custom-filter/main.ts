import { Grid, GridOptions } from '@ag-grid-community/core'
import { YearFilter } from "./YearFilter_typescript";
import { YearFloatingFilter } from "./YearFloatingFilter_typescript";

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'athlete', filterComp: 'agMultiColumnFilter' },
    { field: 'sport', filterComp: 'agMultiColumnFilter' },
    {
      field: 'year',
      filterComp: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filterComp: YearFilter,
            // spl todo doesn't work
            floatingFilterComp: YearFloatingFilter,
          },
          {
            filterComp: 'agNumberColumnFilter',
          },
        ],
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    floatingFilter: true,
    menuTabs: ['filterMenuTab'],
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
