import { ColDef, GridOptions } from '@ag-grid-community/core'

declare var NumberFilterComponent: any;
declare var NumberFloatingFilterComponent: any;

const columnDefs: ColDef[] = [
  { field: 'athlete', filter: 'agTextColumnFilter' },
  {
    field: 'gold',
    floatingFilterComponent: 'customNumberFloatingFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    filter: 'customNumberFilter',
  },
  {
    field: 'silver',
    floatingFilterComponent: 'customNumberFloatingFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    filter: 'customNumberFilter',
  },
  {
    field: 'bronze',
    floatingFilterComponent: 'customNumberFloatingFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    filter: 'customNumberFilter',
  },
  {
    field: 'total',
    floatingFilterComponent: 'customNumberFloatingFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    filter: 'customNumberFilter',
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
  components: {
    customNumberFloatingFilter: NumberFloatingFilterComponent,
    customNumberFilter: NumberFilterComponent,
  },
  columnDefs: columnDefs,
  rowData: null,
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid')
  new agGrid.Grid(gridDiv, gridOptions)

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then(data => {
      gridOptions.api!.setRowData(data)
    })
})
