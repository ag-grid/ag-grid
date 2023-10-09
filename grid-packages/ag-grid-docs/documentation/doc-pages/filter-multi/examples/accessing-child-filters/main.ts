import {
  GridApi,
  createGrid,
  GridOptions,
  IMultiFilter,
  IMultiFilterParams,
  ISetFilter,
  ITextFilterParams,
} from '@ag-grid-community/core';

let api: GridApi<IOlympicData>;

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
            } as ITextFilterParams,
          },
          {
            filter: 'agSetColumnFilter',
          },
        ],
      } as IMultiFilterParams,
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
  var textFilter = api!.getFilterInstance<IMultiFilter>(
    'athlete'
  )!.getChildFilterInstance(0)!;
  console.log('Current Text Filter model: ', textFilter.getModel())
}

function getSetMiniFilter() {
  var setFilter = api!.getFilterInstance<IMultiFilter>(
    'athlete'
  )!.getChildFilterInstance(1) as ISetFilter;
  console.log('Current Set Filter search text: ', setFilter.getMiniFilter())
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  api = createGrid(gridDiv, gridOptions);;

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => api!.setRowData(data))
})
