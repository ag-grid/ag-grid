import { Grid, GridOptions } from '@ag-grid-community/core'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'athlete',
      filterComp: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filterComp: 'agTextColumnFilter',
            display: 'subMenu',
          },
          {
            filterComp: 'agSetColumnFilter',
          },
        ],
      },
    },
    {
      field: 'country',
      filterComp: 'agMultiColumnFilter',
      filterParams: {
        filters: [
          {
            filterComp: 'agTextColumnFilter',
            display: 'accordion',
            title: 'Expand Me for Text Filters',
          },
          {
            filterComp: 'agSetColumnFilter',
            display: 'accordion',
          },
        ],
      },
    },
    {
      field: 'sport',
      filterComp: 'agMultiColumnFilter',
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
    menuTabs: ['filterMenuTab'],
  },
  sideBar: {
    toolPanels: [
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      },
    ],
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => gridOptions.api!.setRowData(data))
})
