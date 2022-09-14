import {
  FirstDataRenderedEvent, Grid,
  GridOptions,
  ICellRendererParams,
  IFiltersToolPanel
} from '@ag-grid-community/core';
import { getData } from "./data";


const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Case Insensitive (default)',
      field: 'colour',
      filter: 'agSetColumnFilter',
      filterParams: {
        caseSensitive: false,
        cellRenderer: colourCellRenderer,
      },
    },
    {
      headerName: 'Case Sensitive',
      field: 'colour',
      filter: 'agSetColumnFilter',
      filterParams: {
        caseSensitive: true,
        cellRenderer: colourCellRenderer,
      },
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 225,
    cellRenderer: colourCellRenderer,
    resizable: true,
    floatingFilter: true,
  },
  sideBar: 'filters',
  onFirstDataRendered: onFirstDataRendered,
  rowData: getData(),
}

const FIXED_STYLES =
  'vertical-align: middle; border: 1px solid black; margin: 3px; display: inline-block; width: 10px; height: 10px'

function colourCellRenderer(params: ICellRendererParams) {
  if (!params.value || params.value === '(Select All)') {
    return params.value
  }

  return `<div style="background-color: ${params.value.toLowerCase()}; ${FIXED_STYLES}"></div>${params.value
    }`
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
