import { GridOptions } from '@ag-grid-community/core'

declare var CustomTooltip: any

const gridOptions: GridOptions = {
  columnDefs: [
    {
      field: 'colA',
      tooltipField: 'colA',
      filter: 'agSetColumnFilter',
    },
    {
      field: 'colB',
      tooltipField: 'colB',
      filter: 'agSetColumnFilter',
      filterParams: {
        showTooltips: true,
      },
    },
    {
      field: 'colC',
      tooltipField: 'colC',
      tooltipComponent: 'customTooltip',
      filter: 'agSetColumnFilter',
      filterParams: {
        showTooltips: true,
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  components: {
    customTooltip: CustomTooltip,
  },
  tooltipShowDelay: 100,
  rowData: getData(),
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)
})
