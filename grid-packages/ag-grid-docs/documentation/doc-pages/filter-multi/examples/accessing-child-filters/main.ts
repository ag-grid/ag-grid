import { Grid, GridOptions, IMultiFilter, ISetFilter } from '@ag-grid-community/core';

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    {
      field: 'athlete',
      filter: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filter: 'agTextColumnFilter',
            filterParams: {
              buttons: ['apply', 'clear'],
            },
          },
          {
            filter: 'agSetColumnFilter',
          },
        ],
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    menuTabs: ['filterMenuTab'],
  },
}

function getTextModel() {
  var textFilter = gridOptions.api!.getFilterInstance<IMultiFilter>(
    'athlete'
  )!.getChildFilterInstance(0)!;
  console.log('Current Text Filter model: ', textFilter.getModel())
}

function getSetMiniFilter() {
  var setFilter = gridOptions.api!.getFilterInstance<IMultiFilter>(
    'athlete'
  )!.getChildFilterInstance(1) as ISetFilter;
  console.log('Current Set Filter search text: ', setFilter.getMiniFilter())
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridOptions.api!.setRowData(data))
})
