import { GridOptions } from '@ag-grid-community/core'

declare var CustomTooltip: any

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'colA',
      tooltipField: 'colA',
      filterComp: 'agSetColumnFilter',
    },
    {
      field: 'colB',
      tooltipField: 'colB',
      filterComp: 'agSetColumnFilter',
      filterParams: {
        showTooltips: true,
      },
    },
    {
      field: 'colC',
      tooltipField: 'colC',
      tooltipComp: CustomTooltip,
      filterComp: 'agSetColumnFilter',
      filterParams: {
        showTooltips: true,
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  tooltipShowDelay: 100,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)
})
