import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
import { SliderFloatingFilter } from './sliderFloatingFilter_typescript'

const columnDefs: ColDef[] = [
  { field: 'country', filter: false },
  { field: 'language', filter: false },
  { field: 'name', filter: false },
  {
    field: 'gold',
    floatingFilterComponent: SliderFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 7,
      suppressFilterButton: true,
    },
    filter: 'agNumberColumnFilter',
    suppressMenu: false,
  },
  {
    field: 'silver',
    filter: 'agNumberColumnFilter',
    floatingFilterComponent: SliderFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 5,
      suppressFilterButton: true,
    },
    suppressMenu: false,
  },
  {
    field: 'bronze',
    filter: 'agNumberColumnFilter',
    floatingFilterComponent: SliderFloatingFilter,
    floatingFilterComponentParams: {
      maxValue: 10,
      suppressFilterButton: true,
    },
    suppressMenu: false,
  },
]

const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    floatingFilter: true,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: getData()
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
  gridOptions.api!.sizeColumnsToFit()
})
