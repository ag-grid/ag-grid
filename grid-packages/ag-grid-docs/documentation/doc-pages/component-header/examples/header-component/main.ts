import { Grid, ColDef, GridOptions } from '@ag-grid-community/core'
import { CustomHeader } from './customHeader_typescript'

const columnDefs: ColDef[] = [
  { field: 'athlete', suppressMenu: true, minWidth: 120 },
  {
    field: 'age',
    sortable: false,
    headerComponentParams: { menuIcon: 'fa-external-link-alt' },
  },
  { field: 'country', suppressMenu: true, minWidth: 120 },
  { field: 'year', sortable: false },
  { field: 'date', suppressMenu: true },
  { field: 'sport', sortable: false },
  {
    field: 'gold',
    headerComponentParams: { menuIcon: 'fa-cog' },
    minWidth: 120,
  },
  { field: 'silver', sortable: false },
  { field: 'bronze', suppressMenu: true, minWidth: 120 },
  { field: 'total', sortable: false },
]

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  rowData: null,
  suppressMenuHide: true,
  components: {
    agColumnHeader: CustomHeader,
  },
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
    headerComponentParams: {
      menuIcon: 'fa-bars'
    },
  },
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
