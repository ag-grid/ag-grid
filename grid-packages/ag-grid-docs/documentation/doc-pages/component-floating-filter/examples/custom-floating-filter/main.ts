import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
import { NumberFloatingFilterComponent } from "./numberFloatingFilterComponent_typescript";

const columnDefs: ColDef[] = [
  { field: 'athlete', filter: false },
  {
    field: 'gold',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'red',
    },
  },
  {
    field: 'silver',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'blue',
    },
  },
  {
    field: 'bronze',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'green',
    },
  },
  {
    field: 'total',
    filter: 'agNumberColumnFilter',
    suppressMenu: true,
    floatingFilterComponent: NumberFloatingFilterComponent,
    floatingFilterComponentParams: {
      suppressFilterButton: true,
      color: 'orange',
    },
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
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
