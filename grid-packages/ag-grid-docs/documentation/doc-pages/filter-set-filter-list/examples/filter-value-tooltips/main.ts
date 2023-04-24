import { Grid, GridOptions, ISetFilterParams } from '@ag-grid-community/core';
import { getData } from "./data";

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
      } as ISetFilterParams,
    },
    {
      field: 'colC',
      tooltipField: 'colC',
      tooltipComponent: CustomTooltip,
      filter: 'agSetColumnFilter',
      filterParams: {
        showTooltips: true,
      } as ISetFilterParams,
    },
  ],
  sideBar: 'filters',
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
  new Grid(gridDiv, gridOptions)
})
