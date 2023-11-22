import {
  FirstDataRenderedEvent,
  GridApi,
  createGrid,
  GridOptions,
  ICellRendererParams,
  ISetFilter,
  ISetFilterParams,
} from '@ag-grid-community/core';
import { getData } from "./data";


let gridApi: GridApi;


const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Case Insensitive (default)',
      field: 'colour',
      filter: 'agSetColumnFilter',
      filterParams: {
        caseSensitive: false,
        cellRenderer: colourCellRenderer,
      } as ISetFilterParams,
    },
    {
      headerName: 'Case Sensitive',
      field: 'colour',
      filter: 'agSetColumnFilter',
      filterParams: {
        caseSensitive: true,
        cellRenderer: colourCellRenderer,
      } as ISetFilterParams,
    },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 225,
    cellRenderer: colourCellRenderer,
    floatingFilter: true,
  },
  sideBar: 'filters',
  onFirstDataRendered: onFirstDataRendered,
  rowData: getData(),
}

var FIXED_STYLES =
  'vertical-align: middle; border: 1px solid black; margin: 3px; display: inline-block; width: 10px; height: 10px'

var FILTER_TYPES: Record<string, string> = {
  insensitive: 'colour',
  sensitive: 'colour_1',
}

function colourCellRenderer(params: ICellRendererParams) {
  if (!params.value || params.value === '(Select All)') {
    return params.value
  }

  return `<div style="background-color: ${params.value.toLowerCase()}; ${FIXED_STYLES}"></div>${params.value
    }`
}

function setModel(type: string) {
  const instance = gridApi!.getFilterInstance(FILTER_TYPES[type])!

  instance.setModel({ values: MANGLED_COLOURS })
  gridApi!.onFilterChanged()
}

function getModel(type: string) {
  const instance = gridApi!.getFilterInstance(FILTER_TYPES[type])!

  alert(JSON.stringify(instance.getModel(), null, 2))
}

function setFilterValues(type: string) {
  const instance = gridApi!.getFilterInstance<ISetFilter>(
    FILTER_TYPES[type]
  )!;

  instance.setFilterValues(MANGLED_COLOURS)
  instance.applyModel()
  gridApi!.onFilterChanged()
}

function getValues(type: string) {
  const instance = gridApi!.getFilterInstance<ISetFilter>(
    FILTER_TYPES[type]
  )!;

  alert(JSON.stringify(instance.getFilterValues(), null, 2))
}

function reset(type: string) {
  const instance = gridApi!.getFilterInstance<ISetFilter>(
    FILTER_TYPES[type]
  )!;

  instance.resetFilterValues()
  instance.setModel(null)
  gridApi!.onFilterChanged()
}

var MANGLED_COLOURS = ['ReD', 'OrAnGe', 'WhItE', 'YeLlOw']

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  params.api.getToolPanelInstance('filters')!.expandFilters()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
