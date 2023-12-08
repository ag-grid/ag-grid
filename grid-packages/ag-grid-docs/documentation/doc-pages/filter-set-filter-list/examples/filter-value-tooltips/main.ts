import { GridApi, createGrid, GridOptions, ISetFilterParams } from '@ag-grid-community/core';
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
  },
  tooltipShowDelay: 100,
  rowData: getData(),
}

// setup the grid
var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
const gridApi: GridApi = createGrid(gridDiv, gridOptions);
